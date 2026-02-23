import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { 
  Download, 
  RefreshCw, 
  Users, 
  UserCheck, 
  Undo2, 
  LogOut,
  RotateCcw,
  Trash2
} from 'lucide-react'

interface BulkAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'success' | 'warning' | 'danger'
  disabled?: boolean
}

interface ActionCategory {
  id: string
  label: string
  actions: BulkAction[]
}

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  isDeletedTab: boolean
  onExport: () => void
  onChangeStatus: () => void
  onChangeType: () => void
  onCheckIn: () => void
  onUndoCheckIn: () => void
  onCheckOut: () => void
  onUndoCheckOut: () => void
  onDelete: () => void
  onRestore: () => void
  onPermanentDelete: () => void
}

export const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  isDeletedTab,
  onExport,
  onChangeStatus,
  onChangeType,
  onCheckIn,
  onUndoCheckIn,
  onCheckOut,
  onUndoCheckOut,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  const { t } = useTranslation(['events', 'common'])

  const getVariantClasses = (variant: string = 'default') => {
    const base = "group relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer"
    
    switch (variant) {
      case 'success':
        return `${base} border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20`
      case 'warning':
        return `${base} border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20`
      case 'danger':
        return `${base} border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20`
      default:
        return `${base} border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20`
    }
  }

  const getIconClasses = (variant: string = 'default') => {
    const base = "h-5 w-5 transition-colors"
    
    switch (variant) {
      case 'success':
        return `${base} text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300`
      case 'warning':
        return `${base} text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300`
      case 'danger':
        return `${base} text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300`
      default:
        return `${base} text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300`
    }
  }

  const categories: ActionCategory[] = isDeletedTab 
    ? [
        // Mode supprimés
        {
          id: 'restore',
          label: t('events:registrations.bulk_management_deletions'),
          actions: [
            {
              id: 'restore',
              label: t('events:registrations.bulk_restore_label'),
              description: t('events:registrations.bulk_restore_desc'),
              icon: <RotateCcw className={getIconClasses('success')} />,
              onClick: () => {
                onRestore()
                onClose()
              },
              variant: 'success',
            },
            {
              id: 'permanent-delete',
              label: 'Supprimer définitivement',
              description: '⚠️ Action irréversible - Suppression permanente',
              icon: <Trash2 className={getIconClasses('danger')} />,
              onClick: () => {
                onPermanentDelete()
                onClose()
              },
              variant: 'danger',
            },
          ],
        },
      ]
    : [
        // Mode actifs
        {
          id: 'export',
          label: t('events:registrations.bulk_management_export'),
          actions: [
            {
              id: 'export',
              label: t('events:registrations.bulk_export_label'),
              description: t('events:registrations.bulk_export_desc'),
              icon: <Download className={getIconClasses()} />,
              onClick: () => {
                onExport()
                onClose()
              },
            },
          ],
        },
        {
          id: 'management',
          label: t('events:registrations.bulk_management_registrations'),
          actions: [
            {
              id: 'change-status',
              label: t('events:registrations.bulk_change_status_label'),
              description: t('events:registrations.bulk_change_status_desc'),
              icon: <RefreshCw className={getIconClasses()} />,
              onClick: () => {
                onChangeStatus()
                onClose()
              },
            },
            {
              id: 'change-type',
              label: t('events:registrations.bulk_change_type_label'),
              description: t('events:registrations.bulk_change_type_desc'),
              icon: <Users className={getIconClasses()} />,
              onClick: () => {
                onChangeType()
                onClose()
              },
            },
          ],
        },
        {
          id: 'presence',
          label: t('events:registrations.bulk_management_presence'),
          actions: [
            {
              id: 'check-in',
              label: t('events:registrations.bulk_checkin_label'),
              description: t('events:registrations.bulk_checkin_desc'),
              icon: <UserCheck className={getIconClasses('success')} />,
              onClick: () => {
                onCheckIn()
                onClose()
              },
              variant: 'success',
            },
            {
              id: 'undo-check-in',
              label: t('events:registrations.bulk_undo_checkin_label'),
              description: t('events:registrations.bulk_undo_checkin_desc'),
              icon: <Undo2 className={getIconClasses('warning')} />,
              onClick: () => {
                onUndoCheckIn()
                onClose()
              },
              variant: 'warning',
            },
            {
              id: 'check-out',
              label: t('events:registrations.bulk_checkout_label'),
              description: t('events:registrations.bulk_checkout_desc'),
              icon: <LogOut className={getIconClasses('success')} />,
              onClick: () => {
                onCheckOut()
                onClose()
              },
              variant: 'success',
            },
            {
              id: 'undo-check-out',
              label: t('events:registrations.bulk_undo_checkout_label'),
              description: t('events:registrations.bulk_undo_checkout_desc'),
              icon: <Undo2 className={getIconClasses('warning')} />,
              onClick: () => {
                onUndoCheckOut()
                onClose()
              },
              variant: 'warning',
            },
          ],
        },
        {
          id: 'deletion',
          label: t('events:registrations.bulk_management_deletion'),
          actions: [
            {
              id: 'delete',
              label: t('events:registrations.bulk_delete_label'),
              description: t('events:registrations.bulk_delete_desc'),
              icon: <Trash2 className={getIconClasses('danger')} />,
              onClick: () => {
                onDelete()
                onClose()
              },
              variant: 'danger',
            },
          ],
        },
      ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('events:registrations.bulk_actions_title', { count: selectedCount })}
      size="2xl"
      contentPadding={false}
    >
      {/* Contenu scrollable avec le bon padding */}
      <div className="p-6 space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              {category.label}
            </h3>
            <div className="grid gap-3">
              {category.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={getVariantClasses(action.variant)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {action.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-white mb-0.5">
                      {action.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer fixe non-scrollable */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {t('events:registrations.bulk_selected_count', { count: selectedCount })}
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
        >
          {t('common:app.cancel')}
        </button>
      </div>
    </Modal>
  )
}
