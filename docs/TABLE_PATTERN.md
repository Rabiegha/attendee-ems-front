# Pattern Standard pour les Tables avec Onglets

## 🎯 Objectif

Ce document définit le pattern standard à suivre pour **TOUTES** les tables afin d'assurer la cohérence du code, l'expérience utilisateur optimale et éviter la duplication de logique.

## ⚠️ Principes Fondamentaux

1. **LA GESTION DES ONGLETS DOIT TOUJOURS ÊTRE FAITE AU NIVEAU DE LA PAGE, PAS DANS LE COMPOSANT TABLE**
2. **Sélection multiple et bulk actions standardisées** via DataTable props
3. **Headers sticky** pour garder les colonnes visibles pendant le scroll
4. **Reset automatique de la sélection** lors du changement d'onglet via `key` prop
5. **Zone scrollable limitée** pour les données, headers toujours visibles

## 📐 Architecture

```
Page (EventDetails, Attendees, etc.)
├── Gestion des onglets (state + tabs config)
├── Queries pour les stats (active count + deleted count)
├── Query principale pour les données
├── Configuration des bulk actions (bulkActions array)
└── <DataTable>
    ├── key={activeTab} (force remount pour reset sélection)
    ├── tabsElement (React.ReactNode) - Onglets alignés avec boutons
    ├── enableRowSelection - Active la colonne select
    ├── bulkActions - Actions en lot sur sélection
    ├── getItemId - Fonction pour identifier chaque item
    ├── itemType - Nom des items pour les messages
    └── Layout:
        ├── Scroll container: max-h-[calc(100vh-450px)] overflow-auto
        ├── Headers sticky: sticky top-0 z-10
        └── Données scrollables dans tbody
```

## ✅ Pattern Correct (Version 2025)

### 1. Composant Table (ex: AttendeeTable, RegistrationsTable)

```typescript
interface TableProps {
  items: ItemDPO[]
  isLoading: boolean
  isDeletedTab: boolean        // ✅ Reçu de la page
  tabsElement?: React.ReactNode // ✅ Reçu de la page
  // ... autres props
}

export const Table: React.FC<TableProps> = ({
  items,
  isLoading,
  isDeletedTab,
  tabsElement,
}) => {
  // ✅ Pas de useState pour activeTab
  // ✅ Pas de configuration de tabs
  // ✅ Pas de gestion de handleTabChange
  
  // ✅ Colonnes avec sélection
  const columns = useMemo(() => [
    createSelectionColumn<ItemDPO>(), // Colonne select pinnée
    // ... autres colonnes
  ], [])
  
  // ✅ Configuration des bulk actions
  const bulkActions = useMemo(() => {
    const actions: BulkAction[] = []
    
    if (isDeletedTab) {
      actions.push({
        id: 'restore',
        label: 'Restaurer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: true,
        actionType: 'edit',
        onClick: async (selectedIds) => {
          await Promise.all(
            Array.from(selectedIds).map((id) => restoreMutation({ id }))
          )
        },
      })
    } else {
      actions.push(createBulkActions.delete(async (selectedIds) => {
        await Promise.all(
          Array.from(selectedIds).map((id) => deleteMutation({ id }))
        )
      }))
    }
    
    return actions
  }, [isDeletedTab])
  
  return (
    <Card variant="default" padding="none">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        tabsElement={tabsElement}
        enableRowSelection // ✅ Active la sélection
        bulkActions={bulkActions} // ✅ Actions en lot
        getItemId={(item) => item.id} // ✅ Identifiant unique
        itemType="éléments" // ✅ Nom pour les messages
        emptyMessage={
          isDeletedTab
            ? 'Aucun élément supprimé'
            : 'Aucun élément trouvé'
        }
      />
    </Card>
  )
}
```

### 2. Page Parente (ex: EventDetails, Attendees)

```typescript
export const Page: React.FC = () => {
  // ✅ State pour l'onglet actif
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const isDeletedTab = activeTab === 'deleted'
  
  // ✅ Query principale avec filtre isActive
  const { data: itemsResponse } = useGetItemsQuery({
    page: 1,
    limit: 50,
    isActive: activeTab === 'active',
  })
  
  // ✅ Queries séparées pour les stats
  const { data: activeStats } = useGetItemsQuery({
    page: 1,
    limit: 1,
    isActive: true,
  })
  
  const { data: deletedStats } = useGetItemsQuery({
    page: 1,
    limit: 1,
    isActive: false,
  })
  
  // ✅ Configuration des onglets
  const tabs: TabItem[] = [
    {
      id: 'active',
      label: 'Actifs',
      count: activeStats?.meta?.total || 0,
    },
    {
      id: 'deleted',
      label: 'Supprimés',
      count: deletedStats?.meta?.total || 0,
    },
  ]
  
  // ✅ Handler de changement d'onglet
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'active' | 'deleted')
  }
  
  // ✅ Élément onglets créé dans la page
  const tabsElement = (
    <Tabs
      items={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  )
  
  return (
    <DataTable
      key={activeTab} // ⚠️ IMPORTANT: Reset sélection au changement d'onglet
      columns={columns}
      data={itemsResponse?.data || []}
      isLoading={isLoading}
      tabsElement={tabsElement}
      enableRowSelection
      bulkActions={bulkActions}
      getItemId={(item) => item.id}
      itemType="éléments"
      emptyMessage={
        isDeletedTab
          ? 'Aucun élément supprimé'
          : 'Aucun élément trouvé'
      }
    />
  )
}
```

