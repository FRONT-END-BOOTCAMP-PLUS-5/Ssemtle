'use client';

import { forwardRef } from 'react';

interface DragHandleProps {
  title: string;
  isDraggable: boolean;
  isDragModeEnabled: boolean;
  isDragging: boolean;
  isExpanded: boolean;
  className?: string;
  onClick?: () => void;
}

const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  (
    {
      title,
      isDraggable,
      isDragModeEnabled,
      isDragging,
      isExpanded,
      className = '',
      onClick,
    },
    ref
  ) => {
    return (
      <button
        className={`w-full rounded-xl bg-gray-50 p-4 text-left transition-all duration-200 ${
          isDraggable && isDragModeEnabled
            ? 'cursor-grab shadow-lg'
            : isDraggable
              ? 'cursor-pointer hover:bg-gray-100'
              : 'cursor-pointer hover:bg-gray-100'
        } ${
          isDragging
            ? 'scale-105 cursor-grabbing bg-gray-200 shadow-2xl'
            : isDragModeEnabled
              ? 'bg-gray-100 shadow-md'
              : ''
        } ${className}`}
        ref={ref}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDraggable && (
              <div
                className={`flex flex-col space-y-1 transition-all duration-200 ${
                  isDragModeEnabled ? 'scale-110 opacity-70' : 'opacity-50'
                }`}
              >
                <div
                  className={`h-1 w-4 rounded transition-colors ${
                    isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                ></div>
                <div
                  className={`h-1 w-4 rounded transition-colors ${
                    isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                ></div>
                <div
                  className={`h-1 w-4 rounded transition-colors ${
                    isDragModeEnabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                ></div>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
          <span
            className={`text-gray-600 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
        </div>
      </button>
    );
  }
);

DragHandle.displayName = 'DragHandle';

export default DragHandle;
