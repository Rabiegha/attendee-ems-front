import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { AlertTriangle } from 'lucide-react'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { getRegistrationFullName } from '../utils/registration-helpers'

interface PermanentDeleteRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO | null
  onPermanentDelete: () => Promise<void>
}

export const PermanentDeleteRegistrationModal: React.FC<
  PermanentDeleteRegistrationModalProps
> = ({ isOpen, onClose, registration, onPermanentDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onPermanentDelete()
      onClose()
    } catch (error) {
      console.error('Error permanently deleting registration:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!registration) return null

  const fullName = getRegistrationFullName(registration)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer définitivement"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer définitivement l'inscription de{' '}
              <span className="font-semibold">{fullName}</span> ?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ Cette action est irréversible. Les données seront définitivement
              perdues.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
