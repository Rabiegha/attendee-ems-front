import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { getRegistrationFullName } from '../utils/registration-helpers'

interface RestoreRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO | null
  onRestore: () => Promise<void>
}

export const RestoreRegistrationModal: React.FC<RestoreRegistrationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onRestore,
}) => {
  const { t } = useTranslation(['events', 'common'])
  const [isRestoring, setIsRestoring] = React.useState(false)

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      await onRestore()
      onClose()
    } catch (error) {
      console.error('Error restoring registration:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  if (!registration) return null

  const fullName = getRegistrationFullName(registration)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('events:registrations.restore_title')}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {t('events:registrations.restore_confirm_message')}{' '}
          <span className="font-semibold">{fullName}</span> ?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('events:registrations.restore_description')}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRestoring}
          >
            {t('common:app.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? t('common:app.restoring') : t('common:app.restore')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
