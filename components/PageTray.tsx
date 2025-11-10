
import React from 'react';
import { Page } from '../types';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PageThumbnailProps {
  page: Page;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SortablePageThumbnail: React.FC<PageThumbnailProps> = ({ page, isActive, onSelect, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative">
            <div {...listeners} onClick={onSelect}
                className={`w-24 h-24 bg-gray-100 rounded-lg cursor-pointer flex items-center justify-center border-2 transition-all
                ${isActive ? 'border-custom-blue scale-105' : 'border-gray-300 hover:border-custom-blue'}`}>
                 <div className="w-16 h-16 bg-gray-200 rounded"></div>
            </div>
            <button onClick={onDelete} className="absolute -top-2 -right-2 bg-custom-light-red text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-custom-dark-red transition-colors">
                X
            </button>
        </div>
    );
};

interface PageTrayProps {
  pages: Page[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (id: string) => void;
  onReorderPages: (pages: Page[]) => void;
}

const PageTray: React.FC<PageTrayProps> = ({ pages, activePageId, onSelectPage, onAddPage, onDeletePage, onReorderPages }) => {
    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event: any) {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = pages.findIndex(p => p.id === active.id);
            const newIndex = pages.findIndex(p => p.id === over.id);
            onReorderPages(arrayMove(pages, oldIndex, newIndex));
        }
    }

    return (
        <div className="w-full flex justify-center">
          <div className="flex items-center space-x-4 p-2 bg-white rounded-lg">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex items-center space-x-4">
                    {pages.map((page, index) => (
                        <SortablePageThumbnail
                        key={page.id}
                        page={page}
                        isActive={page.id === activePageId}
                        onSelect={() => onSelectPage(page.id)}
                        onDelete={() => onDeletePage(page.id)}
                        />
                    ))}
                    </div>
                </SortableContext>
            </DndContext>
            <button onClick={onAddPage} className="w-24 h-24 bg-gray-50 text-custom-blue rounded-lg border-2 border-dashed border-gray-300 hover:border-custom-blue hover:text-custom-blue transition-all flex items-center justify-center text-4xl">
                +
            </button>
          </div>
        </div>
    );
};


export default PageTray;
