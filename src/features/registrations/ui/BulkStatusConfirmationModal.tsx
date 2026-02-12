import React from 'react'
import { Modal, Button } from '@/shared/ui'
import { CheckCircle, XCircle, Mail, X } from 'lucide-react'

interface BulkStatusConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  status: 'approved' | 'refused'
  selectedCount: number
  onConfirm: (sendEmail: boolean) => Promise<void>
  isLoading?: boolean
}

export const BulkStatusConfirmationModal: React.FC<BulkStatusConfirmationModalProps> = ({
  isOpen,
  onClose,
  onBack,
  status,
  selectedCount,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = async (sendEmail: boolean) => {
    await onConfirm(sendEmail)
    onClose()
  }

  const isApproval = status === 'approved'
  const statusLabel = isApproval ? 'approuver' : 'refuser'
  const statusLabelCapitalized = isApproval ? 'Approuver' : 'Refuser'
  const iconColor = isApproval ? 'text-green-600' : 'text-red-600'
  const bgColor = isApproval ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
  const borderColor = isApproval ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
  const buttonColor = isApproval 
    ? 'bg-green-600 hover:bg-green-700 text-white'
    : 'bg-red-600 hover:bg-red-700 text-white'

  const Icon = isApproval ? CheckCircle : XCircle

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${statusLabelCapitalized} les inscriptions`}
      maxWidth="md"
      contentPadding={false}
    >
      {/* Contenu scrollable */}
      <div className="p-6 space-y-6">
        {/* Message */}
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Vous êtes sur le point de {statusLabel} :
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {selectedCount} inscription{selectedCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Souhaitez-vous envoyer un email de notification à tous les participants ?
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {isApproval 
              ? "L'email de confirmation sera envoyé selon les paramètres configurés dans l'onglet \"Emails\" de l'événement (avec ou sans QR code)."
              : "Un email de refus sera envoyé à tous les participants concernés."
            }
          </p>
        </div>
      </div>

      {/* Footer avec boutons - TOUJOURS VISIBLE */}
      <div className="sticky bottom-0 border-t-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-6 py-4">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleConfirm(true)}
            disabled={isLoading}
            className={`w-full ${buttonColor} font-medium`}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? 'Envoi en cours...' : `${statusLabelCapitalized} et envoyer les emails`}
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleConfirm(false)}
            disabled={isLoading}
            className="w-full"
          >
            <Icon className={`h-4 w-4 mr-2 ${iconColor}`} />
            {statusLabelCapitalized} sans envoyer d'emails
          </Button>
          
          <Button
            variant="outline"
            onClick={onBack || onClose}
            disabled={isLoading}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    </Modal>
  )
}
