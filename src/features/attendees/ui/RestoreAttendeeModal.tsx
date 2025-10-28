import React from 'react'
import { RotateCcw } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { CloseButton } from '@/shared/ui/CloseButton'
import type { AttendeeDPO } from '../dpo/attendee.dpo'

interface RestoreAttendeeModalProps {
  attendee: AttendeeDPO | null
  isOpen: boolean
  onClose: () => void
  onRestore: (attendeeId: string) => Promise<void>
  isLoading?: boolean
}

export const RestoreAttendeeModal: React.FC<RestoreAttendeeModalProps> = ({
  attendee,
  isOpen,
  onClose,
  onRestore,
  isLoading = false,
}) => {
  const handleRestore = async () => {
    if (!attendee) return

    try {
      await onRestore(attendee.id)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la restauration:', error)
    }
  }

  if (!isOpen || !attendee) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
      contentPadding={false}
    >
      <div className="relative p-8">
        {/* Bouton fermeture moderne */}
        <CloseButton onClick={onClose} />

        {/* Icône et titre moderne */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 mb-6">
            <RotateCcw className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Restaurer le participant
          </h3>

          <div className="text-gray-600 dark:text-gray-300 space-y-2">
            <p className="text-lg">
              <span className="font-semibold text-gray-900 dark:text-white">
                {attendee.displayName}
              </span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {attendee.email}
            </p>
          </div>
        </div>

        {/* Message d'information */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
          <div className="text-green-800 dark:text-green-200">
            <p className="font-medium mb-2">Cette action va :</p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Réactiver le participant</li>
              <li>Le rendre visible dans la liste principale</li>
              <li>Permettre sa participation aux événements</li>
              <li>Restaurer l'accès à toutes ses données</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            Annuler
          </Button>
          <Button
            onClick={handleRestore}
            disabled={isLoading}
            className="min-w-[120px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Restauration...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Restaurer</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
