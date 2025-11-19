/**
 * ActionButtons - Composant d'actions standardisé pour les tableaux
 * 
 * Affiche des boutons Edit/Delete avec icônes uniformisées
 * Utilisé dans tous les tableaux pour garantir la cohérence visuelle
 */

import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { Can } from '@/shared/acl/guards/Can'
import type { Actions, Subjects } from '@/shared/acl/app-ability'

export interface ActionButtonsProps {
  /** Callback pour l'édition */
  onEdit?: () => void
  /** Callback pour la suppression */
  onDelete?: () => void
  /** Label accessible pour le bouton Edit */
  editLabel?: string
  /** Label accessible pour le bouton Delete */
  deleteLabel?: string
  /** Permissions CASL pour l'édition */
  canEdit?: {
    do: Actions
    on: Subjects
    data?: any
  }
  /** Permissions CASL pour la suppression */
  canDelete?: {
    do: Actions
    on: Subjects
    data?: any
  }
  /** Taille des boutons */
  size?: 'sm' | 'default' | 'lg'
  /** Afficher uniquement les icônes (mode compact) */
  iconOnly?: boolean
  /** Enfants à afficher avant les boutons par défaut */
  children?: React.ReactNode
}

/**
 * Composant ActionButtons - Actions standardisées pour tableaux
 * 
 * @example
 * ```tsx
 * <ActionButtons
 *   onEdit={() => handleEdit(user)}
 *   onDelete={() => handleDelete(user)}
 *   canEdit={{ do: 'update', on: 'User', data: user }}
 *   canDelete={{ do: 'delete', on: 'User', data: user }}
 *   size="sm"
 *   iconOnly
 * />
 * ```
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  editLabel = 'Modifier',
  deleteLabel = 'Supprimer',
  canEdit,
  canDelete,
  size = 'sm',
  iconOnly = true,
  children,
}) => {
  return (
    <div className="flex items-center justify-end gap-0">
      {/* Boutons personnalisés */}
      {children}

      {/* Bouton Edit */}
      {onEdit && (
        canEdit ? (
          <Can do={canEdit.do} on={canEdit.on} data={canEdit.data}>
            <Button
              variant="ghost"
              size={size}
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              aria-label={editLabel}
              title={editLabel}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[32px] p-1.5"
            >
              {iconOnly ? (
                <Edit2 className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <Edit2 className="h-4 w-4 shrink-0 mr-1.5" />
                  {editLabel}
                </>
              )}
            </Button>
          </Can>
        ) : (
          <Button
            variant="ghost"
            size={size}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            aria-label={editLabel}
            title={editLabel}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[32px] p-1.5"
          >
            {iconOnly ? (
              <Edit2 className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <Edit2 className="h-4 w-4 shrink-0 mr-1.5" />
                {editLabel}
              </>
            )}
          </Button>
        )
      )}

      {/* Bouton Delete */}
      {onDelete && (
        canDelete ? (
          <Can do={canDelete.do} on={canDelete.on} data={canDelete.data}>
            <Button
              variant="ghost"
              size={size}
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              aria-label={deleteLabel}
              title={deleteLabel}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
            >
              {iconOnly ? (
                <Trash2 className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 shrink-0 mr-1.5" />
                  {deleteLabel}
                </>
              )}
            </Button>
          </Can>
        ) : (
          <Button
            variant="ghost"
            size={size}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label={deleteLabel}
            title={deleteLabel}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
          >
            {iconOnly ? (
              <Trash2 className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 shrink-0 mr-1.5" />
                {deleteLabel}
              </>
            )}
          </Button>
        )
      )}
    </div>
  )
}
