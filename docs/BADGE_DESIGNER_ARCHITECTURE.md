# Architecture du Badge Designer

## Vue d'ensemble

Le Badge Designer est un éditeur WYSIWYG (What You See Is What You Get) permettant de créer et personnaliser des badges pour les événements. Il supporte la multi-sélection, le drag & drop, le redimensionnement, l'alignement, et la symétrie centrale.

## Structure des composants

```
BadgeDesignerPage.tsx (Composant principal - State management)
├── LeftSidebar.tsx (Palette d'outils et formats)
├── BadgeEditor.tsx (Canvas d'édition)
│   └── DraggableElement (Élément draggable)
└── RightSidebar.tsx (Panneau de propriétés)
```

## BadgeDesignerPage.tsx - Orchestrateur principal

### Responsabilités
- **State management central** : Gère tous les états (éléments, sélection, historique, symétrie)
- **History management** : Système Undo/Redo avec stack d'historique
- **Keyboard shortcuts** : Gestion des raccourcis clavier (Delete, Ctrl+D, Ctrl+Z, etc.)
- **Coordination** : Fait le lien entre les 3 sidebars

### État principal

```typescript
// Éléments du badge
const [elements, setElements] = useState<BadgeElement[]>([]);

// Sélection (stocke les IDs des éléments sélectionnés)
const [selectedElements, setSelectedElements] = useState<string[]>([]);

// Historique pour Undo/Redo
const [history, setHistory] = useState<HistoryState[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

// Symétrie centrale (Map parent ID -> clone ID)
const [symmetryPairs, setSymmetryPairs] = useState<Map<string, string>>(new Map());

// Images uploadées (Map image ID -> data URL)
const [uploadedImages, setUploadedImages] = useState<Map<string, ImageData>>(new Map());
```

### Pattern de gestion des actions - Système Scalable

Le Badge Designer utilise un **système dual** pour gérer les actions sur les éléments :

#### 1. Fonctions singulières (un élément)
```typescript
// Exemple: deleteElement
const deleteElement = (id: string) => {
  const newElements = elements.filter(el => el.id !== id);
  setElements(newElements);
  setSelectedElements(prev => prev.filter(selectedId => selectedId !== id));
  saveToHistory(newElements, background);
};
```

#### 2. Fonctions bulk (plusieurs éléments)
```typescript
// Exemple: deleteElements - OPTIMISÉ avec Set
const deleteElements = (ids: string[]) => {
  const idsSet = new Set(ids);
  const newElements = elements.filter(el => !idsSet.has(el.id));
  setElements(newElements);
  setSelectedElements([]);
  saveToHistory(newElements, background);
};
```

**⚠️ IMPORTANT**: Les fonctions bulk filtrent **une seule fois** avec un `Set` pour des performances optimales et éviter les bugs de mutation pendant l'itération.

#### 3. Fonctions batch (mises à jour multiples)
```typescript
// Exemple: batchUpdateElements - Pour modifier plusieurs éléments
const batchUpdateElements = (updates: Array<{ id: string; updates: Partial<BadgeElement> }>) => {
  const updatesMap = new Map(updates.map(u => [u.id, u.updates]));
  const newElements = elements.map(el => {
    const elementUpdates = updatesMap.get(el.id);
    if (elementUpdates) {
      return mergeElementUpdates(el, elementUpdates);
    }
    return el;
  });
  setElements(newElements);
  saveToHistory(newElements, background);
};
```

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Delete` / `Backspace` | Supprimer les éléments sélectionnés |
| `Ctrl+D` / `Cmd+D` | Dupliquer les éléments sélectionnés |
| `Ctrl+Z` / `Cmd+Z` | Annuler (Undo) |
| `Ctrl+Y` / `Cmd+Y` | Refaire (Redo) |
| `Ctrl+A` / `Cmd+A` | Tout sélectionner |
| `Escape` | Désélectionner tout |
| `Arrow Keys` | Déplacer les éléments sélectionnés (1px ou 10px avec Shift) |

## BadgeEditor.tsx - Canvas d'édition

### Responsabilités
- **Rendu des éléments** : Affichage de tous les éléments du badge
- **Système de drag natif** : Gestion du drag & drop sans bibliothèque externe
- **Resize handles** : Poignées de redimensionnement (8 directions)
- **Snap guides** : Guides d'alignement magnétiques
- **Multi-sélection visuelle** : Rectangle de sélection
- **Zoom & Pan** : Intégration avec react-zoom-pan-pinch

### Architecture du drag & drop

Le système de drag utilise des **coordonnées relatives au badge** pour gérer correctement le zoom :

```typescript
// 1. MouseDown: Capture position initiale
const handleElementDragStart = (elementId: string, e: React.MouseEvent) => {
  const badgeRect = badgeRef.current?.getBoundingClientRect();
  const mouseXInBadge = e.clientX - badgeRect.left;
  const mouseYInBadge = e.clientY - badgeRect.top;
  
  setDragStart({
    x: mouseXInBadge,
    y: mouseYInBadge,
    elementX: element.x,
    elementY: element.y
  });
};

