import { Modal, Button } from '@/shared/ui'
import { Trash2, RotateCcw } from 'lucide-react'

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  isDeletedTab: boolean
  onDelete?: () => void
  onRestore?: () => void
}

export const BulkActionsModal = ({
  isOpen,
  onClose,
  selectedCount,
  isDeletedTab,
  onDelete,
  onRestore,
}: BulkActionsModalProps) => {
  const getVariantClasses = (variant: 'warning' | 'success') => {
    const classes = {
      warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100',
      success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100',
    }
    return classes[variant]
  }

  const getIconClasses = (variant: 'warning' | 'success') => {
    const classes = {
      warning: 'text-orange-600 dark:text-orange-400',
      success: 'text-green-600 dark:text-green-400',
    }
    return classes[variant]
  }

  const getButtonVariant = (variant: 'warning' | 'success') => {
    const variants = {
      warning: 'warning' as const,
      success: 'success' as const,
    }
    return variants[variant]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Actions groupées (${selectedCount} sélectionné${selectedCount > 1 ? 's' : ''})`}
      size="2xl"
      contentPadding={false}
    >
      <div className="p-6 space-y-4">
        {isDeletedTab ? (
          /* Actions pour onglet supprimés */
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
              Gestion des suppressions
            </h3>
            {onRestore && (
              <button
                onClick={() => {
                  onRestore()
                  onClose()
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all hover:shadow-sm ${getVariantClasses('success')}`}
              >
                <div className={`flex-shrink-0 ${getIconClasses('success')}`}>
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Réactiver les utilisateurs</p>
                  <p className="text-sm opacity-75 mt-0.5">
                    Réactiver {selectedCount} utilisateur{selectedCount > 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            )}
          </div>
        ) : (
          /* Actions pour onglet actifs */
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
              Suppression
            </h3>
            {onDelete && (
              <button
                onClick={() => {
                  onDelete()
                  onClose()
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all hover:shadow-sm ${getVariantClasses('warning')}`}
              >
                <div className={`flex-shrink-0 ${getIconClasses('warning')}`}>
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Désactiver les utilisateurs</p>
                  <p className="text-sm opacity-75 mt-0.5">
                    Désactiver {selectedCount} utilisateur{selectedCount > 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </Modal>
  )
}
