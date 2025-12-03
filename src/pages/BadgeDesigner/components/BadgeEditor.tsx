import React, { useRef, useEffect, useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragMoveEvent, 
  DragStartEvent, 
  useDraggable, 
  PointerSensor,
  useSensor,
  useSensors,
  Modifier,
  useDndMonitor
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { BadgeElement, BadgeFormat } from '../../../shared/types/badge.types';
import { mmToPx } from '../../../shared/utils/conversion';
import { getTransformWithRotation } from '../../../shared/utils/transform';
import { useCallback, useMemo } from 'react';

interface SnapLine {
  orientation: 'vertical' | 'horizontal';
  position: number; // x or y in badge coordinates
  start: number;
  end: number;
}

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
  zoom?: number;
  symmetryPairs: Map<string, string>; // Add symmetry pairs
}

interface DraggableElementProps {
  element: BadgeElement;
  children: React.ReactNode;
  isSelected: boolean;
  elementRef: React.RefObject<HTMLDivElement>;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  zoom: number;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  children,
  isSelected,
  elementRef,
  onElementClick,
  zoom
}) => {
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

  // Adjust transform for zoom to ensure the element follows the mouse cursor 1:1
  // Note: The transform passed here is already adjusted for zoom by the scaleModifier in DndContext
  const style = {
    position: 'absolute' as const,
    left: element.x,
    top: element.y,
    width: `${element.width}px`,
    height: `${element.height}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isSelected ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (elementRef && 'current' in elementRef) {
          (elementRef as any).current = node;
        }
      }}
      style={{
        ...style,
        ...(isSelected && {
          outline: `${Math.max(2, 2 / zoom)}px solid rgb(59, 130, 246)`,
          outlineOffset: '0px'
        })
      }}
      className="select-none"
      onClick={(e) => onElementClick(element.id, e)}
      {...attributes}
    >
      {/* Zone de contenu draggable */}
      <div
        className="w-full h-full cursor-move"
        style={{ opacity: element.style.opacity ?? 1 }}
        {...listeners}
      >
        {children}
      </div>
    </div>
  );
};

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
  onDrag: _onDrag, // Non utilisé pour éviter l'effet de rebond avec dnd-kit
  onDragStop,
  onResize,
  isSelecting,
  selectionStart,
  selectionEnd,
  uploadedImages,
  zoom = 1,
  symmetryPairs
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
  
  // Track dragging for symmetry
  const [activeDragElement, setActiveDragElement] = useState<BadgeElement | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);
  const snapLinesRef = useRef<SnapLine[]>([]);

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

    // Compenser le zoom dans les deltas
    const deltaX = (e.clientX - resizeStartData.mouseX) / zoom;
    const deltaY = (e.clientY - resizeStartData.mouseY) / zoom;

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



  // Render element content (can be used for both real elements and ghost elements)
  const renderElementContent = (element: BadgeElement) => {
    if (element.type === 'text') {
      return (
        <div 
          style={{
            width: '100%',
            height: '100%',
            fontFamily: element.style.fontFamily,
            fontSize: `${element.style.fontSize}px`,
            color: element.style.color,
            fontWeight: element.style.fontWeight,
            fontStyle: element.style.fontStyle,
            textDecoration: element.style.textDecoration || 'none',
            textAlign: element.style.textAlign,
            transform: element.style.transform,
            transformOrigin: 'center center',
            textTransform: element.style.textTransform,
            overflow: 'visible', // Important: like old system
            display: 'flex',
            alignItems: 'center',
            justifyContent: element.style.textAlign === 'center' ? 'center' : 
                          element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            pointerEvents: 'none',
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {element.content}
        </div>
      );
    } else if (element.type === 'qrcode') {
      return (
        <div 
          className="flex flex-col items-center justify-center bg-white border-2 border-gray-300 text-gray-600"
          style={{ 
            fontSize: '10px', 
            width: '100%', 
            height: '100%',
            transform: element.style.transform,
            transformOrigin: 'center center'
          }}
        >
          <svg 
            viewBox="0 0 100 100" 
            className="w-3/4 h-3/4"
            style={{ maxWidth: '80%', maxHeight: '80%' }}
          >
            {/* Simple QR code pattern */}
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <rect x="10" y="10" width="25" height="25" fill="black"/>
            <rect x="15" y="15" width="15" height="15" fill="white"/>
            <rect x="65" y="10" width="25" height="25" fill="black"/>
            <rect x="70" y="15" width="15" height="15" fill="white"/>
            <rect x="10" y="65" width="25" height="25" fill="black"/>
            <rect x="15" y="70" width="15" height="15" fill="white"/>
            <rect x="40" y="40" width="20" height="20" fill="black"/>
            <rect x="45" y="45" width="10" height="10" fill="white"/>
          </svg>
          <span className="text-[8px] mt-1">QR Code</span>
        </div>
      );
    } else if (element.type === 'image') {
      const imageData = uploadedImages.get(element.imageId || '');
      return (
        <img 
          src={imageData?.data} 
          alt="" 
          className="w-full h-full object-contain pointer-events-none"
          style={{ 
            transform: element.style.transform,
            transformOrigin: 'center center'
          }}
        />
      );
    }
    return null;
  };

  const renderElement = (element: BadgeElement) => {
    const isSelected = selectedElements.includes(element.id);
    
    if (!elementRefs.current.has(element.id)) {
      elementRefs.current.set(element.id, React.createRef());
    }

    const elementRef = elementRefs.current.get(element.id)!;

    const content = renderElementContent(element);

    return (
      <>
        <DraggableElement
          key={element.id}
          element={element}
          isSelected={isSelected}
          elementRef={elementRef}
          onElementClick={onElementClick}
          zoom={zoom}
        >
          {content}
        </DraggableElement>
        
        {/* Resize handles - en dehors de la zone draggable */}
        {isSelected && (
          <>
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map(handle => {
              const handleSize = Math.max(6, 8 / zoom); // Taille adaptée au zoom
              const handleOffset = handleSize / 2;
              return (
                <div
                  key={handle}
                  className={`absolute bg-blue-500 border border-white z-20`}
                  style={{
                    ...getHandlePosition(handle, element, handleOffset),
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    display: resizingElement && resizingElement !== element.id ? 'none' : 'block',
                    cursor: `${handle}-resize`
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Empêche le drag
                    handleResizeStart(element.id, handle, e);
                  }}
                />
              );
            })}
          </>
        )}
      </>
    );
  };

  const getHandlePosition = (handle: string, element: BadgeElement, offset: number = 4) => {
    const { x, y, width, height } = element;
    switch (handle) {
      case 'nw': return { top: y - offset, left: x - offset };
      case 'ne': return { top: y - offset, left: x + width - offset };
      case 'sw': return { top: y + height - offset, left: x - offset };
      case 'se': return { top: y + height - offset, left: x + width - offset };
      case 'n': return { top: y - offset, left: x + width / 2 - offset };
      case 's': return { top: y + height - offset, left: x + width / 2 - offset };
      case 'w': return { top: y + height / 2 - offset, left: x - offset };
      case 'e': return { top: y + height / 2 - offset, left: x + width - offset };
      default: return {};
    }
  };

  const badgeWidth = mmToPx(format.width);
  const badgeHeight = mmToPx(format.height);

  // Scale modifier to convert screen pixels to badge pixels
  const scaleModifier = useCallback<Modifier>(({ transform }) => {
    return {
      ...transform,
      x: transform.x / zoom,
      y: transform.y / zoom
    };
  }, [zoom]);

  // Snap modifier
  const snapModifier = useCallback<Modifier>(({ transform, active }) => {
    if (!active) return transform;

    const element = elements.find(el => el.id === active.id);
    if (!element) return transform;

    // Calculate current position in badge coordinates
    // transform is already in badge pixels due to scaleModifier
    const currentX = element.x + transform.x;
    const currentY = element.y + transform.y;
    const width = element.width;
    const height = element.height;

    const threshold = 5 / zoom; // 5px screen threshold converted to badge pixels
    const newSnapLines: SnapLine[] = [];
    
    let correctionX = 0;
    let correctionY = 0;

    // Snap targets (vertical)
    const verticalTargets = [
      { pos: 0, start: 0, end: badgeHeight }, // Left edge of canvas
      { pos: badgeWidth / 2, start: 0, end: badgeHeight }, // Center of canvas
      { pos: badgeWidth, start: 0, end: badgeHeight }, // Right edge of canvas
    ];

    // Snap targets (horizontal)
    const horizontalTargets = [
      { pos: 0, start: 0, end: badgeWidth }, // Top edge of canvas
      { pos: badgeHeight / 2, start: 0, end: badgeWidth }, // Center of canvas
      { pos: badgeHeight, start: 0, end: badgeWidth }, // Bottom edge of canvas
    ];

    // Add other elements as targets
    elements.forEach(el => {
      if (el.id === element.id) return;
      
      // Vertical edges
      verticalTargets.push(
        { pos: el.x, start: Math.min(el.y, currentY), end: Math.max(el.y + el.height, currentY + height) },
        { pos: el.x + el.width / 2, start: Math.min(el.y, currentY), end: Math.max(el.y + el.height, currentY + height) },
        { pos: el.x + el.width, start: Math.min(el.y, currentY), end: Math.max(el.y + el.height, currentY + height) }
      );

      // Horizontal edges
      horizontalTargets.push(
        { pos: el.y, start: Math.min(el.x, currentX), end: Math.max(el.x + el.width, currentX + width) },
        { pos: el.y + el.height / 2, start: Math.min(el.x, currentX), end: Math.max(el.x + el.width, currentX + width) },
        { pos: el.y + el.height, start: Math.min(el.x, currentX), end: Math.max(el.x + el.width, currentX + width) }
      );
    });

    // Check vertical snaps (X axis)
    // Edges to check: Left, Center, Right of dragged element
    const xPoints = [currentX, currentX + width / 2, currentX + width];
    let minDeltaX = Infinity;
    let bestSnapX: SnapLine | null = null;

    xPoints.forEach((xPoint, index) => {
      verticalTargets.forEach(target => {
        const delta = target.pos - xPoint;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaX)) {
          minDeltaX = delta;
          // Calculate start/end for the line to cover both the target and the element
          const startY = Math.min(target.start, currentY);
          const endY = Math.max(target.end, currentY + height);
          
          bestSnapX = {
            orientation: 'vertical',
            position: target.pos,
            start: startY - 10, // Extend a bit
            end: endY + 10
          };
        }
      });
    });

    if (bestSnapX) {
      correctionX = minDeltaX;
      newSnapLines.push(bestSnapX);
    }

    // Check horizontal snaps (Y axis)
    // Edges to check: Top, Center, Bottom of dragged element
    const yPoints = [currentY, currentY + height / 2, currentY + height];
    let minDeltaY = Infinity;
    let bestSnapY: SnapLine | null = null;

    yPoints.forEach((yPoint, index) => {
      horizontalTargets.forEach(target => {
        const delta = target.pos - yPoint;
        if (Math.abs(delta) < threshold && Math.abs(delta) < Math.abs(minDeltaY)) {
          minDeltaY = delta;
          // Calculate start/end for the line
          const startX = Math.min(target.start, currentX);
          const endX = Math.max(target.end, currentX + width);

          bestSnapY = {
            orientation: 'horizontal',
            position: target.pos,
            start: startX - 10,
            end: endX + 10
          };
        }
      });
    });

    if (bestSnapY) {
      correctionY = minDeltaY;
      newSnapLines.push(bestSnapY);
    }

    // Update snap lines state if changed
    if (JSON.stringify(newSnapLines) !== JSON.stringify(snapLinesRef.current)) {
      snapLinesRef.current = newSnapLines;
      setTimeout(() => setSnapLines(newSnapLines), 0);
    }

    return {
      ...transform,
      x: transform.x + correctionX,
      y: transform.y + correctionY
    };
  }, [elements, zoom, badgeWidth, badgeHeight]);

  const modifiers = useMemo(() => [scaleModifier, snapModifier], [scaleModifier, snapModifier]);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    })
  );

  // Handle drag events
  // IMPORTANT: We MUST divide delta by zoom because the DndContext is inside a scaled container.
  // The mouse events (delta) are in screen pixels.
  // If zoom is 0.5, moving mouse 10px should move element 20px in local space to appear as 10px on screen.
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const elementId = active.id as string;
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setActiveDragElement(element);
      setDragOffset({ x: 0, y: 0 });
      if (onDragStart) {
        onDragStart(elementId, null as any, { x: element.x, y: element.y });
      }
    }
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event;
    
    // Optimization: only update state if the dragged element has a symmetry pair
    // This prevents unnecessary re-renders for non-symmetric elements
    if (symmetryPairs.has(active.id as string)) {
      setDragOffset({ 
        x: delta.x, 
        y: delta.y 
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const elementId = active.id as string;
    const element = elements.find(el => el.id === elementId);
    
    // Reset drag state
    setActiveDragElement(null);
    setDragOffset({ x: 0, y: 0 });
    setSnapLines([]);
    snapLinesRef.current = [];
    
    if (element && onDragStop) {
      // Delta is already adjusted for zoom by scaleModifier and includes snap correction
      onDragStop(elementId, null as any, { 
        x: element.x + delta.x, 
        y: element.y + delta.y 
      });
    }
  };

  // Calculate symmetric clone position during drag
  const getSymmetricClone = () => {
    if (!activeDragElement) return null;
    
    // Check if this element has a symmetric pair
    const cloneId = symmetryPairs.get(activeDragElement.id);
    if (!cloneId) return null;
    
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    // Calculate parent position with drag offset
    // NO zoom adjustment - dragOffset is already in correct coordinate space
    const parentX = activeDragElement.x + dragOffset.x;
    const parentY = activeDragElement.y + dragOffset.y;
    const parentCenterX = parentX + activeDragElement.width / 2;
    const parentCenterY = parentY + activeDragElement.height / 2;
    
    // Calculate symmetric position
    const cloneCenterX = 2 * centerX - parentCenterX;
    const cloneCenterY = 2 * centerY - parentCenterY;
    const cloneX = cloneCenterX - activeDragElement.width / 2;
    const cloneY = cloneCenterY - activeDragElement.height / 2;
    
    // Calculate the transform with rotation + flip for 180°
    const cloneRotation = (activeDragElement.style.rotation || 0) + 180;
    const cloneTransform = getTransformWithRotation(cloneRotation, activeDragElement.style.transform);
    
    return {
      ...activeDragElement,
      id: cloneId,
      x: Math.round(cloneX),
      y: Math.round(cloneY),
      style: {
        ...activeDragElement.style,
        rotation: cloneRotation,
        transform: cloneTransform
      }
    };
  };

  const symmetricClone = getSymmetricClone();

  return (
    <div className="flex-1 flex items-center justify-center overflow-auto">
      <div className="relative">
        <DndContext
          sensors={sensors}
          modifiers={modifiers}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={badgeRef}
            className="relative bg-white shadow-lg overflow-hidden"
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
              style={{
                fontSize: `${Math.max(12, 14 / zoom)}px` // Adapter la taille au zoom
              }}
            >
              <div className="text-center">
                <Plus 
                  size={Math.max(32, 48 / zoom)} 
                  className="mx-auto mb-2" 
                />
                <p>Cliquez pour ajouter un arrière-plan</p>
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

          {/* Render Snap Lines */}
          {snapLines.map((line, index) => (
            <div
              key={index}
              className="absolute bg-red-500 z-50 pointer-events-none"
              style={{
                left: line.orientation === 'vertical' ? `${line.position}px` : `${line.start}px`,
                top: line.orientation === 'horizontal' ? `${line.position}px` : `${line.start}px`,
                width: line.orientation === 'vertical' ? `${Math.max(1, 1 / zoom)}px` : `${line.end - line.start}px`,
                height: line.orientation === 'horizontal' ? `${Math.max(1, 1 / zoom)}px` : `${line.end - line.start}px`,
              }}
            />
          ))}

          {/* Render symmetric clone during drag */}
          {symmetricClone && (
            <div
              className="absolute pointer-events-none ring-2 ring-purple-500 opacity-70"
              style={{
                left: symmetricClone.x,
                top: symmetricClone.y,
                width: `${symmetricClone.width}px`,
                height: `${symmetricClone.height}px`,
                zIndex: 1000
              }}
            >
              {renderElementContent(symmetricClone)}
            </div>
          )}

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