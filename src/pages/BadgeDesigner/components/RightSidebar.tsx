import React from 'react';
import { 
  Trash2, Eye, EyeOff, RotateCcw, RotateCw, Copy, ArrowUp, ArrowDown, Shuffle, X,
  AlignLeft, AlignCenter, AlignRight, Bold, Type, Italic, Underline,
  AlignHorizontalSpaceAround, AlignVerticalSpaceAround
} from 'lucide-react';
import { BadgeElement, BadgeFormat } from '../../../shared/types/badge.types';
import { Button } from '../../../shared/ui/Button';
import { getTransformWithRotation } from '../../../shared/utils/transform';
import { mmToPx } from '../../../shared/utils/conversion';

interface RightSidebarProps {
  selectedElements: BadgeElement[];
  symmetryPairs: Map<string, string>;
  badgeFormat: BadgeFormat;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onMoveElement: (id: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onCreateSymmetry: () => void;
  onBreakSymmetry: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElements,
  symmetryPairs,
  badgeFormat,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  onToggleVisibility,
  onCreateSymmetry,
  onBreakSymmetry
}) => {
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const multipleSelected = selectedElements.length > 1;
  
  // Check if any selected element has a symmetry pair
  const hasSymmetryPair = selectedElements.some(el => 
    symmetryPairs.has(el.id) || Array.from(symmetryPairs.values()).includes(el.id)
  );

  if (selectedElements.length === 0) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 border-l dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p className="text-sm">Sélectionner un élément pour modifier ses propriétés</p>
        </div>
      </div>
    );
  }

  const handleStyleUpdate = (property: string, value: any) => {
    selectedElements.forEach(element => {
      const updates: any = {
        style: { ...element.style, [property]: value }
      };
      
      // When rotation changes, also update the transform
      if (property === 'rotation') {
        updates.style.transform = getTransformWithRotation(value, element.style.transform);
      }
      
      // Ajuster automatiquement la hauteur quand on change la taille de police
      if (property === 'fontSize' && element.type === 'text') {
        updates.height = Math.ceil(value * 1.5);
      }
      
      onUpdateElement(element.id, updates);
    });
  };

  const handleContentUpdate = (content: string) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { content });
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

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col space-y-4 overflow-y-auto border-l dark:border-gray-700">
      {/* Header */}
      <div className="border-b dark:border-gray-700 pb-2">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          {multipleSelected 
            ? `${selectedElements.length} éléments sélectionnés`
            : `Élément: ${selectedElement?.type}`
          }
        </h3>
      </div>

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
                    onUpdateElement(selectedElement.id, { x: value === '' ? 0 : parseInt(value) });
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
                    onUpdateElement(selectedElement.id, { y: value === '' ? 0 : parseInt(value) });
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

      {/* Actions */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {selectedElement && (
            <>
              <Button
                onClick={() => onDuplicateElement(selectedElement.id)}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1"
              >
                <Copy size={14} />
                Dupliquer
              </Button>
              
              <Button
                onClick={() => onToggleVisibility(selectedElement.id)}
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1"
              >
                {selectedElement.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                {selectedElement.visible ? 'Masquer' : 'Afficher'}
              </Button>
            </>
          )}
        </div>

        {selectedElement && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onMoveElement(selectedElement.id, 'up')}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1"
            >
              <ArrowUp size={14} />
              Monter
            </Button>
            
            <Button
              onClick={() => onMoveElement(selectedElement.id, 'down')}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1"
            >
              <ArrowDown size={14} />
              Descendre
            </Button>
          </div>
        )}

        <Button
          onClick={() => selectedElements.forEach(el => onDeleteElement(el.id))}
          variant="destructive"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          Supprimer
        </Button>
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
            onChange={(e) => handleContentUpdate(e.target.value)}
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
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Taille</label>
              <div className="flex items-center">
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
                  className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-0.5"
                />
                <span className="text-xs text-gray-500 ml-1">px</span>
              </div>
            </div>
            <input
              type="range"
              min="8"
              max="200"
              value={selectedElement.style.fontSize || 70}
              onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
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
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
                className="w-12 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedElement.style.color || '#000000'}
                onChange={(e) => handleStyleUpdate('color', e.target.value)}
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

        {/* Text Align - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alignement</label>
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

        {/* Rotation */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rotation</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const currentRotation = selectedElement?.style.rotation || 0;
                  handleStyleUpdate('rotation', currentRotation - 15);
                }}
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 flex items-center justify-center"
              >
                <RotateCcw size={12} />
              </Button>
              <div className="flex items-center">
                <input
                  type="text"
                  value={selectedElement?.style.rotation ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === '-') {
                      handleStyleUpdate('rotation', value);
                    } else if (!isNaN(Number(value))) {
                      handleStyleUpdate('rotation', parseInt(value));
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
                  className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-0.5"
                />
              </div>
              <Button
                onClick={() => {
                  const currentRotation = selectedElement?.style.rotation || 0;
                  handleStyleUpdate('rotation', currentRotation + 15);
                }}
                variant="outline"
                size="sm"
                className="h-6 w-6 p-0 flex items-center justify-center"
              >
                <RotateCw size={12} />
              </Button>
            </div>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={selectedElement?.style.rotation || 0}
            onChange={(e) => handleStyleUpdate('rotation', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opacité</label>
            <div className="flex items-center">
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
                className="w-16 text-right text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-0.5"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((selectedElement?.style.opacity ?? 1) * 100)}
            onChange={(e) => handleStyleUpdate('opacity', parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
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
  );
};