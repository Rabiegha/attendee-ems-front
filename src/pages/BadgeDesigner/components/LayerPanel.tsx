import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  GripVertical,
  Type,
  QrCode,
  ImageIcon,
  Square,
  ChevronDown,
  ChevronRight,
  Pencil,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { BadgeElement } from '../../../shared/types/badge.types';

interface LayerPanelProps {
  elements: BadgeElement[];
  selectedElements: string[];
  symmetryPairs: Map<string, string>;
  onSelectElements: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>, skipHistory?: boolean) => void;
  onBatchUpdateElements: (updates: Array<{ id: string; updates: Partial<BadgeElement> }>, skipHistory?: boolean) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElements: (reorderedElements: BadgeElement[]) => void;
}

// Layer name helper: generate display name for an element
const getLayerDisplayName = (element: BadgeElement): string => {
  if (element.name) return element.name;
  switch (element.type) {
    case 'text':
      if (element.content.includes('{{')) {
        return element.content.replace(/\{\{|\}\}/g, '');
      }
      return element.content.length > 20
        ? element.content.substring(0, 20) + '…'
        : element.content || 'Texte vide';
    case 'qrcode':
    case 'qr':
      return 'QR Code';
    case 'image':
      return 'Image';
    case 'shape':
      return 'Forme';
    default:
      return 'Élément';
  }
};

// Icon for element type
const LayerTypeIcon: React.FC<{ type: BadgeElement['type']; size?: number }> = ({ type, size = 14 }) => {
  switch (type) {
    case 'text':
      return <Type size={size} />;
    case 'qrcode':
    case 'qr':
      return <QrCode size={size} />;
    case 'image':
      return <ImageIcon size={size} />;
    case 'shape':
      return <Square size={size} />;
    default:
      return <Square size={size} />;
  }
};

// Single layer item
const LayerItem: React.FC<{
  element: BadgeElement;
  isSelected: boolean;
  isSymmetryClone: boolean;
  symmetryParentName?: string | undefined;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onUpdateElement: (id: string, updates: Partial<BadgeElement>, skipHistory?: boolean) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  index: number;
  dragOverIndex: number | null;
  isDragging: boolean;
}> = ({
  element,
  isSelected,
  isSymmetryClone,
  symmetryParentName,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onDragStart,
  onDragOver,
  onDragEnd,
  index,
  dragOverIndex,
  isDragging,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const name = getLayerDisplayName(element);
    setEditName(name);
    setIsEditing(true);
  }, [element]);

  const handleConfirmRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed) {
      onUpdateElement(element.id, { name: trimmed }, true);
    }
    setIsEditing(false);
  }, [editName, element.id, onUpdateElement]);

  const handleCancelRename = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleConfirmRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  }, [handleConfirmRename, handleCancelRename]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isDropTarget = dragOverIndex === index;
  const isHidden = !element.visible;
  const isLocked = element.locked === true;

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onClick={(e) => onSelect(element.id, e)}
      className={`
        group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer select-none transition-colors
        ${isSelected
          ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
        }
        ${isDropTarget ? 'border-t-2 border-t-blue-500' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isHidden ? 'opacity-60' : ''}
      `}
    >
      {/* Drag handle */}
      <div
        className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      {/* Type icon */}
      <div className={`shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
        <LayerTypeIcon type={element.type} size={14} />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleConfirmRename}
              className="w-full text-xs px-1 py-0.5 rounded border border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span
              className={`text-xs truncate ${
                isHidden ? 'text-gray-400 dark:text-gray-500 line-through' : 
                isSelected ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'
              }`}
              onDoubleClick={handleStartRename}
              title={getLayerDisplayName(element)}
            >
              {getLayerDisplayName(element)}
            </span>
            {isSymmetryClone && (
              <span className="text-[10px] text-purple-500 dark:text-purple-400 shrink-0" title={`Symétrie de ${symmetryParentName || '?'}`}>
                ⟡
              </span>
            )}
            {isLocked && (
              <Lock size={10} className="text-amber-500 dark:text-amber-400 shrink-0" />
            )}
          </div>
        )}
      </div>

      {/* Action buttons - visible on hover or when selected */}
      <div className={`flex items-center gap-0.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {/* Rename */}
        {!isEditing && (
          <button
            onClick={handleStartRename}
            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Renommer"
          >
            <Pencil size={12} />
          </button>
        )}

        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateElement(element.id, { visible: !element.visible });
          }}
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            isHidden ? 'text-red-400 dark:text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          title={isHidden ? 'Afficher' : 'Masquer'}
        >
          {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateElement(element.id, { locked: !isLocked });
          }}
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
            isLocked ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          title={isLocked ? 'Déverrouiller' : 'Verrouiller'}
        >
          {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateElement(element.id);
          }}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Dupliquer"
        >
          <Copy size={12} />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteElement(element.id);
          }}
          className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          title="Supprimer"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// Main LayerPanel component