// 2. MouseMove: Calcule delta et applique snap
const handleMouseMove = (e: MouseEvent) => {
  const currentMouseXInBadge = e.clientX - badgeRect.left;
  const currentMouseYInBadge = e.clientY - badgeRect.top;
  
  // Conversion en coordonnées badge (compense le zoom)
  const scaleX = badgeWidth / badgeRect.width;
  const scaleY = badgeHeight / badgeRect.height;
  
  const deltaX = (currentMouseXInBadge - dragStart.x) * scaleX;
  const deltaY = (currentMouseYInBadge - dragStart.y) * scaleY;
  
  let newX = dragStart.elementX + deltaX;
  let newY = dragStart.elementY + deltaY;
  
  // Apply snap (sauf si Shift pressé)
  if (!shiftPressed) {
    const snapped = calculateSnap(newX, newY, width, height, elementId);
    newX = snapped.x;
    newY = snapped.y;
  }
};
```

### Système de Snap Guides

Le snap guide aligne automatiquement les éléments avec :
- **Bords du badge** : left, center, right, top, middle, bottom
- **Autres éléments** : alignement des bords et centres
- **Adjacent** : coller bord-à-bord

```typescript
const SNAP_THRESHOLD = 20; // pixels - distance d'attraction

const calculateSnap = (x, y, width, height, elementId) => {
  // Vérifier proximité avec bords du badge
  if (Math.abs(elementLeft - badgeGuides.left) < SNAP_THRESHOLD) {
    snappedX = badgeGuides.left;
    guides.push({ x: badgeGuides.left });
  }
  
  // Vérifier proximité avec autres éléments
  elements.forEach(otherElement => {
    // Skip si même groupe de sélection
    if (selectedElements.includes(otherElement.id)) return;
    
    // Vérifier alignement des bords, centres, et adjacent
    // ...
  });
};
```

### Multi-sélection pendant le drag

Quand on drag un élément d'un groupe sélectionné, **tous les éléments sélectionnés** bougent ensemble :

```typescript
const effectiveDragOffset = (draggingElementId === element.id || isPartOfDragGroup) 
  ? currentDragOffset 
  : undefined;
```

### Resize Handles

8 poignées de redimensionnement adaptatives au zoom :

```typescript
const handleSize = 8 / zoom; // Taille constante à l'écran
const handleOffset = handleSize / 2;

// Positions: 'nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'
```

**Maintien du ratio** : Si `Shift` pressé ou `element.maintainAspectRatio === true`

## RightSidebar.tsx - Panneau de propriétés

### Responsabilités
- **Affichage des propriétés** : Selon le type et nombre d'éléments sélectionnés
- **Modification en temps réel** : Inputs contrôlés avec debounce pour le texte
- **Actions bulk** : Supprimer, dupliquer, aligner plusieurs éléments
- **Gestion de la symétrie** : Créer/briser les paires symétriques

### Helper executeAction - Pattern Scalable

Pour éviter de dupliquer la logique "si un élément vs plusieurs éléments", on utilise un helper :

```typescript
const executeAction = (
  singleFn: (id: string) => void,
  multipleFn: (ids: string[]) => void
) => {
  if (multipleSelected) {
    multipleFn(selectedElements.map(el => el.id));
  } else if (selectedElement) {
    singleFn(selectedElement.id);
  }
};

