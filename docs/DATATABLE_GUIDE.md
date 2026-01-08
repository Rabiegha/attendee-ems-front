# Guide Complet DataTable

## 📚 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation et setup](#installation-et-setup)
3. [Concepts de base](#concepts-de-base)
4. [Exemples pratiques](#exemples-pratiques)
5. [Fonctionnalités avancées](#fonctionnalités-avancées)
6. [Personnalisation](#personnalisation)
7. [Résolution de problèmes](#résolution-de-problèmes)

---

## Vue d'ensemble

Le composant `DataTable` est une solution complète de tableau basée sur **TanStack Table v8** offrant :

- ✅ **Sélection multiple** avec Shift+Click pour sélection de plage
- ✅ **Bulk actions** (actions en lot) avec confirmation
- ✅ **Sticky headers** (headers fixés pendant le scroll)
- ✅ **Colonnes draggables** et redimensionnables
- ✅ **Tri et filtres** intégrés
- ✅ **Visibilité des colonnes** configurable
- ✅ **Onglets** pour filtrer les données
- ✅ **Responsive** avec scroll horizontal si nécessaire

---

## Installation et setup

### Imports nécessaires

```typescript
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { createSelectionColumn } from '@/shared/ui/DataTable/SelectionColumn'
import { createBulkActions, type BulkAction } from '@/shared/ui/BulkActions'
import type { ColumnDef } from '@tanstack/react-table'
```

### Structure de page minimale

```typescript
export const MyPage: React.FC = () => {
  const { data: items, isLoading } = useGetItemsQuery()

  const columns = useMemo<ColumnDef<Item>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Nom',
    },
    // ... autres colonnes
  ], [])

  return (
    <DataTable
      columns={columns}
      data={items || []}
      isLoading={isLoading}
    />
  )
}
```

---

## Concepts de base

### 1. Définition des colonnes

```typescript
const columns = useMemo<ColumnDef<User>[]>(() => [
  // Colonne simple
  {
    accessorKey: 'email',
    header: 'Email',
  },
  
  // Colonne avec cell personnalisée
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'default'}>
        {row.original.is_active ? 'Actif' : 'Inactif'}
      </Badge>
    ),
  },
  
  // Colonne non triable
  {
    id: 'actions',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <ActionButtons
        onEdit={() => handleEdit(row.original)}
        onDelete={() => handleDelete(row.original)}
      />
    ),
  },
], [])
```

### 2. Sélection multiple

```typescript
const columns = useMemo<ColumnDef<User>[]>(() => [
  createSelectionColumn<User>(), // ✅ Colonne select (toujours en premier)
  // ... autres colonnes
], [])

<DataTable
  columns={columns}
  data={users}
  enableRowSelection // ✅ Active la sélection
  getItemId={(user) => user.id} // ✅ Identifiant unique
  itemType="utilisateurs" // ✅ Pour les messages
/>
```

### 3. Bulk Actions

```typescript
const bulkActions = useMemo(() => {
  const actions: BulkAction[] = []
  
  // Action prédéfinie: Delete
  actions.push(createBulkActions.delete(async (selectedIds) => {
    await Promise.all(
      Array.from(selectedIds).map((id) => 
        deleteUser({ id }).unwrap()
      )
    )
  }))
  
  // Action prédéfinie: Export
  actions.push(createBulkActions.export(async (selectedIds) => {
    const response = await exportUsers({ 
      ids: Array.from(selectedIds) 
    }).unwrap()
    
    // Télécharger le fichier
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }))
  
  // Action personnalisée
  actions.push({
    id: 'activate',
    label: 'Activer',
    icon: <Check className="h-4 w-4" />,
    variant: 'default',
    requiresConfirmation: true,
    confirmationMessage: 'Activer {count} utilisateurs ?',
    actionType: 'edit',
    onClick: async (selectedIds) => {
      await Promise.all(
        Array.from(selectedIds).map((id) => 
          updateUser({ id, is_active: true }).unwrap()
        )
      )
    },
  })
  
  return actions
}, [deleteUser, exportUsers, updateUser])

<DataTable
  // ...
  bulkActions={bulkActions}
/>
```

### 4. Onglets avec filtres

```typescript
export const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  
  // Queries séparées pour les stats
  const { data: activeStats } = useGetUsersQuery({ 
    pageSize: 1, 
    isActive: true 
  })
  const { data: deletedStats } = useGetUsersQuery({ 
    pageSize: 1, 
    isActive: false 
  })
  
  // Query principale filtrée
  const { data: usersResponse } = useGetUsersQuery({
    isActive: activeTab === 'active',
  })
  
  const tabs: TabItem[] = [
    {
      id: 'active',
      label: 'Utilisateurs actifs',
      count: activeStats?.meta?.total || 0,
    },
    {
      id: 'deleted',
      label: 'Utilisateurs supprimés',
      count: deletedStats?.meta?.total || 0,
    },
  ]
  
  const tabsElement = (
    <Tabs
      items={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
    />
  )
  
  return (
    <DataTable
      key={activeTab} // ⚠️ IMPORTANT: Reset sélection au changement d'onglet
      columns={columns}
      data={usersResponse?.data || []}
      tabsElement={tabsElement}
      enableRowSelection
      bulkActions={bulkActions}
      // ...
    />
  )
}
```

---

## Exemples pratiques

### Exemple 1: Table simple en lecture seule

```typescript
export const HistoryTable: React.FC = () => {
  const { data: history } = useGetHistoryQuery()

  const columns = useMemo<ColumnDef<HistoryItem>[]>(() => [
    {
      accessorKey: 'event_name',
      header: 'Événement',
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.created_at),
    },
  ], [])

  return (
    <Card variant="transparent" padding="none">
      <DataTable
        columns={columns}
        data={history || []}
        enableRowSelection={false} // Pas de sélection
        emptyMessage="Aucun historique"
      />
    </Card>
  )
}
```

### Exemple 2: Table avec sélection et actions

```typescript
export const AttendeesPage: React.FC = () => {
  const { data: attendees } = useGetAttendeesQuery()
  const [deleteAttendee] = useDeleteAttendeeMutation()

  const columns = useMemo<ColumnDef<Attendee>[]>(() => [
    createSelectionColumn<Attendee>(),
    {
      accessorKey: 'first_name',
      header: 'Nom',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ActionButtons
          onEdit={() => setEditingAttendee(row.original)}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ], [])

  const bulkActions = useMemo(() => [
    createBulkActions.delete(async (ids) => {
      await Promise.all(
        Array.from(ids).map((id) => deleteAttendee({ id }))
      )
    }),
  ], [deleteAttendee])

  return (
    <Card variant="default" padding="none">
      <DataTable
        columns={columns}
        data={attendees || []}
        enableRowSelection
        bulkActions={bulkActions}
        getItemId={(attendee) => attendee.id}
        itemType="participants"
      />
    </Card>
  )
}
```

### Exemple 3: Table avec onglets et actions conditionnelles

```typescript
export const RegistrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const isDeletedTab = activeTab === 'deleted'
  
  const { data: registrationsResponse } = useGetRegistrationsQuery({
    isActive: activeTab === 'active',
  })
  
  const [deleteRegistration] = useDeleteRegistrationMutation()
  const [restoreRegistration] = useRestoreRegistrationMutation()
  const [checkInRegistration] = useCheckInRegistrationMutation()

  const columns = useMemo<ColumnDef<Registration>[]>(() => [
    createSelectionColumn<Registration>(),
    {
      accessorKey: 'attendee_name',
      header: 'Participant',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
  ], [])

  const bulkActions = useMemo(() => {
    const actions: BulkAction[] = []
    
    if (isDeletedTab) {
      // Actions pour onglet supprimés
      actions.push({
        id: 'restore',
        label: 'Restaurer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: true,
        actionType: 'edit',
        onClick: async (selectedIds) => {
          await Promise.all(
            Array.from(selectedIds).map((id) => 
              restoreRegistration({ id })
            )
          )
        },
      })
    } else {
      // Actions pour onglet actifs
      actions.push({
        id: 'check-in',
        label: 'Check-in',
        icon: <Check className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: false,
        actionType: 'edit',
        onClick: async (selectedIds) => {
          await Promise.all(
            Array.from(selectedIds).map((id) => 
              checkInRegistration({ id })
            )
          )
        },
      })
      
      actions.push(createBulkActions.delete(async (selectedIds) => {
        await Promise.all(
          Array.from(selectedIds).map((id) => 
            deleteRegistration({ id })
          )
        )
      }))
    }
    
    return actions
  }, [isDeletedTab, deleteRegistration, restoreRegistration, checkInRegistration])

  return (
    <DataTable
      key={activeTab} // Reset sélection
      columns={columns}
      data={registrationsResponse?.data || []}
      tabsElement={tabsElement}
      enableRowSelection
      bulkActions={bulkActions}
      getItemId={(reg) => reg.id}
      itemType="inscriptions"
      emptyMessage={
        isDeletedTab 
          ? "Aucune inscription supprimée" 
          : "Aucune inscription"
      }
    />
  )
}
```

---

## Fonctionnalités avancées

### Sticky Headers

Les headers sont automatiquement fixés lors du scroll vertical :

```tsx
// Géré automatiquement par DataTable
// Structure interne:
<div className="overflow-auto max-h-[calc(100vh-450px)]">
  <table>
    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
      {/* Headers restent visibles */}
    </thead>
    <tbody>
      {/* Données scrollables */}
    </tbody>
  </table>
</div>
```

### Sélection de plage (Shift+Click)

Maintenir Shift et cliquer sur deux lignes pour sélectionner toute la plage :

1. Cliquer sur la ligne 5
2. Maintenir Shift
3. Cliquer sur la ligne 10
4. Les lignes 5-10 sont sélectionnées

### Colonnes pinnées

La colonne `select` est automatiquement pinnée à gauche et ne peut pas être masquée :

```typescript
createSelectionColumn<T>() // Génère automatiquement:
// {
//   id: 'select',
//   enableHiding: false, // Non masquable
//   // Pinned left par défaut
// }
```

### Reset de sélection au changement d'onglet

La prop `key` force un remount du composant :

```typescript
<DataTable
  key={activeTab} // Quand activeTab change, DataTable est remonté
  // Toute la sélection est réinitialisée
/>
```

---

## Personnalisation

### Hauteur du scroll container

Modifier la hauteur maximale dans votre page :

```typescript
<div className="max-h-[calc(100vh-300px)]"> {/* Au lieu de 450px */}
  <DataTable {...props} />
</div>
```

### Styles de cellules

```typescript
{
  accessorKey: 'status',
  header: 'Statut',
  cell: ({ row }) => (
    <div className={cn(
      "px-2 py-1 rounded",
      row.original.is_active 
        ? "bg-green-100 text-green-800" 
        : "bg-gray-100 text-gray-800"
    )}>
      {row.original.status}
    </div>
  ),
}
```

### Messages personnalisés

```typescript
<DataTable
  emptyMessage="Aucun participant trouvé"
  itemType="participants" // Utilisé dans les confirmations: "Supprimer 5 participants ?"
/>
```

---

## Résolution de problèmes

### La sélection ne se réinitialise pas au changement d'onglet

**Solution:** Ajouter `key={activeTab}` sur DataTable

```typescript
<DataTable
  key={activeTab} // ✅ Force remount
  // ...
/>
```

### Les headers ne sont pas sticky

**Vérifier:**
- Pas de `overflow-hidden` sur les parents
- DataTable gère déjà le sticky avec `sticky top-0 z-10`

### Les dropdowns sont coupés dans les cellules

**Solution:** Utiliser un z-index élevé et position fixed

```typescript
{
  cell: ({ row }) => (
    <div className="relative">
      <MyDropdown className="z-50" /> {/* z-50 minimum */}
    </div>
  ),
}
```

### Les bulk actions ne correspondent pas aux données affichées

**Cause:** Pas de conditionnelle selon l'onglet actif

**Solution:**

```typescript
const bulkActions = useMemo(() => {
  const actions: BulkAction[] = []
  
  if (isDeletedTab) {
    // Actions pour supprimés
  } else {
    // Actions pour actifs
  }
  
  return actions
}, [isDeletedTab]) // ✅ Dépendance importante
```

---

## Ressources

- [TABLE_PATTERN.md](./TABLE_PATTERN.md) - Pattern standard complet
- [TABLES_INVENTORY.md](./TABLES_INVENTORY.md) - Liste de tous les tableaux
- [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) - Documentation des composants
- [TanStack Table Docs](https://tanstack.com/table/v8) - Documentation officielle

---

**Dernière mise à jour:** 8 janvier 2026
