# Inventaire des Tableaux (DataTable)

Ce document liste tous les tableaux du projet utilisant le composant `DataTable`.

## ✅ TOUS LES TABLEAUX SUIVENT LE PATTERN STANDARD

**Pattern appliqué** : Les onglets sont gérés au niveau de la PAGE, pas dans le composant table.
Voir `docs/TABLE_PATTERN.md` pour la documentation complète du pattern.

## 🎨 Structure Standard Commune à TOUS les Tableaux

### Layout et Scroll
- **Hauteur maximale** : `max-h-[calc(100vh-450px)]` sur la zone scrollable
- **Headers sticky** : `sticky top-0 z-10` sur `<thead>`
- **Scroll vertical** : Uniquement sur les données (tbody), les headers restent visibles
- **Scroll horizontal** : `overflow-x-auto` si nécessaire

### Sélection et Bulk Actions
- **Colonne de sélection** : Toujours présente, pinnée à gauche (`enableHiding: false`)
- **Sélection multiple** : Shift+Click pour sélectionner une plage
- **Bulk actions** : Zone bleue qui apparaît au-dessus du tableau quand des éléments sont sélectionnés
- **Réinitialisation** : La sélection est automatiquement réinitialisée lors du changement d'onglet (via `key` prop)

### Alignement des Onglets et Boutons
- **Onglets** : Alignés horizontalement avec les boutons Réinitialiser et Colonnes
- **Structure** : `<div className="flex items-center justify-between">` dans le toolbar DataTable
- **Position** : Onglets à gauche, boutons à droite

### Key Prop pour Reset de Sélection
Tous les tableaux avec onglets utilisent une `key` prop unique qui change avec l'onglet actif:
```tsx
<DataTable
  key={activeTab} // ou key={isDeletedTab ? 'deleted' : 'active'}
  // ... autres props
/>
```
Cela force un remount du composant et réinitialise automatiquement la sélection.

## Type 1 : Tableaux AVEC onglets (Tabs)

### 1. UsersPage - Tableau des utilisateurs
- **Fichier** : `src/pages/Users/index.tsx`
- **Onglets** : "Utilisateurs actifs" / "Utilisateurs supprimés"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper dans page : `<Card variant="default" padding="none">`
  - DataTable : `key={activeTab}` + `tabsElement={<Tabs ... />}` (créé dans la page)
  - Queries : `activeUsersStats` + `deletedUsersStats` (pageSize: 1)
- **Colonnes** : Utilisateur (avatar + email), Rôle (avec TableSelector), Statut (badges), Date création, Actions
- **Colonnes d'actions** : Edit, Delete/Restore
- **Sélection** : ✅ Oui (avec colonne select)
- **Bulk Actions** : ✅ Désactiver (onglet actifs)
- **Scroll** : ✅ Headers sticky, données scrollables
- **État** : ✅ Conforme et standardisé

### 2. AttendeeTable - Tableau des participants
- **Fichier** : `src/features/attendees/ui/AttendeeTable.tsx` + `src/pages/Attendees/index.tsx`
- **Onglets** : "Participants actifs" / "Participants supprimés"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper dans page : `<Card variant="default" padding="none">`
  - DataTable : `key={isDeletedTab ? 'deleted' : 'active'}` + `tabsElement={tabsElement}` (reçu en prop)
  - Queries : `activeStatsResponse` + `deletedStatsResponse` (pageSize: 1)
- **Colonnes** : Participant (nom complet), Contact (email/téléphone), Entreprise, Check-ins, Date inscription, Actions
- **Colonnes d'actions** : Edit, Delete (onglet actifs) / Restore, Permanent Delete (onglet supprimés) - utilise ActionButtons
- **Sélection** : ✅ Oui (avec colonne select)
- **Bulk Actions** : ✅ Exporter, Supprimer (onglet actifs)
- **Scroll** : ✅ Headers sticky, données scrollables par événement
- **Fichier** : `src/features/registrations/ui/RegistrationsTable.tsx` + `src/pages/EventDetails/index.tsx`
- **Onglets** : "Actives" / "Supprimées"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper interne au composant : `<Card variant="default" padding="none">`
  - DataTable : `key={isDeletedTab ? 'deleted' : 'active'}` + `tabsElement={tabsElement}` (reçu en prop)
  - Queries : `activeRegistrationsStats` + `deletedRegistrationsStats` (limit: 1)
