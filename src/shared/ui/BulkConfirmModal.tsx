import React from 'react'
import { AlertTriangle, Download, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'

interface BulkConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  actionType: 'delete' | 'export' | 'edit'
  selectedCount: number
  itemType: string // 'attendees', 'events', 'registrations'
}

export const BulkConfirmModal: React.FC<BulkConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  actionType,
  selectedCount,
  itemType,
}) => {
  const { t } = useTranslation('common')

  const actionConfig = {
    delete: {
      icon: Trash2,
      title: t('bulk.delete_title'),
      color: 'red',
      buttonText: t('bulk.delete_button'),
      loadingText: t('bulk.delete_loading'),
      getMessage: (count: number, itemType: string) =>
        t('bulk.delete_message', { count, itemType }),
      warning: t('bulk.delete_warning'),
    },
    export: {
      icon: Download,
      title: t('bulk.export_title'),
      color: 'blue',
      buttonText: t('bulk.export_button'),
      loadingText: t('bulk.export_loading'),
      getMessage: (count: number, itemType: string) =>
        t('bulk.export_message', { count, itemType }),
      warning: null,
    },
    edit: {
      icon: AlertTriangle,
      title: t('bulk.edit_title'),
      color: 'yellow',
      buttonText: t('bulk.edit_button'),
      loadingText: t('bulk.edit_loading'),
      getMessage: (count: number, itemType: string) =>
        t('bulk.edit_message', { count, itemType }),
      warning: t('bulk.edit_warning'),
    },
  }

  const config = actionConfig[actionType]
  const Icon = config.icon

  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      icon: 'text-red-500',
      button: 'destructive' as const,
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      button: 'default' as const,
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      icon: 'text-yellow-500',
      button: 'default' as const,
    },
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div
          className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${colors.bg} mb-4`}
        >
          <Icon className={`h-8 w-8 ${colors.icon}`} />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {config.getMessage(selectedCount, itemType)}
        </p>

        {config.warning && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {config.warning}
          </p>
        )}

        <div className="flex justify-center space-x-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('app.cancel')}
          </Button>
          <Button
            variant={colors.button}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? config.loadingText : config.buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
