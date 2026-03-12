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

  const getButtonVariant = (): 'default' | 'destructive' => {
    return variant === 'danger' ? 'destructive' : 'default'
  }

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
      default:
        return ''
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
          <Button
            variant={getButtonVariant()}
            onClick={onConfirm}
            loading={isLoading}
            className={getConfirmButtonClasses()}
          >
            {resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
