# Guide des Actions Groupées (Bulk Actions)

Le composant `DataTable` intègre maintenant un système d'actions groupées qui permet d'effectuer des opérations sur plusieurs lignes sélectionnées en même temps.

## Utilisation de base

### 1. Activer la sélection multiple

```tsx
<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  // ... autres props
/>
```

### 2. Ajouter des actions groupées

```tsx
import { createBulkActions } from '@/shared/ui/BulkActions'

const bulkActions = [
  createBulkActions.export(async (selectedIds, selectedItems) => {
    // Logique d'export
    console.log('Export de', selectedIds.size, 'éléments')
  }),
  
  createBulkActions.delete(async (selectedIds, selectedItems) => {
    // Logique de suppression
    await deleteMultiple(Array.from(selectedIds))
  }),
]

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  bulkActions={bulkActions}
  getItemId={(item) => item.id}
  itemType="inscriptions" // Pour le texte d'affichage
/>
```

## Props requises pour les Bulk Actions

| Prop | Type | Description | Requis |
|------|------|-------------|--------|
| `enableRowSelection` | `boolean` | Active la sélection de lignes | ✅ Oui |
| `bulkActions` | `BulkAction[]` | Tableau d'actions disponibles | ✅ Oui |
| `getItemId` | `(item: T) => string` | Fonction pour extraire l'ID unique | ✅ Oui |
| `itemType` | `string` | Type d'élément (pour l'affichage) | ⚠️ Optionnel (défaut: "éléments") |

## Actions prédéfinies

Le helper `createBulkActions` fournit des actions pré-configurées :

### 1. Export
```tsx
createBulkActions.export(async (selectedIds, selectedItems) => {
  const response = await exportAPI({
    ids: Array.from(selectedIds),
    format: 'excel',
  })
  // Télécharger le fichier...
})
```

- Icône : 📥 Download
- Variante : `outline`
- Confirmation : ❌ Non

### 2. Delete (Suppression)
```tsx
createBulkActions.delete(async (selectedIds, selectedItems) => {
  await bulkDeleteAPI({
    ids: Array.from(selectedIds)
  })
})
```

- Icône : 🗑️ Trash
- Variante : `destructive`
- Confirmation : ✅ Oui (modale automatique)

### 3. Edit (Modification)
```tsx
createBulkActions.edit(async (selectedIds, selectedItems) => {
  // Ouvrir une modale d'édition groupée
  setEditModal({ isOpen: true, items: selectedItems })
})
```

- Icône : ✏️ Edit
- Variante : `outline`
- Confirmation : ❌ Non

## Actions personnalisées

Vous pouvez créer vos propres actions :

```tsx
import { type BulkAction } from '@/shared/ui/BulkActions'
import { CheckCircle, Mail } from 'lucide-react'

const customBulkActions: BulkAction[] = [
  {
    id: 'approve',
    label: 'Approuver',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'default',
    requiresConfirmation: true,
    confirmationMessage: 'Approuver toutes les inscriptions sélectionnées ?',
    actionType: 'edit',
    onClick: async (selectedIds, selectedItems) => {
      await bulkApprove(Array.from(selectedIds))
    }
  },
  {
    id: 'send-email',
    label: 'Envoyer email',
    icon: <Mail className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false,
    onClick: async (selectedIds, selectedItems) => {
      // Ouvrir modale d'envoi d'email
      openEmailModal(selectedItems)
    }
  }
]
```

### Structure d'une BulkAction

```typescript
interface BulkAction {
  id: string                    // Identifiant unique
  label: string                 // Texte du bouton
  icon?: React.ReactNode        // Icône (optionnelle)
  variant?: ButtonVariant       // Style du bouton
  requiresConfirmation?: boolean // Afficher modale de confirmation
  confirmationMessage?: string   // Message personnalisé
  actionType?: 'delete' | 'export' | 'edit' // Type (pour la modale)
  onClick: (selectedIds: Set<string>, selectedItems: T[]) => void | Promise<void>
}
```

## Exemple complet : Table d'utilisateurs

