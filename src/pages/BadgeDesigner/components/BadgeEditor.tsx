import React, { useRef, useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus } from 'lucide-react';
import { BadgeElement, BadgeFormat } from '../../../shared/types/badge.types';
import { mmToPx } from '../../../shared/utils/conversion';
import { getTransformWithRotation } from '../../../shared/utils/transform';

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
  onDragStop: (id: string, e: any, data: { x: number; y: number }) => void;
  onResize: (id: string, e: any, data: { size: { width: number; height: number }; position?: { x: number; y: number } }, isResizing?: boolean) => void;
  onSaveHistory?: () => void;
  isSelecting: boolean;
  selectionStart: { x: number; y: number } | null;
  selectionEnd: { x: number; y: number } | null;
  uploadedImages: Map<string, { data: string; filename: string }>;
  symmetryPairs: Map<string, string>;
  transformRef?: React.RefObject<ReactZoomPanPinchRef>;
  initialZoom?: number;
  currentZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

interface DraggableElementProps {
  element: BadgeElement;
  children: React.ReactNode;
  isSelected: boolean;
  elementRef: React.RefObject<HTMLDivElement>;
  onElementClick: (id: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  isDragging: boolean;
  dragOffset?: { x: number; y: number } | undefined;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  element,
  children,
  isSelected,
  elementRef,
  onElementClick,
  onDragStart,
  isDragging,
  dragOffset
}) => {
  const [mouseDownPos, setMouseDownPos] = React.useState<{ x: number; y: number } | null>(null);

  const style = {
    position: 'absolute' as const,
    left: Math.round(element.x + (dragOffset?.x || 0)),
    top: Math.round(element.y + (dragOffset?.y || 0)),
    width: `${Math.round(element.width)}px`,
    height: `${Math.round(element.height)}px`,
    zIndex: isSelected ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore middle mouse button (used for panning)
    if (e.button === 1) return;
    
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    onDragStart(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Ignore middle mouse button (used for panning)
    if (e.button === 1) return;
    
    // Only trigger click if the mouse hasn't moved (not a drag)
    if (mouseDownPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPos.x, 2) + 
        Math.pow(e.clientY - mouseDownPos.y, 2)
      );
      // If mouse moved less than 5 pixels, consider it a click
      if (distance < 5) {
        onElementClick(element.id, e);
      }
    }
    setMouseDownPos(null);
  };

  return (
    <div
      ref={elementRef}
      style={{
        ...style,
        ...(isSelected && {
          outline: '4px solid rgb(59, 130, 246)',
          outlineOffset: '0px'
        })
      }}
      className="select-none"
      onClick={handleClick}
    >
      {/* Zone de contenu draggable */}
      <div
        className="w-full h-full cursor-move"
        style={{ opacity: element.style.opacity ?? 1 }}
        onMouseDown={handleMouseDown}
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
  onDragStop,
  onResize,
  onSaveHistory,
  isSelecting,
  selectionStart,
  selectionEnd,
  uploadedImages,
  symmetryPairs,
  transformRef,
  initialZoom = 0.5,
  currentZoom,
  onZoomChange
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
  const [lastResizeData, setLastResizeData] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);
  const [shiftPressed, setShiftPressed] = useState(false);
  
  // Native drag system
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elementX: number; elementY: number } | null>(null);
  const [currentDragOffset, setCurrentDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDragElement, setActiveDragElement] = useState<BadgeElement | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Snap guides
  const [snapGuides, setSnapGuides] = useState<{ x?: number; y?: number }[]>([]);
  const [snapTargetElements, setSnapTargetElements] = useState<string[]>([]);
  const SNAP_THRESHOLD = 20; // pixels - distance d'attraction du snap

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

    // Get badge coordinates
    const badgeRect = badgeRef.current?.getBoundingClientRect();
    if (!badgeRect) return;

    // Calculate mouse position RELATIVE to badge
    const mouseXInBadge = e.clientX - badgeRect.left;
    const mouseYInBadge = e.clientY - badgeRect.top;
    
    setResizingElement(elementId);
    setResizeHandle(handle);
    setResizeStartData({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      mouseX: mouseXInBadge,
      mouseY: mouseYInBadge,
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingElement || !resizeHandle || !resizeStartData) return;

    // Get current badge position
    const badgeRect = badgeRef.current?.getBoundingClientRect();
    if (!badgeRect) return;

    // Calculate current mouse position RELATIVE to badge
    const currentMouseXInBadge = e.clientX - badgeRect.left;
    const currentMouseYInBadge = e.clientY - badgeRect.top;

    // Get badge dimensions
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);

    // Calculate delta in BADGE COORDINATES (px)
    const scaleX = badgeWidth / badgeRect.width;
    const scaleY = badgeHeight / badgeRect.height;

    const deltaX = (currentMouseXInBadge - resizeStartData.mouseX) * scaleX;
    const deltaY = (currentMouseYInBadge - resizeStartData.mouseY) * scaleY;

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

    // Save last resize data for history
    setLastResizeData({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY
    });

    // During resize, skip history (isResizing=true)
    onResize(resizingElement, null, {
      size: { width: newWidth, height: newHeight },
      position: { x: newX, y: newY }
    }, true);
  };

  const handleResizeEnd = () => {
    // At end of resize, save final state to history
    if (resizingElement && lastResizeData) {
      // Call onResize with isResizing=false to save to history
      onResize(resizingElement, null, {
        size: { width: lastResizeData.width, height: lastResizeData.height },
        position: { x: lastResizeData.x, y: lastResizeData.y }
      }, false);
    }
    
    setResizingElement(null);
    setResizeHandle(null);
    setResizeStartData(null);
    setLastResizeData(null);
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
  }, [resizingElement, resizeHandle, resizeStartData, lastResizeData]);



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
            alignItems: element.style.alignItems || 'center',
            justifyContent: element.style.textAlign === 'center' ? 'center' : 
                          element.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
            pointerEvents: 'none',
            lineHeight: element.style.lineHeight !== undefined ? element.style.lineHeight : 1.2,
            letterSpacing: element.style.letterSpacing !== undefined ? `${element.style.letterSpacing}px` : 'normal',
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
    const isSnapTarget = snapTargetElements.includes(element.id);
    const isDraggingOther = draggingElementId !== null && draggingElementId !== element.id;
    const isPartOfDragGroup = isSelected && isDraggingOther && selectedElements.includes(draggingElementId || '');
    
    // Check if this element is a symmetric pair of a selected element
    const isSymmetricPairSelected = selectedElements.some(selectedId => {
      // Check if selected element is parent and this is its clone
      const cloneId = symmetryPairs.get(selectedId);
      if (cloneId === element.id) return true;
      
      // Check if selected element is clone and this is its parent
      const parentId = getParentId(selectedId);
      if (parentId === element.id) return true;
      
      return false;
    });
    
    if (!elementRefs.current.has(element.id)) {
      elementRefs.current.set(element.id, React.createRef());
    }

    const elementRef = elementRefs.current.get(element.id)!;

    const content = renderElementContent(element);

    // Apply drag offset to all selected elements when one is being dragged
    const effectiveDragOffset = (draggingElementId === element.id || isPartOfDragGroup) ? currentDragOffset : undefined;

    return (
      <React.Fragment key={element.id}>
        <DraggableElement
          element={element}
          isSelected={isSelected}
          elementRef={elementRef}
          onElementClick={onElementClick}
          onDragStart={(e) => handleElementDragStart(element.id, e)}
          isDragging={draggingElementId === element.id}
          dragOffset={effectiveDragOffset}
        >
          {content}
        </DraggableElement>
        
        {/* Symmetric pair highlight (purple ring when paired element is selected) */}
        {isSymmetricPairSelected && !isSelected && (
          <div
            className="absolute pointer-events-none ring-4 ring-purple-500"
            style={{
              left: element.x,
              top: element.y,
              width: `${element.width}px`,
              height: `${element.height}px`,
              zIndex: 9
            }}
          />
        )}
        
        {/* Snap target outline */}
        {isSnapTarget && (
          <div
            className="absolute pointer-events-none border-[3px] border-blue-500"
            style={{
              left: element.x,
              top: element.y,
              width: `${element.width}px`,
              height: `${element.height}px`,
              zIndex: 9
            }}
          />
        )}
        
        {/* Resize handles - en dehors de la zone draggable */}
        {isSelected && (
          <>
            {['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'].map(handle => {
              const zoom = currentZoom || initialZoom;
              const handleSize = 8 / zoom;
              const handleOffset = handleSize / 2;
              const activeDragOffset = effectiveDragOffset;
              return (
                <div
                  key={`${element.id}-${handle}`}
                  className={`absolute bg-blue-500 border border-white z-20`}
                  style={{
                    ...getHandlePosition(handle, element, handleOffset, activeDragOffset),
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    display: resizingElement && resizingElement !== element.id ? 'none' : 'block',
                    cursor: `${handle}-resize`,
                    willChange: draggingElementId === element.id ? 'transform' : 'auto',
                    transform: 'translateZ(0)'
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
      </React.Fragment>
    );
  };

  const getHandlePosition = (handle: string, element: BadgeElement, offset: number = 4, dragOffset?: { x: number; y: number }) => {
    const { x, y, width, height } = element;
    const dx = dragOffset?.x || 0;
    const dy = dragOffset?.y || 0;
    switch (handle) {
      case 'nw': return { top: Math.round(y + dy - offset), left: Math.round(x + dx - offset) };
      case 'ne': return { top: Math.round(y + dy - offset), left: Math.round(x + dx + width - offset) };
      case 'sw': return { top: Math.round(y + dy + height - offset), left: Math.round(x + dx - offset) };
      case 'se': return { top: Math.round(y + dy + height - offset), left: Math.round(x + dx + width - offset) };
      case 'n': return { top: Math.round(y + dy - offset), left: Math.round(x + dx + width / 2 - offset) };
      case 's': return { top: Math.round(y + dy + height - offset), left: Math.round(x + dx + width / 2 - offset) };
      case 'w': return { top: Math.round(y + dy + height / 2 - offset), left: Math.round(x + dx - offset) };
      case 'e': return { top: Math.round(y + dy + height / 2 - offset), left: Math.round(x + dx + width - offset) };
      default: return {};
    }
  };

  const badgeWidth = mmToPx(format.width);
  const badgeHeight = mmToPx(format.height);

  // Calculate snap positions
  const calculateSnap = (x: number, y: number, width: number, height: number, elementId: string) => {
    const guides: { x?: number; y?: number }[] = [];
    const targetElements: string[] = [];
    let snappedX = x;
    let snappedY = y;

    // Badge guides (edges and center)
    const badgeGuides = {
      left: 0,
      centerX: badgeWidth / 2,
      right: badgeWidth,
      top: 0,
      centerY: badgeHeight / 2,
      bottom: badgeHeight
    };

    // Element positions to check
    const elementLeft = x;
    const elementCenterX = x + width / 2;
    const elementRight = x + width;
    const elementTop = y;
    const elementCenterY = y + height / 2;
    const elementBottom = y + height;

    // Snap to badge guides - X axis
    if (Math.abs(elementLeft - badgeGuides.left) < SNAP_THRESHOLD) {
      snappedX = badgeGuides.left;
      guides.push({ x: badgeGuides.left });
    } else if (Math.abs(elementCenterX - badgeGuides.centerX) < SNAP_THRESHOLD) {
      snappedX = badgeGuides.centerX - width / 2;
      guides.push({ x: badgeGuides.centerX });
    } else if (Math.abs(elementRight - badgeGuides.right) < SNAP_THRESHOLD) {
      snappedX = badgeGuides.right - width;
      guides.push({ x: badgeGuides.right });
    }

    // Snap to badge guides - Y axis
    if (Math.abs(elementTop - badgeGuides.top) < SNAP_THRESHOLD) {
      snappedY = badgeGuides.top;
      guides.push({ y: badgeGuides.top });
    } else if (Math.abs(elementCenterY - badgeGuides.centerY) < SNAP_THRESHOLD) {
      snappedY = badgeGuides.centerY - height / 2;
      guides.push({ y: badgeGuides.centerY });
    } else if (Math.abs(elementBottom - badgeGuides.bottom) < SNAP_THRESHOLD) {
      snappedY = badgeGuides.bottom - height;
      guides.push({ y: badgeGuides.bottom });
    }

    // Snap to other elements
    elements.forEach(otherElement => {
      if (otherElement.id === elementId) return;
      
      // Skip elements that are part of the same selection group being dragged
      if (selectedElements.length > 1 && selectedElements.includes(otherElement.id)) return;

      const otherLeft = otherElement.x;
      const otherCenterX = otherElement.x + otherElement.width / 2;
      const otherRight = otherElement.x + otherElement.width;
      const otherTop = otherElement.y;
      const otherCenterY = otherElement.y + otherElement.height / 2;
      const otherBottom = otherElement.y + otherElement.height;

      let hasSnap = false;

      // X axis alignment - edges
      if (Math.abs(elementLeft - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft;
        guides.push({ x: otherLeft });
        hasSnap = true;
      } else if (Math.abs(elementCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - width / 2;
        guides.push({ x: otherCenterX });
        hasSnap = true;
      } else if (Math.abs(elementRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - width;
        guides.push({ x: otherRight });
        hasSnap = true;
      }
      // X axis - snap adjacent (coller bord à bord)
      else if (Math.abs(elementLeft - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight;
        guides.push({ x: otherRight });
        hasSnap = true;
      } else if (Math.abs(elementRight - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft - width;
        guides.push({ x: otherLeft });
        hasSnap = true;
      }

      // Y axis alignment - edges
      if (Math.abs(elementTop - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop;
        guides.push({ y: otherTop });
        hasSnap = true;
      } else if (Math.abs(elementCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - height / 2;
        guides.push({ y: otherCenterY });
        hasSnap = true;
      } else if (Math.abs(elementBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - height;
        guides.push({ y: otherBottom });
        hasSnap = true;
      }
      // Y axis - snap adjacent (coller bord à bord)
      else if (Math.abs(elementTop - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom;
        guides.push({ y: otherBottom });
        hasSnap = true;
      } else if (Math.abs(elementBottom - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop - height;
        guides.push({ y: otherTop });
        hasSnap = true;
      }

      if (hasSnap) {
        targetElements.push(otherElement.id);
      }
    });

    setSnapGuides(guides);
    setSnapTargetElements(targetElements);
    return { x: snappedX, y: snappedY };
  };

  // Native drag handlers
  const handleElementDragStart = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Select element immediately on mousedown ONLY if it's not already in a multi-selection
    // This preserves multi-selection when starting to drag
    if (!selectedElements.includes(elementId)) {
      onElementClick(elementId, e as any);
    }

    // Get badge coordinates
    const badgeRect = badgeRef.current?.getBoundingClientRect();
    if (!badgeRect) return;

    // Calculate mouse position RELATIVE to badge (already accounts for zoom)
    const mouseXInBadge = e.clientX - badgeRect.left;
    const mouseYInBadge = e.clientY - badgeRect.top;

    setDraggingElementId(elementId);
    setDragStart({
      x: mouseXInBadge,
      y: mouseYInBadge,
      elementX: element.x,
      elementY: element.y
    });
    setActiveDragElement(element);
    
    if (onDragStart) {
      onDragStart(elementId, null as any, { x: element.x, y: element.y });
    }
  };

  useEffect(() => {
    if (!draggingElementId || !dragStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get current badge position
      const badgeRect = badgeRef.current?.getBoundingClientRect();
      if (!badgeRect) return;

      // Calculate current mouse position RELATIVE to badge
      const currentMouseXInBadge = e.clientX - badgeRect.left;
      const currentMouseYInBadge = e.clientY - badgeRect.top;

      // Get badge dimensions
      const badgeWidth = mmToPx(format.width);
      const badgeHeight = mmToPx(format.height);

      // Calculate delta in BADGE COORDINATES (px)
      // Badge rect width/height includes zoom, so we need to convert back
      const scaleX = badgeWidth / badgeRect.width;
      const scaleY = badgeHeight / badgeRect.height;

      const deltaX = (currentMouseXInBadge - dragStart.x) * scaleX;
      const deltaY = (currentMouseYInBadge - dragStart.y) * scaleY;
      
      // Calculate raw position
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;

      // Apply snap if not holding shift
      if (!shiftPressed && activeDragElement) {
        const snapped = calculateSnap(newX, newY, activeDragElement.width, activeDragElement.height, draggingElementId);
        newX = snapped.x;
        newY = snapped.y;
      } else {
        setSnapGuides([]);
        setSnapTargetElements([]);
      }

      // Update visual drag offset based on snapped position
      const offsetX = newX - dragStart.elementX;
      const offsetY = newY - dragStart.elementY;
      setCurrentDragOffset({ x: offsetX, y: offsetY });

      // Update drag offset for symmetry preview
      if (symmetryPairs.has(draggingElementId)) {
        setDragOffset({ x: offsetX, y: offsetY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Get current badge position
      const badgeRect = badgeRef.current?.getBoundingClientRect();
      if (!badgeRect) return;

      // Calculate final mouse position RELATIVE to badge
      const finalMouseXInBadge = e.clientX - badgeRect.left;
      const finalMouseYInBadge = e.clientY - badgeRect.top;

      // Get badge dimensions
      const badgeWidth = mmToPx(format.width);
      const badgeHeight = mmToPx(format.height);

      // Calculate delta in BADGE COORDINATES (px)
      const scaleX = badgeWidth / badgeRect.width;
      const scaleY = badgeHeight / badgeRect.height;

      const deltaX = (finalMouseXInBadge - dragStart.x) * scaleX;
      const deltaY = (finalMouseYInBadge - dragStart.y) * scaleY;
      
      // Calculate raw position
      let newX = dragStart.elementX + deltaX;
      let newY = dragStart.elementY + deltaY;

      // Apply snap if not holding shift (same as mousemove)
      if (!shiftPressed && activeDragElement) {
        const snapped = calculateSnap(newX, newY, activeDragElement.width, activeDragElement.height, draggingElementId);
        newX = snapped.x;
        newY = snapped.y;
      }

      if (onDragStop) {
        onDragStop(draggingElementId, null as any, { x: newX, y: newY });
      }

      setDraggingElementId(null);
      setDragStart(null);
      setCurrentDragOffset({ x: 0, y: 0 });
      setActiveDragElement(null);
      setDragOffset({ x: 0, y: 0 });
      setSnapGuides([]);
      setSnapTargetElements([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElementId, dragStart, transformRef, symmetryPairs, onDragStop]);

  // Calculate symmetric clone position during drag
  const getSymmetricClone = (element: BadgeElement, offset: { x: number; y: number }) => {
    // Check if this element has a symmetric pair
    const cloneId = symmetryPairs.get(element.id);
    if (!cloneId) return null;
    
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    // Calculate parent position with drag offset
    const parentX = element.x + offset.x;
    const parentY = element.y + offset.y;
    const parentCenterX = parentX + element.width / 2;
    const parentCenterY = parentY + element.height / 2;
    
    // Calculate symmetric position
    const cloneCenterX = 2 * centerX - parentCenterX;
    const cloneCenterY = 2 * centerY - parentCenterY;
    const cloneX = cloneCenterX - element.width / 2;
    const cloneY = cloneCenterY - element.height / 2;
    
    // Calculate the transform with rotation + flip for 180°
    const cloneRotation = (element.style.rotation || 0) + 180;
    const cloneTransform = getTransformWithRotation(cloneRotation, element.style.transform);
    
    return {
      ...element,
      id: cloneId,
      x: Math.round(cloneX),
      y: Math.round(cloneY),
      style: {
        ...element.style,
        rotation: cloneRotation,
        transform: cloneTransform
      }
    };
  };

  // Find parent element if this element is a clone
  const getParentId = (elementId: string): string | null => {
    for (const [parentId, cloneId] of symmetryPairs.entries()) {
      if (cloneId === elementId) return parentId;
    }
    return null;
  };

  // Calculate symmetric parent position during drag (when dragging a clone)
  const getSymmetricParent = (element: BadgeElement, offset: { x: number; y: number }) => {
    // Check if this element is a clone (find its parent)
    const parentId = getParentId(element.id);
    if (!parentId) return null;
    
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    // Calculate clone position with drag offset
    const cloneX = element.x + offset.x;
    const cloneY = element.y + offset.y;
    const cloneCenterX = cloneX + element.width / 2;
    const cloneCenterY = cloneY + element.height / 2;
    
    // Calculate symmetric parent position (inverse operation)
    const parentCenterX = 2 * centerX - cloneCenterX;
    const parentCenterY = 2 * centerY - cloneCenterY;
    const parentX = parentCenterX - element.width / 2;
    const parentY = parentCenterY - element.height / 2;
    
    // Calculate the transform with rotation - 180° (reverse)
    const parentRotation = (element.style.rotation || 0) - 180;
    const parentTransform = getTransformWithRotation(parentRotation, element.style.transform);
    
    return {
      ...element,
      id: parentId,
      x: Math.round(parentX),
      y: Math.round(parentY),
      style: {
        ...element.style,
        rotation: parentRotation,
        transform: parentTransform
      }
    };
  };

  // Get all symmetric clones for currently dragged elements
  const getSymmetricClones = () => {
    if (!draggingElementId) return [];
    
    const clones: BadgeElement[] = [];
    
    // If dragging multiple selected elements
    if (selectedElements.includes(draggingElementId)) {
      selectedElements.forEach(selectedId => {
        const element = elements.find(el => el.id === selectedId);
        if (element) {
          // Try to get clone (if this is a parent)
          const clone = getSymmetricClone(element, currentDragOffset);
          if (clone) {
            clones.push(clone);
          } else {
            // Try to get parent (if this is a clone)
            const parent = getSymmetricParent(element, currentDragOffset);
            if (parent) clones.push(parent);
          }
        }
      });
    } else {
      // Single element drag
      if (activeDragElement) {
        // Try to get clone (if this is a parent)
        const clone = getSymmetricClone(activeDragElement, dragOffset);
        if (clone) {
          clones.push(clone);
        } else {
          // Try to get parent (if this is a clone)
          const parent = getSymmetricParent(activeDragElement, dragOffset);
          if (parent) clones.push(parent);
        }
      }
    }
    
    return clones;
  };

  const symmetricClones = getSymmetricClones();

  return (
    <div className="flex-1 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
      <TransformWrapper
          ref={transformRef}
          initialScale={initialZoom}
          minScale={0.1}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.1 }}
          panning={{ 
            disabled: false,
            velocityDisabled: true,
            allowLeftClickPan: false,
            allowRightClickPan: false
          }}
          doubleClick={{ disabled: true }}
          onTransformed={(ref) => {
            if (onZoomChange) {
              onZoomChange(ref.state.scale);
            }
          }}
        >
          <TransformComponent
            wrapperStyle={{
              width: '100%',
              height: '100%',
              padding: '20px 0',
            }}
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
            >
              <div className="text-center">
                <Plus 
                  size={48} 
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
          {elements
            .filter(element => {
              // If we're dragging, hide the symmetric pair elements (they'll be rendered as symmetricClones)
              if (draggingElementId) {
                // Check if this element is a clone of the dragged element
                const cloneId = symmetryPairs.get(draggingElementId);
                if (element.id === cloneId) return false;
                
                // Check if this element is the parent of the dragged clone
                const parentId = getParentId(draggingElementId);
                if (element.id === parentId) return false;
                
                // Check if this element is a clone of any selected element being dragged
                for (const selectedId of selectedElements) {
                  if (selectedElements.includes(draggingElementId || '')) {
                    const selectedCloneId = symmetryPairs.get(selectedId);
                    if (element.id === selectedCloneId) return false;
                    
                    // Check if this element is the parent of any selected clone being dragged
                    const selectedParentId = getParentId(selectedId);
                    if (element.id === selectedParentId) return false;
                  }
                }
              }
              return true;
            })
            .map(renderElement)}

          {/* Render symmetric clones during drag */}
          {symmetricClones.map(clone => (
            <div
              key={`clone-${clone.id}`}
              className="absolute pointer-events-none ring-4 ring-purple-500 opacity-70"
              style={{
                left: clone.x,
                top: clone.y,
                width: `${clone.width}px`,
                height: `${clone.height}px`,
                zIndex: 1000
              }}
            >
              {renderElementContent(clone)}
            </div>
          ))}

          {/* Selection rectangle */}
          {isSelecting && selectionStart && selectionEnd && (
            <div
              className="absolute border-[3px] border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
              }}
            />
          )}

          {/* Snap guides */}
          {snapGuides.map((guide, index) => (
            <React.Fragment key={index}>
              {guide.x !== undefined && (
                <div
                  className="absolute pointer-events-none bg-blue-500"
                  style={{
                    left: `${guide.x}px`,
                    top: 0,
                    width: '1px',
                    height: '100%',
                    opacity: 0.6
                  }}
                />
              )}
              {guide.y !== undefined && (
                <div
                  className="absolute pointer-events-none bg-blue-500"
                  style={{
                    left: 0,
                    top: `${guide.y}px`,
                    width: '100%',
                    height: '1px',
                    opacity: 0.6
                  }}
                />
              )}
            </React.Fragment>
          ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};