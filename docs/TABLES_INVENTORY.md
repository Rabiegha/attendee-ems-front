# Inventaire des Tableaux (DataTable)

Ce document liste tous les tableaux du projet utilisant le composant `DataTable`.

## ✅ TOUS LES TABLEAUX SUIVENT LE PATTERN STANDARD

**Pattern appliqué** : Les onglets sont gérés au niveau de la PAGE, pas dans le composant table.
Voir `docs/TABLE_PATTERN.md` pour la documentation complète du pattern.

## Type 1 : Tableaux AVEC onglets (Tabs)

### 1. UsersPage - Tableau des utilisateurs
- **Fichier** : `src/pages/Users/index.tsx`
- **Onglets** : "Actifs" / "Supprimés"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper dans page : `<Card variant="default" padding="none">`
  - DataTable : `tabsElement={<Tabs ... />}` (créé dans la page)
  - Queries : `activeUsersStats` + `deletedUsersStats` (pageSize: 1)
- **Colonnes d'actions** : Edit, Delete/Restore
- **Sélection** : Oui
- **État** : ✅ Conforme au pattern standard

### 2. AttendeeTable - Tableau des participants
- **Fichier** : `src/features/attendees/ui/AttendeeTable.tsx` + `src/pages/Attendees/index.tsx`
- **Onglets** : "Actifs" / "Supprimés"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper dans page : `<Card variant="default" padding="none">`
  - DataTable : `tabsElement={tabsElement}` (reçu en prop)
  - Queries : `activeStatsResponse` + `deletedStatsResponse` (pageSize: 1)
- **Colonnes d'actions** : Edit, Delete (utilise ActionButtons)
- **Sélection** : Oui
- **État** : ✅ Conforme au pattern standard

### 3. RegistrationsTable - Tableau des inscriptions
- **Fichier** : `src/features/registrations/ui/RegistrationsTable.tsx` + `src/pages/EventDetails/index.tsx`
- **Onglets** : "Actives" / "Supprimées"
- **Pattern** : ✅ Onglets gérés dans la page avec queries séparées
- **Structure** :
  - Wrapper interne au composant : `<Card variant="default" padding="none">`
  - DataTable : `tabsElement={tabsElement}` (reçu en prop)
  - Queries : `activeRegistrationsStats` + `deletedRegistrationsStats` (limit: 1)
- **Colonnes d'actions** : Approve, Refuse, Edit, Delete (4 boutons avec ActionButtons + children) / Restore, Permanent Delete (onglet supprimées)
- **Sélection** : Oui
- **État** : ✅ Conforme au pattern standard

## Type 2 : Tableaux SANS onglets

### 4. HistoryTable - Historique des participations (AttendeeDetail)
- **Fichier** : `src/pages/AttendeeDetail/HistoryTable.tsx`
- **Onglets** : Non
- **Props** :
  - Wrapped in `<Card variant="transparent" padding="none">`
  - `enableRowSelection={false}`
- **Colonnes d'actions** : Aucune
- **Sélection** : Non
- **État** : ✅ Conforme

## Règles de cohérence

### Tableaux AVEC onglets
```tsx
<Card variant="default" padding="none">
  <DataTable
    tabsElement={<Tabs ... />}
    // ... autres props
  />
</Card>
```

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
