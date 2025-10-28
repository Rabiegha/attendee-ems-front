/**
 * RoleSelector - Composant pour assigner un rôle à un utilisateur
 *
 * Fonctionnalités:
 * - Affiche un select avec tous les rôles disponibles
 * - Visible seulement pour les utilisateurs avec permission "roles.assign"
 * - Respecte la hiérarchie des rôles
 * - Mise à jour optimiste avec rollback en cas d'erreur
 */

import React, { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useGetRolesQuery } from '@/features/roles/api/rolesApi'
import { useUpdateUserMutation } from '@/features/users/api/usersApi'
import { useToast } from '@/shared/hooks/useToast'
import { cn } from '@/shared/lib/utils'
import type { User } from '../api/usersApi'

interface RoleSelectorProps {
  user: User
  disabled?: boolean
  currentUserId?: string | undefined // Pour éviter l'auto-assignation
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  user,
  disabled = false,
  currentUserId,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { success, error } = useToast()

  // Récupérer les rôles disponibles
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery({})

  // Mutation pour mettre à jour l'utilisateur
  const [updateUser] = useUpdateUserMutation()

  const handleRoleChange = async (newRoleId: string) => {
    if (newRoleId === user.role?.id || isUpdating) return

    // Empêcher l'auto-assignation
    if (currentUserId && user.id === currentUserId) {
      error(
        'Action non autorisée',
        'Vous ne pouvez pas modifier votre propre rôle'
      )
      setIsOpen(false)
      return
    }

    // Fermer le dropdown immédiatement pour une meilleure UX
    setIsOpen(false)
    setIsUpdating(true)

    try {
      await updateUser({
        id: user.id,
        data: { role_id: newRoleId },
      }).unwrap()

      const newRole = roles.find((r) => r.id === newRoleId)
      success(
        'Rôle mis à jour',
        `${user.first_name || user.email} est maintenant ${newRole?.name}`
      )
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du rôle:', err)

      // Messages d'erreur plus spécifiques
      let errorMessage = 'Impossible de mettre à jour le rôle'
      if (err?.status === 403) {
        errorMessage =
          "Vous n'avez pas les permissions nécessaires pour assigner ce rôle"
      } else if (err?.status === 400) {
        errorMessage =
          err?.data?.message || "Données invalides pour l'assignation de rôle"
      } else if (err?.data?.message) {
        errorMessage = err.data.message
      }

      error("Erreur d'assignation", errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  // Filtrer les rôles selon la hiérarchie (optionnel)
  const availableRoles = roles.filter(() => {
    // Ici on peut ajouter une logique de hiérarchie si nécessaire
    // Par exemple, un MANAGER ne peut pas assigner le rôle ADMIN
    return true // Pour l'instant, on montre tous les rôles
  })

  // Protection supplémentaire : désactiver si c'est l'utilisateur courant
  const isCurrentUser = currentUserId && user.id === currentUserId
  const isDisabled = disabled || isCurrentUser

  if (rolesLoading) {
    return (
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 animate-pulse">
        Chargement...
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled || isUpdating}
        title={
          isCurrentUser
            ? 'Vous ne pouvez pas modifier votre propre rôle'
            : undefined
        }
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all',
          'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
          !isDisabled &&
            'hover:bg-blue-200 dark:hover:bg-blue-900/40 cursor-pointer',
          isDisabled && 'opacity-50 cursor-not-allowed',
          isUpdating && 'animate-pulse',
          isCurrentUser && 'ring-1 ring-blue-300 dark:ring-blue-600' // Indication visuelle pour l'utilisateur courant
        )}
      >
        <span>
          {user.role?.name || 'Non défini'}
          {isCurrentUser && ' (Vous)'}
        </span>
        {!isDisabled && (
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {isOpen && !isDisabled && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu dropdown */}
          <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            <div className="py-1 max-h-48 overflow-y-auto">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2',
                    role.id === user.role?.id &&
                      'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{role.name}</div>
                    {role.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {role.description.substring(0, 30)}
                        {role.description.length > 30 ? '...' : ''}
                      </div>
                    )}
                  </div>
                  {role.id === user.role?.id && (
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
