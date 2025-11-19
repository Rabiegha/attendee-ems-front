# TableSelector - Composant de sélection inline universel pour tableaux

**Un seul composant pour tous vos selects dans les tableaux !**

Remplace les composants spécialisés (RoleSelector, StatusSelector, etc.) par un composant générique réutilisable.

## 🚀 Utilisation rapide

```tsx
import { TableSelector, type TableSelectorOption } from '@/shared/ui'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

// 1. Définir vos options
const statusOptions: TableSelectorOption[] = [
  { value: 'approved', label: 'Approuvé', icon: CheckCircle, color: 'green' },
  { value: 'refused', label: 'Refusé', icon: XCircle, color: 'red' },
  { value: 'pending', label: 'En attente', icon: Clock, color: 'yellow' },
]

// 2. Utiliser dans une colonne de tableau
{
  id: 'status',
  header: 'Statut',
  cell: ({ row }) => (
    <TableSelector
      value={row.original.status}
      options={statusOptions}
      onChange={async (newStatus) => {
        await updateStatus(row.original.id, newStatus)
      }}
    />
  ),
}
```

## 📋 Props

| Prop | Type | Requis | Défaut | Description |
|------|------|--------|--------|-------------|
| `value` | `T` | ✅ | - | Valeur actuelle |
| `options` | `TableSelectorOption<T>[]` | ✅ | - | Liste des options |
| `onChange` | `(value: T) => Promise<void> \| void` | ✅ | - | Callback de changement |
| `disabled` | `boolean` | ❌ | `false` | Désactiver le sélecteur |
| `loadingText` | `string` | ❌ | `"Chargement..."` | Texte pendant le chargement |
| `size` | `'sm' \| 'md'` | ❌ | `'sm'` | Taille du badge |

## 🎨 Options disponibles

```typescript
interface TableSelectorOption<T = string> {
  value: T                    // Valeur unique
  label: string              // Label affiché
  description?: string       // Description (optionnelle)
  icon?: LucideIcon         // Icône Lucide (optionnelle)
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'orange'
}
```

## 💡 Exemples concrets

### 1. Statuts de registrations

```tsx
const registrationStatusOptions: TableSelectorOption[] = [
  { value: 'awaiting', label: 'En attente', icon: Clock, color: 'yellow' },
  { value: 'approved', label: 'Approuvé', icon: CheckCircle, color: 'green' },
  { value: 'refused', label: 'Refusé', icon: XCircle, color: 'red' },
  { value: 'cancelled', label: 'Annulé', icon: Ban, color: 'gray' },
]

<TableSelector
  value={registration.status}
  options={registrationStatusOptions}
  onChange={(status) => updateRegistrationStatus(registration.id, status)}
/>
```

### 2. Rôles d'utilisateurs

```tsx
const roleOptions: TableSelectorOption[] = [
  { value: 'user', label: 'Utilisateur', icon: User, color: 'blue' },
  { value: 'manager', label: 'Manager', icon: Shield, color: 'indigo' },
  { value: 'admin', label: 'Admin', icon: Crown, color: 'purple' },
]

<TableSelector
  value={user.role}
  options={roleOptions}
  onChange={(role) => updateUserRole(user.id, role)}
  disabled={user.id === currentUserId} // Empêcher l'auto-modification
/>
```

### 3. Priorités

```tsx
type Priority = 'low' | 'medium' | 'high' | 'urgent'

const priorityOptions: TableSelectorOption<Priority>[] = [
  { value: 'low', label: 'Basse', color: 'gray' },
  { value: 'medium', label: 'Moyenne', color: 'yellow' },
  { value: 'high', label: 'Haute', color: 'orange' },
  { value: 'urgent', label: 'Urgente', color: 'red' },
]

<TableSelector<Priority>
  value="medium"
  options={priorityOptions}
  onChange={updatePriority}
/>
```

## ✨ Fonctionnalités

- 🎯 **Générique** - Fonctionne avec n'importe quel type
- 🎨 **9 couleurs** - gray, red, yellow, green, blue, indigo, purple, pink, orange
- 🔍 **Position intelligente** - S'adapte automatiquement (top/bottom)
- 🌐 **Portal rendering** - Évite les problèmes de z-index/overflow
- ⚡ **Support async** - Gère les mises à jour asynchrones
- 🎭 **États visuels** - Loading, disabled, hover

## 🎨 Couleurs recommandées

| Couleur | Usage |
|---------|-------|
| `gray` | Neutre, annulé, désactivé |
| `red` | Erreur, refusé, urgent |
| `yellow` | Attention, en attente |
| `green` | Succès, approuvé, actif |
| `blue` | Info, utilisateur |
| `indigo` | Manager, modéré |
| `purple` | Admin, premium |
| `orange` | Priorité haute |
| `pink` | Favoris, spécial |

## 🚨 Gestion des erreurs

Le composant ne gère PAS les toasts d'erreur. C'est au parent de gérer :

```tsx
<TableSelector
  value={status}
  options={options}
  onChange={async (newStatus) => {
    try {
      await updateStatus(id, newStatus)
      toast.success('Statut mis à jour !')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
      throw error // Important : relancer l'erreur
    }
  }}
/>
```

## 🔄 Migration

### Depuis RoleSelector

**Avant** :
```tsx
<RoleSelector user={user} currentUserId={currentUserId} />
```

**Après** :
```tsx
<TableSelector
  value={user.role.id}
  options={roleOptions}
  onChange={(roleId) => updateUserRole(user.id, roleId)}
  disabled={user.id === currentUserId}
/>
```

### Depuis StatusSelector

**Avant** :
```tsx
<StatusSelector status={registration.status} onChange={updateStatus} />
```

**Après** :
```tsx
<TableSelector
  value={registration.status}
  options={statusOptions}
  onChange={updateStatus}
/>
```

## 💪 Un seul composant pour tout modifier

Modifiez le comportement dans `TableSelector.tsx` et **tous les tableaux** sont mis à jour automatiquement !

- Changer le style du hover ? → Une seule ligne à modifier
- Ajouter une animation ? → Impact sur tous les selects
- Bug à corriger ? → Un seul fichier
