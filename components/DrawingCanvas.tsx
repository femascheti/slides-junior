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

  const startDrawing = (e: React.MouseEvent) => {
    if (tool !== Tool.PEN) return;
    const pos = getMousePos(e);
    setIsDrawing(true);
    const newLine: Line = { points: [pos], color, strokeWidth };
    setContent(prev => ({ ...prev, lines: [...prev.lines, newLine] }));
  };

  const continueDrawing = (e: React.MouseEvent) => {
    if (!isDrawing || tool !== Tool.PEN) return;
    const pos = getMousePos(e);
    setContent(prev => {
        if (prev.lines.length === 0) return prev;
        
        const lastLine = prev.lines[prev.lines.length - 1];
        const newLastLine = {
            ...lastLine,
            points: [...lastLine.points, pos], // Create new points array
        };

        // Replace the last line with the new updated one
        const newLines = [
            ...prev.lines.slice(0, -1),
            newLastLine,
        ];

        return { ...prev, lines: newLines };
    });
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
  
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool !== Tool.TEXT) return;
    const pos = getMousePos(e);
    
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
  };
  
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
        style={{ cursor: tool === Tool.PEN ? 'crosshair' : 'text' }}
      />
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
            border: '1px solid #0029FF',
            background: 'white',
            color: currentText.color,
            fontSize: `${currentText.fontSize}px`,
            fontFamily: 'Saira, sans-serif',
            outline: 'none',
            padding: '2px 4px',
          }}
          className="rounded"
        />
      )}
    </div>
  );
};

export default DrawingCanvas;