// Utilisation simple
<Button onClick={() => executeAction(onDuplicateElement, onDuplicateElements)}>
  Dupliquer
</Button>
```

**Avantages** :
- ✅ Code DRY (Don't Repeat Yourself)
- ✅ Évite les bugs de forEach
- ✅ Facile à maintenir et étendre

### Alignement des éléments

#### Alignement de distribution (entre éléments)
Aligne les éléments sélectionnés les uns par rapport aux autres :

```typescript
const handleAlignLeft = () => {
  const leftmost = Math.min(...selectedElements.map(el => el.x));
  onBatchUpdateElements(selectedElements.map(el => ({
    id: el.id,
    updates: { x: leftmost }
  })));
};
```

**6 types** : Left, Right, Top, Bottom, CenterHorizontal, CenterVertical

#### Alignement de texte
Pour les éléments texte uniquement :

**Horizontal** (textAlign) :
- `left`, `center`, `right`

**Vertical** (alignItems) :
- `flex-start` (haut), `center` (milieu), `flex-end` (bas)

### Active State des boutons

Les boutons d'alignement montrent l'état actif avec une tolérance de 1px :

```typescript
const isAlignmentActive = (property: string, value: any) => {
  const tolerance = 1;
  return selectedElements.every(el => {
    const currentValue = property.includes('.') 
      ? el.style[property.split('.')[1]]
      : el[property];
    return Math.abs(currentValue - value) <= tolerance;
  });
};

// Style actif
className={isAlignmentActive('x', leftmost) 
  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500' 
  : ''}
```

### Gestion des styles (handleStyleUpdate)

Utilise le pattern dual pour gérer un ou plusieurs éléments :

```typescript
const handleStyleUpdate = (property: string, value: any) => {
  if (selectedElements.length === 1) {
    // Single: mise à jour directe
    onUpdateElement(element.id, {
      style: { [property]: value }
    });
  } else {
    // Multiple: batch update
    const batchUpdates = selectedElements.map(element => ({
      id: element.id,
      updates: {
        style: { [property]: value }
      }
    }));
    onBatchUpdateElements(batchUpdates);
  }
};
```

## Système de Symétrie Centrale

### Concept
La symétrie centrale (rotation à 180° autour du centre du badge) crée un clone d'un élément :

```
Parent          Center          Clone
   ●  ------------|------------- ●
                  |
        (rotation 180°)
```

### Structure de données

```typescript
// Map qui stocke la relation parent -> clone
const symmetryPairs = new Map<string, string>();

// Exemple:
symmetryPairs.set('element-123', 'clone-456');
```

### Création de symétrie

```typescript
const createSymmetry = () => {
  const centerX = badgeWidth / 2;
  const centerY = badgeHeight / 2;
  
  selectedElements.forEach(parentId => {
    const parentElement = elements.find(el => el.id === parentId);
    
    // Calculer position symétrique
    const parentCenterX = parentElement.x + parentElement.width / 2;
    const parentCenterY = parentElement.y + parentElement.height / 2;
    
    const cloneCenterX = 2 * centerX - parentCenterX;
    const cloneCenterY = 2 * centerY - parentCenterY;
    
    // Créer clone avec rotation 180°
    const cloneElement = {
      ...parentElement,
      id: `clone-${Date.now()}-${Math.random()}`,
      x: cloneCenterX - parentElement.width / 2,
      y: cloneCenterY - parentElement.height / 2,
      style: {
        ...parentElement.style,
        rotation: (parentElement.style.rotation || 0) + 180,
        transform: getTransformWithRotation(rotation + 180, transform)
      }
    };
    
    newSymmetryPairs.set(parentId, cloneElement.id);
  });
};
```

### Mise à jour automatique

Quand un élément parent bouge, son clone est mis à jour **de manière synchrone** pour éviter les bugs avec l'historique :

```typescript
const updateElement = (id: string, updates: Partial<BadgeElement>, skipHistory = false) => {
  // Vérifier si cet élément est dans une paire symétrique
  const isParent = symmetryPairs.has(id);
  const cloneId = isParent ? symmetryPairs.get(id) : null;
  
  // Si c'est un parent, calculer les updates du clone de manière synchrone
  const cloneUpdates = cloneId ? calculateSymmetricClone(id, updates) : null;
  
  // Appliquer toutes les mises à jour dans un seul setElements
  const newElements = elements.map(el => {
    if (el.id === id) {
      return mergeElementUpdates(el, updates);
    }
    if (cloneId && el.id === cloneId && cloneUpdates) {
      return mergeElementUpdates(el, cloneUpdates);
    }
    return el;
  });
  
  setElements(newElements);
  
  if (!skipHistory) {
    saveToHistory(newElements, background);
  }
};

