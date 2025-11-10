
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
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="relative">
            <div {...listeners}
                className={`w-32 h-32 rounded-xl cursor-grab active:cursor-grabbing flex items-center justify-center border-4 transition-all shadow-md
                ${isActive ? 'border-custom-blue scale-110 shadow-lg bg-blue-50' : 'border-gray-300 hover:border-custom-blue bg-gray-100'}
                ${isDragging ? 'opacity-50' : ''}`}>
                <div
                    onClick={onSelect}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onSelect();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg cursor-pointer flex items-center justify-center text-center text-xs font-bold text-gray-500"
                >
                    Slide
                </div>
            </div>
            <button onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }} className="absolute -top-3 -right-3 bg-custom-light-red text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-custom-dark-red hover:scale-110 transition-all">
                ✕
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
            <button onClick={onAddPage} className="w-32 h-32 bg-gradient-to-br from-custom-light-green to-custom-dark-green text-white rounded-xl border-4 border-dashed border-custom-dark-green hover:border-white hover:shadow-lg transition-all flex items-center justify-center text-5xl font-bold shadow-md hover:scale-105">
                +
            </button>
          </div>
        </div>
    );
};


export default PageTray;
