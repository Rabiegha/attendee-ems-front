import React from 'react'
import { Modal, Button } from '@/shared/ui'
import { XCircle, Mail, X } from 'lucide-react'

interface RejectionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  registrationName: string
  onReject: (sendEmail: boolean) => Promise<void>
  isRejecting?: boolean
}

export const RejectionConfirmationModal: React.FC<RejectionConfirmationModalProps> = ({
  isOpen,
  onClose,
  registrationName,
  onReject,
  isRejecting = false,
}) => {
  const handleReject = async (sendEmail: boolean) => {
    await onReject(sendEmail)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Refuser l'inscription"
      maxWidth="md"
      contentPadding={false}
    >
      {/* Contenu scrollable */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Message */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Vous êtes sur le point de refuser l'inscription de :
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {registrationName}
          </p>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Souhaitez-vous envoyer un email de notification à ce participant ?
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            L'email informera le participant que son inscription a été refusée.
          </p>
        </div>
      </div>

      {/* Footer avec boutons - TOUJOURS VISIBLE */}
      <div className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-6 py-4">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleReject(true)}
            disabled={isRejecting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isRejecting ? 'Envoi en cours...' : 'Refuser et envoyer le mail'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleReject(false)}
            disabled={isRejecting}
            className="w-full"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Refuser sans envoyer de mail
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isRejecting}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  )
}