const calculateSymmetricClone = (parentId: string, updates: Partial<BadgeElement>) => {
  const parent = elements.find(el => el.id === parentId);
  if (!parent) return null;
  
  const centerX = badgeWidth / 2;
  const centerY = badgeHeight / 2;
  
  // Appliquer les updates au parent
  const updatedParent = { ...parent, ...updates };
  
  // Calculer position symétrique
  const parentCenterX = updatedParent.x + updatedParent.width / 2;
  const parentCenterY = updatedParent.y + updatedParent.height / 2;
  
  const cloneCenterX = 2 * centerX - parentCenterX;
  const cloneCenterY = 2 * centerY - parentCenterY;
  
  return {
    x: cloneCenterX - updatedParent.width / 2,
    y: cloneCenterY - updatedParent.height / 2,
    width: updatedParent.width,
    height: updatedParent.height,
    style: {
      ...updatedParent.style,
      rotation: (updatedParent.style.rotation || 0) + 180,
      transform: getTransformWithRotation(
        (updatedParent.style.rotation || 0) + 180,
        updatedParent.style.transform
      )
    }
  };
};
```

**Important** : Tous les calculs sont faits **avant** `setElements` pour garantir la cohérence avec l'historique Undo/Redo.

### Suppression en cascade

Quand on supprime un élément d'une paire symétrique, **les deux éléments** sont supprimés :

```typescript
const deleteElement = (id: string) => {
  const idsToDelete = new Set([id]);
  
  // Si c'est un parent, ajouter le clone
  if (symmetryPairs.has(id)) {
    idsToDelete.add(symmetryPairs.get(id)!);
  }
  
  // Si c'est un clone, trouver et ajouter le parent
  for (const [parentId, cloneId] of symmetryPairs.entries()) {
    if (cloneId === id) {
      idsToDelete.add(parentId);
      break;
    }
  }
  
  // Supprimer les éléments et nettoyer symmetryPairs
  const newElements = elements.filter(el => !idsToDelete.has(el.id));
  const newSymmetryPairs = new Map(symmetryPairs);
  idsToDelete.forEach(idToDelete => {
    newSymmetryPairs.delete(idToDelete);
    // Nettoyer si c'était un clone
    for (const [parentId, cloneId] of newSymmetryPairs.entries()) {
      if (cloneId === idToDelete) {
        newSymmetryPairs.delete(parentId);
      }
    }
  });
  
  setElements(newElements);
  setSymmetryPairs(newSymmetryPairs);
  setSelectedElements(prev => prev.filter(selectedId => !idsToDelete.has(selectedId)));
  saveToHistory(newElements, background, newSymmetryPairs);
};
```

**Avantages** :
- ✅ Pas d'éléments orphelins
- ✅ Comportement intuitif
- ✅ symmetryPairs toujours cohérent

### Preview pendant le drag

Un ghost element violet montre la position future du clone pendant le drag :

```typescript
const getSymmetricClone = () => {
  if (!activeDragElement) return null;
  const cloneId = symmetryPairs.get(activeDragElement.id);
  if (!cloneId) return null;
  
  // Calculer position avec dragOffset
  const parentX = activeDragElement.x + dragOffset.x;
  const parentY = activeDragElement.y + dragOffset.y;
  
  // ... calcul symétrique ...
  
  return cloneElement; // Rendu avec ring-purple-500
};
```

## Types de données

### BadgeElement

```typescript
interface BadgeElement {
  id: string;
  type: 'text' | 'qrcode' | 'image';
  x: number;           // Position X (px)
  y: number;           // Position Y (px)
  width: number;       // Largeur (px)
  height: number;      // Hauteur (px)
  content?: string;    // Contenu texte
  imageId?: string;    // ID de l'image uploadée
  
