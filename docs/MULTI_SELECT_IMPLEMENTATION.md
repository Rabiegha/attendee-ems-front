# Implémentation de la Fonctionnalité Multi-Select

> ⚠️ **Note importante** : Ce document décrit l'approche initiale avec `useMultiSelect` hook.
> La version actuelle (2026) utilise **TanStack Table v8** avec gestion native de la sélection intégrée dans `DataTable`.
> Voir `TABLE_PATTERN.md` et `TABLES_INVENTORY.md` pour le pattern actuel.

## Vue d'ensemble

Cette documentation décrit l'implémentation de la fonctionnalité de sélection multiple avec actions en lot pour les tables de l'application EMS.

## ⚠️ Pattern Actuel (2026)

La sélection multiple est maintenant gérée directement par **DataTable** via TanStack Table :

```typescript
// Plus besoin de useMultiSelect hook
// La sélection est gérée par TanStack Table

const columns = useMemo(() => [
  createSelectionColumn<ItemType>(), // Colonne select automatique
  // ... autres colonnes
], [])

const bulkActions = useMemo(() => {
  const actions: BulkAction[] = []
  // ... configuration des actions
  return actions
}, [dependencies])

return (
  <DataTable
    key={activeTab} // Reset sélection au changement d'onglet
    columns={columns}
    data={items}
    enableRowSelection // Active la sélection
    bulkActions={bulkActions}
    getItemId={(item) => item.id}
    itemType="éléments"
  />
)
```

### Avantages du nouveau pattern
- ✅ Gestion native par TanStack Table (plus robuste)
- ✅ Shift+Click pour sélection de plage
- ✅ Reset automatique via `key` prop
- ✅ Colonnes pinnées et draggables
- ✅ État synchronisé avec le tableau

---

## Architecture Historique (useMultiSelect)

> Cette section est conservée pour référence historique.

### 1. Hook réutilisable `useMultiSelect`

**Fichier**: `src/shared/hooks/useMultiSelect.ts`

Fonctionnalités :

- Gestion d'état de sélection (individuelle et globale)
- Toggle items et select all/none
- Calculs dérivés (count, selectedItems)
- Interface générique pour tous types d'éléments

```typescript
const multiSelect = useMultiSelect({
  items: data,
  getItemId: (item) => item.id,
})
```

### 2. Composant générique `BulkActions`

**Fichier**: `src/shared/ui/BulkActions.tsx`

Fonctionnalités :

- Interface utilisateur pour actions en lot
- Gestion des confirmations et loading states
- Actions prédéfinies (delete, export, edit)
- Support d'actions personnalisées

```typescript
<BulkActions
  selectedCount={selectedCount}
  selectedIds={selectedIds}
  selectedItems={selectedItems}
  actions={bulkActions}
  onClearSelection={unselectAll}
/>
```

## État d'implémentation (2026)

### ✅ Complètement standardisés

Tous les tableaux suivent le pattern DataTable avec sélection TanStack Table :

1. **UsersPage** (`src/pages/Users/index.tsx`)
   - Sélection multiple ✅
   - Bulk action: Désactiver ✅
   - Key prop pour reset ✅

2. **AttendeeTable** (`src/features/attendees/ui/AttendeeTable.tsx`)
   - Sélection multiple ✅
   - Bulk actions: Exporter, Supprimer ✅
   - Key prop pour reset ✅

3. **RegistrationsTable** (`src/features/registrations/ui/RegistrationsTable.tsx`)
   - Sélection multiple ✅
   - Bulk actions: Exporter, Changer statut, Changer type, Check-in, Undo check-in, Check-out, Undo check-out, Supprimer ✅
   - Key prop pour reset ✅

4. **AttendeeTypesPage** (`src/pages/AttendeeTypes/index.tsx`)
   - Sélection multiple ✅
   - Bulk actions: Désactiver, Restaurer, Supprimer définitivement ✅
   - Key prop pour reset ✅

5. **HistoryTable** (`src/pages/AttendeeDetail/HistoryTable.tsx`)
   - Table en lecture seule (pas de sélection) ✅

### Pattern d'implémentation actuel

Voir `TABLE_PATTERN.md` pour le guide complet.

### 1. Modification d'un tableau existant

```typescript
// 1. Imports
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'

// 2. Setup multi-select
const multiSelect = useMultiSelect({
  items: data,
  getItemId: (item) => item.id
})

// 3. Configuration des actions
const bulkActions = useMemo(() => [
  createBulkActions.delete(async (selectedIds) => {
    await bulkDeleteMutation(Array.from(selectedIds)).unwrap()
    multiSelect.unselectAll()
  }),
  createBulkActions.export(async (selectedIds) => {
    const response = await bulkExportMutation({
      ids: Array.from(selectedIds),
      format: 'csv'
    }).unwrap()
    // Handle download
    multiSelect.unselectAll()
  })
], [/* dependencies */])

// 4. JSX Structure
return (
  <div>
    <BulkActions {...multiSelect} actions={bulkActions} />
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={multiSelect.isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = multiSelect.isIndeterminate
              }}
              onChange={multiSelect.toggleAll}
            />
          </th>
          {/* autres colonnes */}
        </tr>
      </thead>
      <tbody>
        {data.map(item => (
          <tr
            key={item.id}
            className={multiSelect.isSelected(item.id) ? 'bg-blue-50' : ''}
            onClick={(e) => handleRowClick(item.id, e)}
          >
            <td onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={multiSelect.isSelected(item.id)}
                onChange={() => multiSelect.toggleItem(item.id)}
              />
            </td>
            {/* autres cellules */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
```

### 2. Ajout d'endpoints API

