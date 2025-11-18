# Guidelines - Skeleton Loading

## 📋 Principes généraux

Le système de skeleton loading permet d'afficher des états de chargement cohérents et professionnels qui correspondent **exactement** à la structure du contenu réel.

### ✅ Bonnes pratiques

1. **Toujours utiliser un skeleton** lors du chargement de données asynchrones
2. **Le skeleton doit ressembler au contenu réel** (même structure, même disposition)
3. **Ne pas inclure les contrôles UI statiques** (filtres, barres de recherche, headers fixes)
4. **Utiliser PageContainer** pour un alignement cohérent
5. **Créer des skeletons spécifiques** pour les structures complexes

### ❌ À éviter

- ❌ Utiliser `LoadingSpinner` seul sans contexte
- ❌ Skeleton générique qui ne ressemble pas au contenu
- ❌ Inclure les éléments qui n'ont pas besoin de charger (filtres, headers)
- ❌ Double chargement (skeleton global puis spinner local)

---

## 🏗️ Architecture du système

### Composants de base (`shared/ui/Skeleton.tsx`)

```tsx
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '@/shared/ui'

// Skeleton simple
<Skeleton className="h-8 w-48" />

// Texte multi-lignes
<SkeletonText lines={3} />

// Avatar circulaire
<SkeletonAvatar size="md" />

// Card complète
<SkeletonCard />
```

### Skeletons spécialisés (`shared/ui/SkeletonLayouts.tsx`)

Skeletons préconstruits pour les layouts courants :
- `EventsPageSkeleton` - Grille d'événements
- `UsersTableSkeleton` - Table avec avatars
- `DashboardPageSkeleton` - Dashboard avec stats + listes
- `EventDetailsSkeleton` - Détails d'événement avec onglets
- etc.

---

## 📝 Guide d'implémentation

### 1. Pour une nouvelle page

```tsx
import { PageContainer, PageHeader, MonSkeleton } from '@/shared/ui'

export const MaPage: React.FC = () => {
  const { data, isLoading } = useGetDataQuery()

  if (isLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader 
          title="Ma Page" 
          icon={MonIcon}
          actions={<Button>Action</Button>} // Header visible pendant loading
        />
        <PageSection spacing="lg">
          {/* Filtres visibles pendant loading */}
          <Card>
            <SearchInput value={search} onChange={setSearch} />
            <Select>...</Select>
          </Card>
          
          {/* Skeleton pour le contenu qui charge */}
          <MonSkeleton />
        </PageSection>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader title="Ma Page" icon={MonIcon} actions={<Button>Action</Button>} />
      <PageSection spacing="lg">
        <Card>
          <SearchInput value={search} onChange={setSearch} />
          <Select>...</Select>
        </Card>
        {/* Contenu réel */}
      </PageSection>
    </PageContainer>
  )
}
```

### 2. Créer un nouveau skeleton

**Étape 1 : Analyser la structure réelle**
```
Ma page:
├── Header (titre + icône + bouton) → Visible pendant loading
├── Filtres (search + select)        → Visibles pendant loading
└── Contenu                          → SKELETON ICI
    ├── Stats (3 cartes)
    └── Table (5 colonnes)
```

**Étape 2 : Créer le skeleton dans `SkeletonLayouts.tsx`**
```tsx
export const MaPageSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg">
        <table className="w-full">
          <thead>
            <tr>
              <th><Skeleton className="h-4 w-24" /></th>
              <th><Skeleton className="h-4 w-32" /></th>
              <th><Skeleton className="h-4 w-20" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                <td><Skeleton className="h-4 w-32" /></td>
                <td><Skeleton className="h-4 w-48" /></td>
                <td><Skeleton className="h-6 w-20 rounded-full" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Étape 3 : Exporter dans `shared/ui/index.ts`**
```tsx
export {
  // ... autres exports
  MaPageSkeleton,
} from './SkeletonLayouts'
```

### 3. Pour des onglets/tabs

Si la page a plusieurs onglets avec des structures différentes :

```tsx
// Créer un skeleton par onglet
export const MaPageOnglet1Skeleton: React.FC = () => { ... }
export const MaPageOnglet2Skeleton: React.FC = () => { ... }

