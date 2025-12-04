import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        title="Zoom arrière"
        className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
      >
        <ZoomOut size={18} className="text-gray-700 dark:text-gray-300" />
      </button>

      {/* Zoom Percentage */}
      <div className="px-3 text-sm font-medium min-w-[60px] text-center text-gray-900 dark:text-gray-100">
        {Math.round(zoom * 100)}%
      </div>

      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        title="Zoom avant"
        className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
      >
        <ZoomIn size={18} className="text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};