- **Colonnes** : Participant, Contact, Type (avec TableSelector), Statut (avec TableSelector), Check-in, Check-out, Date inscription, QR Code, Actions
- **Colonnes d'actions** : Approve, Refuse, Edit, Delete (4 boutons avec ActionButtons + children) / Restore, Permanent Delete (onglet supprimées)
- **Sélection** : ✅ Oui (avec colonne select)
- **Bulk Actions** : ✅ Exporter, Changer le statut, Changer le type, Check-in, Annuler Check-in, Check-out, Annuler Check-out, Supprimer (onglet actifs)
- **Scroll** : ✅ Headers sticky, données scrollables
- **État** : ✅ Conforme et standardisé`deletedRegistrationsStats` (limit: 1)
- **Colonnes d'actions** : Approve, Refuse, Edit, Delete (4 boutons avec ActionButtons + children) / Restore, Permanent Delete (onglet supprimées)
- # 4. AttendeeTypesPage - Tableau des types de participants
- **Fichier** : `src/pages/AttendeeTypes/index.tsx`
- **Onglets** : "Types actifs" / "Types désactivés"
- **Pattern** : ✅ Onglets gérés dans la page
- **Structure** :
  - Wrapper dans page : `<Card variant="default" padding="none">`
  - DataTable : `key={activeTab}` + `tabsElement={<Tabs ... />}` (créé dans la page)
  - Data filtrée côté client : `attendeeTypes.filter((t) => activeTab === 'active' ? t.is_active : !t.is_active)`
- **Colonnes** : Type (badge coloré), Couleur de fond (color picker), Couleur du texte (color picker), Code, Statut, Actions
- **Colonnes d'actions** : Edit, Désactiver (onglet actifs) / Restore, Supprimer définitivement (onglet désactivés)
- **Sélection** : ✅ Oui (avec colonne select)
- **Bulk Actions** : ✅ Désactiver (onglet actifs) / Restaurer, Supprimer définitivement (onglet désactivés)
- *📋 Règles de Cohérence

### Tableaux AVEC onglets
```tsx
<Card variant="default" padding="none">
  <DataTable
    key={activeTab} // ⚠️ IMPORTANT: Reset sélection au changement d'onglet
    tabsElement={<Tabs items={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
    enableRowSelection
    bulkActions={bulkActions}
    getItemId={(item) => item.id}
    itemType="éléments"
    // ... autres props
  />
</Card>
```

### Tableaux SANS onglets
```tsx
<Card variant="transparent" padding="none">
  <DataTable
    enableRowSelection={false} // Généralement en lecture seule
    // pas de tabsElement
    // pas de bulkActions
    // ... autres props
  />
</Card>
```

### Structure de Scroll
```tsx
// DataTable gère automatiquement:
<div className="overflow-auto max-h-[calc(100vh-450px)]">
  <table>
    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
      {/* Headers restent visibles */}
    </thead>
    <tbody>
   📝 Notes Importantes

### Colonnes Système
- **Colonne `select`** : 
  - `enableHiding: false` (toujours visible)
  - Pinnée à gauche par défaut
  - Support Shift+Click pour sélection de plage
- **Colonne `actions`** : 
  - `enableHiding: false` (toujours visible)
  - `enableSorting: false` (pas de tri sur les actions)
  - Le composant `ActionButtons` gère automatiquement l'espacement avec `gap-1` et `min-w-[32px]`

### Gestion de l'État
- **Sélection réinitialisée** : Utiliser `key={activeTab}` sur DataTable pour reset automatique
- **Les en-têtes pinnés** : Ne sont pas draggables (colonne select notamment)
- **Optimistic Updates** : Utilisés pour les sélecteurs (statut, type, rôle) pour UX instantanée

### Performance
- **Queries de stats** : Toujours avec `pageSize: 1` ou `limit: 1` pour minimiser les données
- **Filtrage** : Côté serveur quand possible (`isActive` dans query params)
- **Recherche floue** : Avec `useFuzzySearch` hook pour résultats pertinent
### Colonnes d'actions
Tous les tableaux avec actions doivent utiliser le composant `ActionButtons` :
```tsx
<ActionButtons
  onEdit={() => setEditingItem(row.original)}
  onDelete={() => setDeletingItem(row.original)}
  size="sm"
  iconOnly
>
  {/* Boutons personnalisés optionnels */}