```typescript
// Frontend API
bulkDeleteItems: builder.mutation<{ deletedCount: number }, string[]>({
  query: (ids) => ({
    url: `${API_ENDPOINTS.ITEMS.LIST}/bulk-delete`,
    method: 'DELETE',
    body: { ids },
  }),
  invalidatesTags: (result, error, ids) => [
    ...ids.map(id => ({ type: 'Item' as const, id })),
    { type: 'Items', id: 'LIST' },
  ],
}),

bulkExportItems: builder.mutation<ExportResponse, { ids: string[]; format?: 'csv' | 'xlsx' }>({
  query: ({ ids, format = 'csv' }) => ({
    url: `${API_ENDPOINTS.ITEMS.LIST}/bulk-export`,
    method: 'POST',
    body: { ids, format },
  }),
}),
```

### 3. Endpoints Backend

```typescript
// Controller
@Delete('bulk-delete')
@Permissions('items.delete')
async bulkDelete(@Body('ids') ids: string[], @Request() req) {
  const { user } = req;
  const allowAny = user.permissions?.some(p => p.permission.endsWith(':any'));
  const orgId = allowAny ? null : user.org_id;

  const deletedCount = await this.itemsService.bulkDelete(ids, orgId);
  return { deletedCount };
}

@Post('bulk-export')
@Permissions('items.read')
async bulkExport(
  @Body('ids') ids: string[],
  @Body('format') format: 'csv' | 'xlsx' = 'csv',
  @Request() req,
  @Res() res: Response
) {
  const { user } = req;
  const allowAny = user.permissions?.some(p => p.permission.endsWith(':any'));
  const orgId = allowAny ? null : user.org_id;

  const { buffer, filename, mimeType } = await this.itemsService.bulkExport(ids, format, orgId);

  res.set({
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': buffer.length,
  });

  res.send(buffer);
}
```

```typescript
// Service
async bulkDelete(ids: string[], orgId?: string): Promise<number> {
  const whereClause: Prisma.ItemWhereInput = {
    id: { in: ids },
  };

  if (orgId) {
    whereClause.org_id = orgId;
  }

  const result = await this.prisma.item.deleteMany({
    where: whereClause,
  });

  return result.count;
}

async bulkExport(ids: string[], format: 'csv' | 'xlsx', orgId?: string) {
  const whereClause: Prisma.ItemWhereInput = {
    id: { in: ids },
  };

  if (orgId) {
    whereClause.org_id = orgId;
  }

  const items = await this.prisma.item.findMany({
    where: whereClause,
    include: { /* relations */ },
    orderBy: { created_at: 'desc' },
  });

  if (format === 'csv') {
    const csvHeader = 'ID,Name,Status,Created\n';
    const csvRows = items.map(item =>
      [item.id, item.name, item.status, item.created_at.toISOString()]
        .map(field => `"${field}"`)
        .join(',')
    ).join('\n');

    const csvContent = csvHeader + csvRows;
    const buffer = Buffer.from(csvContent, 'utf-8');

    return {
      buffer,
      filename: `items_export_${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv',
    };
  }

  throw new BadRequestException('Format Excel non encore supporté');
}
```

## Fonctionnalités supportées

### Sélection

- [x] Sélection individuelle par checkbox
- [x] Sélection globale (select all/none)
- [x] État indéterminé pour sélection partielle
- [x] Highlighting visuel des éléments sélectionnés
- [x] Compteur d'éléments sélectionnés

### Actions en lot

- [x] Suppression en lot avec confirmation
- [x] Export CSV en lot
- [x] Interface unifiée pour toutes les actions
- [x] États de chargement et feedback utilisateur
- [x] Gestion d'erreurs avec retry

### Sécurité

- [x] Respect des permissions RBAC
- [x] Filtrage par organisation
- [x] Support SUPER_ADMIN cross-organisation

## Tests

### Tests manuels effectués

- [x] Sélection individuelle d'attendees
- [x] Sélection globale (select all)
- [x] Actions de suppression en lot
- [x] Export CSV en lot
- [x] Permissions SUPER_ADMIN vs utilisateurs normaux

### Tests à effectuer

- [ ] Tests Events multi-select
- [ ] Tests Registrations multi-select
- [ ] Tests de performance avec grandes listes
- [ ] Tests d'accessibilité (navigation clavier)

## Performance

### Optimisations implémentées

- `useMemo` pour les actions calculées
- Callbacks stables pour éviter re-renders
- Invalidation cache RTK Query ciblée

### Considérations futures

- Pagination intelligente avec sélection
- Virtualisation pour très grandes listes
- WebWorkers pour export de gros volumes

## Accessibilité

### Fonctionnalités d'accessibilité

- Labels appropriés pour screen readers
- Support navigation clavier
- États ARIA pour checkboxes indéterminées
- Feedback vocal pour actions en lot

## Prochaines étapes

1. **Étendre aux Events** - Ajouter multi-select au tableau des événements
2. **Étendre aux Registrations** - Ajouter multi-select au tableau des inscriptions
3. **Actions avancées** - Modifier en lot, changer statut en lot
4. **Export Excel** - Implémenter export Excel avec formatting avancé
5. **Tests automatisés** - Tests unitaires et E2E pour toutes les fonctionnalités

## Maintenance

### Points d'attention

- Cohérence des permissions entre modules
- Performance avec grandes datasets
- UX cohérente entre tous les tableaux
- Maintenir la compatibilité des APIs

### Documentation associée

- [API Field Mapping Guide](./API_FIELD_MAPPING_GUIDE.md)
- [RBAC Architecture](./RBAC_ARCHITECTURE.md)
- [Permissions Structure Guide](./PERMISSIONS_STRUCTURE_GUIDE.md)