```tsx
import React, { useMemo } from 'react'
import { DataTable } from '@/shared/ui/DataTable'
import { createBulkActions, type BulkAction } from '@/shared/ui/BulkActions'
import { Mail, UserCheck } from 'lucide-react'

export const UsersTable = ({ users }) => {
  const bulkActions = useMemo<BulkAction[]>(() => [
    // Action prédéfinie : Export
    createBulkActions.export(async (selectedIds) => {
      const response = await exportUsers({
        ids: Array.from(selectedIds),
        format: 'excel'
      })
      downloadFile(response.downloadUrl, response.filename)
    }),

    // Action personnalisée : Activer
    {
      id: 'activate',
      label: 'Activer',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'default',
      requiresConfirmation: true,
      confirmationMessage: 'Activer tous les utilisateurs sélectionnés ?',
      actionType: 'edit',
      onClick: async (selectedIds) => {
        await bulkActivateUsers(Array.from(selectedIds))
      }
    },

    // Action personnalisée : Envoyer email
    {
      id: 'email',
      label: 'Envoyer email',
      icon: <Mail className="h-4 w-4" />,
      variant: 'outline',
      onClick: (selectedIds, selectedItems) => {
        setEmailModal({
          isOpen: true,
          recipients: selectedItems.map(u => u.email)
        })
      }
    },

    // Action prédéfinie : Supprimer
    createBulkActions.delete(async (selectedIds) => {
      await bulkDeleteUsers(Array.from(selectedIds))
    }),
  ], [])

  return (
    <DataTable
      columns={columns}
      data={users}
      enableRowSelection={true}
      bulkActions={bulkActions}
      getItemId={(user) => user.id}
      itemType="utilisateurs"
    />
  )
}
```

## Fonctionnalités automatiques

Quand `bulkActions` est fourni, le `DataTable` gère automatiquement :

✅ **Affichage conditionnel** : La barre d'actions n'apparaît que si au moins 1 élément est sélectionné

✅ **Compteur** : Affiche "X sélectionné(s)" avec badge bleu

✅ **Désélection** : Bouton "Tout désélectionner" automatique

✅ **Modales de confirmation** : Gestion automatique pour les actions avec `requiresConfirmation: true`

✅ **États de chargement** : Indicateurs de chargement pendant l'exécution des actions

✅ **Réinitialisation** : La sélection est automatiquement réinitialisée après une action réussie

## Différence avec l'ancien système

### ❌ Avant (manuel)
```tsx
// Il fallait gérer manuellement :
const { selectedIds, selectedItems, unselectAll } = useMultiSelect(...)

<BulkActions
  selectedCount={selectedCount}
  selectedIds={selectedIds}
  selectedItems={selectedItems}
  actions={bulkActions}
  onClearSelection={unselectAll}
/>

<DataTable ... />
```

### ✅ Maintenant (automatique)
```tsx
// Tout est géré par DataTable
<DataTable
  enableRowSelection={true}
  bulkActions={bulkActions}
  getItemId={(item) => item.id}
  itemType="inscriptions"
  {...otherProps}
/>
```

## Bonnes pratiques

### 1. Mémoriser les actions
Utilisez `useMemo` pour éviter de recréer les actions à chaque render :

```tsx
const bulkActions = useMemo(() => [
  createBulkActions.export(/* ... */),
  createBulkActions.delete(/* ... */),
], [/* dépendances */])
```

### 2. Gestion des erreurs
Les actions doivent gérer leurs erreurs et les afficher via toast :

```tsx
createBulkActions.delete(async (selectedIds) => {
  try {
    await bulkDeleteAPI(Array.from(selectedIds))
    toast.success('Suppression réussie')
  } catch (error) {
    toast.error('Erreur lors de la suppression')
    throw error // Important : re-throw pour arrêter le spinner
  }
})
```

### 3. Actions spécifiques au contexte
Adaptez les actions selon le contexte (onglet actif, permissions, etc.) :

```tsx
const bulkActions = useMemo(() => {
  const actions = []

  // Toujours disponible
  actions.push(createBulkActions.export(...))

  // Uniquement pour l'onglet "supprimés"
  if (isDeletedTab) {
    actions.push({
      id: 'restore',
      label: 'Restaurer',
      icon: <RotateCcw className="h-4 w-4" />,
      variant: 'default',
      onClick: async (selectedIds) => {
        await bulkRestore(Array.from(selectedIds))
      }
    })
  } else {
    // Actions normales
    actions.push(createBulkActions.delete(...))
  }

  return actions
}, [isDeletedTab])
```

## Notes importantes

⚠️ **getItemId est requis** : Sans cette fonction, les IDs ne peuvent pas être extraits et les actions ne fonctionneront pas correctement

⚠️ **Async/await** : Les actions qui font des appels API doivent être `async` et retourner une `Promise`

⚠️ **Réinitialisation automatique** : Après une action réussie, la sélection est automatiquement vidée. Pas besoin d'appeler `unselectAll()`

⚠️ **Performance** : Pour de très grandes listes (>10 000 items), considérez l'utilisation de la pagination côté serveur
