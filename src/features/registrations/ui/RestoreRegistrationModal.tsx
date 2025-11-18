import React from 'react'
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
      title="Restaurer l'inscription"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          Voulez-vous vraiment restaurer l'inscription de{' '}
          <span className="font-semibold">{fullName}</span> ?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Cette action réactivera l'inscription et elle redeviendra visible dans la liste
          principale.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRestoring}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? 'Restauration...' : 'Restaurer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
