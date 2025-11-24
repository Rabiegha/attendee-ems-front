import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { CloseButton } from '@/shared/ui/CloseButton'
import { useDeleteEventMutation } from '../api/eventsApi'
import type { EventDPO } from '../dpo/event.dpo'
import { useToast } from '@/shared/hooks/useToast'

interface DeleteEventModalProps {
  event: EventDPO | null
  isOpen: boolean
  onClose: () => void
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [deleteEvent, { isLoading }] = useDeleteEventMutation()
  const toast = useToast()

  const handleDelete = async () => {
    if (!event) return

    try {
      await deleteEvent(event.id).unwrap()
      toast.success(
        'Événement supprimé !',
        `L'événement "${event.name}" a été supprimé avec succès.`
      )
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(
        'Erreur de suppression',
        "Une erreur est survenue lors de la suppression de l'événement. Veuillez réessayer."
      )
    }
  }

  if (!isOpen || !event) return null

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
            Supprimer l'événement
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Cette action est irréversible</p>
        </div>

        {/* Message principal */}
        <div className="text-center mb-8">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Êtes-vous sûr de vouloir supprimer l'événement{' '}
            <span className="font-semibold text-gray-900 dark:text-white">"{event.name}"</span> ?
          </p>

          {/* Avertissement moderne */}
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium text-red-600 dark:text-red-400">Attention :</span> Tous
              les participants associés à cet événement seront également
              supprimés.
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
            {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteEventModal
