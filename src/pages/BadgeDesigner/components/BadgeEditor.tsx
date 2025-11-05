import React, { useRef, useEffect, useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragMoveEvent, 
  DragStartEvent, 
  useDraggable, 
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { BadgeElement, BadgeFormat } from '../../../shared/types/badge.types';
import { mmToPx } from '../../../shared/utils/conversion';

interface BadgeEditorProps {
  format: BadgeFormat;
  background: string | null;
  elements: BadgeElement[];
  selectedElements: string[];
  badgeRef: React.RefObject<HTMLDivElement>;
  elementRefs: React.MutableRefObject<Map<string, React.RefObject<HTMLDivElement>>>;
  onBackgroundMouseDown: (e: React.MouseEvent) => void;
  onBackgroundMouseMove: (e: React.MouseEvent) => void;
  onBackgroundMouseUp: () => void;
  onBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  onDragStart: (id: string, e: any, data: { x: number; y: number }) => void;
  onDrag: (id: string, e: any, data: { x: number; y: number }) => void;
  onDragStop: (id: string, e: any, data: { x: number; y: number }) => void;
  onResize: (id: string, e: any, data: { size: { width: number; height: number }; position?: { x: number; y: number } }) => void;
  isSelecting: boolean;
  selectionStart: { x: number; y: number } | null;
  selectionEnd: { x: number; y: number } | null;
  uploadedImages: Map<string, { data: string; filename: string }>;
}

export const BadgeEditor: React.FC<BadgeEditorProps> = ({
  format,
  background,
  elements,
  selectedElements,
  badgeRef,
  elementRefs,
  onBackgroundMouseDown,
  onBackgroundMouseMove,
  onBackgroundMouseUp,
  onBackgroundUpload,
  onElementClick,
  onDragStart,
  onDrag,
  onDragStop,
  onResize,
  isSelecting,
  selectionStart,
  selectionEnd,
  uploadedImages
}) => {
  const [resizingElement, setResizingElement] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStartData, setResizeStartData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [shiftPressed, setShiftPressed] = useState(false);

  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Track shift key state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleResizeStart = (elementId: string, handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setResizingElement(elementId);
    setResizeHandle(handle);
    setResizeStartData({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingElement || !resizeHandle || !resizeStartData) return;

    const deltaX = e.clientX - resizeStartData.mouseX;
    const deltaY = e.clientY - resizeStartData.mouseY;

    let newWidth = resizeStartData.width;
    let newHeight = resizeStartData.height;
    let newX = resizeStartData.x;
    let newY = resizeStartData.y;

    const element = elements.find(el => el.id === resizingElement);
    if (!element) return;

    // Calculate new dimensions based on handle
    switch (resizeHandle) {
      case 'nw':
        newWidth = resizeStartData.width - deltaX;
        newHeight = resizeStartData.height - deltaY;
        newX = resizeStartData.x + deltaX;
        newY = resizeStartData.y + deltaY;
        break;
      case 'ne':
        newWidth = resizeStartData.width + deltaX;
        newHeight = resizeStartData.height - deltaY;
        newY = resizeStartData.y + deltaY;
        break;
      case 'sw':
        newWidth = resizeStartData.width - deltaX;
        newHeight = resizeStartData.height + deltaY;
        newX = resizeStartData.x + deltaX;
        break;
      case 'se':
        newWidth = resizeStartData.width + deltaX;
        newHeight = resizeStartData.height + deltaY;
        break;
      case 'n':
        newHeight = resizeStartData.height - deltaY;
        newY = resizeStartData.y + deltaY;
        break;
      case 's':
        newHeight = resizeStartData.height + deltaY;
        break;
      case 'w':
        newWidth = resizeStartData.width - deltaX;
        newX = resizeStartData.x + deltaX;
        break;
      case 'e':
        newWidth = resizeStartData.width + deltaX;
        break;
    }

    // Maintain aspect ratio if shift is pressed or element requires it
    if (shiftPressed || element.maintainAspectRatio) {
      const aspectRatio = element.aspectRatio || resizeStartData.width / resizeStartData.height;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }
    }

    // Minimum size constraints
    newWidth = Math.max(10, newWidth);
    newHeight = Math.max(10, newHeight);

    onResize(resizingElement, null, {
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY }
    });
  };

  const handleResizeEnd = () => {
    setResizingElement(null);
    setResizeHandle(null);
    setResizeStartData(null);
  };

  useEffect(() => {
    if (resizingElement) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
    return undefined;
  }, [resizingElement, resizeHandle, resizeStartData]);

  // DraggableElement component for @dnd-kit
  const DraggableElement: React.FC<{
    element: BadgeElement;
    children: React.ReactNode;
    isSelected: boolean;
    elementRef: React.RefObject<HTMLDivElement>;
  }> = ({ element, children, isSelected, elementRef }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      isDragging,
    } = useDraggable({
      id: element.id,
      data: { element }
    });

    const style = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `${CSS.Translate.toString(transform)} ${element.style.transform || ''} rotate(${element.style.rotation || 0}deg)`.trim(),
      zIndex: isSelected ? 10 : 1,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={(node) => {
          setNodeRef(node);
          if (elementRef.current !== node) {
            (elementRef as any).current = node;
          }
        }}
        style={style}
        className={`select-none ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={(e) => onElementClick(element.id, e)}
        {...attributes}
      >
        {/* Zone de contenu draggable */}
        <div
          className="w-full h-full cursor-move"
          {...listeners}
        >
          {children}
        </div>
      </div>
    );
  };

  const renderElement = (element: BadgeElement) => {
    const isSelected = selectedElements.includes(element.id);
    
    if (!elementRefs.current.has(element.id)) {
      elementRefs.current.set(element.id, React.createRef());
    }

    const elementRef = elementRefs.current.get(element.id)!;

    let content;
    if (element.type === 'text') {
      content = (
        <div 
          style={{
            fontFamily: element.style.fontFamily,
            fontSize: `${element.style.fontSize}px`,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            textAlign: element.style.textAlign,
            textTransform: element.style.textTransform,
            lineHeight: '1.2',
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {element.content}
        </div>
      );
    } else if (element.type === 'qrcode') {
      content = (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500 text-xs"
          style={{ fontSize: '10px' }}
        >
          QR: {element.content.substring(0, 20)}...
        </div>
      );
    } else if (element.type === 'image') {
      const imageData = uploadedImages.get(element.imageId || '');
      content = (
        <div className="w-full h-full overflow-hidden">
          {imageData ? (
            <img 
              src={imageData.data} 
              alt="" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
              Image
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <DraggableElement
          key={element.id}
          element={element}
          isSelected={isSelected}
          elementRef={elementRef}
        >
          {content}
        </DraggableElement>
        
        {/* Resize handles - en dehors de la zone draggable */}
        {isSelected && (
          <>
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map(handle => (
              <div
                key={handle}
                className={`absolute w-2 h-2 bg-blue-500 border border-white z-20`}
                style={{
                  ...getHandlePosition(handle, element),
                  display: resizingElement && resizingElement !== element.id ? 'none' : 'block',
                  cursor: `${handle}-resize`
                }}
                onMouseDown={(e) => {
                  e.stopPropagation(); // Empêche le drag
                  handleResizeStart(element.id, handle, e);
                }}
              />
            ))}
          </>
        )}
      </>
    );
  };

  const getHandlePosition = (handle: string, element: BadgeElement) => {
    const { x, y, width, height } = element;
    switch (handle) {
      case 'nw': return { top: y - 4, left: x - 4 };
      case 'ne': return { top: y - 4, left: x + width - 4 };
      case 'sw': return { top: y + height - 4, left: x - 4 };
      case 'se': return { top: y + height - 4, left: x + width - 4 };
      case 'n': return { top: y - 4, left: x + width / 2 - 4 };
      case 's': return { top: y + height - 4, left: x + width / 2 - 4 };
      case 'w': return { top: y + height / 2 - 4, left: x - 4 };
      case 'e': return { top: y + height / 2 - 4, left: x + width - 4 };
      default: return {};
    }
  };

  const badgeWidth = mmToPx(format.width);
  const badgeHeight = mmToPx(format.height);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    })
  );

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const elementId = active.id as string;
    const element = elements.find(el => el.id === elementId);
    if (element && onDragStart) {
      onDragStart(elementId, null as any, { x: element.x, y: element.y });
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    const element = elements.find(el => el.id === elementId);
    if (element && onDrag) {
      onDrag(elementId, null as any, { 
        x: element.x + delta.x, 
        y: element.y + delta.y 
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    const element = elements.find(el => el.id === elementId);
    if (element && onDragStop) {
      onDragStop(elementId, null as any, { 
        x: element.x + delta.x, 
        y: element.y + delta.y 
      });
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-100 overflow-auto">
      <div className="relative">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={badgeRef}
            className="relative bg-white shadow-lg border-2 border-gray-300 overflow-hidden"
            style={{
              width: `${badgeWidth}px`,
              height: `${badgeHeight}px`,
              backgroundImage: background ? `url(${background})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            onMouseDown={onBackgroundMouseDown}
            onMouseMove={onBackgroundMouseMove}
            onMouseUp={onBackgroundMouseUp}
          >
          {/* Background upload prompt */}
          {!background && (
            <div 
              className="absolute inset-0 flex items-center justify-center text-gray-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                backgroundInputRef.current?.click();
              }}
            >
              <div className="text-center">
                <Plus size={48} className="mx-auto mb-2" />
                <p className="text-sm">Cliquez pour ajouter un arrière-plan</p>
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onBackgroundUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Render elements */}
          {elements.map(renderElement)}

          {/* Selection rectangle */}
          {isSelecting && selectionStart && selectionEnd && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
              }}
            />
          )}
          </div>
        </DndContext>
      </div>
    </div>
  );
};