## ❌ Pattern Incorrect (À ÉVITER)

### ❌ Gestion des onglets dans le composant Table

```typescript
// ❌ NE PAS FAIRE CECI
export const Table: React.FC<TableProps> = ({ items, activeCount, deletedCount }) => {
  const [activeTab, setActiveTab] = useState('active') // ❌
  
  const tabs = [
    { id: 'active', label: 'Actifs', count: activeCount },
    { id: 'deleted', label: 'Supprimés', count: deletedCount },
  ] // ❌
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId) // ❌
    onTabChange?.(tabId === 'active') // ❌
  }
  
  return (
    <DataTable
      tabsElement={
        <Tabs items={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      } // ❌
    />
  )
}
```

### Pourquoi c'est incorrect ?

1. **Duplication** : Chaque table duplique la même logique d'onglets
2. **Incohérence** : Difficile de maintenir le même comportement partout
3. **Bugs** : Les compteurs peuvent être incorrects (calculés depuis les données filtrées)
4. **Tests** : Plus difficile à tester (état interne au composant)
5. **Réutilisabilité** : Le composant est moins flexible

## 🔧 Migration d'un Pattern Incorrect

Si vous trouvez un composant table avec gestion interne des onglets :

1. **Supprimer du composant Table** :
   - `useState` pour `activeTab`
   - Configuration `tabs`
   - `handleTabChange`
   - Props `activeCount`, `deletedCount`, `onTabChange`

2. **Ajouter au composant Table** :
   - Prop `isDeletedTab: boolean`
   - Prop `tabsElement?: React.ReactNode`

3. **Ajouter à la page parente** :
   - State `activeTab`
   - Queries séparées pour stats active/deleted
   - Configuration `tabs` avec counts
   - `handleTabChange`
   - Passer `tabsElement` en JSX

## 📚 Exemples de Référence

### Implémentations correctes

- ✅ `src/features/attendees/ui/AttendeeTable.tsx`
- ✅ `src/pages/Attendees/index.tsx`
- ✅ `src/features/registrations/ui/RegistrationsTable.tsx` (après refactoring)
- ✅ `src/pages/EventDetails/index.tsx` (après refactoring)

## 🎓 Principes de Design

1. **Séparation des responsabilités** : La table affiche, la page gère l'état
2. **Unique source de vérité** : Les stats viennent toujours du backend
3. **Réutilisabilité** : Les composants tables sont flexibles et testables
4. **Cohérence** : Tous les tableaux suivent le même pattern

## 🎨 Layout et Scroll (géré automatiquement par DataTable)

### Structure de scroll
```tsx
// DataTable crée automatiquement:
<div className="overflow-auto max-h-[calc(100vh-450px)]">
  <table>
    <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">
      {/* Headers restent visibles pendant le scroll */}
    </thead>
    <tbody>
      {/* Données scrollables */}
    </tbody>
  </table>
</div>
```

### Points clés
- **Headers sticky** : Toujours visibles lors du scroll vertical
- **Hauteur limitée** : Zone scrollable définie (tbody uniquement)
- **Scroll horizontal** : Automatique si le tableau est trop large
- **Colonnes pinnées** : La colonne `select` reste à gauche

## 🚀 Checklist pour Nouvelle Table

### Structure de base
- [ ] Onglets gérés au niveau de la PAGE (state + queries + handlers)
- [ ] Prop `key={activeTab}` sur DataTable pour reset de sélection
- [ ] Wrapper `<Card variant="default" padding="none">` pour tables avec onglets
- [ ] Wrapper `<Card variant="transparent" padding="none">` pour tables sans onglets
- [ ] Queries séparées pour stats des onglets (pageSize: 1 ou limit: 1)

### Sélection et Bulk Actions
- [ ] Colonne `select` ajoutée : `createSelectionColumn<Type>()`
- [ ] `enableRowSelection={true}` sur DataTable
- [ ] `bulkActions` définies dans un `useMemo` avec dépendances
- [ ] `getItemId={(item) => item.id}` passé au DataTable
- [ ] `itemType` défini ("utilisateurs", "participants", etc.)
- [ ] Actions bulk conditionnelles selon l'onglet actif

### Colonnes
- [ ] Colonne `select` : `enableHiding: false` (toujours visible)
- [ ] Colonne `actions` : `enableHiding: false`, `enableSorting: false`
- [ ] ActionButtons utilisé pour les actions individuelles
- [ ] TableSelector pour les champs éditables inline (si applicable)

### Tests de validation
- [ ] Changement d'onglet → sélection réinitialisée automatiquement
- [ ] Bulk actions correspondent aux données affichées (actifs vs supprimés)
- [ ] Headers restent visibles pendant le scroll (sticky)
- [ ] Popup des colonnes scrollable si > 10 colonnes
- [ ] Responsive : scroll horizontal fonctionne si nécessaire
- [ ] Shift+Click pour sélection de plage fonctionne

---

**Date de création** : 18 novembre 2025
**Dernière mise à jour** : 8 janvier 2026
**Status** : Standard obligatoire - Tous les tableaux doivent suivre ce pattern
