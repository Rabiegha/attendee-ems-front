# Résumé du Refactoring - Pattern Standard des Tables

**Date** : 18 novembre 2025  
**Objectif** : Éliminer la duplication de code et unifier tous les tableaux avec le même pattern

## 🎯 Problème Initial

Les tableaux avec onglets avaient des implémentations incohérentes :
- ❌ Certains géraient les onglets en interne (duplication)
- ❌ Certains calculaient les stats depuis les données filtrées (inexact)
- ❌ Chaque tableau réinventait la roue
- ❌ Les bugs devaient être corrigés plusieurs fois

## ✅ Solution Appliquée

### Pattern Standard Obligatoire

**Principe fondamental** : La gestion des onglets se fait TOUJOURS au niveau de la page, JAMAIS dans le composant table.

```typescript
// ✅ CORRECT - Dans la PAGE
const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')

// Queries séparées pour les stats
const { data: activeStats } = useGetItemsQuery({ page: 1, limit: 1, isActive: true })
const { data: deletedStats } = useGetItemsQuery({ page: 1, limit: 1, isActive: false })

const tabs = [
  { id: 'active', label: 'Actifs', count: activeStats?.total || 0 },
  { id: 'deleted', label: 'Supprimés', count: deletedStats?.total || 0 },
]

<Table
  isDeletedTab={activeTab === 'deleted'}
  tabsElement={<Tabs items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
/>
```

```typescript
// ✅ CORRECT - Dans le COMPOSANT TABLE
interface TableProps {
  isDeletedTab: boolean        // Reçu de la page
  tabsElement?: React.ReactNode // Reçu de la page
}

// Pas de useState pour activeTab
// Pas de configuration de tabs
// Pas de gestion interne
```

## 📊 Tableaux Refactorisés

### 1. ✅ UsersPage
**Fichier** : `src/pages/Users/index.tsx`

**Avant** :
```typescript
// ❌ Une seule query avec pageSize: 1000
const { data: allUsersData } = useGetUsersQuery({ page: 1, pageSize: 1000 })
const stats = {
  active: allUsersData?.users?.filter((u) => u.is_active).length || 0,
  inactive: allUsersData?.users?.filter((u) => !u.is_active).length || 0,
}
```

**Après** :
```typescript
// ✅ Deux queries séparées avec pageSize: 1
const { data: activeUsersStats } = useGetUsersQuery({ page: 1, pageSize: 1, isActive: true })
const { data: deletedUsersStats } = useGetUsersQuery({ page: 1, pageSize: 1, isActive: false })

const tabs = [
  { id: 'active', label: 'Actifs', count: activeUsersStats?.total || 0 },
  { id: 'deleted', label: 'Supprimés', count: deletedUsersStats?.total || 0 },
]
```

### 2. ✅ AttendeeTable
**Fichier** : `src/features/attendees/ui/AttendeeTable.tsx` + `src/pages/Attendees/index.tsx`

**État** : Déjà conforme au pattern (utilisé comme référence)

### 3. ✅ RegistrationsTable
**Fichier** : `src/features/registrations/ui/RegistrationsTable.tsx` + `src/pages/EventDetails/index.tsx`

**Avant** :
```typescript
// ❌ Gestion interne des onglets dans RegistrationsTable
const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
const tabs = [
  { id: 'active', label: 'Actives', count: activeCount }, // Props reçus
  { id: 'deleted', label: 'Supprimées', count: deletedCount },
]
```

**Après** :
```typescript
// ✅ Dans EventDetails/index.tsx
const [registrationsActiveTab, setRegistrationsActiveTab] = useState<'active' | 'deleted'>('active')

const { data: activeRegistrationsStats } = useGetRegistrationsQuery({
  eventId: id,
  page: 1,
  limit: 1,
  isActive: true,
})

const { data: deletedRegistrationsStats } = useGetRegistrationsQuery({
  eventId: id,
  page: 1,
  limit: 1,
  isActive: false,
})

const registrationsTabs = [
  { id: 'active', label: 'Actives', count: activeRegistrationsStats?.meta?.total || 0 },
  { id: 'deleted', label: 'Supprimées', count: deletedRegistrationsStats?.meta?.total || 0 },
]

<RegistrationsTable
  isDeletedTab={registrationsActiveTab === 'deleted'}
  tabsElement={<Tabs items={registrationsTabs} activeTab={registrationsActiveTab} onTabChange={handleTabChange} />}
/>
```

```typescript
// ✅ Dans RegistrationsTable.tsx
interface RegistrationsTableProps {
  isDeletedTab: boolean        // Nouveau
  tabsElement?: React.ReactNode // Nouveau
  // Supprimé: activeCount, deletedCount, onTabChange
}

// Supprimé: useState pour activeTab
// Supprimé: configuration tabs
// Supprimé: handleTabChange
```

### 4. ✅ HistoryTable
**Fichier** : `src/pages/AttendeeDetail/HistoryTable.tsx`

**État** : Table sans onglets - Pattern correct (variant transparent)

## 🎓 Avantages du Refactoring

### 1. **Zéro Duplication**
- ✅ Tous les tableaux utilisent le même pattern
- ✅ Un seul endroit à modifier si besoin de changer le comportement
- ✅ Code réutilisable et cohérent

### 2. **Stats Précises**
- ✅ Les compteurs d'onglets viennent toujours du backend
- ✅ Pas de calculs locaux sur données filtrées
- ✅ Valeurs en temps réel

### 3. **Maintenance Facilitée**
- ✅ Un bug corrigé = corrigé partout
- ✅ Pattern documenté dans `TABLE_PATTERN.md`
- ✅ Checklist pour nouvelles tables

### 4. **Séparation des Responsabilités**
- ✅ Page = État et orchestration
- ✅ Table = Affichage et interactions
- ✅ Plus testable et modulaire

## 📚 Documentation Créée

1. **`TABLE_PATTERN.md`**
   - Pattern standard obligatoire
   - Exemples ✅ et ❌
   - Checklist pour nouvelles tables
   - Principes de design

2. **`TABLES_INVENTORY.md`** (mis à jour)
   - Liste de tous les tableaux
   - Conformité au pattern
   - Statut de chaque table

3. **`REFACTORING_SUMMARY.md`** (ce fichier)
   - Résumé des changements
   - Avant/Après
   - Avantages

## 🚀 Pour l'Avenir

Quand tu crées une nouvelle table avec onglets :

1. ✅ Vérifie `docs/TABLE_PATTERN.md`
2. ✅ Utilise AttendeeTable comme référence
3. ✅ Gère les onglets dans la page
4. ✅ Utilise deux queries séparées pour les stats
5. ✅ Passe `isDeletedTab` et `tabsElement` en props

---

**Résultat** : Codebase unifié, maintenable et sans duplication ! 🎉
