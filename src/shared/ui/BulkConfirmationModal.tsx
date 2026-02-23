import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { AlertTriangle, CheckCircle, Trash2, Info } from 'lucide-react'

interface BulkConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  isLoading?: boolean
}

export const BulkConfirmationModal: React.FC<BulkConfirmationModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  isLoading = false,
}) => {
  const { t } = useTranslation('common')
  const resolvedConfirmLabel = confirmLabel ?? t('confirmation.confirm')
  const resolvedCancelLabel = cancelLabel ?? t('confirmation.cancel')

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="h-12 w-12 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-12 w-12 text-orange-500" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      default:
        return <Info className="h-12 w-12 text-blue-500" />
    }
  }

  const getConfirmButtonClasses = () => {
    const baseClasses = 'font-medium'
    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700`
      case 'warning':
        return `${baseClasses} bg-orange-500 hover:bg-orange-600 text-white dark:bg-orange-500 dark:hover:bg-orange-600`
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700`
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700`
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {getIcon()}
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onBack || onClose}
            disabled={isLoading}
          >
            {resolvedCancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClasses()}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {resolvedConfirmLabel}
              </span>
            ) : (
              resolvedConfirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