// Skeleton principal avec switch
export const MaPageSkeleton: React.FC<{ activeTab?: string }> = ({ 
  activeTab = 'onglet1' 
}) => {
  return (
    <div className="space-y-6">
      {/* Header + Tabs toujours visibles */}
      <div className="border-b">
        {['Onglet 1', 'Onglet 2'].map((label, i) => (
          <div key={i} className={activeTab === `onglet${i+1}` ? 'border-b-2' : ''}>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      {/* Contenu selon onglet actif */}
      {activeTab === 'onglet1' && <MaPageOnglet1Skeleton />}
      {activeTab === 'onglet2' && <MaPageOnglet2Skeleton />}
    </div>
  )
}

// Utilisation
if (isLoading) {
  return (
    <PageContainer>
      <MaPageSkeleton activeTab={activeTab} />
    </PageContainer>
  )
}
```

---

## 🎨 Patterns courants

### Grid de cartes
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {Array.from({ length: 6 }).map((_, i) => (
    <div key={i} className="border rounded-lg p-6">
      <Skeleton className="h-48 w-full mb-4" /> {/* Image */}
      <Skeleton className="h-6 w-3/4 mb-2" />   {/* Titre */}
      <Skeleton className="h-4 w-full" />        {/* Description */}
    </div>
  ))}
</div>
```

### Table avec avatars
```tsx
<tbody>
  {Array.from({ length: rows }).map((_, i) => (
    <tr key={i}>
      <td className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </td>
      <td><Skeleton className="h-6 w-20 rounded-full" /></td>
    </tr>
  ))}
</tbody>
```

### Liste avec bordure gauche (comme Dashboard)
```tsx
{Array.from({ length: 5 }).map((_, i) => (
  <div 
    key={i}
    className="border-l-4 border-blue-500 pl-4 pr-4 py-3 bg-white rounded-r-lg"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  </div>
))}
```

### Stats cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="bg-white rounded-lg border p-6">
      <Skeleton className="h-12 w-12 rounded-lg mb-3" />
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-4 w-24" />
    </div>
  ))}
</div>
```

---

## 📊 Skeletons existants

| Skeleton | Usage | Structure |
|----------|-------|-----------|
| `EventsPageSkeleton` | Page liste événements | Grille 3 colonnes de cartes |
| `EventDetailsSkeleton` | Page détail événement | Header + Tabs + Contenu dynamique selon onglet |
| `EventDetailsTabSkeleton` | Onglet Détails | 2 colonnes (description + stats) |
| `EventRegistrationsTabSkeleton` | Onglet Inscriptions | Header + Table inscriptions |
| `EventFormTabSkeleton` | Onglet Formulaire | 2 colonnes (builder + preview) |
| `EventSettingsTabSkeleton` | Onglet Paramètres | Sections de settings |
| `UsersTableSkeleton` | Table utilisateurs | Table avec avatars + badges |
| `OrganizationsPageSkeleton` | Page organisations | Card unique avec équipe |
| `RolesPermissionsPageSkeleton` | Page rôles/permissions | 2 colonnes (liste + permissions) |
| `DashboardPageSkeleton` | Dashboard | Stats + 2 colonnes (events + attendees) |
| `DashboardStatsCardsSkeleton` | Stats cards dashboard | 4 cartes avec gradients |
| `DashboardEventListSkeleton` | Liste événements dashboard | Liste avec bordure bleue |
| `DashboardAttendeeListSkeleton` | Liste participants dashboard | Liste avec bordure bleue |
| `RegistrationsTableSkeleton` | Table inscriptions | Cartes empilées avec avatar |
| `BadgeTemplatesGridSkeleton` | Grille templates badges | Grille 3 colonnes |
| `StatsGridSkeleton` | Grille de stats | Grid flexible avec compteur |

---

## 🔧 Utilitaires

### API Delay pour tester (Dev Tools)

Un middleware est disponible pour simuler un délai API et tester les skeletons :

```tsx
// DevTools en bas à droite (mode dev uniquement)
- Toggle On/Off
- Slider 0-5000ms
- Presets: 500ms, 1s, 2s
- Mode aléatoire
```

Configuration dans `app/config/devConfig.ts` :
```tsx
export const devConfig = {
  enableApiDelay: true,
  apiDelayMs: 1000,
  useRandomDelay: false,
  randomDelayMin: 500,
  randomDelayMax: 2000,
}
```

---

## ✅ Checklist pour nouvelle page

- [ ] Identifier la structure du contenu (grid, table, liste, etc.)
- [ ] Créer un skeleton dédié dans `SkeletonLayouts.tsx`
- [ ] Exporter le skeleton dans `shared/ui/index.ts`
- [ ] Implémenter le state de loading avec PageContainer
- [ ] Garder header + filtres visibles pendant le loading
- [ ] Tester avec API Delay (DevTools)
- [ ] Vérifier que le skeleton ressemble au contenu réel
- [ ] Si onglets : créer des skeletons par onglet

---

## 📚 Ressources

- **Composants de base** : `src/shared/ui/Skeleton.tsx`
- **Skeletons spécialisés** : `src/shared/ui/SkeletonLayouts.tsx`
- **Exports** : `src/shared/ui/index.ts`
- **Middleware API Delay** : `src/app/middleware/apiDelayMiddleware.ts`
- **DevTools** : `src/app/components/DevTools.tsx`

---

## 🎯 Objectif

**Chaque page doit avoir un skeleton loading professionnel qui correspond exactement à sa structure finale, offrant une expérience utilisateur fluide et cohérente.**
