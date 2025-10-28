import React from 'react'
import { Trash, AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { CloseButton } from '@/shared/ui/CloseButton'
import type { AttendeeDPO } from '../dpo/attendee.dpo'

interface PermanentDeleteAttendeeModalProps {
  attendee: AttendeeDPO | null
  isOpen: boolean
  onClose: () => void
  onPermanentDelete: (attendeeId: string) => Promise<void>
  isLoading?: boolean
}

export const PermanentDeleteAttendeeModal: React.FC<
  PermanentDeleteAttendeeModalProps
> = ({ attendee, isOpen, onClose, onPermanentDelete, isLoading = false }) => {
  const handlePermanentDelete = async () => {
    if (!attendee) return

    try {
      await onPermanentDelete(attendee.id)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error)
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
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 mb-6">
            <Trash className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Suppression définitive
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

        {/* Avertissement critique */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-red-800 dark:text-red-200">
              <p className="font-bold mb-2">
                ⚠️ ATTENTION : Cette action est irréversible !
              </p>
              <p className="font-medium mb-2">
                Cette suppression définitive va :
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>
                  <strong>Supprimer définitivement</strong> ce participant
                </li>
                <li>
                  <strong>Supprimer toutes ses inscriptions</strong> aux
                  événements
                </li>
                <li>
                  <strong>Supprimer toutes ses statistiques</strong> et données
                  de participation
                </li>
                <li>
                  <strong>Supprimer son historique complet</strong> dans le
                  système
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Message final */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            <strong>Cette action ne peut pas être annulée.</strong>
            <br />
            Toutes les données associées à ce participant seront perdues
            définitivement.
          </p>
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
            onClick={handlePermanentDelete}
            disabled={isLoading}
            className="min-w-[180px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Suppression...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash className="w-4 h-4" />
                <span>Supprimer définitivement</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
