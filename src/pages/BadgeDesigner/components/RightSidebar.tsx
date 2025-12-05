import React from 'react';
import { 
  Trash2, RotateCcw, RotateCw, Shuffle, X,
  AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  AlignStartHorizontal, AlignEndHorizontal, AlignCenterHorizontal,
  Undo2, Redo2, CopyPlus
} from 'lucide-react';
import { BadgeElement, BadgeFormat } from '../../../shared/types/badge.types';
import { Button } from '../../../shared/ui/Button';
import { getTransformWithRotation } from '../../../shared/utils/transform';
import { mmToPx } from '../../../shared/utils/conversion';

interface RightSidebarProps {
  selectedElements: BadgeElement[];
  symmetryPairs: Map<string, string>;
  badgeFormat: BadgeFormat;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>, skipHistory?: boolean) => void;
  onBatchUpdateElements: (updates: Array<{ id: string; updates: Partial<BadgeElement> }>, skipHistory?: boolean) => void;
  onDeleteElement: (id: string) => void;
  onDeleteElements: (ids: string[]) => void;
  onDuplicateElement: (id: string) => void;
  onDuplicateElements: (ids: string[]) => void;
  onCreateSymmetry: () => void;
  onBreakSymmetry: () => void;
  // Manual history save (for slider mouseup)
  onSaveHistory?: () => void;
  // History controls
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  historyIndex?: number;
  historyLength?: number;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElements,
  symmetryPairs,
  badgeFormat,
  onUpdateElement,
  onBatchUpdateElements,
  onDeleteElements,
  onDuplicateElements,
  onDeleteElement,
  onDuplicateElement,
  onCreateSymmetry,
  onBreakSymmetry,
  onSaveHistory,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  historyIndex = 0,
  historyLength = 0,
}) => {
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const multipleSelected = selectedElements.length > 1;
  
  // Track which slider is currently open
  const [openSlider, setOpenSlider] = React.useState<string | null>(null);
  
  // Track if user is dragging a slider
  const [isDraggingSlider, setIsDraggingSlider] = React.useState(false);
  
  // Check if any selected element has a symmetry pair
  const hasSymmetryPair = selectedElements.some(el => 
    symmetryPairs.has(el.id) || Array.from(symmetryPairs.values()).includes(el.id)
  );

  // Helper: Execute action for single or multiple elements automatically
  const executeAction = (
    singleFn: (id: string) => void,
    multipleFn: (ids: string[]) => void
  ) => {
    if (multipleSelected) {
      multipleFn(selectedElements.map(el => el.id));
    } else if (selectedElement) {
      singleFn(selectedElement.id);
    }
  };

  if (selectedElements.length === 0) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md border-l dark:border-gray-700 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-sm">Sélectionner un élément pour modifier ses propriétés</p>
          </div>
        </div>

        {/* Actions - Fixed en bas */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-center gap-2">
            {/* Undo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Annuler (Ctrl+Z)"
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Undo2 size={18} className="text-gray-700 dark:text-gray-300" />
            </button>

            {/* History counter */}
            <div className="px-3 text-sm font-medium min-w-[60px] text-center text-gray-900 dark:text-gray-100">
              {historyIndex + 1}/{historyLength || 1}
            </div>

            {/* Redo */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Rétablir (Ctrl+Y)"
              className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Redo2 size={18} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStyleUpdate = (property: string, value: any, skipHistory = false) => {
    if (selectedElements.length === 1) {
      // Single element: use direct update
      const element = selectedElements[0];
      const updates: any = {
        style: { [property]: value }
      };
      
      // When rotation changes, also update the transform
      if (property === 'rotation') {
        updates.style.transform = getTransformWithRotation(value, element.style.transform);
      }
      
      // Ajuster automatiquement la hauteur quand on change la taille de police
      if (property === 'fontSize' && element.type === 'text') {
        updates.height = Math.ceil(value * 1.5);
      }
      
      onUpdateElement(element.id, updates, skipHistory);
    } else {
      // Multiple elements: use batch update
      const batchUpdates = selectedElements.map(element => {
        const updates: any = {
          style: { [property]: value }
        };
        
        // When rotation changes, also update the transform
        if (property === 'rotation') {
          updates.style.transform = getTransformWithRotation(value, element.style.transform);
        }
        
        // Ajuster automatiquement la hauteur quand on change la taille de police
        if (property === 'fontSize' && element.type === 'text') {
          updates.height = Math.ceil(value * 1.5);
        }
        
        return { id: element.id, updates };
      });
      
      onBatchUpdateElements(batchUpdates, skipHistory);
    }
  };

  const handleContentUpdate = (content: string, skipHistory = false) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { content }, skipHistory);
    }
  };

  // Fonctions d'alignement
  const handleCenterHorizontally = () => {
    if (!selectedElement) return;
    const badgeWidth = mmToPx(badgeFormat.width);
    const x = (badgeWidth - selectedElement.width) / 2;
    onUpdateElement(selectedElement.id, { x });
  };

  const handleCenterVertically = () => {
    if (!selectedElement) return;
    const badgeHeight = mmToPx(badgeFormat.height);
    const y = (badgeHeight - selectedElement.height) / 2;
    onUpdateElement(selectedElement.id, { y });
  };

  // Multi-selection alignment functions
  const handleAlignLeft = () => {
    if (selectedElements.length === 0) return;
    const leftmost = Math.min(...selectedElements.map(el => el.x));
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { x: leftmost }
    })));
  };

  const handleAlignRight = () => {
    if (selectedElements.length === 0) return;
    const rightmost = Math.max(...selectedElements.map(el => el.x + el.width));
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { x: rightmost - el.width }
    })));
  };

  const handleAlignTop = () => {
    if (selectedElements.length === 0) return;
    const topmost = Math.min(...selectedElements.map(el => el.y));
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { y: topmost }
    })));
  };

  const handleAlignBottom = () => {
    if (selectedElements.length === 0) return;
    const bottommost = Math.max(...selectedElements.map(el => el.y + el.height));
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { y: bottommost - el.height }
    })));
  };

  const handleAlignCenterHorizontal = () => {
    if (selectedElements.length === 0) return;
    const leftmost = Math.min(...selectedElements.map(el => el.x));
    const rightmost = Math.max(...selectedElements.map(el => el.x + el.width));
    const centerX = (leftmost + rightmost) / 2;
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { x: centerX - el.width / 2 }
    })));
  };

  const handleAlignCenterVertical = () => {
    if (selectedElements.length === 0) return;
    const topmost = Math.min(...selectedElements.map(el => el.y));
    const bottommost = Math.max(...selectedElements.map(el => el.y + el.height));
    const centerY = (topmost + bottommost) / 2;
    onBatchUpdateElements(selectedElements.map(el => ({
      id: el.id,
      updates: { y: centerY - el.height / 2 }
    })));
  };

  // Check alignment state for multi-selection
  const isAlignmentActive = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    if (selectedElements.length === 0) return false;
    
    const tolerance = 1; // pixels
    
    switch(type) {
      case 'left':
        const leftmost = Math.min(...selectedElements.map(el => el.x));
        return selectedElements.every(el => Math.abs(el.x - leftmost) < tolerance);
      
      case 'right':
        const rightmost = Math.max(...selectedElements.map(el => el.x + el.width));
        return selectedElements.every(el => Math.abs((el.x + el.width) - rightmost) < tolerance);
      
      case 'center-h':
        const lefts = selectedElements.map(el => el.x);
        const rights = selectedElements.map(el => el.x + el.width);
        const centerX = (Math.min(...lefts) + Math.max(...rights)) / 2;
        return selectedElements.every(el => Math.abs((el.x + el.width / 2) - centerX) < tolerance);
      
      case 'top':
        const topmost = Math.min(...selectedElements.map(el => el.y));
        return selectedElements.every(el => Math.abs(el.y - topmost) < tolerance);
      
      case 'bottom':
        const bottommost = Math.max(...selectedElements.map(el => el.y + el.height));
        return selectedElements.every(el => Math.abs((el.y + el.height) - bottommost) < tolerance);
      
      case 'center-v':
        const tops = selectedElements.map(el => el.y);
        const bottoms = selectedElements.map(el => el.y + el.height);
        const centerY = (Math.min(...tops) + Math.max(...bottoms)) / 2;
        return selectedElements.every(el => Math.abs((el.y + el.height / 2) - centerY) < tolerance);
      
      default:
        return false;
    }
  };

  // Bulk style updates for multi-selection
  const handleBulkStyleUpdate = (property: string, value: any) => {
    const batchUpdates = selectedElements
      .filter(element => {
        // Only apply to text elements for text-specific styles
        if ((property === 'fontSize' || property === 'fontFamily' || property === 'fontWeight' || 
             property === 'fontStyle' || property === 'textDecoration' || property === 'textAlign') 
            && element.type !== 'text') {
          return false;
        }
        
        // Only apply color to text/qrcode elements
        if (property === 'color' && element.type !== 'text' && element.type !== 'qrcode') {
          return false;
        }
        
        return true;
      })
      .map(element => {
        const updates: any = {
          style: { [property]: value }
        };
        
        // Adjust height for font size changes
        if (property === 'fontSize' && element.type === 'text') {
          updates.height = Math.ceil(value * 1.5);
        }
        
        return { id: element.id, updates };
      });
    
    if (batchUpdates.length > 0) {
      onBatchUpdateElements(batchUpdates);
    }
  };

  // Toggle style for multi-selection (bold, italic, underline)
  const handleBulkStyleToggle = (property: 'fontWeight' | 'fontStyle' | 'textDecoration') => {
    const textElements = selectedElements.filter(el => el.type === 'text');
    if (textElements.length === 0) return;

    // Determine the target value: if ALL elements have the active state, turn it off, otherwise turn it on for all
    const getActiveValue = (prop: typeof property) => {
      if (prop === 'fontWeight') return 'bold';
      if (prop === 'fontStyle') return 'italic';
      if (prop === 'textDecoration') return 'underline';
      return undefined;
    };

    const getInactiveValue = (prop: typeof property) => {
      if (prop === 'fontWeight') return 'normal';
      if (prop === 'fontStyle') return 'normal';
      if (prop === 'textDecoration') return 'none';
      return undefined;
    };

    const activeValue = getActiveValue(property);
    const inactiveValue = getInactiveValue(property);

    // Check if ALL elements have the active state
    const allActive = textElements.every(el => el.style[property] === activeValue);

    // If all are active, turn off for all. Otherwise, turn on for all.
    const targetValue = allActive ? inactiveValue : activeValue;

    const batchUpdates = textElements.map(element => ({
      id: element.id,
      updates: {
        style: { 
          [property]: targetValue
        }
      }
    }));

    onBatchUpdateElements(batchUpdates);
  };

  // Helper function to check if a style property is active for all selected text elements
  const isStyleActive = (property: 'fontWeight' | 'fontStyle' | 'textDecoration'): boolean => {
    const textElements = selectedElements.filter(el => el.type === 'text');
    if (textElements.length === 0) return false;

    const getActiveValue = (prop: typeof property) => {
      if (prop === 'fontWeight') return 'bold';
      if (prop === 'fontStyle') return 'italic';
      if (prop === 'textDecoration') return 'underline';
      return undefined;
    };

    const activeValue = getActiveValue(property);
    return textElements.every(el => el.style[property] === activeValue);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md border-l dark:border-gray-700 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="border-b dark:border-gray-700 pb-2">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          {multipleSelected 
            ? `${selectedElements.length} éléments sélectionnés`
            : `Élément: ${selectedElement?.type}`
          }
        </h3>
      </div>

      {/* Multi-Selection Panel */}
      {multipleSelected && (
        <div className="space-y-4 border-b dark:border-gray-700 pb-4">
          {/* Alignment Tools */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Alignement</h4>
            
            {/* Horizontal Alignment */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Horizontal</label>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={handleAlignTop}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('top') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Aligner en haut"
                >
                  <AlignStartHorizontal size={14} />
                </Button>
                <Button
                  onClick={handleAlignCenterVertical}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('center-v') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Centrer verticalement"
                >
                  <AlignCenterHorizontal size={14} />
                </Button>
                <Button
                  onClick={handleAlignBottom}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('bottom') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Aligner en bas"
                >
                  <AlignEndHorizontal size={14} />
                </Button>
              </div>
            </div>

            {/* Vertical Alignment */}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Vertical</label>
              <div className="grid grid-cols-3 gap-1">
                <Button
                  onClick={handleAlignLeft}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('left') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Aligner à gauche"
                >
                  <AlignStartVertical size={14} />
                </Button>
                <Button
                  onClick={handleAlignCenterHorizontal}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('center-h') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Centrer horizontalement"
                >
                  <AlignCenterVertical size={14} />
                </Button>
                <Button
                  onClick={handleAlignRight}
                  variant="outline"
                  size="sm"
                  className={`flex items-center justify-center gap-1 text-xs px-1 py-1.5 ${
                    isAlignmentActive('right') 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400' 
                      : ''
                  }`}
                  title="Aligner à droite"
                >
                  <AlignEndVertical size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Styling - Only if at least one text/qrcode element */}
          {selectedElements.some(el => el.type === 'text' || el.type === 'qrcode') && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Style groupé</h4>
              
              {/* Color for text/qrcode elements */}
              {selectedElements.some(el => el.type === 'text' || el.type === 'qrcode') && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Couleur</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      defaultValue="#000000"
                      onChange={(e) => handleBulkStyleUpdate('color', e.target.value, false, true)}
                      onBlur={() => onSaveHistory?.()}
                      className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="#000000"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(value)) {
                          handleBulkStyleUpdate('color', value, true);
                        }
                      }}
                      className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Text Style - Only for text elements */}
              {selectedElements.some(el => el.type === 'text') && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Style de texte</label>
                  <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
                    <button
                      onClick={() => handleBulkStyleToggle('fontWeight')}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                        isStyleActive('fontWeight')
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title="Basculer gras"
                    >
                      <Bold size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleBulkStyleToggle('fontStyle')}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                        isStyleActive('fontStyle')
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title="Basculer italique"
                    >
                      <Italic size={16} />
                    </button>

                    <button
                      onClick={() => handleBulkStyleToggle('textDecoration')}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                        isStyleActive('textDecoration')
                          ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title="Basculer souligné"
                    >
                      <Underline size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Text Align Horizontal - Only for text elements */}
              {selectedElements.some(el => el.type === 'text') && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Alignement horizontal</label>
                  <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
                    {[
                      { value: 'left', icon: AlignLeft, label: 'Gauche' },
                      { value: 'center', icon: AlignCenter, label: 'Centre' },
                      { value: 'right', icon: AlignRight, label: 'Droite' }
                    ].map((option) => {
                      const textElements = selectedElements.filter(el => el.type === 'text');
                      const isActive = textElements.length > 0 && textElements.every(el => (el.style.textAlign || 'left') === option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleBulkStyleUpdate('textAlign', option.value)}
                          className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={option.label}
                        >
                          <option.icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Align Vertical - Only for text elements */}
              {selectedElements.some(el => el.type === 'text') && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Alignement vertical</label>
                  <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
                    {[
                      { value: 'flex-start', icon: AlignStartVertical, label: 'Haut' },
                      { value: 'center', icon: AlignCenterVertical, label: 'Centre' },
                      { value: 'flex-end', icon: AlignEndVertical, label: 'Bas' }
                    ].map((option) => {
                      const textElements = selectedElements.filter(el => el.type === 'text');
                      const isActive = textElements.length > 0 && textElements.every(el => (el.style.alignItems || 'center') === option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleBulkStyleUpdate('alignItems', option.value)}
                          className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                          title={option.label}
                        >
                          <option.icon size={16} style={{ transform: 'rotate(90deg)' }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Font Size - Only for text elements */}
              {selectedElements.some(el => el.type === 'text') && (
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Taille de police</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="8"
                      max="200"
                      defaultValue="70"
                      onChange={(e) => handleBulkStyleUpdate('fontSize', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <input
                      type="number"
                      min="8"
                      max="200"
                      placeholder="70"
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 8 && value <= 200) {
                          handleBulkStyleUpdate('fontSize', value);
                        }
                      }}
                      className="w-14 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Position Controls */}
      {selectedElement && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Position</h4>
          
          {/* Position inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 block">X</label>
              <input
                type="text"
                value={Math.round(selectedElement.x)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    onUpdateElement(selectedElement.id, { x: value === '' ? 0 : parseInt(value) }, false, true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    onUpdateElement(selectedElement.id, { x: selectedElement.x - 1 });
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    onUpdateElement(selectedElement.id, { x: selectedElement.x + 1 });
                  }
                }}
                className="w-full text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 block">Y</label>
              <input
                type="text"
                value={Math.round(selectedElement.y)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    onUpdateElement(selectedElement.id, { y: value === '' ? 0 : parseInt(value) }, false, true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    onUpdateElement(selectedElement.id, { y: selectedElement.y - 1 });
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    onUpdateElement(selectedElement.id, { y: selectedElement.y + 1 });
                  }
                }}
                className="w-full text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Alignment buttons */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-1">
              <Button
                onClick={handleCenterHorizontally}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1 text-xs px-1"
                title="Centrer horizontalement"
              >
                <AlignHorizontalSpaceAround size={14} />
              </Button>
              <Button
                onClick={handleCenterVertically}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1 text-xs px-1"
                title="Centrer verticalement"
              >
                <AlignVerticalSpaceAround size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions - Available for both single and multi-selection */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => executeAction(onDuplicateElement, onDuplicateElements)}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1 text-xs px-2"
            title={multipleSelected ? `Dupliquer ${selectedElements.length} éléments` : 'Dupliquer'}
          >
            <CopyPlus size={16} className="flex-shrink-0" />
            <span className="truncate">Dupliquer</span>
          </Button>
          
          <Button
            onClick={() => executeAction(onDeleteElement, onDeleteElements)}
            variant="destructive"
            size="sm"
            className="flex items-center justify-center gap-1 text-xs px-2"
            title={multipleSelected ? `Supprimer ${selectedElements.length} éléments` : 'Supprimer'}
          >
            <Trash2 size={16} className="flex-shrink-0" />
            <span className="truncate">Supprimer {multipleSelected ? `(${selectedElements.length})` : ''}</span>
          </Button>
        </div>
      </div>

      {/* Symmetry Controls */}
      {selectedElements.length > 0 && (
        <div className="border-t dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Symétrie Centrale</h4>
          
          {!hasSymmetryPair ? (
            <Button
              onClick={onCreateSymmetry}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              title="Créer une symétrie centrale pour les éléments sélectionnés"
            >
              <Shuffle size={14} />
              Créer Symétrie
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                ✓ Éléments en symétrie centrale
              </div>
              <Button
                onClick={onBreakSymmetry}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
                title="Supprimer la symétrie centrale"
              >
                <X size={14} />
                Casser Symétrie
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Content - Only for single text/qrcode elements */}
      {selectedElement && (selectedElement.type === 'text' || selectedElement.type === 'qrcode') && (
        <div className="border-t dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu</label>
          <textarea
            value={selectedElement.content}
            onChange={(e) => handleContentUpdate(e.target.value, true)}
            onBlur={() => onSaveHistory?.()}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm resize-none"
            rows={3}
            placeholder={selectedElement.type === 'qrcode' ? 'URL ou texte pour QR Code' : 'Texte à afficher'}
          />
        </div>
      )}

      {/* Style Properties */}
      <div className="border-t dark:border-gray-700 pt-4 space-y-3">
        <h4 className="font-medium text-gray-800 dark:text-gray-200">Style</h4>

        {/* Font Family - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Police</label>
            <select
              value={selectedElement.style.fontFamily || 'Arial'}
              onChange={(e) => handleStyleUpdate('fontFamily', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Courier New">Courier New</option>
            </select>
          </div>
        )}

        {/* Font Size - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <div 
              className="flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 -m-1"
              onClick={() => setOpenSlider(openSlider === 'fontSize' ? null : 'fontSize')}
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Taille</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedElement.style.fontSize ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleStyleUpdate('fontSize', '');
                    } else if (!isNaN(Number(value))) {
                      handleStyleUpdate('fontSize', parseInt(value) || '');
                    }
                  }}
                  onKeyDown={(e) => {
                    const currentValue = selectedElement.style.fontSize || 70;
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      handleStyleUpdate('fontSize', Math.min(200, currentValue + 1));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      handleStyleUpdate('fontSize', Math.max(8, currentValue - 1));
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(Number(value))) {
                      handleStyleUpdate('fontSize', 70);
                    } else {
                      const numValue = parseInt(value);
                      handleStyleUpdate('fontSize', Math.max(8, Math.min(200, numValue)));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
            {openSlider === 'fontSize' && (
              <input
                type="range"
                min="8"
                max="200"
                value={selectedElement.style.fontSize || 70}
                onMouseDown={() => setIsDraggingSlider(true)}
                onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value), true)}
                onMouseUp={() => {
                  setIsDraggingSlider(false);
                  onSaveHistory?.();
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
              />
            )}
          </div>
        )}

        {/* Line Height - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <div 
              className="flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 -m-1"
              onClick={() => setOpenSlider(openSlider === 'lineHeight' ? null : 'lineHeight')}
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Interligne</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedElement.style.lineHeight !== undefined ? selectedElement.style.lineHeight.toFixed(1) : '1.2'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(Number(value))) {
                      handleStyleUpdate('lineHeight', parseFloat(value) || 1.2);
                    }
                  }}
                  onKeyDown={(e) => {
                    const currentValue = selectedElement.style.lineHeight || 1.2;
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      handleStyleUpdate('lineHeight', Math.min(3, currentValue + 0.1));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      handleStyleUpdate('lineHeight', Math.max(0.5, currentValue - 0.1));
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(Number(value))) {
                      handleStyleUpdate('lineHeight', 1.2);
                    } else {
                      const numValue = parseFloat(value);
                      handleStyleUpdate('lineHeight', Math.max(0.5, Math.min(3, numValue)));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
                />
              </div>
            </div>
            {openSlider === 'lineHeight' && (
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={selectedElement.style.lineHeight || 1.2}
                onMouseDown={() => setIsDraggingSlider(true)}
                onChange={(e) => handleStyleUpdate('lineHeight', parseFloat(e.target.value), true)}
                onMouseUp={() => {
                  setIsDraggingSlider(false);
                  onSaveHistory?.();
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
              />
            )}
          </div>
        )}

        {/* Letter Spacing - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <div 
              className="flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 -m-1"
              onClick={() => setOpenSlider(openSlider === 'letterSpacing' ? null : 'letterSpacing')}
            >
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Espacement</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedElement.style.letterSpacing !== undefined ? selectedElement.style.letterSpacing.toFixed(1) : '0.0'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!isNaN(Number(value))) {
                      handleStyleUpdate('letterSpacing', parseFloat(value) || 0);
                    }
                  }}
                  onKeyDown={(e) => {
                    const currentValue = selectedElement.style.letterSpacing || 0;
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      handleStyleUpdate('letterSpacing', Math.min(20, currentValue + 0.5));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      handleStyleUpdate('letterSpacing', Math.max(-5, currentValue - 0.5));
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(Number(value))) {
                      handleStyleUpdate('letterSpacing', 0);
                    } else {
                      const numValue = parseFloat(value);
                      handleStyleUpdate('letterSpacing', Math.max(-5, Math.min(20, numValue)));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
              </div>
            </div>
            {openSlider === 'letterSpacing' && (
              <input
                type="range"
                min="-5"
                max="20"
                step="0.5"
                value={selectedElement.style.letterSpacing || 0}
                onMouseDown={() => setIsDraggingSlider(true)}
                onChange={(e) => handleStyleUpdate('letterSpacing', parseFloat(e.target.value), true)}
                onMouseUp={() => {
                  setIsDraggingSlider(false);
                  onSaveHistory?.();
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
              />
            )}
          </div>
        )}

        {/* Color - Text and QR Code */}
        {(selectedElement?.type === 'text' || selectedElement?.type === 'qrcode') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={selectedElement.style.color || '#000000'}
                onChange={(e) => handleStyleUpdate('color', e.target.value, true)}
                onBlur={() => onSaveHistory?.()}
                className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.style.color || '#000000'}
                onChange={(e) => handleStyleUpdate('color', e.target.value, false, true)}
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Text Style - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Style de texte</label>
            <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
               {/* Bold */}
               <button
                 onClick={() => handleStyleUpdate('fontWeight', selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                 className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${selectedElement.style.fontWeight === 'bold' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                 title="Gras"
               >
                 <Bold size={18} />
               </button>
               
               {/* Italic */}
               <button
                 onClick={() => handleStyleUpdate('fontStyle', selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                 className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${selectedElement.style.fontStyle === 'italic' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                 title="Italique"
               >
                 <Italic size={18} />
               </button>

               {/* Underline */}
               <button
                 onClick={() => handleStyleUpdate('textDecoration', selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline')}
                 className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${selectedElement.style.textDecoration === 'underline' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                 title="Souligné"
               >
                 <Underline size={18} />
               </button>
            </div>
          </div>
        )}

        {/* Text Align Horizontal - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alignement horizontal</label>
            <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
              {[
                { value: 'left', icon: AlignLeft, label: 'Gauche' },
                { value: 'center', icon: AlignCenter, label: 'Centre' },
                { value: 'right', icon: AlignRight, label: 'Droite' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStyleUpdate('textAlign', option.value)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                    (selectedElement.style.textAlign || 'left') === option.value
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={option.label}
                >
                  <option.icon size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Align Vertical - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alignement vertical</label>
            <div className="flex bg-gray-100 dark:bg-gray-900/50 rounded-md p-1 gap-1">
              {[
                { value: 'flex-start', icon: AlignStartVertical, label: 'Haut' },
                { value: 'center', icon: AlignCenterVertical, label: 'Centre' },
                { value: 'flex-end', icon: AlignEndVertical, label: 'Bas' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStyleUpdate('alignItems', option.value)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${
                    (selectedElement.style.alignItems || 'center') === option.value
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  title={option.label}
                >
                  <option.icon size={18} style={{ transform: 'rotate(90deg)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rotation */}
        <div>
          <div 
            className="flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 -m-1"
            onClick={() => setOpenSlider(openSlider === 'rotation' ? null : 'rotation')}
          >
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rotation</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedElement?.style.rotation ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-') {
                    handleStyleUpdate('rotation', value, false, true);
                  } else if (!isNaN(Number(value))) {
                    handleStyleUpdate('rotation', parseInt(value), false, true);
                  }
                }}
                onKeyDown={(e) => {
                  const currentValue = selectedElement?.style.rotation || 0;
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleStyleUpdate('rotation', Math.min(180, currentValue + 1));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleStyleUpdate('rotation', Math.max(-180, currentValue - 1));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === '-' || isNaN(Number(value))) {
                    handleStyleUpdate('rotation', 0);
                  } else {
                    const numValue = parseInt(value);
                    handleStyleUpdate('rotation', Math.max(-180, Math.min(180, numValue)));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">°</span>
            </div>
          </div>
          {openSlider === 'rotation' && (
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedElement?.style.rotation || 0}
              onMouseDown={() => setIsDraggingSlider(true)}
              onChange={(e) => handleStyleUpdate('rotation', parseInt(e.target.value), true)}
              onMouseUp={() => {
                setIsDraggingSlider(false);
                onSaveHistory?.();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          )}
        </div>

        {/* Opacity */}
        <div>
          <div 
            className="flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded p-1 -m-1"
            onClick={() => setOpenSlider(openSlider === 'opacity' ? null : 'opacity')}
          >
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opacité</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedElement?.style.opacity !== undefined ? Math.round(selectedElement.style.opacity * 100) : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleStyleUpdate('opacity', 0);
                  } else if (!isNaN(Number(value))) {
                    const numValue = parseInt(value);
                    handleStyleUpdate('opacity', numValue / 100);
                  }
                }}
                onKeyDown={(e) => {
                  const currentValue = Math.round((selectedElement?.style.opacity ?? 1) * 100);
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    handleStyleUpdate('opacity', Math.min(100, currentValue + 1) / 100);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    handleStyleUpdate('opacity', Math.max(0, currentValue - 1) / 100);
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value === '' || isNaN(Number(value))) {
                    handleStyleUpdate('opacity', 1);
                  } else {
                    const numValue = parseInt(value);
                    handleStyleUpdate('opacity', Math.max(0, Math.min(100, numValue)) / 100);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-2 py-1"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
            </div>
          </div>
          {openSlider === 'opacity' && (
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((selectedElement?.style.opacity ?? 1) * 100)}
              onMouseDown={() => setIsDraggingSlider(true)}
              onChange={(e) => handleStyleUpdate('opacity', parseInt(e.target.value) / 100, true)}
              onMouseUp={() => {
                setIsDraggingSlider(false);
                onSaveHistory?.();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
            />
          )}
        </div>

        {/* Z-Index */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Z-Index</label>
          <input
            type="number"
            value={selectedElement?.style.zIndex || 1}
            onChange={(e) => handleStyleUpdate('zIndex', parseInt(e.target.value))}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm"
          />
        </div>
      </div>
      </div>

      {/* Actions - Fixed en bas */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center gap-2">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Annuler (Ctrl+Z)"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Undo2 size={18} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* History Counter */}
          <div className="px-3 text-sm font-medium min-w-[60px] text-center text-gray-900 dark:text-gray-100">
            {historyIndex + 1}/{historyLength || 1}
          </div>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Rétablir (Ctrl+Y)"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Redo2 size={18} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};