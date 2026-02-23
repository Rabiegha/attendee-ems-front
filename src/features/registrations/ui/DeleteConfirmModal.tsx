import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  attendeeName: string
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  attendeeName,
}) => {
  const { t } = useTranslation(['events', 'common'])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {t('events:registrations.delete_registration_title')}
        </h3>

        <p className="text-gray-400 mb-6">
          {t('events:registrations.delete_confirm_message')}{' '}
          <span className="font-medium text-white">{attendeeName}</span> ?
          <br />
          <span className="text-sm">{t('events:registrations.delete_irreversible')}</span>
        </p>

        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common:app.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t('common:app.deleting') : t('common:app.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
