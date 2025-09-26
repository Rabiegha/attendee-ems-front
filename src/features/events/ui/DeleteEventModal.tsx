import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
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
  onClose
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
        'Une erreur est survenue lors de la suppression de l\'événement. Veuillez réessayer.'
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
      {/* Header personnalisé avec icône d'alerte */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Supprimer l'événement
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Êtes-vous sûr de vouloir supprimer l'événement{' '}
          <span className="font-semibold text-gray-900 dark:text-white">"{event.name}"</span> ?
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md p-3 mb-6 transition-colors duration-200">
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>Attention :</strong> Cette action est irréversible. Tous les participants 
            associés à cet événement seront également supprimés.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteEventModal
