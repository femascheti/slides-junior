import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page, Line, Point, Tool, TextObject } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface DrawingCanvasProps {
  page: Page;
  onUpdatePage: (pageId: string, newLines: Line[], newTexts: TextObject[]) => void;
  tool: Tool;
  color: string;
  strokeWidth: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ page, onUpdatePage, tool, color, strokeWidth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [content, setContent] = useState({ lines: page.lines, texts: page.texts });
  const [currentText, setCurrentText] = useState<TextObject | null>(null);
  const [draggedTextId, setDraggedTextId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Sync local state when the page prop changes
  useEffect(() => {
    setContent({ lines: page.lines, texts: page.texts });
  }, [page]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw lines
    content.lines.forEach(({ points, color: lineColor, strokeWidth: lineStrokeWidth }) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = lineStrokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    });

    // Draw texts
    content.texts.forEach(textObj => {
        ctx.fillStyle = textObj.color;
        ctx.font = `${textObj.fontSize}px Saira`;
        ctx.fillText(textObj.text, textObj.x, textObj.y);
    });

  }, [content.lines, content.texts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (context) {
            draw(context);
        }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
        window.removeEventListener('resize', resizeCanvas);
    };
  }, [draw]);

  const getMousePos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Helper function to detect if a point is near any line (for eraser)
  const detectLineAtPoint = (pos: Point, lineIndex?: number): boolean => {
    const threshold = 10; // pixels around the eraser
    if (lineIndex !== undefined) {
      const line = content.lines[lineIndex];
      return line.points.some(point =>
        Math.hypot(point.x - pos.x, point.y - pos.y) < threshold
      );
    }
    return content.lines.some(line =>
      line.points.some(point =>
        Math.hypot(point.x - pos.x, point.y - pos.y) < threshold
      )
    );
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (tool === Tool.TEXT) return;

    const pos = getMousePos(e);

    if (tool === Tool.PEN) {
      setIsDrawing(true);
      const newLine: Line = { points: [pos], color, strokeWidth };
      setContent(prev => ({ ...prev, lines: [...prev.lines, newLine] }));
    } else if (tool === Tool.ERASER) {
      setIsDrawing(true);
      // Erase lines that touch this point
      setContent(prev => ({
        ...prev,
        lines: prev.lines.filter(line =>
          !line.points.some(point => Math.hypot(point.x - pos.x, point.y - pos.y) < 10)
        )
      }));
    }
  };

  const continueDrawing = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (tool === Tool.PEN) {
      setContent(prev => {
          if (prev.lines.length === 0) return prev;

          const lastLine = prev.lines[prev.lines.length - 1];
          const newLastLine = {
              ...lastLine,
              points: [...lastLine.points, pos],
          };

          const newLines = [
              ...prev.lines.slice(0, -1),
              newLastLine,
          ];

          return { ...prev, lines: newLines };
      });
    } else if (tool === Tool.ERASER) {
      // Erase lines that touch this point
      setContent(prev => ({
        ...prev,
        lines: prev.lines.filter(line =>
          !line.points.some(point => Math.hypot(point.x - pos.x, point.y - pos.y) < 10)
        )
      }));
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Use functional update to get latest state for saving
    setContent(prev => {
        onUpdatePage(page.id, prev.lines, prev.texts);
        return prev;
    });
  };
  
  // Helper function to detect if a point hits a text
  const getTextAtPoint = (pos: Point): TextObject | null => {
    return content.texts.find(text => {
      const textWidth = text.text.length * (text.fontSize * 0.6);
      const textHeight = text.fontSize;
      return (
        pos.x >= text.x &&
        pos.x <= text.x + textWidth &&
        pos.y >= text.y - textHeight &&
        pos.y <= text.y + 5
      );
    }) || null;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === Tool.TEXT && draggedTextId === null) {
      const pos = getMousePos(e);

      // Check if clicking on existing text
      const clickedText = getTextAtPoint(pos);
      if (clickedText) {
        setCurrentText(clickedText);
        return;
      }

      // Finalize previous text if any
      if (currentText) {
          finishEditingText();
      }

      const newText: TextObject = {
        id: uuidv4(),
        text: 'Escreva aqui...',
        x: pos.x,
        y: pos.y,
        color: color,
        fontSize: 24,
        isEditing: true,
      };
      setCurrentText(newText);
    }
  };

  const handleTextMouseDown = (e: React.MouseEvent, textId: string) => {
    e.stopPropagation();
    if (tool === Tool.TEXT && currentText?.id !== textId) {
      const text = content.texts.find(t => t.id === textId);
      if (text) {
        const pos = getMousePos(e);
        setDraggedTextId(textId);
        setDragOffset({
          x: pos.x - text.x,
          y: pos.y - text.y,
        });
      }
    }
  };

  useEffect(() => {
    if (draggedTextId === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const pos = {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y,
      };

      setContent(prev => ({
        ...prev,
        texts: prev.texts.map(t =>
          t.id === draggedTextId ? { ...t, x: pos.x, y: pos.y } : t
        ),
      }));
    };

    const handleMouseUp = () => {
      setDraggedTextId(null);
      // Save the updated position
      setContent(prev => {
        onUpdatePage(page.id, prev.lines, prev.texts);
        return prev;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTextId, dragOffset, page.id, onUpdatePage]);
  
  const finishEditingText = () => {
    if (!currentText || !currentText.text.trim()) {
        setCurrentText(null);
        return;
    }
    // Use functional update to get latest state for saving
    setContent(prev => {
        const newTexts = [...prev.texts, { ...currentText, isEditing: false }];
        onUpdatePage(page.id, prev.lines, newTexts);
        return { ...prev, texts: newTexts };
    });
    setCurrentText(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentText) return;
    setCurrentText({ ...currentText, text: e.target.value });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      finishEditingText();
    }
    if (e.key === 'Delete' && e.ctrlKey) {
      // Delete the text
      if (currentText) {
        setContent(prev => ({
          ...prev,
          texts: prev.texts.filter(t => t.id !== currentText.id),
        }));
        setCurrentText(null);
      }
    }
  };

  const deleteText = (textId: string) => {
    setContent(prev => ({
      ...prev,
      texts: prev.texts.filter(t => t.id !== textId),
    }));
    if (currentText?.id === textId) {
      setCurrentText(null);
    }
    // Save the updated state
    setContent(prev => {
      onUpdatePage(page.id, prev.lines, prev.texts.filter(t => t.id !== textId));
      return { ...prev, texts: prev.texts.filter(t => t.id !== textId) };
    });
  };


  const getCursor = () => {
    if (draggedTextId !== null) return 'grabbing';
    if (tool === Tool.PEN) return 'crosshair';
    if (tool === Tool.ERASER) return 'not-allowed';
    return 'text';
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={continueDrawing}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onClick={handleCanvasClick}
        className="w-full h-full"
        style={{ cursor: getCursor() }}
      />

      {/* Render text objects */}
      {content.texts.map((textObj) => (
        <div key={textObj.id} style={{ position: 'absolute', left: `${textObj.x}px`, top: `${textObj.y}px` }}>
          <div
            onMouseDown={(e) => {
              if (e.ctrlKey) {
                e.stopPropagation();
                deleteText(textObj.id);
              } else {
                handleTextMouseDown(e, textObj.id);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              deleteText(textObj.id);
            }}
            style={{
              position: 'relative',
              color: textObj.color,
              fontSize: `${textObj.fontSize}px`,
              fontFamily: 'Saira, sans-serif',
              whiteSpace: 'nowrap',
              cursor: tool === Tool.TEXT ? (draggedTextId === textObj.id ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none',
              transform: 'translateY(-100%)',
              padding: '2px 4px',
              borderRadius: '4px',
              backgroundColor: currentText?.id === textObj.id ? 'rgba(0, 41, 255, 0.1)' : 'transparent',
              border: currentText?.id === textObj.id ? '1px solid #0029FF' : 'none',
            }}
            role="button"
            tabIndex={0}
            onDoubleClick={() => {
              if (tool === Tool.TEXT) {
                setCurrentText(textObj);
              }
            }}
            title="Duplo clique para editar | Ctrl+Clique para deletar | Clique direito para deletar"
          >
            {textObj.text}
          </div>
        </div>
      ))}

      {/* Input for editing text */}
      {currentText && currentText.isEditing && (
        <input
          type="text"
          value={currentText.text}
          onChange={handleTextChange}
          onKeyDown={handleTextKeyDown}
          onBlur={finishEditingText}
          autoFocus
          style={{
            position: 'absolute',
            left: `${currentText.x}px`,
            top: `${currentText.y}px`,
            transform: 'translateY(-100%)',
            border: '2px solid #0029FF',
            background: 'white',
            color: currentText.color,
            fontSize: `${currentText.fontSize}px`,
            fontFamily: 'Saira, sans-serif',
            outline: 'none',
            padding: '2px 4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
          className="rounded"
        />
      )}
    </div>
  );
};

export default DrawingCanvas;