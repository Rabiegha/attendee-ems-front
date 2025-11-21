# DataTable Component

Composant de table réutilisable et puissant basé sur TanStack Table v8.

## 🎯 Fonctionnalités

### Core Features
- ✅ **Tri multi-colonnes** : Tri par plusieurs colonnes simultanément
- ✅ **Sélection multiple** : Checkbox avec gestion de plages (Shift+Click)
- ✅ **Pagination** : Côté client ou serveur avec navigation complète
- ✅ **Filtres** : Par colonne avec recherche intégrée
- ✅ **Column Ordering** : Drag & drop fluide pour réorganiser les colonnes
- ✅ **Column Visibility** : Masquer/afficher les colonnes dynamiquement
- ✅ **Actions groupées (NEW)** : Actions sur plusieurs lignes sélectionnées
- ✅ **Responsive** : Scroll horizontal automatique
- ✅ **Dark mode** : Support complet du mode sombre
- ✅ **Animations** : Transitions smooth
- ✅ **TypeScript** : Typage strict

### Advanced Features
- 🎨 **Column Pinning** : Colonnes fixes (gauche/droite)
- 💾 **Persistence** : L'ordre des colonnes est sauvegardé dans localStorage
- ⚡ **Optimisations** : GPU acceleration, virtualization-ready
- 🎭 **États** : Loading, empty state, skeleton
- 📱 **Accessibilité** : ARIA labels, keyboard navigation

## 📦 Installation

```tsx
import { DataTable } from '@/shared/ui/DataTable'
import { createSelectionColumn, createActionsColumn } from '@/shared/ui/DataTable/columns'
```

## 🚀 Usage de base

```tsx
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/ui/DataTable'

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
]

function MyTable() {
  return (
    <DataTable
      columns={columns}
      data={users}
    />
  )
}
```

## 🔥 Actions Groupées (Bulk Actions) - NOUVEAU

Les bulk actions permettent d'effectuer des opérations sur plusieurs lignes sélectionnées.

### Configuration rapide

```tsx
import { createBulkActions } from '@/shared/ui/BulkActions'

const bulkActions = [
  createBulkActions.export(async (selectedIds) => {
    await exportUsers(Array.from(selectedIds))
  }),
  createBulkActions.delete(async (selectedIds) => {
    await deleteUsers(Array.from(selectedIds))
  }),
]

<DataTable
  columns={columns}
  data={users}
  enableRowSelection={true}
  bulkActions={bulkActions}
  getItemId={(user) => user.id}
  itemType="utilisateurs"
/>
```

