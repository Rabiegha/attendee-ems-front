import React, { useRef, useState, useCallback } from 'react';
import { Trash2, RotateCw, Move, Square } from 'lucide-react';
import type { BadgeElement, BadgeDesignDimensions } from '@/shared/types/badge.types';

interface BadgeCanvasProps {
  dimensions: BadgeDesignDimensions;
  elements: BadgeElement[];
  selectedElementId: string | null;
  isPreviewMode: boolean;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<BadgeElement>) => void;
  onElementDelete: (elementId: string) => void;
}

interface DragState {
  isDragging: boolean;
  dragElementId: string | null;
  dragStart: { x: number; y: number } | null;
  elementStart: { x: number; y: number } | null;
}

interface ResizeState {
  isResizing: boolean;
  resizeElementId: string | null;
  resizeHandle: string | null;
  startSize: { width: number; height: number } | null;
  startPos: { x: number; y: number } | null;
}

export const BadgeCanvas: React.FC<BadgeCanvasProps> = ({
  dimensions,
  elements,
  selectedElementId,
  isPreviewMode,
  onElementSelect,
  onElementUpdate,
  onElementDelete
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragElementId: null,
    dragStart: null,
    elementStart: null
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizeElementId: null,
    resizeHandle: null,
    startSize: null,
    startPos: null
  });

  // Calculate canvas scale to fit in viewport
  const maxCanvasWidth = 800;
  const maxCanvasHeight = 800;
  const scaleX = Math.min(1, maxCanvasWidth / dimensions.width);
  const scaleY = Math.min(1, maxCanvasHeight / dimensions.height);
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onElementSelect(elementId);
    }
  }, [isPreviewMode, onElementSelect]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, action: 'drag' | 'resize', handle?: string) => {
    if (isPreviewMode) return;

    e.preventDefault();
    e.stopPropagation();

    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (action === 'drag') {
      setDragState({
        isDragging: true,
        dragElementId: elementId,
        dragStart: { x: mouseX, y: mouseY },
        elementStart: { x: element.x * scale, y: element.y * scale }
      });
    } else if (action === 'resize') {
      setResizeState({
        isResizing: true,
        resizeElementId: elementId,
        resizeHandle: handle || 'se',
        startSize: { width: element.width, height: element.height },
        startPos: { x: mouseX, y: mouseY }
      });
    }

    onElementSelect(elementId);
  }, [isPreviewMode, elements, scale, onElementSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPreviewMode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle dragging
    if (dragState.isDragging && dragState.dragElementId && dragState.dragStart && dragState.elementStart) {
      const deltaX = mouseX - dragState.dragStart.x;
      const deltaY = mouseY - dragState.dragStart.y;

      const newX = Math.max(0, Math.min(
        dimensions.width - 50, // Keep some margin
        (dragState.elementStart.x + deltaX) / scale
      ));
      const newY = Math.max(0, Math.min(
        dimensions.height - 50, // Keep some margin
        (dragState.elementStart.y + deltaY) / scale
      ));

      onElementUpdate(dragState.dragElementId, { x: newX, y: newY });
    }

    // Handle resizing
    if (resizeState.isResizing && resizeState.resizeElementId && resizeState.startSize && resizeState.startPos) {
      const deltaX = mouseX - resizeState.startPos.x;
      const deltaY = mouseY - resizeState.startPos.y;

      const newWidth = Math.max(20, resizeState.startSize.width + deltaX / scale);
      const newHeight = Math.max(20, resizeState.startSize.height + deltaY / scale);

      onElementUpdate(resizeState.resizeElementId, { 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [isPreviewMode, dragState, resizeState, dimensions, scale, onElementUpdate]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      dragElementId: null,
      dragStart: null,
      elementStart: null
    });

    setResizeState({
      isResizing: false,
      resizeElementId: null,
      resizeHandle: null,
      startSize: null,
      startPos: null
    });
  }, []);

  const renderElement = (element: BadgeElement) => {
    const isSelected = element.id === selectedElementId && !isPreviewMode;
    const elementStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x * scale,
      top: element.y * scale,
      width: element.width * scale,
      height: element.height * scale,
      transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      cursor: isPreviewMode ? 'default' : 'move',
      zIndex: isSelected ? 10 : 1
    };

    let content: React.ReactNode = null;

    switch (element.type) {
      case 'text':
        content = (
          <div
            style={{
              ...elementStyle,
              fontSize: (element.properties.fontSize || 16) * scale,
              color: element.properties.color || '#000000',
              fontWeight: element.properties.fontWeight || 'normal',
              textAlign: element.properties.textAlign || 'left',
              fontFamily: element.properties.fontFamily || 'Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.properties.textAlign === 'center' ? 'center' : 
                             element.properties.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: `${4 * scale}px`,
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          >
            {element.properties.content || 'Texte'}
          </div>
        );
        break;

      case 'image':
        content = (
          <div
            style={{
              ...elementStyle,
              backgroundColor: element.properties.backgroundColor || '#f0f0f0',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: element.properties.borderRadius || 0
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          >
            {element.properties.src ? (
              <img 
                src={element.properties.src} 
                alt=""
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  borderRadius: element.properties.borderRadius || 0
                }}
              />
            ) : (
              <span style={{ fontSize: Math.min(element.width, element.height) * scale * 0.3, color: '#999' }}>
                📷
              </span>
            )}
          </div>
        );
        break;

      case 'qr':
        content = (
          <div
            style={{
              ...elementStyle,
              backgroundColor: '#ffffff',
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          >
            <div style={{
              width: '80%',
              height: '80%',
              backgroundColor: '#000000',
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, #000 2px, #000 4px)
              `
            }} />
          </div>
        );
        break;

      case 'shape':
        content = (
          <div
            style={{
              ...elementStyle,
              backgroundColor: element.properties.backgroundColor || '#3B82F6',
              border: element.properties.borderWidth ? 
                `${element.properties.borderWidth}px solid ${element.properties.borderColor || '#000'}` : 
                'none',
              borderRadius: element.properties.borderRadius || 0
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          />
        );
        break;

      default:
        content = (
          <div
            style={elementStyle}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id, 'drag')}
          >
            Élément inconnu
          </div>
        );
    }

    return (
      <div key={element.id}>
        {content}
        
        {/* Selection outline and handles */}
        {isSelected && (
          <>
            {/* Selection outline */}
            <div
              style={{
                position: 'absolute',
                left: element.x * scale - 2,
                top: element.y * scale - 2,
                width: element.width * scale + 4,
                height: element.height * scale + 4,
                border: '2px solid #3B82F6',
                pointerEvents: 'none',
                zIndex: 11
              }}
            />
            
            {/* Resize handle */}
            <div
              style={{
                position: 'absolute',
                left: (element.x + element.width) * scale - 4,
                top: (element.y + element.height) * scale - 4,
                width: 8,
                height: 8,
                backgroundColor: '#3B82F6',
                cursor: 'se-resize',
                zIndex: 12
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id, 'resize', 'se')}
            />
            
            {/* Delete button */}
            <button
              style={{
                position: 'absolute',
                left: (element.x + element.width) * scale - 12,
                top: element.y * scale - 12,
                width: 24,
                height: 24,
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 12
              }}
              onClick={(e) => {
                e.stopPropagation();
                onElementDelete(element.id);
              }}
            >
              <Trash2 size={12} />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Canvas info */}
      <div className="text-sm text-gray-500">
        {dimensions.width} × {dimensions.height}px 
        {scale < 1 && ` (échelle ${Math.round(scale * 100)}%)`}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-white shadow-lg border border-gray-200"
        style={{
          width: scaledWidth,
          height: scaledHeight,
          cursor: dragState.isDragging ? 'grabbing' : 'default'
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid pattern for design mode */}
        {!isPreviewMode && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: `${20 * scale}px ${20 * scale}px`
            }}
          />
        )}

        {/* Render all elements */}
        {elements.map(renderElement)}

        {/* Canvas center guides */}
        {!isPreviewMode && (
          <>
            <div
              className="absolute border-l border-dashed border-gray-300 opacity-50"
              style={{
                left: scaledWidth / 2,
                top: 0,
                height: '100%'
              }}
            />
            <div
              className="absolute border-t border-dashed border-gray-300 opacity-50"
              style={{
                top: scaledHeight / 2,
                left: 0,
                width: '100%'
              }}
            />
          </>
        )}
      </div>

      {/* Canvas controls */}
      {!isPreviewMode && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Échelle: {Math.round(scale * 100)}%</span>
          <span>•</span>
          <span>{elements.length} élément{elements.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};