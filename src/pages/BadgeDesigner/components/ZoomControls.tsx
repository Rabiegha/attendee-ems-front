import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitToScreen: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitToScreen
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 flex items-center space-x-2 border dark:border-gray-700">
      <Button
        onClick={onZoomOut}
        variant="outline"
        size="sm"
        className="p-2"
        title="Zoom arrière (Ctrl + roulette)"
      >
        <ZoomOut size={16} />
      </Button>
      
      <div className="px-2 text-sm font-medium min-w-[60px] text-center text-gray-900 dark:text-gray-100">
        {Math.round(zoom * 100)}%
      </div>
      
      <Button
        onClick={onZoomIn}
        variant="outline"
        size="sm"
        className="p-2"
        title="Zoom avant (Ctrl + roulette)"
      >
        <ZoomIn size={16} />
      </Button>
      
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
      
      <Button
        onClick={onResetView}
        variant="outline"
        size="sm"
        className="p-2"
        title="Réinitialiser la vue (100%)"
      >
        <RotateCcw size={16} />
      </Button>
      
      <Button
        onClick={onFitToScreen}
        variant="outline"
        size="sm"
        className="p-2"
        title="Ajuster à l'écran"
      >
        <Maximize2 size={16} />
      </Button>
    </div>
  );
};