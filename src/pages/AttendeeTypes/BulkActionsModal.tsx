import { Modal, Button } from '@/shared/ui'
import { UserCheck, UserX } from 'lucide-react'

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  isDeletedTab: boolean
  onActivate?: () => void
  onDeactivate?: () => void
}

export const BulkActionsModal = ({
  isOpen,
  onClose,
  selectedCount,
  isDeletedTab,
  onActivate,
  onDeactivate,
}: BulkActionsModalProps) => {
  const getVariantClasses = (variant: 'success' | 'warning') => {
    const classes = {
      success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100',
      warning: 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100',
    }
    return classes[variant]
  }

  const getIconClasses = (variant: 'success' | 'warning') => {
    const classes = {
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-orange-600 dark:text-orange-400',
    }
    return classes[variant]
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
        {/* Gestion */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-3">
            Gestion
          </h3>

          {isDeletedTab && onActivate && (
            <button
              onClick={() => {
                onActivate()
                onClose()
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all hover:shadow-sm ${getVariantClasses('success')}`}
            >
              <div className={`flex-shrink-0 ${getIconClasses('success')}`}>
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Activer les types</p>
                <p className="text-sm opacity-75 mt-0.5">
                  Activer {selectedCount} type{selectedCount > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          )}

          {!isDeletedTab && onDeactivate && (
            <button
              onClick={() => {
                onDeactivate()
                onClose()
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all hover:shadow-sm ${getVariantClasses('warning')}`}
            >
              <div className={`flex-shrink-0 ${getIconClasses('warning')}`}>
                <UserX className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Désactiver les types</p>
                <p className="text-sm opacity-75 mt-0.5">
                  Désactiver {selectedCount} type{selectedCount > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          )}
        </div>
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
