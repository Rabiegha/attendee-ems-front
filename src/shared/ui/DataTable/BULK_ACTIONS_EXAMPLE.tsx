/**
 * Exemple d'intégration des Bulk Actions dans la page Users
 * 
 * Ce fichier montre comment ajouter facilement des actions groupées
 * à un tableau existant utilisant DataTable
 */

import { useMemo } from 'react'
import { createBulkActions, type BulkAction } from '@/shared/ui/BulkActions'
import { Mail, UserCheck, UserX, Download } from 'lucide-react'

// ========================================
// EXEMPLE 1 : Ajout simple d'actions groupées
// ========================================

export function UsersTableWithBulkActions() {
  // 1. Définir les actions groupées
  const bulkActions = useMemo<BulkAction[]>(() => [
    // Export (action prédéfinie)
    createBulkActions.export(async (selectedIds) => {
      const response = await exportUsers({
        ids: Array.from(selectedIds),
        format: 'excel'
      })
      downloadFile(response)
    }),

    // Activer plusieurs utilisateurs
    {
      id: 'activate',
      label: 'Activer',
      icon: <UserCheck className="h-4 w-4" />,
      variant: 'default',
      requiresConfirmation: true,
      confirmationMessage: 'Activer tous les utilisateurs sélectionnés ?',
      actionType: 'edit',
      onClick: async (selectedIds, selectedItems) => {
        await bulkActivateUsers(Array.from(selectedIds))
        toast.success(`${selectedIds.size} utilisateurs activés`)
      }
    },

    // Désactiver plusieurs utilisateurs
    {
      id: 'deactivate',
      label: 'Désactiver',
      icon: <UserX className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: true,
      confirmationMessage: 'Désactiver tous les utilisateurs sélectionnés ?',
      actionType: 'edit',
      onClick: async (selectedIds) => {
        await bulkDeactivateUsers(Array.from(selectedIds))
        toast.success(`${selectedIds.size} utilisateurs désactivés`)
      }
    },

    // Supprimer (action prédéfinie)
    createBulkActions.delete(async (selectedIds) => {
      await bulkDeleteUsers(Array.from(selectedIds))
      toast.success(`${selectedIds.size} utilisateurs supprimés`)
    }),
  ], [])

  // 2. Passer les props au DataTable
  return (
    <DataTable
      columns={columns}
      data={users}
      enableRowSelection={true}
      bulkActions={bulkActions}
      getItemId={(user) => user.id}
      itemType="utilisateurs"
      // ... autres props
    />
  )
}

// ========================================
// EXEMPLE 2 : Actions conditionnelles selon l'onglet
// ========================================

export function UsersTableWithConditionalActions({ isDeletedTab }: { isDeletedTab: boolean }) {
  const bulkActions = useMemo<BulkAction[]>(() => {
    const actions = []

    // Export : toujours disponible
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        const response = await exportUsers({
          ids: Array.from(selectedIds),
          format: 'excel'
        })
        downloadFile(response)
      })
    )

    if (isDeletedTab) {
      // Actions pour l'onglet "Supprimés"
      actions.push({
        id: 'restore',
        label: 'Restaurer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default',
        requiresConfirmation: true,
        confirmationMessage: 'Restaurer tous les utilisateurs sélectionnés ?',
        actionType: 'edit',
        onClick: async (selectedIds) => {
          await bulkRestoreUsers(Array.from(selectedIds))
        }
      })

      actions.push({
        id: 'permanent-delete',
        label: 'Supprimer définitivement',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive',
        requiresConfirmation: true,
        confirmationMessage: 'ATTENTION : Cette action est irréversible. Supprimer définitivement ?',
        actionType: 'delete',
        onClick: async (selectedIds) => {
          await bulkPermanentDeleteUsers(Array.from(selectedIds))
        }
      })
    } else {
      // Actions pour l'onglet "Actifs"
      actions.push({
        id: 'activate',
        label: 'Activer',
        icon: <UserCheck className="h-4 w-4" />,
        variant: 'default',
        onClick: async (selectedIds) => {
          await bulkActivateUsers(Array.from(selectedIds))
        }
      })

      actions.push({
        id: 'deactivate',
        label: 'Désactiver',
        icon: <UserX className="h-4 w-4" />,
        variant: 'outline',
        onClick: async (selectedIds) => {
          await bulkDeactivateUsers(Array.from(selectedIds))
        }
      })

      actions.push(
        createBulkActions.delete(async (selectedIds) => {
          await bulkDeleteUsers(Array.from(selectedIds))
        })
      )
    }

    return actions
  }, [isDeletedTab])

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

// ========================================
// EXEMPLE 3 : Action complexe avec modale
// ========================================

