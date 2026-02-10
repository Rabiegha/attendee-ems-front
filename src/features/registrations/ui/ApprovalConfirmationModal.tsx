import React from 'react'
import { Modal, Button } from '@/shared/ui'
import { CheckCircle, Mail, X } from 'lucide-react'

interface ApprovalConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  registrationName: string
  onApprove: (sendEmail: boolean) => Promise<void>
  isApproving?: boolean
}

export const ApprovalConfirmationModal: React.FC<ApprovalConfirmationModalProps> = ({
  isOpen,
  onClose,
  registrationName,
  onApprove,
  isApproving = false,
}) => {
  const handleApprove = async (sendEmail: boolean) => {
    await onApprove(sendEmail)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approuver l'inscription"
      maxWidth="md"
      contentPadding={false}
    >
      {/* Contenu scrollable */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Message */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Vous êtes sur le point d'approuver l'inscription de :
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {registrationName}
          </p>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Souhaitez-vous envoyer un email de confirmation à ce participant ?
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            L'email sera envoyé selon les paramètres configurés dans l'onglet "Emails" de l'événement (avec ou sans QR code).
          </p>
        </div>
      </div>

      {/* Footer avec boutons - TOUJOURS VISIBLE */}
      <div className="border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-6 py-4">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleApprove(true)}
            disabled={isApproving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isApproving ? 'Envoi en cours...' : 'Approuver et envoyer le mail'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleApprove(false)}
            disabled={isApproving}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuver sans envoyer de mail
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isApproving}
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
