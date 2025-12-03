import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { BadgeElement, BadgeFormat, BADGE_FORMATS, HistoryState } from '../../shared/types/badge.types';
import { mmToPx } from '../../shared/utils/conversion';
import { getTransformWithRotation } from '../../shared/utils/transform';
import { BadgeEditor } from './components/BadgeEditor';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { 
  useGetBadgeTemplateQuery, 
  useCreateBadgeTemplateMutation, 
  useUpdateBadgeTemplateMutation,
  useDeleteBadgeTemplateMutation
} from '@/services/api/badge-templates.api';
import { useToast } from '@/shared/hooks/useToast';

const MAX_HISTORY = 50;

export const BadgeDesignerPage: React.FC = () => {
  // Router hooks
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  // API hooks
  const { data: loadedTemplate } = useGetBadgeTemplateQuery(
    templateId || 'skip',
    { skip: !templateId || templateId === 'new' }
  );
  const [createTemplate, { isLoading: isCreating }] = useCreateBadgeTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateBadgeTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteBadgeTemplateMutation();
  
  // State
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
  const [copiedUrl, setCopiedUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<Map<string, { data: string; filename: string }>>(new Map());
  
  // Symmetry pairs - maps parent ID to clone ID  
  const [symmetryPairs, setSymmetryPairs] = useState<Map<string, string>>(new Map());
  
  // Current zoom level for display
  const [currentZoom, setCurrentZoom] = useState(0.5);

  const badgeRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

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

  // Load template from API when editing
  useEffect(() => {
    if (loadedTemplate?.template_data) {
      try {
        const data = loadedTemplate.template_data;
        // Ensure QR code elements have aspect ratio properties
        const elementsWithAspectRatio = (data.elements || []).map((el: BadgeElement) => {
          if (el.type === 'qrcode' && !el.maintainAspectRatio) {
            return {
              ...el,
              maintainAspectRatio: true,
              aspectRatio: 1,
              // Ensure it's square by using the larger dimension
              width: Math.max(el.width, el.height),
              height: Math.max(el.width, el.height)
            };
          }
          return el;
        });
        setElements(elementsWithAspectRatio);
        setBackground(data.background || null);
        setFormat(data.format || BADGE_FORMATS.LARGE);
        if (data.uploadedImages) {
          setUploadedImages(new Map(data.uploadedImages));
        }
        if (data.symmetryPairs) {
          setSymmetryPairs(new Map(data.symmetryPairs));
        }
        setTemplateName(loadedTemplate.name);
      } catch (e) {
        console.error('Failed to load template from API:', e);
        toast.error('Erreur', 'Impossible de charger le template');
      }
    }
  }, [loadedTemplate]);

  // Helper function to measure text dimensions
  const measureText = (content: string, fontSize: number, fontFamily: string = 'Arial'): { width: number; height: number } => {
    // Créer un élément temporaire pour mesurer le texte
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordBreak = 'break-word';
    div.style.fontFamily = fontFamily;
    div.style.fontSize = `${fontSize}px`;
    div.style.lineHeight = '1.2';
    div.style.width = 'fit-content';
    div.style.height = 'fit-content';
    div.textContent = content;
    
    document.body.appendChild(div);
    const width = div.offsetWidth;
    const height = div.offsetHeight;
    document.body.removeChild(div);
    
    return { width: width + 5, height: height + 5 }; // Ajouter une petite marge
  };

  // Add element
  const addElement = (type: 'text' | 'qrcode' | 'image', content: string = '') => {
    const defaultFontSize = 70;
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    
    // Détecter si c'est une variable (contient {{ }})
    const isVariable = content.includes('{{') && content.includes('}}');
    
    let textWidth: number;
    let textHeight: number;
    let posX: number;
    let posY: number;
    let textAlign: 'left' | 'center' | 'right' = 'left';
    
    if (type === 'text' && isVariable) {
      // Variables : 90% de la largeur du badge, centrées
      textWidth = badgeWidth * 0.9;
      textHeight = Math.ceil(defaultFontSize * 1.5);
      posX = badgeWidth * 0.05; // Centré (5% de marge de chaque côté)
      posY = 50;
      textAlign = 'left'; // Texte aligné à gauche dans la zone centrée
    } else if (type === 'text' && content) {
      // Texte libre : mesurer la taille réelle du texte
      const measured = measureText(content, defaultFontSize);
      textWidth = measured.width;
      textHeight = measured.height;
      posX = 50;
      posY = 50;
      textAlign = 'left';
    } else {
      // Défaut pour autres types
      textWidth = type === 'image' ? 100 : (type === 'qrcode' ? 80 : 300);
      textHeight = type === 'image' ? 100 : (type === 'qrcode' ? 80 : Math.ceil(defaultFontSize * 1.5));
      posX = 50;
      posY = 50;
    }
    
    const newElement: BadgeElement = {
      id: `element-${Date.now()}`,
      type,
      content,
      x: posX,
      y: posY,
      width: textWidth,
      height: textHeight,
      visible: true,
      ...(type === 'qrcode' && { 
        maintainAspectRatio: true,
        aspectRatio: 1
      }),
      style: {
        fontFamily: 'Arial',
        fontSize: defaultFontSize,
        color: '#000000',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: textAlign,
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
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    // Si le contenu change et que c'est un texte, recalculer les dimensions automatiquement
    if (updates.content !== undefined && element.type === 'text') {
      const newContent = updates.content;
      const isVariable = newContent.includes('{{') && newContent.includes('}}');
      const fontSize = updates.style?.fontSize || element.style.fontSize || 70;
      const fontFamily = updates.style?.fontFamily || element.style.fontFamily || 'Arial';
      const badgeWidth = mmToPx(format.width);
      
      if (isVariable) {
        // Variables : garder 90% de la largeur du badge
        updates.width = badgeWidth * 0.9;
        updates.x = badgeWidth * 0.05;
        updates.height = Math.ceil(fontSize * 1.5);
      } else {
        // Texte libre : mesurer la taille réelle du texte
        const measured = measureText(newContent, fontSize, fontFamily);
        updates.width = measured.width;
        updates.height = measured.height;
      }
    }
    
    // Si la taille de police change et que c'est un texte, recalculer les dimensions
    if (updates.style?.fontSize !== undefined && element.type === 'text') {
      const fontSize = updates.style.fontSize;
      const fontFamily = updates.style.fontFamily || element.style.fontFamily || 'Arial';
      const content = updates.content || element.content;
      const isVariable = content.includes('{{') && content.includes('}}');
      const badgeWidth = mmToPx(format.width);
      
      if (isVariable) {
        updates.width = badgeWidth * 0.9;
        updates.height = Math.ceil(fontSize * 1.5);
      } else {
        const measured = measureText(content, fontSize, fontFamily);
        updates.width = measured.width;
        updates.height = measured.height;
      }
    }
    
    // Si la police change et que c'est un texte libre, recalculer les dimensions
    if (updates.style?.fontFamily !== undefined && element.type === 'text') {
      const fontSize = updates.style.fontSize || element.style.fontSize || 70;
      const fontFamily = updates.style.fontFamily;
      const content = updates.content || element.content;
      const isVariable = content.includes('{{') && content.includes('}}');
      
      if (!isVariable) {
        const measured = measureText(content, fontSize, fontFamily);
        updates.width = measured.width;
        updates.height = measured.height;
      }
    }
    
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    
    // Update symmetry pair if needed
    const updatedElement = newElements.find(el => el.id === id);
    if (updatedElement) {
      updateSymmetryPair(updatedElement);
    }
    
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

  // Symmetry functions (from original badge generator)
  const createSymmetry = () => {
    if (selectedElements.length === 0) return;
    
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    const newSymmetryPairs = new Map(symmetryPairs);
    const newElements = [...elements];
    
    selectedElements.forEach(parentId => {
      const parentElement = elements.find(el => el.id === parentId);
      if (!parentElement) return;
      
      // Calculate symmetric position (central symmetry = 180° rotation around center)
      const parentCenterX = parentElement.x + parentElement.width / 2;
      const parentCenterY = parentElement.y + parentElement.height / 2;
      
      // Central symmetry: point reflection through the center
      const cloneCenterX = 2 * centerX - parentCenterX;
      const cloneCenterY = 2 * centerY - parentCenterY;
      
      const cloneX = cloneCenterX - parentElement.width / 2;
      const cloneY = cloneCenterY - parentElement.height / 2;
      
      // Create clone with 180° rotation for true central symmetry
      const transform = getTransformWithRotation((parentElement.style.rotation || 0) + 180, parentElement.style.transform);
      
      const cloneElement: BadgeElement = {
        ...parentElement,
        id: `clone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: Math.round(cloneX),
        y: Math.round(cloneY),
        style: {
          ...parentElement.style,
          rotation: (parentElement.style.rotation || 0) + 180,
          transform
        }
      };
      
      newElements.push(cloneElement);
      newSymmetryPairs.set(parentId, cloneElement.id);
    });
    
    setElements(newElements);
    setSymmetryPairs(newSymmetryPairs);
    saveToHistory(newElements, background);
  };

  const breakSymmetry = () => {
    if (selectedElements.length === 0) return;
    
    const newSymmetryPairs = new Map(symmetryPairs);
    
    selectedElements.forEach(id => {
      // Remove if it's a parent
      if (newSymmetryPairs.has(id)) {
        newSymmetryPairs.delete(id);
      }
      // Remove if it's a clone
      for (const [parentId, cloneId] of newSymmetryPairs.entries()) {
        if (cloneId === id) {
          newSymmetryPairs.delete(parentId);
        }
      }
    });
    
    setSymmetryPairs(newSymmetryPairs);
  };

  const updateSymmetryPair = (updatedElement: BadgeElement) => {
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    // Check if this element is a parent in a symmetry pair
    const cloneId = symmetryPairs.get(updatedElement.id);
    if (cloneId) {
      // Update the clone to maintain central symmetry
      setElements(prev => prev.map(el => {
        if (el.id === cloneId) {
          // Calculate symmetric position
          const parentCenterX = updatedElement.x + updatedElement.width / 2;
          const parentCenterY = updatedElement.y + updatedElement.height / 2;
          
          const cloneCenterX = 2 * centerX - parentCenterX;
          const cloneCenterY = 2 * centerY - parentCenterY;
          
          const cloneX = cloneCenterX - updatedElement.width / 2;
          const cloneY = cloneCenterY - updatedElement.height / 2;
          
          return {
            ...el,
            x: Math.round(cloneX),
            y: Math.round(cloneY),
            width: updatedElement.width,
            height: updatedElement.height,
            style: {
              ...updatedElement.style,
              rotation: (updatedElement.style.rotation || 0) + 180,
              transform: getTransformWithRotation((updatedElement.style.rotation || 0) + 180, updatedElement.style.transform)
            }
          };
        }
        return el;
      }));
    }
    
    // Check if this element is a clone in a symmetry pair
    for (const [parentId, cloneIdInPair] of symmetryPairs.entries()) {
      if (cloneIdInPair === updatedElement.id) {
        // Update the parent to maintain central symmetry
        setElements(prev => prev.map(el => {
          if (el.id === parentId) {
            // Calculate symmetric position
            const cloneCenterX = updatedElement.x + updatedElement.width / 2;
            const cloneCenterY = updatedElement.y + updatedElement.height / 2;
            
            const parentCenterX = 2 * centerX - cloneCenterX;
            const parentCenterY = 2 * centerY - cloneCenterY;
            
            const parentX = parentCenterX - updatedElement.width / 2;
            const parentY = parentCenterY - updatedElement.height / 2;
            
            return {
              ...el,
              x: Math.round(parentX),
              y: Math.round(parentY),
              width: updatedElement.width,
              height: updatedElement.height,
              style: {
                ...updatedElement.style,
                rotation: (updatedElement.style.rotation || 0) - 180,
                transform: getTransformWithRotation((updatedElement.style.rotation || 0) - 180, updatedElement.style.transform)
              }
            };
          }
          return el;
        }));
      }
    }
  };

  // Zoom and view functions - Now handled by react-zoom-pan-pinch
  const handleZoomIn = () => {
    transformRef.current?.zoomIn(0.2);
  };

  const handleZoomOut = () => {
    transformRef.current?.zoomOut(0.2);
  };

  const resetView = () => {
    transformRef.current?.resetTransform();
  };

  const fitToScreen = () => {
    transformRef.current?.centerView(0.5);
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

  // Generate HTML and CSS from elements
  const generateHTMLAndCSS = () => {
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    
    // Generate HTML
    let html = '<div class="badge-container">\n';
    
    elements.forEach(el => {
      if (el.type === 'text') {
        const content = el.content || '';
        html += `  <div class="element element-${el.id}">${content}</div>\n`;
      } else if (el.type === 'image') {
        html += `  <div class="element element-${el.id}"><img src="{{photo_url}}" alt="Photo" /></div>\n`;
      } else if (el.type === 'qr') {
        html += `  <div class="element element-${el.id}"><img src="{{qr_code_url}}" alt="QR Code" /></div>\n`;
      }
    });
    
    html += '</div>';
    
    // Generate CSS
    let css = `.badge-container {
  position: relative;
  width: ${badgeWidth}px;
  height: ${badgeHeight}px;
  ${background ? `background: ${background.startsWith('http') || background.startsWith('data:') ? `url(${background})` : background};` : 'background: #ffffff;'}
  background-size: cover;
  background-position: center;
  overflow: hidden;
}\n\n`;

    css += `.element {
  position: absolute;
  box-sizing: border-box;
}\n\n`;

    css += `.element img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}\n\n`;

    elements.forEach(el => {
      css += `.element-${el.id} {
  left: ${el.x}px;
  top: ${el.y}px;
  width: ${el.width || 'auto'}px;
  height: ${el.height || 'auto'}px;`;
      
      if (el.type === 'text') {
        css += `\n  font-size: ${el.fontSize || 16}px;
  font-weight: ${el.fontWeight || 'normal'};
  text-align: ${el.textAlign || 'left'};
  color: ${el.color || '#000000'};`;
        if (el.fontFamily) css += `\n  font-family: ${el.fontFamily};`;
        if (el.style?.textTransform) css += `\n  text-transform: ${el.style.textTransform};`;
      }
      
      if (el.borderRadius) css += `\n  border-radius: ${el.borderRadius};`;
      if (el.style?.rotation) css += `\n  transform: rotate(${el.style.rotation}deg);`;
      if (el.style?.opacity !== undefined) css += `\n  opacity: ${el.style.opacity};`;
      
      css += '\n}\n\n';
    });
    
    return { html, css };
  };

  // Save template to API
  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Erreur', 'Veuillez entrer un nom pour le template');
      return;
    }

    try {
      const templateData = {
        elements,
        background,
        format,
        uploadedImages: Array.from(uploadedImages.entries()),
        symmetryPairs: Array.from(symmetryPairs.entries())
      };
      
      // Note: We don't generate HTML/CSS here anymore
      // The backend will generate it from template_data when rendering badges
      // This ensures fontSize and other styles from elements are preserved

      // Extract variables from elements
      const variables = elements
        .filter(el => el.type === 'text')
        .map(el => el.content)
        .filter(content => content.includes('{{') && content.includes('}}'))
        .map(content => {
          const match = content.match(/\{\{([^}]+)\}\}/g);
          return match ? match.map(m => m.replace(/[{}]/g, '')) : [];
        })
        .flat()
        .filter((v, i, arr) => arr.indexOf(v) === i); // unique

      const payload = {
        code: templateName.toLowerCase().replace(/\s+/g, '-'),
        name: templateName,
        description: `Badge template ${format.name}`,
        width: mmToPx(format.width),
        height: mmToPx(format.height),
        // html and css will be generated by backend from template_data
        html: '',
        css: '',
        template_data: templateData,
        variables,
        is_active: true
      };

      if (templateId && templateId !== 'new') {
        // Update existing template
        await updateTemplate({ id: templateId, data: payload }).unwrap();
        toast.success('Succès', 'Template mis à jour avec succès');
      } else {
        // Create new template
        const result = await createTemplate(payload).unwrap();
        toast.success('Succès', 'Template créé avec succès');
        // Navigate to edit mode with the new template ID
        navigate(`/badges/designer/${result.id}`);
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Erreur', error?.data?.message || 'Erreur lors de la sauvegarde du template');
    }
  };

  // Delete template
  const handleDeleteTemplate = async () => {
    if (!templateId || templateId === 'new') return;
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return;
    }

    try {
      await deleteTemplate(templateId).unwrap();
      toast.success('Succès', 'Template supprimé avec succès');
      navigate('/badges');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Erreur', error?.data?.message || 'Erreur lors de la suppression du template');
    }
  };

  // Go back to list
  const handleGoBack = () => {
    navigate('/badges');
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

  const handleDragStop = (id: string, _e: any, data: { x: number; y: number }) => {
    // Mise à jour finale de la position
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
    <div className="flex bg-gray-100 dark:bg-gray-900 h-[calc(100vh-69px)]">
      {/* Left Sidebar */}
      <LeftSidebar
        format={format}
        onFormatChange={handleFormatChange}
        onAddElement={addElement}
        backgroundInputRef={backgroundInputRef}
        onImageUpload={handleImageUpload}
        templateName={templateName}
        onTemplateNameChange={setTemplateName}
        onSaveTemplate={saveTemplate}
        copiedUrl={copiedUrl}
        onCopyUrl={copyUrl}
        isSaving={isCreating || isUpdating}
        onGoBack={handleGoBack}
        onDeleteTemplate={handleDeleteTemplate}
        isDeleting={isDeleting}
        isEditMode={templateId !== 'new'}
        zoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={resetView}
        onFitToScreen={fitToScreen}
      />

      {/* Main Canvas - zoom/pan managed by BadgeEditor */}
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
        onDragStop={handleDragStop}
        onResize={handleResize}
        isSelecting={isSelecting}
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        uploadedImages={uploadedImages}
        symmetryPairs={symmetryPairs}
        transformRef={transformRef}
        initialZoom={0.5}
        currentZoom={currentZoom}
        onZoomChange={setCurrentZoom}
      />

      {/* Right Sidebar */}
      <RightSidebar
        selectedElements={elements.filter(el => selectedElements.includes(el.id))}
        badgeFormat={format}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        onDuplicateElement={duplicateElement}
        onMoveElement={moveElement}
        onToggleVisibility={toggleVisibility}
        symmetryPairs={symmetryPairs}
        onCreateSymmetry={createSymmetry}
        onBreakSymmetry={breakSymmetry}
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