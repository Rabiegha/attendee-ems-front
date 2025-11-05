import React from 'react';
import { Trash2, Eye, EyeOff, RotateCcw, RotateCw, Copy, ArrowUp, ArrowDown, Shuffle, X } from 'lucide-react';
import { BadgeElement } from '../../../shared/types/badge.types';
import { Button } from '../../../shared/ui/Button';

interface RightSidebarProps {
  selectedElements: BadgeElement[];
  symmetryPairs: Map<string, string>;
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
      onUpdateElement(element.id, {
        style: { ...element.style, [property]: value }
      });
    });
  };

  const handleContentUpdate = (content: string) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { content });
    }
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille de police ({selectedElement.style.fontSize || 16}px)
            </label>
            <input
              type="range"
              min="8"
              max="72"
              value={selectedElement.style.fontSize || 16}
              onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value))}
              className="w-full"
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

        {/* Font Weight - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids</label>
            <select
              value={selectedElement.style.fontWeight || 'normal'}
              onChange={(e) => handleStyleUpdate('fontWeight', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Gras</option>
              <option value="lighter">Léger</option>
            </select>
          </div>
        )}

        {/* Text Align - Text only */}
        {selectedElement?.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alignement</label>
            <select
              value={selectedElement.style.textAlign || 'left'}
              onChange={(e) => handleStyleUpdate('textAlign', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded p-2 text-sm"
            >
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
            </select>
          </div>
        )}

        {/* Rotation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rotation ({selectedElement?.style.rotation || 0}°)
          </label>
          <div className="flex gap-2 mb-2">
            <Button
              onClick={() => {
                const currentRotation = selectedElement?.style.rotation || 0;
                handleStyleUpdate('rotation', currentRotation - 15);
              }}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              <RotateCcw size={14} />
            </Button>
            <Button
              onClick={() => {
                const currentRotation = selectedElement?.style.rotation || 0;
                handleStyleUpdate('rotation', currentRotation + 15);
              }}
              variant="outline"
              size="sm"
              className="flex items-center justify-center"
            >
              <RotateCw size={14} />
            </Button>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={selectedElement?.style.rotation || 0}
            onChange={(e) => handleStyleUpdate('rotation', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Opacité ({Math.round((selectedElement?.style.opacity || 1) * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedElement?.style.opacity || 1}
            onChange={(e) => handleStyleUpdate('opacity', parseFloat(e.target.value))}
            className="w-full"
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