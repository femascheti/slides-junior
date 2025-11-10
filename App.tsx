
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Page, Line, TextObject, Tool } from './types';
import DrawingCanvas from './components/DrawingCanvas';
import PageTray from './components/PageTray';
import Modal from './components/Modal';
import HelpModalContent from './components/HelpModalContent';
import AboutModalContent from './components/AboutModalContent';
import CanvasToolbar from './components/CanvasToolbar';

// NOTE: You need to install uuid and its types: `npm install uuid @types/uuid`
// You also need dnd-kit for page reordering: `npm install @dnd-kit/core @dnd-kit/sortable`

const App: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([
    { id: uuidv4(), lines: [], texts: [] },
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);

  const [tool, setTool] = useState<Tool>(Tool.PEN);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);

  const activePage = pages[activePageIndex];

  const updatePage = useCallback(
    (pageId: string, newLines: Line[], newTexts: TextObject[]) => {
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId ? { ...page, lines: newLines, texts: newTexts } : page
        )
      );
    },
    []
  );

  const addPage = () => {
    const newPage: Page = { id: uuidv4(), lines: [], texts: [] };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return; // Cannot delete the last page
    
    const pageIndexToDelete = pages.findIndex(p => p.id === pageId);
    
    setPages(prev => prev.filter(p => p.id !== pageId));

    if (activePageIndex >= pageIndexToDelete) {
        setActivePageIndex(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="bg-white text-gray-800 font-saira w-screen h-screen flex flex-col overflow-hidden">
      <header className="p-4 flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-custom-blue">Crie sua propria historia</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 min-h-0">
         <div className="w-full max-w-4xl h-full flex flex-col border border-custom-blue rounded-lg shadow-lg">
             <CanvasToolbar 
                tool={tool} 
                setTool={setTool}
                color={color}
                setColor={setColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
              />
            <div className="flex-grow relative bg-gray-50 rounded-b-lg overflow-hidden">
                {activePage && (
                    <DrawingCanvas
                        key={activePage.id}
                        page={activePage}
                        onUpdatePage={updatePage}
                        tool={tool}
                        color={color}
                        strokeWidth={strokeWidth}
                    />
                )}
            </div>
         </div>
      </main>

      <footer className="p-4 flex-shrink-0">
        <PageTray
          pages={pages}
          activePageId={activePage?.id}
          onSelectPage={(pageId) => setActivePageIndex(pages.findIndex(p => p.id === pageId))}
          onAddPage={addPage}
          onDeletePage={deletePage}
          onReorderPages={setPages}
        />
      </footer>

      {/* Floating Action Buttons */}
      <button
        onClick={() => setAboutModalOpen(true)}
        className="absolute bottom-5 left-5 w-14 h-14 bg-custom-yellow rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110"
        aria-label="Sobre mim"
      >
        🥑
      </button>
      <button
        onClick={() => setHelpModalOpen(true)}
        className="absolute bottom-5 right-5 w-14 h-14 bg-custom-blue text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg transition-transform hover:scale-110"
        aria-label="Ajuda"
      >
        ?
      </button>

      {/* Modals */}
      <Modal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)}>
        <HelpModalContent />
      </Modal>
      <Modal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)}>
        <AboutModalContent />
      </Modal>
    </div>
  );
};

export default App;