export const LayerPanel: React.FC<LayerPanelProps> = ({
  elements,
  selectedElements,
  symmetryPairs,
  onSelectElements,
  onUpdateElement,
  onBatchUpdateElements,
  onDeleteElement,
  onDuplicateElement,
  onReorderElements,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Elements sorted by zIndex descending (highest zIndex = top of list)
  const sortedElements = [...elements].sort((a, b) => (b.style.zIndex || 0) - (a.style.zIndex || 0));

  // Build reverse symmetry map (clone ID -> parent ID)
  const cloneToParentMap = new Map<string, string>();
  symmetryPairs.forEach((cloneId, parentId) => {
    cloneToParentMap.set(cloneId, parentId);
  });

  const handleSelect = useCallback((id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      if (selectedElements.includes(id)) {
        onSelectElements(selectedElements.filter(eid => eid !== id));
      } else {
        onSelectElements([...selectedElements, id]);
      }
    } else if (e.shiftKey && selectedElements.length > 0) {
      // Range selection
      const lastSelected = selectedElements[selectedElements.length - 1];
      const lastIdx = sortedElements.findIndex(el => el.id === lastSelected);
      const currentIdx = sortedElements.findIndex(el => el.id === id);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx);
        const end = Math.max(lastIdx, currentIdx);
        const rangeIds = sortedElements.slice(start, end + 1).map(el => el.id);
        const newSelection = [...new Set([...selectedElements, ...rangeIds])];
        onSelectElements(newSelection);
      }
    } else {
      onSelectElements([id]);
    }
  }, [selectedElements, onSelectElements, sortedElements]);

  // Drag-to-reorder handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Use a transparent image as drag ghost
    const ghost = document.createElement('div');
    ghost.style.opacity = '0';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => document.body.removeChild(ghost));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      // Reorder the sorted elements
      const reordered = [...sortedElements];
      const [moved] = reordered.splice(dragIndex, 1);
      if (moved) {
        reordered.splice(dragOverIndex, 0, moved);

        // Reassign zIndex values: top of list = highest zIndex
        const updated = reordered.map((el, idx) => ({
          ...el,
          style: {
            ...el.style,
            zIndex: reordered.length - idx,
          },
        }));

        onReorderElements(updated);
      }
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, dragOverIndex, sortedElements, onReorderElements]);

  // Bulk actions
  const handleToggleAllVisibility = useCallback(() => {
    const allVisible = elements.every(el => el.visible);
    const updates = elements.map(el => ({ id: el.id, updates: { visible: !allVisible } as Partial<BadgeElement> }));
    onBatchUpdateElements(updates);
  }, [elements, onBatchUpdateElements]);

  const handleToggleAllLock = useCallback(() => {
    const allLocked = elements.every(el => el.locked === true);
    const updates = elements.map(el => ({ id: el.id, updates: { locked: !allLocked } as Partial<BadgeElement> }));
    onBatchUpdateElements(updates);
  }, [elements, onBatchUpdateElements]);

  if (elements.length === 0) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          Calques
          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
            ({elements.length})
          </span>
        </button>

        {/* Bulk actions */}
        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleAllVisibility}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title={elements.every(el => el.visible) ? 'Tout masquer' : 'Tout afficher'}
            >
              {elements.every(el => el.visible) ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button
              onClick={handleToggleAllLock}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              title={elements.every(el => el.locked === true) ? 'Tout déverrouiller' : 'Tout verrouiller'}
            >
              {elements.every(el => el.locked === true) ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Layer list */}
      {!isCollapsed && (
        <div className="space-y-0.5 max-h-60 overflow-y-auto">
          {sortedElements.map((element, index) => {
            const isClone = cloneToParentMap.has(element.id);
            const parentId = cloneToParentMap.get(element.id);
            const parentElement = parentId ? elements.find(el => el.id === parentId) : undefined;
            const parentName = parentElement ? getLayerDisplayName(parentElement) : undefined;

            return (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={selectedElements.includes(element.id)}
                isSymmetryClone={isClone}
                symmetryParentName={parentName}
                onSelect={handleSelect}
                onUpdateElement={onUpdateElement}
                onDeleteElement={onDeleteElement}
                onDuplicateElement={onDuplicateElement}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                index={index}
                dragOverIndex={dragOverIndex}
                isDragging={dragIndex === index}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
