import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { CloseButton } from '@/shared/ui/CloseButton'
import type { AttendeeDPO } from '../dpo/attendee.dpo'
import { useToast } from '@/shared/hooks/useToast'

interface DeleteAttendeeModalProps {
  attendee: AttendeeDPO | null
  isOpen: boolean
  onClose: () => void
  onDelete: (attendeeId: string) => Promise<void>
  isLoading?: boolean
}

export const DeleteAttendeeModal: React.FC<DeleteAttendeeModalProps> = ({
  attendee,
  isOpen,
  onClose,
  onDelete,
  isLoading = false,
}) => {
  const toast = useToast()

  const handleDelete = async () => {
    if (!attendee) return

    try {
      await onDelete(attendee.id)
      toast.success(
        'Participant supprimé !',
        `${attendee.displayName} a été supprimé avec succès.`
      )
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(
        'Erreur de suppression',
        'Une erreur est survenue lors de la suppression du participant. Veuillez réessayer.'
      )
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
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Supprimer le participant
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Cette action peut être annulée</p>
        </div>

        {/* Message principal */}
        <div className="text-center mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Êtes-vous sûr de vouloir supprimer{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {attendee.displayName}
            </span>{' '}
            ?
          </p>

          {/* Information moderne */}
          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-orange-600 dark:text-orange-400">Info :</span> Le
              participant sera marqué comme inactif et pourra être restauré
              depuis l'onglet "Participants supprimés".
            </p>
          </div>
        </div>

        {/* Actions modernes */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-xl"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