</ActionButtons>
```

### Bulk Actions
```tsx
const bulkActions = useMemo(() => {
  const actions: BulkAction[] = []
  
  // Exemple: Export
  actions.push(createBulkActions.export(async (selectedIds) => {
    // ... logique
  }))
  
  // Exemple: Delete
  actions.push(createBulkActions.delete(async (selectedIds) => {
    // ... logique
  }))
  
  // Exemple: Action custom
  actions.push({
    id: 'custom-action',
    label: 'Action personnalisée',
    icon: <Icon className="h-4 w-4" />,
    variant: 'default',
    requiresConfirmation: true,
    actionType: 'edit',
    onClick: async (selectedIds) => {
      // ... logique
    },
  })
  
  return actions
}, [dependencies])

## ✅ Checklist de Standardisation pour Nouveaux Tableaux

Lors de la création d'un nouveau tableau avec DataTable:

### Structure
- [ ] Onglets gérés au niveau de la PAGE (pas dans le composant table)
- [ ] Prop `key` unique basée sur l'onglet actif pour reset de sélection
- [ ] Wrapper `<Card variant="default" padding="none">` (ou `transparent` sans onglets)
- [ ] Queries séparées pour stats des onglets (pageSize: 1)

### Sélection et Bulk Actions
- [ ] Colonne `select` ajoutée avec `createSelectionColumn<Type>()`
- [ ] `enableRowSelection={true}` sur DataTable
- [ ] `bulkActions` définies dans un `useMemo`
- [ ] `getItemId` et `itemType` passés au DataTable
- [ ] Actions bulk correspondent à l'onglet actif

### Scroll et Layout
- [ ] Headers sticky automatiques (géré par DataTable)
- [ ] Hauteur max appropriée `max-h-[calc(100vh-XXXpx)]`
- [ ] Scroll uniquement sur les données (tbody)
- [ ] Onglets et boutons alignés horizontalement

### Colonnes
- [ ] Colonne `select` : `enableHiding: false`
- [ ] Colonne `actions` : `enableHiding: false`, `enableSorting: false`
- [ ] ActionButtons utilisé pour les actions individuelles
- [ ] TableSelector pour les champs éditables inline (statut, type, rôle)

### Tests et Validation
- [ ] Changement d'onglet réinitialise la sélection
- [ ] Bulk actions correspondent aux données affichées
- [ ] Headers restent visibles pendant le scroll
- [ ] Popup des colonnes scrollable si > 10 colonnes
- [ ] Responsive (scroll horizontal si nécessaire)
### Tableaux SANS onglets
```tsx
<Card variant="transparent" padding="none">
  <DataTable
    // pas de tabsElement
    // ... autres props
  />
</Card>
```

### Colonnes d'actions
Tous les tableaux avec actions doivent utiliser le composant `ActionButtons` :
```tsx
<ActionButtons
  onEdit={() => setEditingItem(row.original)}
  onDelete={() => setDeletingItem(row.original)}
  size="sm"
  iconOnly
>
  {/* Boutons personnalisés optionnels */}
</ActionButtons>
```

## Notes
- Le composant `ActionButtons` utilise `gap-1` et `min-w-[32px]` pour gérer jusqu'à 4 boutons
- **Colonnes toujours visibles (non masquables)** :
  - Colonne `select` (checkbox) : `enableHiding: false` + pinnée à gauche
  - Colonne `actions` : `enableHiding: false` pour cohérence
- Les en-têtes des colonnes pinnées ne sont pas draggables

## ⚠️ Dropdowns dans les Tables

### Problème d'overflow
Les dropdowns (selects, menus, etc.) dans les cellules de tableau peuvent être clippés par `overflow-hidden`.

### Solution appliquée
1. **DataTable** : Pas de `overflow-hidden` sur le wrapper principal
   - `overflow-x-auto` uniquement sur la div interne pour le scroll horizontal
   - Permet aux dropdowns de s'afficher en dehors du tableau

2. **Composants dropdown** : Utiliser des z-index élevés
   - Overlay : `z-40` minimum
   - Dropdown : `z-50` minimum
   - Position calculée dynamiquement (top/bottom) selon l'espace disponible

### Exemple : RoleSelector
```tsx
{isOpen && (
  <>
    {/* Overlay */}
    <div className="fixed inset-0 z-40" onClick={handleClose} />
    
    {/* Dropdown */}
    <div className={cn(
      "absolute left-0 w-44 bg-white dark:bg-gray-800 shadow-lg z-50",
      dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
    )}>
      {/* Contenu */}
    </div>
  </>
)}
```

### Checklist pour nouveaux dropdowns
- [ ] Pas de `overflow-hidden` sur les containers parents
- [ ] Overlay avec `fixed inset-0 z-40`
- [ ] Dropdown avec `z-50` minimum
- [ ] Position dynamique (calcul de l'espace disponible)
- [ ] Click sur overlay ferme le dropdown
