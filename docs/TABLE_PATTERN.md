# Pattern Standard pour les Tables avec Onglets

## 🎯 Objectif

Ce document définit le pattern standard à suivre pour **TOUTES** les tables avec onglets (actifs/supprimés) afin d'assurer la cohérence du code et éviter la duplication de logique.

## ⚠️ Principe Fondamental

**LA GESTION DES ONGLETS DOIT TOUJOURS ÊTRE FAITE AU NIVEAU DE LA PAGE, PAS DANS LE COMPOSANT TABLE**

## 📐 Architecture

```
Page (EventDetails, Attendees, etc.)
├── Gestion des onglets (state + tabs config)
├── Queries pour les stats (active count + deleted count)
├── Query principale pour les données
└── <Table>
    ├── Prop: isDeletedTab (boolean)
    ├── Prop: tabsElement (React.ReactNode)
    └── Affichage conditionnel basé sur isDeletedTab
```

## ✅ Pattern Correct

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
  
  return (
    <Card variant="default" padding="none">
      <DataTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        tabsElement={tabsElement} // ✅ Utilise le prop
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
  
  return (
    <Table
      items={itemsResponse?.data || []}
      isLoading={isLoading}
      isDeletedTab={activeTab === 'deleted'}
      tabsElement={
        <Tabs
          items={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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

## 🚀 Checklist pour Nouvelle Table

Quand vous créez une nouvelle table avec onglets :

- [ ] Le composant table reçoit `isDeletedTab` en prop
- [ ] Le composant table reçoit `tabsElement` en prop
- [ ] Le composant table n'a PAS de `useState` pour activeTab
- [ ] La page parente gère le state `activeTab`
- [ ] La page parente a 2 queries séparées pour les stats
- [ ] La page parente configure les onglets avec `TabItem[]`
- [ ] La page parente passe `<Tabs>` dans `tabsElement`

---

**Date de création** : 18 novembre 2025
**Dernière mise à jour** : 18 novembre 2025
**Status** : Standard obligatoire