### Documentation complète
- 📖 [Guide complet des Bulk Actions](./BULK_ACTIONS_GUIDE.md)
- 💡 [Exemples d'utilisation](./BULK_ACTIONS_EXAMPLE.tsx)

### Actions prédéfinies
- `createBulkActions.export()` : Export Excel/CSV
- `createBulkActions.delete()` : Suppression avec confirmation
- `createBulkActions.edit()` : Modification groupée

### Actions personnalisées

```tsx
const customAction = {
  id: 'approve',
  label: 'Approuver',
  icon: <CheckCircle className="h-4 w-4" />,
  variant: 'default',
  requiresConfirmation: true,
  onClick: async (selectedIds, selectedItems) => {
    await bulkApprove(Array.from(selectedIds))
  }
}
```

## 🎨 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | **required** | Définition des colonnes |
| `data` | `T[]` | **required** | Données à afficher |
| `enableRowSelection` | `boolean` | `false` | Active la sélection de lignes |
| `bulkActions` | `BulkAction[]` | `undefined` | Actions groupées (NEW) |
| `getItemId` | `(item: T) => string` | `undefined` | Fonction pour extraire l'ID (requis si bulkActions) |
| `itemType` | `string` | `'éléments'` | Type d'items pour les messages |
| `onRowSelectionChange` | `(rows: T[]) => void` | `undefined` | Callback quand la sélection change |
| `pageSize` | `number` | `10` | Nombre de lignes par page |
| `enablePagination` | `boolean` | `true` | Active la pagination |
| `enableColumnOrdering` | `boolean` | `true` | Active le drag & drop des colonnes |
| `enableColumnVisibility` | `boolean` | `true` | Active le menu de visibilité |
| `tabsElement` | `React.ReactNode` | `undefined` | Onglets personnalisés |
| `className` | `string` | `undefined` | Classes CSS additionnelles |
| `isLoading` | `boolean` | `false` | État de chargement |
| `emptyMessage` | `string` | `'Aucune donnée'` | Message si vide |

## 📚 Helpers de colonnes

### Selection Column
```tsx
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'

const columns = [
  createSelectionColumn<User>(),
  // ... autres colonnes
]
```

### Actions Column
```tsx
import { createActionsColumn } from '@/shared/ui/DataTable/columns'

const columns = [
  // ... autres colonnes
  createActionsColumn<User>((user) => (
    <>
      <Button onClick={() => edit(user)}>Modifier</Button>
      <Button onClick={() => delete(user)}>Supprimer</Button>
    </>
  ))
]
```

### Text Column
```tsx
import { createTextColumn } from '@/shared/ui/DataTable/columns'

createTextColumn<User>('name', 'Nom', {
  enableSorting: true,
  cell: (value) => <strong>{value}</strong>
})
```

### Date Column
```tsx
import { createDateColumn } from '@/shared/ui/DataTable/columns'

createDateColumn<User>('createdAt', 'Créé le', (date) => {
  return new Date(date).toLocaleDateString('fr-FR')
})
```

### Badge Column
```tsx
import { createBadgeColumn } from '@/shared/ui/DataTable/columns'

createBadgeColumn<User>('status', 'Statut', (status) => (
  <Badge variant={status === 'active' ? 'success' : 'error'}>
    {status}
  </Badge>
))
```

## 🎯 Exemples complets

### Table simple

```tsx
function SimpleTable() {
  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nom' },
    { accessorKey: 'email', header: 'Email' },
    createDateColumn<User>('createdAt', 'Créé le'),
  ]

  return <DataTable columns={columns} data={users} />
}
```

### Table avec sélection

```tsx
function SelectableTable() {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const columns = [
    createSelectionColumn<User>(),
    { accessorKey: 'name', header: 'Nom' },
    { accessorKey: 'email', header: 'Email' },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      enableRowSelection
      onRowSelectionChange={setSelectedUsers}
    />
  )
}
```

### Table avec actions groupées

```tsx
function TableWithBulkActions() {
  const bulkActions = useMemo(() => [
    createBulkActions.export(async (ids) => {
      await exportUsers(Array.from(ids))
    }),
    {
      id: 'activate',
      label: 'Activer',
      icon: <CheckCircle />,
      variant: 'default',
      onClick: async (ids) => {
        await activateUsers(Array.from(ids))
      }
    },
    createBulkActions.delete(async (ids) => {
      await deleteUsers(Array.from(ids))
    }),
  ], [])

  return (
    <DataTable
      columns={columns}
      data={users}
      enableRowSelection
      bulkActions={bulkActions}
      getItemId={(user) => user.id}
      itemType="utilisateurs"
    />
  )
}
```

### Table avec onglets

```tsx
function TabbedTable() {
  const [activeTab, setActiveTab] = useState('active')

  const tabs = (
    <Tabs
      items={[
        { id: 'active', label: 'Actifs' },
        { id: 'deleted', label: 'Supprimés' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  )

  return (
    <DataTable
      columns={columns}
      data={users}
      tabsElement={tabs}
    />
  )
}
```

### Table avec pagination serveur

```tsx
function ServerPaginatedTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  
  const { data, isLoading } = useGetUsersQuery({
    page,
    pageSize,
  })

  return (
    <DataTable
      columns={columns}
      data={data?.users || []}
      isLoading={isLoading}
      manualPagination={true}
      currentPage={page}
      pageSize={pageSize}
      totalPages={data?.totalPages}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  )
}
```

## 🎨 Personnalisation

### Styles personnalisés

```tsx
<DataTable
  columns={columns}
  data={data}
  className="my-custom-table"
/>
```

### Message vide personnalisé

```tsx
<DataTable
  columns={columns}
  data={data}
  emptyMessage="Aucun utilisateur trouvé"
/>
```

### Skeleton de chargement

Le skeleton s'affiche automatiquement quand `isLoading={true}`.

## 📝 Notes importantes

### Performance
- Utilisez `useMemo` pour les colonnes et les bulk actions
- Pour de grandes listes (>10 000), utilisez la pagination serveur
- Le composant utilise GPU acceleration pour les animations

### Persistence
- L'ordre des colonnes est automatiquement sauvegardé dans localStorage
- La clé est générée à partir des IDs de colonnes
- Pour désactiver : `enableColumnOrdering={false}`

### Sélection de plages
- Maintenez `Shift` et cliquez pour sélectionner une plage
- Fonctionne uniquement dans la colonne select (pas sur toute la ligne)

### Bulk Actions
- `getItemId` est **requis** si vous utilisez `bulkActions`
- Les actions avec `requiresConfirmation` affichent automatiquement une modale
- La sélection est automatiquement vidée après une action réussie

## 🐛 Troubleshooting

### Les bulk actions n'apparaissent pas
- Vérifiez que `enableRowSelection={true}`
- Vérifiez que `bulkActions` est défini
- Vérifiez que `getItemId` est fourni

### La persistence ne fonctionne pas
- Vérifiez que les colonnes ont des IDs uniques
- Vérifiez que localStorage est accessible
- La structure des colonnes ne doit pas changer entre renders

### Les animations sont saccadées
- Réduisez le nombre de lignes affichées
- Utilisez la pagination
- Évitez les re-renders inutiles avec `useMemo`

## 📖 Ressources

- [TanStack Table Documentation](https://tanstack.com/table/v8)
- [Guide des Bulk Actions](./BULK_ACTIONS_GUIDE.md)
- [Exemples de Bulk Actions](./BULK_ACTIONS_EXAMPLE.tsx)
- [Column Helpers](./columns.tsx)

## 🤝 Contribution

Pour ajouter de nouvelles fonctionnalités ou améliorer le composant, référez-vous au guide de contribution du projet.
