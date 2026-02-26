import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useBlocker, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { AlertTriangle } from 'lucide-react';
import { BadgeElement, BadgeFormat, BADGE_FORMATS, HistoryState } from '../../shared/types/badge.types';
import { mmToPx } from '../../shared/utils/conversion';
import { getTransformWithRotation } from '../../shared/utils/transform';
import { BadgeEditor } from './components/BadgeEditor';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { 
  useGetBadgeTemplateQuery, 
  useCreateBadgeTemplateMutation, 
  useUpdateBadgeTemplateMutation,
  useDeleteBadgeTemplateMutation
} from '@/services/api/badge-templates.api';
import { useToast } from '@/shared/hooks/useToast';
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage';

const MAX_HISTORY = 99;

const BadgeDesignerPageContent: React.FC = () => {
  // Router hooks
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { t } = useTranslation('badges');
  
  // API hooks
  const { data: loadedTemplate } = useGetBadgeTemplateQuery(
    templateId || 'skip',
    { skip: !templateId || templateId === 'new' }
  );
  const [createTemplate, { isLoading: isCreating }] = useCreateBadgeTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateBadgeTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteBadgeTemplateMutation();
  
  // State — use format from location.state (set by format selector) or fallback to LARGE
  const initialFormat = (location.state as any)?.format || BADGE_FORMATS.LARGE;
  const [format, setFormat] = useState<BadgeFormat>(initialFormat);
  const [elements, setElements] = useState<BadgeElement[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [background, setBackground] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [templateName, setTemplateName] = useState('');
  const [clipboard, setClipboard] = useState<BadgeElement[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Map<string, { data: string; filename: string }>>(new Map());
  
  // Symmetry pairs - maps parent ID to clone ID  
  const [symmetryPairs, setSymmetryPairs] = useState<Map<string, string>>(new Map());
  
  // Current zoom level for display
  const [currentZoom, setCurrentZoom] = useState(0.5);
  
  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const badgeRef = useRef<HTMLDivElement>(null);
  const elementRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const saveTemplateRef = useRef<((options?: { exitAfterSave?: boolean }) => Promise<void>) | null>(null);
  const hasLoadedTemplateRef = useRef(false);
  const isSavingRef = useRef(false);

  // Protection contre la navigation interne avec useBlocker
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isSavingRef.current && isDirty && (
        currentLocation.pathname !== nextLocation.pathname || 
        currentLocation.search !== nextLocation.search
      )
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowUnsavedChangesModal(true);
    } else {
      setShowUnsavedChangesModal(false);
    }
  }, [blocker]);

  // Détection des changements : dirty si on a plus d'une entrée d'historique (initial + modifications)
  useEffect(() => {
    // Si l'historique a plus d'une entrée, il y a eu des modifications
    setIsDirty(history.length > 1);
  }, [history.length]);

  // Reset isSavingRef when location changes
  useEffect(() => {
    isSavingRef.current = false;
  }, [location]);

  // Protection contre la fermeture de l'onglet/navigateur
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save state to history
  const saveToHistory = useCallback((newElements: BadgeElement[], newBackground: string | null, newSymmetryPairs?: Map<string, string>) => {
    // Use provided symmetryPairs or current state
    const pairsToSave = newSymmetryPairs !== undefined ? newSymmetryPairs : symmetryPairs;
    
    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(newElements)),
      background: newBackground,
      symmetryPairs: Array.from(pairsToSave.entries()) // Convert Map to array for serialization
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-MAX_HISTORY);
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex, symmetryPairs]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      if (!state) return;
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setBackground(state.background);
      // Restore symmetry pairs
      setSymmetryPairs(new Map(state.symmetryPairs || []));
      setHistoryIndex(newIndex);
      // Keep selection - filter out IDs that no longer exist
      setSelectedElements(prev => prev.filter(id => state.elements.some(el => el.id === id)));
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      if (!state) return;
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setBackground(state.background);
      // Restore symmetry pairs
      setSymmetryPairs(new Map(state.symmetryPairs || []));
      setHistoryIndex(newIndex);
      // Keep selection - filter out IDs that no longer exist
      setSelectedElements(prev => prev.filter(id => state.elements.some(el => el.id === id)));
    }
  }, [history, historyIndex]);

  // Copy selected elements
  const copyElements = useCallback(() => {
    if (selectedElements.length === 0) return;
    const elementsToCopy = elements.filter(el => selectedElements.includes(el.id));
    setClipboard(JSON.parse(JSON.stringify(elementsToCopy)));
  }, [selectedElements, elements]);

  // Paste copied elements
  const pasteElements = useCallback(() => {
    if (clipboard.length === 0) return;
    
    const PASTE_OFFSET = 20; // Offset in pixels
    let timeOffset = 0;
    const newElements: BadgeElement[] = clipboard.map(el => {
      const newId = `element-${Date.now() + timeOffset}`;
      timeOffset++;
      return {
        ...el,
        id: newId,
        x: el.x + PASTE_OFFSET,
        y: el.y + PASTE_OFFSET,
      };
    });

    const updatedElements = [...elements, ...newElements];
    setElements(updatedElements);
    setSelectedElements(newElements.map(el => el.id));
    saveToHistory(updatedElements, background);
  }, [clipboard, elements, background, saveToHistory]);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
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
  }, [elements, background, saveToHistory]);

  // Duplicate multiple elements at once
  const duplicateElements = useCallback((ids: string[]) => {
    const elementsToDuplicate = elements.filter(el => ids.includes(el.id));
    if (elementsToDuplicate.length === 0) return;

    const newElements = [...elements];
    const newIds: string[] = [];
    let timeOffset = 0;

    elementsToDuplicate.forEach(element => {
      const newElement: BadgeElement = {
        ...element,
        id: `element-${Date.now() + timeOffset}`,
        x: element.x + 20,
        y: element.y + 20
      };
      newElements.push(newElement);
      newIds.push(newElement.id);
      timeOffset++; // Ensure unique IDs
    });

    setElements(newElements);
    setSelectedElements(newIds);
    saveToHistory(newElements, background);
  }, [elements, background, saveToHistory]);

  // Load template from API when editing (only once at mount)
  useEffect(() => {
    // Skip if already loaded
    if (hasLoadedTemplateRef.current) return;
    
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
        
        // Initialize history with loaded state including symmetryPairs
        const initialSymmetryPairs = data.symmetryPairs ? new Map(data.symmetryPairs) : new Map();
        const initialState: HistoryState = {
          elements: JSON.parse(JSON.stringify(elementsWithAspectRatio)),
          background: data.background || null,
          symmetryPairs: Array.from(initialSymmetryPairs.entries())
        };
        setHistory([initialState]);
        setHistoryIndex(0);
        
        // Mark as loaded to prevent re-loading after save
        hasLoadedTemplateRef.current = true;
      } catch (e) {
        console.error('Failed to load template from API:', e);
        toast.error('Erreur', 'Impossible de charger le template');
      }
    } else if (templateId === 'new') {
      // Initialize history for new templates (only once)
      const initialState: HistoryState = {
        elements: [],
        background: null,
        symmetryPairs: []
      };
      setHistory([initialState]);
      setHistoryIndex(0);
      hasLoadedTemplateRef.current = true;
    }
  }, [loadedTemplate, templateId, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveTemplateRef.current?.();
        return;
      }

      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Ctrl/Cmd + C: Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyElements();
        return;
      }

      // Ctrl/Cmd + V: Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteElements();
        return;
      }

      // Delete or Backspace: Delete selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedElements.length > 0) {
          // Use deleteElements to handle symmetry pairs
          deleteElements(selectedElements);
        }
        return;
      }

      // Ctrl/Cmd + D: Duplicate selected elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        if (selectedElements.length > 1) {
          duplicateElements(selectedElements);
        } else if (selectedElements.length === 1 && selectedElements[0]) {
          duplicateElement(selectedElements[0]);
        }
        return;
      }

      // Ctrl/Cmd + A: Select all elements
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedElements(elements.map(el => el.id));
        return;
      }

      // Escape: Deselect all
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedElements([]);
        return;
      }

      // Arrow keys: Move selected elements
      if (selectedElements.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        // Shift key multiplies movement by 10 for faster movement
        const moveAmount = e.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case 'ArrowUp':
            deltaY = -moveAmount;
            break;
          case 'ArrowDown':
            deltaY = moveAmount;
            break;
          case 'ArrowLeft':
            deltaX = -moveAmount;
            break;
          case 'ArrowRight':
            deltaX = moveAmount;
            break;
        }

        // Batch update all selected elements
        const badgeWidth = mmToPx(format.width);
        const badgeHeight = mmToPx(format.height);
        const centerX = badgeWidth / 2;
        const centerY = badgeHeight / 2;
        
        // Calculate all symmetry updates first
        const symmetryUpdates = new Map<string, Partial<BadgeElement>>();
        
        selectedElements.forEach(elementId => {
          const element = elements.find(el => el.id === elementId);
          if (!element) return;
          
          const updatedElement = {
            ...element,
            x: element.x + deltaX,
            y: element.y + deltaY
          };
          
          // Check if this element is a parent in a symmetry pair
          const cloneId = symmetryPairs.get(elementId);
          if (cloneId) {
            const parentCenterX = updatedElement.x + updatedElement.width / 2;
            const parentCenterY = updatedElement.y + updatedElement.height / 2;
            
            const cloneCenterX = 2 * centerX - parentCenterX;
            const cloneCenterY = 2 * centerY - parentCenterY;
            
            const cloneX = cloneCenterX - updatedElement.width / 2;
            const cloneY = cloneCenterY - updatedElement.height / 2;
            
            symmetryUpdates.set(cloneId, {
              x: Math.round(cloneX),
              y: Math.round(cloneY),
              width: updatedElement.width,
              height: updatedElement.height,
              style: {
                ...updatedElement.style,
                rotation: (updatedElement.style.rotation || 0) + 180,
                transform: getTransformWithRotation((updatedElement.style.rotation || 0) + 180, updatedElement.style.transform)
              }
            });
          }
          
          // Check if this element is a clone in a symmetry pair
          for (const [parentId, cloneIdInPair] of symmetryPairs.entries()) {
            if (cloneIdInPair === elementId) {
              const cloneCenterX = updatedElement.x + updatedElement.width / 2;
              const cloneCenterY = updatedElement.y + updatedElement.height / 2;
              
              const parentCenterX = 2 * centerX - cloneCenterX;
              const parentCenterY = 2 * centerY - cloneCenterY;
              
              const parentX = parentCenterX - updatedElement.width / 2;
              const parentY = parentCenterY - updatedElement.height / 2;
              
              symmetryUpdates.set(parentId, {
                x: Math.round(parentX),
                y: Math.round(parentY),
                width: updatedElement.width,
                height: updatedElement.height,
                style: {
                  ...updatedElement.style,
                  rotation: (updatedElement.style.rotation || 0) - 180,
                  transform: getTransformWithRotation((updatedElement.style.rotation || 0) - 180, updatedElement.style.transform)
                }
              });
              break;
            }
          }
        });
        
        // Apply all updates in one synchronous setElements call
        const newElements = elements.map(element => {
          if (selectedElements.includes(element.id)) {
            return {
              ...element,
              x: element.x + deltaX,
              y: element.y + deltaY
            };
          }
          if (symmetryUpdates.has(element.id)) {
            return { ...element, ...symmetryUpdates.get(element.id) };
          }
          return element;
        });

        setElements(newElements);
        saveToHistory(newElements, background);
        
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElements, elements, background, saveToHistory, undo, redo, copyElements, pasteElements, duplicateElement, duplicateElements]);

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
      textAlign = 'left';
    } else if (type === 'text' && content) {
      // Texte libre : mesurer la taille réelle du texte
      const measured = measureText(content, defaultFontSize);
      textWidth = measured.width;
      textHeight = measured.height;
      textAlign = 'left';
    } else {
      // Défaut pour autres types
      textWidth = type === 'image' ? 100 : (type === 'qrcode' ? 80 : 300);
      textHeight = type === 'image' ? 100 : (type === 'qrcode' ? 80 : Math.ceil(defaultFontSize * 1.5));
    }

    // Calculer la position au centre de la zone visible du viewport
    // On utilise badgeRef pour obtenir la position réelle du badge à l'écran
    const badgeEl = badgeRef.current;
    if (badgeEl) {
      const badgeRect = badgeEl.getBoundingClientRect();
      // Trouver le conteneur parent (la zone d'édition visible)
      const editorContainer = badgeEl.closest('.flex-1.flex.items-center');
      if (editorContainer) {
        const containerRect = editorContainer.getBoundingClientRect();

        // Centre du conteneur visible en coordonnées écran
        const viewportCenterScreenX = containerRect.left + containerRect.width / 2;
        const viewportCenterScreenY = containerRect.top + containerRect.height / 2;

        // Convertir en coordonnées badge (0..badgeWidth, 0..badgeHeight)
        const scaleX = badgeWidth / badgeRect.width;
        const scaleY = badgeHeight / badgeRect.height;
        const centerXOnBadge = (viewportCenterScreenX - badgeRect.left) * scaleX;
        const centerYOnBadge = (viewportCenterScreenY - badgeRect.top) * scaleY;

        if (type === 'text' && isVariable) {
          posX = badgeWidth * 0.05;
          posY = Math.max(0, Math.min(centerYOnBadge - textHeight / 2, badgeHeight - textHeight));
        } else {
          posX = Math.max(0, Math.min(centerXOnBadge - textWidth / 2, badgeWidth - textWidth));
          posY = Math.max(0, Math.min(centerYOnBadge - textHeight / 2, badgeHeight - textHeight));
        }
      } else {
        posX = (type === 'text' && isVariable) ? badgeWidth * 0.05 : 50;
        posY = 50;
      }
    } else {
      // Fallback si pas de badgeRef
      posX = (type === 'text' && isVariable) ? badgeWidth * 0.05 : 50;
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
  const updateElement = (id: string, updates: Partial<BadgeElement>, skipHistory = false): BadgeElement[] => {
    const element = elements.find(el => el.id === id);
    if (!element) return elements;
    
    // NOTE: Ne plus recalculer automatiquement les dimensions quand le contenu change
    // L'utilisateur peut avoir manuellement redimensionné l'élément et on doit respecter ça
    
    // Si la taille de police change et que c'est un texte, recalculer seulement la hauteur
    if (updates.style?.fontSize !== undefined && element.type === 'text') {
      const fontSize = updates.style.fontSize;
      // Ne modifier que la hauteur, pas la largeur
      updates.height = Math.ceil(fontSize * 1.5);
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
    
    // Merge style properties intelligently to avoid overwriting the entire style object
    const mergedUpdates = { ...updates };
    if (updates.style) {
      const element = elements.find(el => el.id === id);
      if (element) {
        mergedUpdates.style = { ...element.style, ...updates.style };
      }
    }
    
    // Calculate symmetry pair updates BEFORE setElements
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    const updatedElement = { ...element, ...mergedUpdates };
    let symmetryUpdate: { id: string; updates: Partial<BadgeElement> } | null = null;
    
    // Check if this element is a parent in a symmetry pair
    const cloneId = symmetryPairs.get(id);
    if (cloneId) {
      // Calculate symmetric position for clone
      const parentCenterX = updatedElement.x + updatedElement.width / 2;
      const parentCenterY = updatedElement.y + updatedElement.height / 2;
      
      const cloneCenterX = 2 * centerX - parentCenterX;
      const cloneCenterY = 2 * centerY - parentCenterY;
      
      const cloneX = cloneCenterX - updatedElement.width / 2;
      const cloneY = cloneCenterY - updatedElement.height / 2;
      
      symmetryUpdate = {
        id: cloneId,
        updates: {
          x: Math.round(cloneX),
          y: Math.round(cloneY),
          width: updatedElement.width,
          height: updatedElement.height,
          style: {
            ...updatedElement.style,
            rotation: (updatedElement.style.rotation || 0) + 180,
            transform: getTransformWithRotation((updatedElement.style.rotation || 0) + 180, updatedElement.style.transform)
          }
        }
      };
    }
    
    // Check if this element is a clone in a symmetry pair
    for (const [parentId, cloneIdInPair] of symmetryPairs.entries()) {
      if (cloneIdInPair === id) {
        // Calculate symmetric position for parent
        const cloneCenterX = updatedElement.x + updatedElement.width / 2;
        const cloneCenterY = updatedElement.y + updatedElement.height / 2;
        
        const parentCenterX = 2 * centerX - cloneCenterX;
        const parentCenterY = 2 * centerY - cloneCenterY;
        
        const parentX = parentCenterX - updatedElement.width / 2;
        const parentY = parentCenterY - updatedElement.height / 2;
        
        symmetryUpdate = {
          id: parentId,
          updates: {
            x: Math.round(parentX),
            y: Math.round(parentY),
            width: updatedElement.width,
            height: updatedElement.height,
            style: {
              ...updatedElement.style,
              rotation: (updatedElement.style.rotation || 0) - 180,
              transform: getTransformWithRotation((updatedElement.style.rotation || 0) - 180, updatedElement.style.transform)
            }
          }
        };
        break;
      }
    }
    
    // Update both parent and clone in a SINGLE synchronous setElements call
    const newElements = elements.map(el => {
      if (el.id === id) {
        return { ...el, ...mergedUpdates };
      }
      if (symmetryUpdate && el.id === symmetryUpdate.id) {
        return { ...el, ...symmetryUpdate.updates };
      }
      return el;
    });
    
    setElements(newElements);
    
    if (!skipHistory) {
      saveToHistory(newElements, background);
    }
    
    return newElements;
  };

  // Batch update elements
  const batchUpdateElements = (updates: Array<{ id: string; updates: Partial<BadgeElement> }>, skipHistory = false) => {
    const badgeWidth = mmToPx(format.width);
    const badgeHeight = mmToPx(format.height);
    const centerX = badgeWidth / 2;
    const centerY = badgeHeight / 2;
    
    // Calculate all symmetry updates first
    const symmetryUpdates = new Map<string, Partial<BadgeElement>>();
    
    updates.forEach(({ id, updates: elementUpdates }) => {
      const element = elements.find(el => el.id === id);
      if (!element) return;
      
      const mergedUpdates = { ...elementUpdates };
      if (elementUpdates.style) {
        mergedUpdates.style = { ...element.style, ...elementUpdates.style };
      }
      
      const updatedElement = { ...element, ...mergedUpdates };
      
      // Check if this element is a parent in a symmetry pair
      const cloneId = symmetryPairs.get(id);
      if (cloneId) {
        const parentCenterX = updatedElement.x + updatedElement.width / 2;
        const parentCenterY = updatedElement.y + updatedElement.height / 2;
        
        const cloneCenterX = 2 * centerX - parentCenterX;
        const cloneCenterY = 2 * centerY - parentCenterY;
        
        const cloneX = cloneCenterX - updatedElement.width / 2;
        const cloneY = cloneCenterY - updatedElement.height / 2;
        
        symmetryUpdates.set(cloneId, {
          x: Math.round(cloneX),
          y: Math.round(cloneY),
          width: updatedElement.width,
          height: updatedElement.height,
          style: {
            ...updatedElement.style,
            rotation: (updatedElement.style.rotation || 0) + 180,
            transform: getTransformWithRotation((updatedElement.style.rotation || 0) + 180, updatedElement.style.transform)
          }
        });
      }
      
      // Check if this element is a clone in a symmetry pair
      for (const [parentId, cloneIdInPair] of symmetryPairs.entries()) {
        if (cloneIdInPair === id) {
          const cloneCenterX = updatedElement.x + updatedElement.width / 2;
          const cloneCenterY = updatedElement.y + updatedElement.height / 2;
          
          const parentCenterX = 2 * centerX - cloneCenterX;
          const parentCenterY = 2 * centerY - cloneCenterY;
          
          const parentX = parentCenterX - updatedElement.width / 2;
          const parentY = parentCenterY - updatedElement.height / 2;
          
          symmetryUpdates.set(parentId, {
            x: Math.round(parentX),
            y: Math.round(parentY),
            width: updatedElement.width,
            height: updatedElement.height,
            style: {
              ...updatedElement.style,
              rotation: (updatedElement.style.rotation || 0) - 180,
              transform: getTransformWithRotation((updatedElement.style.rotation || 0) - 180, updatedElement.style.transform)
            }
          });
          break;
        }
      }
    });
    
    // Apply all updates in one synchronous setElements call
    const newElements = elements.map(element => {
      const update = updates.find(u => u.id === element.id);
      if (update) {
        // Merge style properties intelligently to avoid overwriting the entire style object
        const mergedUpdates = { ...update.updates };
        if (update.updates.style) {
          mergedUpdates.style = { ...element.style, ...update.updates.style };
        }
        return { ...element, ...mergedUpdates };
      }
      if (symmetryUpdates.has(element.id)) {
        return { ...element, ...symmetryUpdates.get(element.id) };
      }
      return element;
    });
    
    setElements(newElements);
    
    if (!skipHistory) {
      saveToHistory(newElements, background);
    }
  };

  // Delete element
  const deleteElement = (id: string) => {
    const idsToDelete = new Set<string>([id]);
    
    // If element is part of a symmetry pair, delete both elements
    const newSymmetryPairs = new Map(symmetryPairs);
    
    // Check if it's a parent - add clone to deletion
    if (newSymmetryPairs.has(id)) {
      const cloneId = newSymmetryPairs.get(id)!;
      idsToDelete.add(cloneId);
      newSymmetryPairs.delete(id);
    }
    
    // Check if it's a clone - add parent to deletion
    for (const [parentId, cloneId] of newSymmetryPairs.entries()) {
      if (cloneId === id) {
        idsToDelete.add(parentId);
        newSymmetryPairs.delete(parentId);
        break;
      }
    }
    
    const newElements = elements.filter(el => !idsToDelete.has(el.id));
    setElements(newElements);
    setSymmetryPairs(newSymmetryPairs);
    setSelectedElements(prev => prev.filter(selectedId => !idsToDelete.has(selectedId)));
    saveToHistory(newElements, background, newSymmetryPairs);
  };

  // Delete multiple elements at once
  const deleteElements = (ids: string[]) => {
    const idsToDelete = new Set<string>(ids);
    
    // For each element to delete, if it's part of a symmetry pair, add the pair to deletion
    const newSymmetryPairs = new Map(symmetryPairs);
    
    ids.forEach(id => {
      // Check if it's a parent - add clone to deletion
      if (newSymmetryPairs.has(id)) {
        const cloneId = newSymmetryPairs.get(id)!;
        idsToDelete.add(cloneId);
        newSymmetryPairs.delete(id);
      }
      
      // Check if it's a clone - add parent to deletion
      for (const [parentId, cloneId] of newSymmetryPairs.entries()) {
        if (cloneId === id) {
          idsToDelete.add(parentId);
          newSymmetryPairs.delete(parentId);
        }
      }
    });
    
    const newElements = elements.filter(el => !idsToDelete.has(el.id));
    setElements(newElements);
    setSymmetryPairs(newSymmetryPairs);
    setSelectedElements([]);
    saveToHistory(newElements, background, newSymmetryPairs);
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
    // Save to history with new symmetry pairs
    saveToHistory(newElements, background, newSymmetryPairs);
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
    // Save to history when breaking symmetry
    saveToHistory(elements, background, newSymmetryPairs);
  };

  // Zoom and view functions - Now handled by react-zoom-pan-pinch
  const handleZoomIn = () => {
    transformRef.current?.zoomIn(0.2);
  };

  const handleZoomOut = () => {
    transformRef.current?.zoomOut(0.2);
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
        css += `\n  font-size: ${el.style?.fontSize || 16}px;
  font-weight: ${el.style?.fontWeight || 'normal'};
  text-align: ${el.style?.textAlign || 'left'};
  color: ${el.style?.color || '#000000'};`;
        if (el.style?.fontFamily) css += `\n  font-family: ${el.style.fontFamily};`;
        if (el.style?.textTransform) css += `\n  text-transform: ${el.style.textTransform};`;
      }
      
      if (el.properties?.borderRadius) css += `\n  border-radius: ${el.properties.borderRadius};`;
      if (el.style?.rotation) css += `\n  transform: rotate(${el.style.rotation}deg);`;
      if (el.style?.opacity !== undefined) css += `\n  opacity: ${el.style.opacity};`;
      
      css += '\n}\n\n';
    });
    
    return { html, css };
  };

  // Save template to API
  const saveTemplate = async (options: { exitAfterSave?: boolean } = {}) => {
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
        setIsDirty(false);
        // Réinitialiser l'historique à l'état actuel après sauvegarde
        const newInitialState: HistoryState = {
          elements: JSON.parse(JSON.stringify(elements)),
          background,
          symmetryPairs: Array.from(symmetryPairs.entries())
        };
        setHistory([newInitialState]);
        setHistoryIndex(0);

        if (options.exitAfterSave) {
          isSavingRef.current = true;
          navigate('/badges');
        }
      } else {
        // Create new template
        const result = await createTemplate(payload).unwrap();
        toast.success('Succès', 'Template créé avec succès');
        setIsDirty(false);
        // Réinitialiser l'historique à l'état actuel après sauvegarde
        const newInitialState: HistoryState = {
          elements: JSON.parse(JSON.stringify(elements)),
          background,
          symmetryPairs: Array.from(symmetryPairs.entries())
        };
        setHistory([newInitialState]);
        setHistoryIndex(0);
        
        // Bypass blocker for redirection
        isSavingRef.current = true;
        
        if (options.exitAfterSave) {
          navigate('/badges');
        } else {
          // Navigate to edit mode with the new template ID
          navigate(`/badges/designer/${result.id}`);
        }
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Erreur', error?.data?.message || 'Erreur lors de la sauvegarde du template');
    }
  };

  // Update ref when saveTemplate changes
  saveTemplateRef.current = saveTemplate;

  // Delete template
  const handleDeleteTemplate = () => {
    if (!templateId || templateId === 'new') return;
    setShowDeleteModal(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateId) return;

    try {
      await deleteTemplate(templateId).unwrap();
      toast.success('Succès', 'Template supprimé avec succès');
      setShowDeleteModal(false);
      navigate('/badges');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error('Erreur', error?.data?.message || 'Erreur lors de la suppression du template');
    }
  };

  // Go back to list
  const handleGoBack = () => {
    if (isDirty) {
      setPendingNavigation('/badges');
      setShowUnsavedChangesModal(true);
    } else {
      navigate('/badges');
    }
  };

  // Modal handlers
  const handleStay = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowUnsavedChangesModal(false);
    setPendingNavigation(null);
  };

  const handleLeave = () => {
    isSavingRef.current = true; // Bypass blocker synchronously
    setIsDirty(false);
    setShowUnsavedChangesModal(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleSaveAndLeave = async () => {
    await saveTemplate();
    setShowUnsavedChangesModal(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  // Selection handlers
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    // Ignore middle mouse button (used for panning)
    if (e.button === 1) return;
    
    if (e.target === badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const badgeWidth = mmToPx(format.width);
      const badgeHeight = mmToPx(format.height);
      
      // Convert screen coordinates to badge coordinates
      const scaleX = badgeWidth / rect.width;
      const scaleY = badgeHeight / rect.height;
      const mouseXInBadge = (e.clientX - rect.left) * scaleX;
      const mouseYInBadge = (e.clientY - rect.top) * scaleY;
      
      setIsSelecting(true);
      setSelectionStart({ x: mouseXInBadge, y: mouseYInBadge });
      setSelectionEnd({ x: mouseXInBadge, y: mouseYInBadge });
      
      if (!e.shiftKey && !e.ctrlKey) {
        setSelectedElements([]);
      }
    }
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionStart) {
      const rect = badgeRef.current?.getBoundingClientRect();
      if (rect) {
        const badgeWidth = mmToPx(format.width);
        const badgeHeight = mmToPx(format.height);
        
        // Convert screen coordinates to badge coordinates
        const scaleX = badgeWidth / rect.width;
        const scaleY = badgeHeight / rect.height;
        const mouseXInBadge = (e.clientX - rect.left) * scaleX;
        const mouseYInBadge = (e.clientY - rect.top) * scaleY;
        
        setSelectionEnd({ x: mouseXInBadge, y: mouseYInBadge });
      }
    }
  };

  const handleBackgroundMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Calculate selection rectangle
      const selectionRect = {
        left: Math.min(selectionStart.x, selectionEnd.x),
        top: Math.min(selectionStart.y, selectionEnd.y),
        right: Math.max(selectionStart.x, selectionEnd.x),
        bottom: Math.max(selectionStart.y, selectionEnd.y)
      };

      // Find elements that intersect with selection rectangle
      const selectedIds = elements
        .filter(element => {
          const elementRect = {
            left: element.x,
            top: element.y,
            right: element.x + element.width,
            bottom: element.y + element.height
          };

          // Check for intersection
          return !(
            elementRect.right < selectionRect.left ||
            elementRect.left > selectionRect.right ||
            elementRect.bottom < selectionRect.top ||
            elementRect.top > selectionRect.bottom
          );
        })
        .map(element => element.id);

      // Update selection
      if (selectedIds.length > 0) {
        setSelectedElements(prev => {
          // If shift/ctrl, add to existing selection
          if (prev.length > 0 && selectionStart) {
            return [...new Set([...prev, ...selectedIds])];
          }
          return selectedIds;
        });
      }
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Element interaction handlers
  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Ignore middle mouse button (used for panning)
    if (e.button === 1) return;
    
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
    // Get the dragged element
    const draggedElement = elements.find(el => el.id === id);
    if (!draggedElement) return;

    // Calculate delta movement
    const deltaX = data.x - draggedElement.x;
    const deltaY = data.y - draggedElement.y;

    // Check if element actually moved (avoid saving history on simple click)
    const hasMoved = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;
    if (!hasMoved) return;

    // If multiple elements are selected, move them all together
    if (selectedElements.length > 1 && selectedElements.includes(id)) {
      // Batch update all selected elements
      const badgeWidth = mmToPx(format.width);
      const badgeHeight = mmToPx(format.height);
      const centerX = badgeWidth / 2;
      const centerY = badgeHeight / 2;
      
      // Calculate all symmetry updates first
      const symmetryUpdates = new Map<string, Partial<BadgeElement>>();
      
      selectedElements.forEach(elementId => {
        const element = elements.find(el => el.id === elementId);
        if (!element) return;
        
        const updatedElement = {
          ...element,
          x: element.x + deltaX,
          y: element.y + deltaY
        };
        
        // Check if this element is a parent in a symmetry pair
        const cloneId = symmetryPairs.get(elementId);
        if (cloneId) {
          const parentCenterX = updatedElement.x + updatedElement.width / 2;
          const parentCenterY = updatedElement.y + updatedElement.height / 2;
          
          const cloneCenterX = 2 * centerX - parentCenterX;
          const cloneCenterY = 2 * centerY - parentCenterY;
          
          const cloneX = cloneCenterX - updatedElement.width / 2;
          const cloneY = cloneCenterY - updatedElement.height / 2;
          
          symmetryUpdates.set(cloneId, {
            x: Math.round(cloneX),
            y: Math.round(cloneY),
            width: updatedElement.width,
            height: updatedElement.height,
            style: {
              ...updatedElement.style,
              rotation: (updatedElement.style.rotation || 0) + 180,
              transform: getTransformWithRotation((updatedElement.style.rotation || 0) + 180, updatedElement.style.transform)
            }
          });
        }
        
        // Check if this element is a clone in a symmetry pair
        for (const [parentId, cloneIdInPair] of symmetryPairs.entries()) {
          if (cloneIdInPair === elementId) {
            const cloneCenterX = updatedElement.x + updatedElement.width / 2;
            const cloneCenterY = updatedElement.y + updatedElement.height / 2;
            
            const parentCenterX = 2 * centerX - cloneCenterX;
            const parentCenterY = 2 * centerY - cloneCenterY;
            
            const parentX = parentCenterX - updatedElement.width / 2;
            const parentY = parentCenterY - updatedElement.height / 2;
            
            symmetryUpdates.set(parentId, {
              x: Math.round(parentX),
              y: Math.round(parentY),
              width: updatedElement.width,
              height: updatedElement.height,
              style: {
                ...updatedElement.style,
                rotation: (updatedElement.style.rotation || 0) - 180,
                transform: getTransformWithRotation((updatedElement.style.rotation || 0) - 180, updatedElement.style.transform)
              }
            });
            break;
          }
        }
      });
      
      // Apply all updates in one synchronous setElements call
      const newElements = elements.map(element => {
        if (selectedElements.includes(element.id)) {
          return {
            ...element,
            x: element.x + deltaX,
            y: element.y + deltaY
          };
        }
        if (symmetryUpdates.has(element.id)) {
          return { ...element, ...symmetryUpdates.get(element.id) };
        }
        return element;
      });
      
      setElements(newElements);
      saveToHistory(newElements, background);
    } else {
      // Single element drag
      updateElement(id, { x: data.x, y: data.y });
    }
  };

  const handleResize = (id: string, _e: any, data: { size: { width: number; height: number }; position?: { x: number; y: number } }, isResizing = true) => {
    const updates: Partial<BadgeElement> = {
      width: data.size.width,
      height: data.size.height
    };
    
    if (data.position) {
      updates.x = data.position.x;
      updates.y = data.position.y;
    }
    
    // Update element (skip history during resize, save at end)
    updateElement(id, updates, isResizing);
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
        onSaveTemplate={() => saveTemplate()}
        onSaveAndExit={() => saveTemplate({ exitAfterSave: true })}
        isSaving={isCreating || isUpdating}
        onGoBack={handleGoBack}
        onDeleteTemplate={handleDeleteTemplate}
        isDeleting={isDeleting}
        isEditMode={templateId !== 'new'}
        background={background}
        zoom={currentZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
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
        onSaveHistory={() => saveToHistory(elements, background)}
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
        onBatchUpdateElements={batchUpdateElements}
        onDeleteElement={deleteElement}
        onDeleteElements={deleteElements}
        onDuplicateElement={duplicateElement}
        onDuplicateElements={duplicateElements}
        symmetryPairs={symmetryPairs}
        onCreateSymmetry={createSymmetry}
        onBreakSymmetry={breakSymmetry}
        onSaveHistory={() => saveToHistory(elements, background)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        historyIndex={historyIndex}
        historyLength={history.length}
      />

      {/* Hidden background upload input */}
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* Modal de confirmation de navigation */}
      <Modal
        isOpen={showUnsavedChangesModal}
        onClose={handleStay}
        title="Modifications non enregistrées"
        maxWidth="lg"
        showCloseButton={false}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vous avez des modifications en attente. Si vous quittez cette page sans enregistrer, elles seront perdues.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleStay}
                className="order-3 sm:order-1"
              >
                Retour
              </Button>
              <Button
                variant="ghost"
                onClick={handleLeave}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 order-2 sm:order-2"
              >
                Quitter
              </Button>
              <Button
                onClick={handleSaveAndLeave}
                disabled={isCreating || isUpdating}
                className="order-1 sm:order-3"
              >
                {isCreating || isUpdating ? t('designer.saving') : t('designer.save')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('designer.delete_template')}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir supprimer ce template ? Cette action est irréversible.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteTemplate}
              disabled={isDeleting}
            >
              {isDeleting ? t('designer.deleting') : t('designer.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const BadgeDesignerPage = () => (
  <ProtectedPage
    action="read"
    subject="Badge"
    deniedTitle="Accès au designer de badges refusé"
    deniedMessage="Vous n'avez pas les permissions nécessaires pour accéder au designer de badges."
  >
    <BadgeDesignerPageContent />
  </ProtectedPage>
);