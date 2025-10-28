import React from 'react'
import { Trash2, Download, Edit, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { BulkConfirmModal } from '@/shared/ui/BulkConfirmModal'

export interface BulkAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  requiresConfirmation?: boolean
  confirmationMessage?: string
  actionType?: 'delete' | 'export' | 'edit'
  onClick: (selectedIds: Set<string>, selectedItems: any[]) => void | Promise<void>
}

interface BulkActionsProps {
  selectedCount: number
  selectedIds: Set<string>
  selectedItems: any[]
  actions: BulkAction[]
  onClearSelection: () => void
  isLoading?: boolean
  itemType?: string // 'attendees', 'events', 'registrations'
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  selectedIds,
  selectedItems,
  actions,
  onClearSelection,
  isLoading = false,
  itemType = 'éléments'
}) => {
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null)
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean
    action: BulkAction | null
  }>({ isOpen: false, action: null })

  const handleActionClick = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmModal({ isOpen: true, action })
      return
    }

    try {
      setLoadingAction(action.id)
      await action.onClick(selectedIds, selectedItems)
    } catch (error) {
      console.error(`Error executing bulk action ${action.id}:`, error)
    } finally {
      setLoadingAction(null)
    }
  }

  const handleConfirmAction = async () => {
    if (!confirmModal.action) return

    try {
      setLoadingAction(confirmModal.action.id)
      await confirmModal.action.onClick(selectedIds, selectedItems)
    } catch (error) {
      console.error(`Error executing bulk action ${confirmModal.action.id}:`, error)
    } finally {
      setLoadingAction(null)
      setConfirmModal({ isOpen: false, action: null })
    }
  }

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, action: null })
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="h-4 w-4" />
                Tout désélectionner
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={() => handleActionClick(action)}
                disabled={isLoading || loadingAction !== null}
                className="flex items-center space-x-2"
              >
                {loadingAction === action.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  action.icon
                )}
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <BulkConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        actionType={confirmModal.action?.actionType || 'delete'}
        itemType={itemType}
        selectedCount={selectedCount}
        isLoading={loadingAction !== null}
      />
    </>
  )
}

// Actions prédéfinies courantes
export const createBulkActions = {
  delete: (onDelete: (selectedIds: Set<string>, selectedItems: any[]) => void | Promise<void>): BulkAction => ({
    id: 'delete',
    label: 'Supprimer',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive' as const,
    requiresConfirmation: true,
    confirmationMessage: 'Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ? Cette action est irréversible.',
    onClick: onDelete
  }),

  export: (onExport: (selectedIds: Set<string>, selectedItems: any[]) => void | Promise<void>): BulkAction => ({
    id: 'export',
    label: 'Exporter',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: onExport
  }),

  edit: (onEdit: (selectedIds: Set<string>, selectedItems: any[]) => void | Promise<void>): BulkAction => ({
    id: 'edit',
    label: 'Modifier',
    icon: <Edit className="h-4 w-4" />,
    variant: 'outline' as const,
    onClick: onEdit
  })
}