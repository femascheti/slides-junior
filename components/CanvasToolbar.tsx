
import React from 'react';
import { Tool } from '../types';

interface CanvasToolbarProps {
  tool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

const ToolButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-md flex items-center justify-center transition-colors ${
            isActive ? 'bg-custom-blue text-white' : 'hover:bg-gray-200'
        }`}
        aria-label={label}
        title={label}
    >
        {icon}
    </button>
);

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
}) => {
  return (
    <div className="flex items-center space-x-4 p-2 border-b border-custom-blue bg-white rounded-t-lg">
      <div className="flex items-center space-x-1 border-r border-gray-200 pr-3">
        <ToolButton 
            label="Caneta"
            icon={<PencilIcon />}
            isActive={tool === Tool.PEN}
            onClick={() => setTool(Tool.PEN)}
        />
        <ToolButton
            label="Texto"
            icon={<TypeIcon />}
            isActive={tool === Tool.TEXT}
            onClick={() => setTool(Tool.TEXT)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label htmlFor="colorPicker" className="cursor-pointer" title="Cor">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300" style={{ backgroundColor: color }}></div>
        </label>
        <input
          id="colorPicker"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="opacity-0 w-0 h-0 absolute"
        />
      </div>

      <div className="flex items-center space-x-2">
        <label htmlFor="strokeWidth" className="text-sm text-gray-600" title="Tamanho do traço">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </label>
        <input
          id="strokeWidth"
          type="range"
          min="1"
          max="50"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-32"
        />
      </div>
    </div>
  );
};


const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
    </svg>
);
const TypeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7V6h16v1M7 12h10M12 7v10" />
    </svg>
);


export default CanvasToolbar;