  style: {
    // Texte
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    textAlign?: 'left' | 'center' | 'right';
    alignItems?: 'flex-start' | 'center' | 'flex-end';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    color?: string;
    
    // Transformation
    rotation?: number;
    transform?: string;
    
    // Général
    opacity?: number;
  };
  
  // Contraintes
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
}
```

### BadgeFormat

```typescript
interface BadgeFormat {
  id: string;
  name: string;
  width: number;   // mm
  height: number;  // mm
  category: string;
}
```

## Conversion mm ↔ px

Le badge utilise des millimètres (format physique) mais le rendu utilise des pixels :

```typescript
const DPI = 96; // Standard web
const MM_TO_INCH = 0.0393701;

export const mmToPx = (mm: number): number => {
  return Math.round(mm * MM_TO_INCH * DPI);
};

export const pxToMm = (px: number): number => {
  return px / (MM_TO_INCH * DPI);
};
```

**Exemple** : Badge 85mm × 55mm → 323px × 209px à 96 DPI

## Historique (Undo/Redo)

### Structure

```typescript
interface HistoryState {
  elements: BadgeElement[];
  background: string | null;
  symmetryPairs: [string, string][]; // Paires parent->clone sérialisées
}

const MAX_HISTORY = 99; // Capacité maximale de l'historique
const [history, setHistory] = useState<HistoryState[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);
```

### Sauvegarde

Chaque action importante sauvegarde l'état, incluant les paires de symétrie :

```typescript
const saveToHistory = (
  elements: BadgeElement[], 
  background: string | null,
  newSymmetryPairs?: Map<string, string>
) => {
  const pairsToSave = newSymmetryPairs !== undefined ? newSymmetryPairs : symmetryPairs;
  
  const newState: HistoryState = {
    elements: JSON.parse(JSON.stringify(elements)), // Deep clone
    background,
    symmetryPairs: Array.from(pairsToSave.entries()) // Map -> Array
  };
  
  setHistory(prev => {
    // Supprimer les états "redo" si on fait une nouvelle action
    const newHistory = prev.slice(0, historyIndex + 1);
    newHistory.push(newState);
    // Limiter à MAX_HISTORY états (99)
    return newHistory.slice(-MAX_HISTORY);
  });
  
  setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
};
```

### Navigation

```typescript
const undo = () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    
    // Restaurer l'état complet
    setElements(JSON.parse(JSON.stringify(state.elements)));
    setBackground(state.background);
    setSymmetryPairs(new Map(state.symmetryPairs || [])); // Array -> Map
    setHistoryIndex(newIndex);
    
    // Filtrer la sélection (garder uniquement les IDs qui existent encore)
    setSelectedElements(prev => 
      prev.filter(id => state.elements.some(el => el.id === id))
    );
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    
    // Restaurer l'état complet
    setElements(JSON.parse(JSON.stringify(state.elements)));
    setBackground(state.background);
    setSymmetryPairs(new Map(state.symmetryPairs || [])); // Array -> Map
    setHistoryIndex(newIndex);
    
    // Filtrer la sélection
    setSelectedElements(prev => 
      prev.filter(id => state.elements.some(el => el.id === id))
    );
  }
};
```

### Optimisation : skipHistory pour les interactions continues

Pour éviter de créer une entrée d'historique à chaque micro-changement (ex: slider, color picker), on utilise le flag `skipHistory` :

```typescript
const updateElement = (
  id: string, 
  updates: Partial<BadgeElement>,
  skipHistory = false
) => {
  // Appliquer les mises à jour
  const newElements = elements.map(el => 
    el.id === id ? { ...el, ...updates } : el
  );
  setElements(newElements);
  
  // Sauvegarder seulement si pas en mode skipHistory
  if (!skipHistory) {
    saveToHistory(newElements, background);
  }
};
```

**Usage** :
- Pendant le drag d'un slider : `skipHistory=true` (update visuel seulement)
- Sur `onMouseUp` du slider : `onSaveHistory()` (sauvegarde une seule entrée)
- Pendant la saisie texte : `skipHistory=true` (update visuel)
- Sur `onBlur` du textarea : `onSaveHistory()` (sauvegarde une seule entrée)

Résultat : **Une seule entrée d'historique** par action complète, pas 50 micro-changements !

## Protection contre la perte de données

### useBlocker - Navigation interne

Protection contre la navigation vers d'autres pages de l'application :

```typescript
import { useBlocker } from 'react-router-dom';

