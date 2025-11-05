import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BadgeElement, BadgeFormat, BADGE_FORMATS, HistoryState } from '../../shared/types/badge.types';
import { SafeStorage } from '../../shared/utils/safeStorage';
import { mmToPx } from '../../shared/utils/conversion';
import { BadgeEditor } from './components/BadgeEditor';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';

const STORAGE_KEY = 'badge-designer-state';
const MAX_HISTORY = 50;

export const BadgeDesignerPage: React.FC = () => {
  const [format, setFormat] = useState<BadgeFormat>(BADGE_FORMATS.LARGE);
  const [elements, setElements] = useState<BadgeElement[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [background, setBackground] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templateName, setTemplateName] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Map<string, { data: string; filename: string }>>(new Map());

  const badgeRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Storage helper
  const safeStorage = new SafeStorage();

  // Save state to history
  const saveToHistory = useCallback((newElements: BadgeElement[], newBackground: string | null) => {
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(newElements)),
      background: newBackground
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-MAX_HISTORY);
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Load state from storage
  useEffect(() => {
    const savedState = safeStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.elements) setElements(parsed.elements);
        if (parsed.background) setBackground(parsed.background);
        if (parsed.format) setFormat(parsed.format);
        if (parsed.uploadedImages) {
          setUploadedImages(new Map(parsed.uploadedImages));
        }
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }

    // Load templates
    const templates = safeStorage.getItem('badge-templates');
    if (templates) {
      try {
        setAvailableTemplates(Object.keys(JSON.parse(templates)));
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }
  }, []);

  // Save state to storage
  useEffect(() => {
    const stateToSave = {
      elements,
      background,
      format,
      uploadedImages: Array.from(uploadedImages.entries())
    };
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [elements, background, format, uploadedImages]);

  // Add element
  const addElement = (type: 'text' | 'qrcode' | 'image', content: string = '') => {
    const newElement: BadgeElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: 50,
      y: 50,
      width: type === 'image' ? 100 : (type === 'qrcode' ? 80 : 200),
      height: type === 'image' ? 100 : (type === 'qrcode' ? 80 : 30),
      visible: true,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        transform: '',
        rotation: 0,
        opacity: 1,
        zIndex: elements.length + 1
      }
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElements([newElement.id]);
    saveToHistory(newElements, background);
  };

  // Update element
  const updateElement = (id: string, updates: Partial<BadgeElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    saveToHistory(newElements, background);
  };

  // Delete element
  const deleteElement = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    setSelectedElements(prev => prev.filter(selectedId => selectedId !== id));
    saveToHistory(newElements, background);
  };

  // Duplicate element
  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement: BadgeElement = {
        ...element,
        id: `element-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      setSelectedElements([newElement.id]);
      saveToHistory(newElements, background);
    }
  };

  // Move element
  const moveElement = (id: string, direction: 'up' | 'down') => {
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    if (direction === 'up' && index > 0) {
      const temp = newElements[index];
      const prev = newElements[index - 1];
      if (temp && prev) {
        newElements[index] = prev;
        newElements[index - 1] = temp;
      }
    } else if (direction === 'down' && index < newElements.length - 1) {
      const temp = newElements[index];
      const next = newElements[index + 1];
      if (temp && next) {
        newElements[index] = next;
        newElements[index + 1] = temp;
      }
    }

    setElements(newElements);
    saveToHistory(newElements, background);
  };

  // Toggle visibility
  const toggleVisibility = (id: string) => {
    updateElement(id, { visible: !elements.find(el => el.id === id)?.visible });
  };

  // Handle format change
  const handleFormatChange = (newFormat: BadgeFormat) => {
    setFormat(newFormat);
    // Reset elements positions if they're outside new bounds
    const maxX = mmToPx(newFormat.width) - 50;
    const maxY = mmToPx(newFormat.height) - 50;
    
    const adjustedElements = elements.map(element => ({
      ...element,
      x: Math.min(element.x, maxX),
      y: Math.min(element.y, maxY)
    }));
    
    if (JSON.stringify(adjustedElements) !== JSON.stringify(elements)) {
      setElements(adjustedElements);
      saveToHistory(adjustedElements, background);
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = {
            data: event.target.result as string,
            filename: file.name
          };
          
          const newImages = new Map(uploadedImages);
          const imageId = `img-${Date.now()}-${Math.random()}`;
          newImages.set(imageId, imageData);
          setUploadedImages(newImages);

          // Add image element
          addElement('image', imageId);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Background upload
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newBackground = event.target.result as string;
        setBackground(newBackground);
        saveToHistory(elements, newBackground);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save template
  const saveTemplate = () => {
    if (!templateName.trim()) return;

    const templates = safeStorage.getItem('badge-templates');
    const existingTemplates = templates ? JSON.parse(templates) : {};
    
    existingTemplates[templateName] = {
      elements: JSON.parse(JSON.stringify(elements)),
      background,
      format,
      uploadedImages: Array.from(uploadedImages.entries())
    };

    safeStorage.setItem('badge-templates', JSON.stringify(existingTemplates));
    setAvailableTemplates(Object.keys(existingTemplates));
    setTemplateName('');
  };

  // Load template
  const loadTemplate = (name: string) => {
    const templates = safeStorage.getItem('badge-templates');
    if (!templates) return;

    try {
      const existingTemplates = JSON.parse(templates);
      const template = existingTemplates[name];
      
      if (template) {
        setElements(template.elements || []);
        setBackground(template.background || null);
        setFormat(template.format || BADGE_FORMATS.LARGE);
        if (template.uploadedImages) {
          setUploadedImages(new Map(template.uploadedImages));
        }
        setSelectedElements([]);
        saveToHistory(template.elements || [], template.background || null);
      }
    } catch (e) {
      console.error('Failed to load template:', e);
    }
  };

  // Copy URL
  const copyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 3000);
    });
  };

  // Selection handlers
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.target === badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setIsSelecting(true);
      setSelectionStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      
      if (!e.shiftKey && !e.ctrlKey) {
        setSelectedElements([]);
      }
    }
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart) {
      const rect = badgeRef.current?.getBoundingClientRect();
      if (rect) {
        setSelectionEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  };

  const handleBackgroundMouseUp = () => {
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Element interaction handlers
  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey || e.ctrlKey) {
      setSelectedElements(prev => 
        prev.includes(id) 
          ? prev.filter(selectedId => selectedId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedElements([id]);
    }
  };

  const handleDragStart = (_id: string, _e: any, _data: { x: number; y: number }) => {
    // Drag start logic
  };

  const handleDrag = (id: string, _e: any, data: { x: number; y: number }) => {
    // Update element position during drag
    updateElement(id, { x: data.x, y: data.y });
  };

  const handleDragStop = (id: string, _e: any, data: { x: number; y: number }) => {
    // Final position update
    updateElement(id, { x: data.x, y: data.y });
  };

  const handleResize = (id: string, _e: any, data: { size: { width: number; height: number }; position?: { x: number; y: number } }) => {
    const updates: Partial<BadgeElement> = {
      width: data.size.width,
      height: data.size.height
    };
    
    if (data.position) {
      updates.x = data.position.x;
      updates.y = data.position.y;
    }
    
    updateElement(id, updates);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <LeftSidebar
        format={format}
        onFormatChange={handleFormatChange}
        onAddElement={addElement}
        backgroundInputRef={backgroundInputRef}
        onImageUpload={handleImageUpload}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        availableTemplates={availableTemplates}
        onSaveTemplate={saveTemplate}
        onLoadTemplate={loadTemplate}
        copiedUrl={copiedUrl}
        onCopyUrl={copyUrl}
      />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b p-4">
          <h1 className="text-xl font-bold text-gray-800">Créateur de Badges</h1>
          <p className="text-gray-600">Format: {format.name}</p>
        </div>
        
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="flex justify-center">
            <BadgeEditor
              format={format}
              background={background}
              elements={elements}
              selectedElements={selectedElements}
              badgeRef={badgeRef}
              elementRefs={elementRefs}
              onBackgroundMouseDown={handleBackgroundMouseDown}
              onBackgroundMouseMove={handleBackgroundMouseMove}
              onBackgroundMouseUp={handleBackgroundMouseUp}
              onBackgroundUpload={handleBackgroundUpload}
              onElementClick={handleElementClick}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragStop={handleDragStop}
              onResize={handleResize}
              isSelecting={isSelecting}
              selectionStart={selectionStart}
              selectionEnd={selectionEnd}
              uploadedImages={uploadedImages}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        selectedElements={elements.filter(el => selectedElements.includes(el.id))}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onDuplicateElement={duplicateElement}
        onMoveElement={moveElement}
        onToggleVisibility={toggleVisibility}
      />

      {/* Hidden background upload input */}
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />
    </div>
  );
};