export function UsersTableWithComplexAction() {
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])

  const bulkActions = useMemo<BulkAction[]>(() => [
    {
      id: 'send-email',
      label: 'Envoyer un email',
      icon: <Mail className="h-4 w-4" />,
      variant: 'outline',
      onClick: async (selectedIds, selectedItems) => {
        // Stocker les utilisateurs sélectionnés
        setSelectedUsers(selectedItems)
        // Ouvrir une modale d'envoi d'email
        setEmailModalOpen(true)
      }
    },

    {
      id: 'reset-password',
      label: 'Réinitialiser mot de passe',
      icon: <Key className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: true,
      confirmationMessage: 'Envoyer un email de réinitialisation à tous les utilisateurs sélectionnés ?',
      actionType: 'edit',
      onClick: async (selectedIds) => {
        await bulkResetPassword(Array.from(selectedIds))
        toast.success(`Email envoyé à ${selectedIds.size} utilisateurs`)
      }
    },

    createBulkActions.export(async (selectedIds) => {
      const response = await exportUsers({
        ids: Array.from(selectedIds),
        format: 'excel'
      })
      downloadFile(response)
    }),
  ], [])

  return (
    <>
      <DataTable
        columns={columns}
        data={users}
        enableRowSelection={true}
        bulkActions={bulkActions}
        getItemId={(user) => user.id}
        itemType="utilisateurs"
      />

      {/* Modale pour envoyer des emails */}
      <EmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipients={selectedUsers.map(u => ({ email: u.email, name: u.name }))}
      />
    </>
  )
}

// ========================================
// EXEMPLE 4 : Actions avec permissions (RBAC)
// ========================================

export function UsersTableWithPermissions({ currentUser }: { currentUser: User }) {
  const bulkActions = useMemo<BulkAction[]>(() => {
    const actions = []

    // Export : accessible à tous
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        const response = await exportUsers({
          ids: Array.from(selectedIds),
          format: 'excel'
        })
        downloadFile(response)
      })
    )

    // Modifier : uniquement pour les admins
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      actions.push({
        id: 'change-role',
        label: 'Changer le rôle',
        icon: <Shield className="h-4 w-4" />,
        variant: 'outline',
        onClick: async (selectedIds, selectedItems) => {
          // Ouvrir modale de changement de rôle
          openChangeRoleModal(selectedItems)
        }
      })
    }

    // Supprimer : uniquement pour les super admins
    if (currentUser.role === 'super_admin') {
      actions.push(
        createBulkActions.delete(async (selectedIds) => {
          await bulkDeleteUsers(Array.from(selectedIds))
        })
      )
    }

    return actions
  }, [currentUser])

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

// ========================================
// EXEMPLE 5 : Intégration dans RegistrationsTable
// ========================================

export function RegistrationsTableExample({ eventId, isDeletedTab }: Props) {
  const bulkActions = useMemo<BulkAction[]>(() => {
    const actions = []

    if (isDeletedTab) {
      // Restaurer plusieurs inscriptions
      actions.push({
        id: 'restore',
        label: 'Restaurer',
        icon: <RotateCcw className="h-4 w-4" />,
        variant: 'default',
        onClick: async (selectedIds) => {
          await bulkRestoreRegistrations({
            ids: Array.from(selectedIds),
            eventId
          })
        }
      })
    } else {
      // Approuver plusieurs inscriptions
      actions.push({
        id: 'approve',
        label: 'Approuver',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default',
        onClick: async (selectedIds) => {
          await bulkApproveRegistrations({
            ids: Array.from(selectedIds),
            eventId
          })
        }
      })

      // Refuser plusieurs inscriptions
      actions.push({
        id: 'refuse',
        label: 'Refuser',
        icon: <XCircle className="h-4 w-4" />,
        variant: 'outline',
        onClick: async (selectedIds) => {
          await bulkRefuseRegistrations({
            ids: Array.from(selectedIds),
            eventId
          })
        }
      })

      // Export
      actions.push(
        createBulkActions.export(async (selectedIds) => {
          const response = await bulkExportRegistrations({
            ids: Array.from(selectedIds),
            format: 'excel'
          })
          downloadFile(response)
        })
      )

      // Supprimer
      actions.push(
        createBulkActions.delete(async (selectedIds) => {
          await bulkDeleteRegistrations({
            ids: Array.from(selectedIds),
            eventId
          })
        })
      )
    }

    return actions
  }, [eventId, isDeletedTab])

  return (
    <DataTable
      columns={columns}
      data={registrations}
      enableRowSelection={true}
      bulkActions={bulkActions}
      getItemId={(registration) => registration.id}
      itemType="inscriptions"
    />
  )
}

// ========================================
// Tips & Best Practices
// ========================================

/*
✅ DO:
- Mémoriser les actions avec useMemo pour éviter les re-renders
- Gérer les erreurs dans chaque action et afficher un toast
- Utiliser requiresConfirmation pour les actions destructives
- Fournir des messages de confirmation clairs
- Re-throw les erreurs pour arrêter le spinner en cas d'échec

❌ DON'T:
- Ne pas appeler unselectAll() manuellement (géré automatiquement)
- Ne pas créer les actions inline sans useMemo (performance)
- Ne pas oublier getItemId (requis pour les bulk actions)
- Ne pas oublier de gérer les cas d'erreur

💡 TIPS:
- Utilisez actionType: 'delete' | 'export' | 'edit' pour personnaliser la modale
- Les actions peuvent accéder à selectedIds (Set<string>) ET selectedItems (T[])
- itemType personnalise les messages ("X utilisateurs sélectionnés")
- variant contrôle le style du bouton ('default', 'destructive', 'outline', etc.)
*/