// Détection des changements non sauvegardés
const isDirty = history.length > 1; // Plus d'une entrée = modifications

// Bloquer la navigation si des changements existent
const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    isDirty && (
      currentLocation.pathname !== nextLocation.pathname || 
      currentLocation.search !== nextLocation.search
    )
);

// Afficher le modal quand bloqué
useEffect(() => {
  if (blocker.state === 'blocked') {
    setShowUnsavedChangesModal(true);
  }
}, [blocker]);

// Actions du modal
const handleStay = () => blocker.reset(); // Annuler la navigation
const handleLeave = () => {
  setIsDirty(false);
  blocker.proceed(); // Continuer la navigation
};
const handleSaveAndLeave = async () => {
  await saveTemplate();
  blocker.proceed(); // Sauvegarder puis naviguer
};
```

### beforeunload - Fermeture navigateur

Protection contre la fermeture de l'onglet ou du navigateur :

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = ''; // Déclenche le message natif du navigateur
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### Détection des changements

Au lieu de comparer des snapshots JSON (coûteux et complexe), on utilise la **longueur de l'historique** :

```typescript
// Détection simple et fiable
useEffect(() => {
  setIsDirty(history.length > 1); // 1 = état initial, >1 = modifications
}, [history.length]);
```

**Avantages** :
- ✅ Simple et fiable
- ✅ Pas de comparaison JSON coûteuse
- ✅ Cohérent avec le système d'historique
- ✅ Se reset automatiquement après sauvegarde (historique -> 1 entrée)

### Reset après sauvegarde

Après une sauvegarde réussie, l'historique est réinitialisé pour considérer l'état actuel comme "propre" :

```typescript
const saveTemplate = async () => {
  // ... sauvegarde API ...
  
  // Réinitialiser l'historique à l'état actuel
  const newInitialState: HistoryState = {
    elements: JSON.parse(JSON.stringify(elements)),
    background,
    symmetryPairs: Array.from(symmetryPairs.entries())
  };
  setHistory([newInitialState]);
  setHistoryIndex(0);
  setIsDirty(false); // Plus de changements non sauvegardés
};
```

### Modal de confirmation

Modal élégant avec 3 options (même style que EventSettingsTab) :

```tsx
{showUnsavedChangesModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
          <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Modifications non enregistrées
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Vous avez des modifications en attente. Si vous quittez cette page sans enregistrer, 
            elles seront perdues.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={handleStay}>Retour</Button>
            <Button variant="ghost" onClick={handleLeave} className="text-red-600">
              Quitter sans sauvegarder
            </Button>
            <Button onClick={handleSaveAndLeave}>Sauvegarder</Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

## Optimisations de performance

### 1. skipHistory sur les interactions continues

Au lieu de debouncing, on utilise `skipHistory` + événements de fin (onBlur, onMouseUp) :

```typescript
// ❌ ANCIEN : Debouncing avec setTimeout
const debouncedUpdate = useCallback(
  debounce((id: string, content: string) => {
    onUpdateElement(id, { content });
  }, 300),
  []
);

// ✅ NOUVEAU : skipHistory + onBlur
<textarea
  value={content}
  onChange={(e) => handleContentUpdate(e.target.value, true)} // skipHistory=true
  onBlur={() => onSaveHistory?.()} // Sauvegarde au focus out
/>

// Color picker
<input
  type="color"
  onChange={(e) => handleStyleUpdate('color', e.target.value, true)} // skipHistory=true
  onBlur={() => onSaveHistory?.()} // Sauvegarde au blur
/>

// Slider
<input
  type="range"
  onChange={(e) => handleStyleUpdate('fontSize', e.target.value, true)} // skipHistory=true
  onMouseUp={() => onSaveHistory?.()} // Sauvegarde au mouseup
/>
```

**Avantages** :
- ✅ Pas de délai perçu par l'utilisateur
- ✅ Feedback visuel immédiat
- ✅ Une seule entrée d'historique par action complète
- ✅ Pattern cohérent pour tous les contrôles

### 2. Set pour les opérations bulk

```typescript
// ❌ MAUVAIS - O(n²)
selectedElements.forEach(id => onDeleteElement(id));

// ✅ BON - O(n)
const idsSet = new Set(selectedElements);
const newElements = elements.filter(el => !idsSet.has(el.id));
```

### 3. Refs pour les éléments

```typescript
const elementRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
```

Évite les re-renders inutiles lors du drag.

### 4. willChange et transform pour le GPU

```typescript
style={{
  willChange: draggingElementId === element.id ? 'transform' : 'auto',
  transform: 'translateZ(0)' // Force GPU acceleration
}}
```

## Flux de données

```
User Action (click, drag, input)
         ↓
   BadgeEditor / RightSidebar
         ↓
   Callback Props (onUpdateElement, onDragStop, etc.)
         ↓
   BadgeDesignerPage
         ↓
   State Update (setElements, setSelectedElements)
         ↓
   Save to History
         ↓
   Re-render Components
```

## Bonnes pratiques

### ✅ À faire

1. **Toujours utiliser les fonctions bulk pour la multi-sélection**
   ```typescript
   executeAction(onDuplicateElement, onDuplicateElements)
   ```

2. **Filtrer avec Set pour les suppressions multiples**
   ```typescript
   const idsSet = new Set(ids);
   const filtered = elements.filter(el => !idsSet.has(el.id));
   ```

3. **Sauvegarder l'historique après chaque modification**
   ```typescript
   saveToHistory(newElements, background);
   ```

4. **Utiliser les coordonnées relatives au badge pour le drag**
   ```typescript
   const mouseXInBadge = e.clientX - badgeRect.left;
   ```

### ❌ À éviter

1. **Ne JAMAIS utiliser forEach avec mutation de state**
   ```typescript
   // ❌ MAUVAIS
   selectedElements.forEach(id => onDeleteElement(id));
   
   // ✅ BON
   onDeleteElements(selectedElements.map(el => el.id));
   ```

2. **Ne pas oublier la conversion zoom pour le drag**
   ```typescript
   // ❌ MAUVAIS
   const deltaX = currentMouseX - dragStart.x;
   
   // ✅ BON
   const scaleX = badgeWidth / badgeRect.width;
   const deltaX = (currentMouseX - dragStart.x) * scaleX;
   ```

3. **Ne pas modifier directement les éléments**
   ```typescript
   // ❌ MAUVAIS
   element.x = newX;
   
   // ✅ BON
   updateElement(element.id, { x: newX });
   ```

## Résumé des patterns clés

| Pattern | Usage | Avantage |
|---------|-------|----------|
| **Dual functions** | `deleteElement` + `deleteElements` | Gestion propre single/multi |
| **executeAction helper** | Abstraction single/multi dans UI | Code DRY, moins de bugs |
| **Set-based filtering** | Suppression/filtrage bulk | Performance O(n) |
| **Batch updates** | `batchUpdateElements` | Une seule mise à jour state |
| **Relative coordinates** | Drag & drop avec zoom | Précision indépendante du zoom |
| **Snap guides** | Alignement automatique | UX professionnelle |
| **History stack** | Undo/Redo | Récupération d'erreurs |
| **Symmetry pairs** | Map parent→clone | Symétrie centrale automatique |

## Extension future

Pour ajouter une nouvelle fonctionnalité :

1. **Créer les fonctions dans BadgeDesignerPage**
   ```typescript
   const newAction = (id: string) => { /* ... */ };
   const newActions = (ids: string[]) => { /* ... */ };
   ```

2. **Passer en props au RightSidebar**
   ```typescript
   onNewAction={newAction}
   onNewActions={newActions}
   ```

3. **Utiliser executeAction dans le bouton**
   ```typescript
   <Button onClick={() => executeAction(onNewAction, onNewActions)}>
     Nouvelle Action
   </Button>
   ```

Le système est **scalable** et **maintenable** ! 🎉
