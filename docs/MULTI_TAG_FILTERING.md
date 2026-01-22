# Multi-Tag Filtering Implementation

## Vue d'ensemble

Cette documentation décrit l'implémentation du filtrage multi-tags sur la page Events. Les utilisateurs peuvent maintenant sélectionner plusieurs tags simultanément pour filtrer les événements.

## Changements apportés

### 1. Nouveau composant `TagMultiSelect`

**Fichier:** `src/features/tags/ui/TagMultiSelect.tsx`

Un composant de sélection multiple de tags avec les fonctionnalités suivantes :
- **Sélection multiple** : Permet de sélectionner plusieurs tags à la fois
- **Interface à base de chips** : Affiche les tags sélectionnés sous forme de badges cliquables
- **Autocomplétion** : Suggestions en temps réel pendant la frappe
- **Navigation au clavier** : Support complet des touches fléchées, Enter, Escape, Backspace
- **Filtrage intelligent** : Masque automatiquement les tags déjà sélectionnés des suggestions
- **Effacement rapide** : Bouton pour supprimer tous les tags en un clic
- **Suppression individuelle** : Clic sur le X de chaque chip ou Backspace sur input vide

#### Props
```typescript
interface TagMultiSelectProps {
  value: string[]           // Tags sélectionnés
  onChange: (tagNames: string[]) => void  // Callback lors du changement
  placeholder?: string      // Texte du placeholder
}
```

### 2. Wrapper `FilterTagMulti`

**Fichier:** `src/shared/ui/FilterBar/FilterTagMulti.tsx`

Un wrapper simple pour intégrer `TagMultiSelect` dans le système `FilterBar`.

### 3. Mise à jour de la page Events

**Fichier:** `src/pages/Events/index.tsx`

Changements principaux :

#### État
```typescript
// Avant
const [tagFilter, setTagFilter] = useState<string>('')

// Après
const [tagFilters, setTagFilters] = useState<string[]>([])
```

#### Logique de filtrage
```typescript
// Logique AND : l'événement doit avoir TOUS les tags sélectionnés
if (tagFilters.length > 0) {
  const eventTags = event.tags && Array.isArray(event.tags) ? event.tags : []
  const hasAllTags = tagFilters.every(selectedTag => eventTags.includes(selectedTag))
  if (!hasAllTags) {
    return false
  }
}
```

#### Composant
```tsx
// Avant
<FilterTag
  value={tagFilter}
  onChange={setTagFilter}
  placeholder="Filtrer par tag..."
/>

// Après
<FilterTagMulti
  value={tagFilters}
  onChange={setTagFilters}
  placeholder="Filtrer par tags..."
/>
```

## Logique de filtrage

### Logique AND (implémentée)

L'événement doit avoir **TOUS** les tags sélectionnés pour être affiché.

**Exemple :**
- Tags sélectionnés : `["Conference", "Tech"]`
- Événement A avec tags `["Conference", "Tech", "AI"]` → ✅ Affiché
- Événement B avec tags `["Conference"]` → ❌ Masqué
- Événement C avec tags `["Tech"]` → ❌ Masqué

**Avantages :**
- Plus précis et restrictif
- Utile pour trouver des événements très spécifiques
- Comportement attendu dans la plupart des interfaces de filtrage

### Logique OR (alternative)

Si vous préférez une logique OR (l'événement doit avoir **AU MOINS UN** des tags sélectionnés), remplacez dans `src/pages/Events/index.tsx` :

```typescript
// Remplacer
const hasAllTags = tagFilters.every(selectedTag => eventTags.includes(selectedTag))
if (!hasAllTags) {
  return false
}

// Par
const hasAnyTag = tagFilters.some(selectedTag => eventTags.includes(selectedTag))
if (!hasAnyTag) {
  return false
}
```

## Fonctionnalités utilisateur

### Ajouter un tag
1. Cliquer dans le champ de filtrage
2. Taper pour filtrer les suggestions
3. Cliquer sur un tag OU utiliser les flèches + Enter
4. Le tag s'affiche comme un chip bleu

### Retirer un tag
- **Option 1** : Cliquer sur le X du chip
- **Option 2** : Vider le champ de saisie et appuyer sur Backspace

### Effacer tous les tags
- Cliquer sur le bouton X à droite du champ
- OU utiliser le bouton "Réinitialiser les filtres" de la FilterBar

### Navigation au clavier
- **↓** : Suggestion suivante
- **↑** : Suggestion précédente
- **Enter** : Sélectionner la suggestion active
- **Escape** : Fermer les suggestions
- **Backspace** (sur input vide) : Supprimer le dernier tag

## Tests recommandés

1. **Sélection multiple**
   - Sélectionner 2-3 tags
   - Vérifier que seuls les événements avec TOUS les tags sont affichés

2. **Suppression de tags**
   - Supprimer un tag via le X du chip
   - Vérifier que la liste d'événements se met à jour

3. **Navigation clavier**
   - Utiliser les flèches pour naviguer dans les suggestions
   - Appuyer sur Enter pour sélectionner
   - Appuyer sur Escape pour fermer

4. **Réinitialisation**
   - Cliquer sur "Réinitialiser les filtres"
   - Vérifier que tous les tags sont retirés

5. **Combinaison avec autres filtres**
   - Appliquer des tags + filtre de statut
   - Vérifier que les deux filtres sont appliqués

6. **Performance**
   - Sélectionner/désélectionner rapidement plusieurs tags
   - Vérifier que l'interface reste réactive

## Notes techniques

### Gestion des suggestions
- Les tags déjà sélectionnés sont automatiquement filtrés des suggestions
- Les suggestions se chargent de manière asynchrone via l'API
- Debounce de 300ms pour éviter trop de requêtes

### Accessibilité
- Navigation complète au clavier
- Focus visible sur les éléments interactifs
- Aria labels sur les boutons de suppression (à améliorer si nécessaire)

### Dark mode
- Support complet du dark mode
- Couleurs adaptées pour une bonne lisibilité

## Fichiers modifiés

1. ✅ `src/features/tags/ui/TagMultiSelect.tsx` (créé)
2. ✅ `src/features/tags/ui/index.ts` (export ajouté)
3. ✅ `src/shared/ui/FilterBar/FilterTagMulti.tsx` (créé)
4. ✅ `src/shared/ui/FilterBar/index.ts` (export ajouté)
5. ✅ `src/shared/ui/index.ts` (export ajouté)
6. ✅ `src/pages/Events/index.tsx` (mise à jour)

## Extensions futures possibles

1. **Choix AND/OR**
   - Ajouter un toggle pour basculer entre logique AND et OR
   - Afficher visuellement la logique active

2. **Tags populaires**
   - Afficher les tags les plus utilisés en premier
   - Ajouter des suggestions "rapides"

3. **Groupes de tags**
   - Organiser les tags par catégories
   - Permettre la sélection d'un groupe entier

4. **Sauvegarde des filtres**
   - Permettre de sauvegarder des combinaisons de filtres
   - Créer des "vues" personnalisées

5. **URL state**
   - Synchroniser les tags sélectionnés avec l'URL
   - Permettre le partage de liens avec filtres
