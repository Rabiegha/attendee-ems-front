import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui'

interface BulkStatusChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  onConfirm: (status: string) => void
  selectedCount: number
}

const STATUS_OPTIONS = [
  {
    value: 'approved',
    label: 'Approuvé',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-500',
    description: 'Inscription approuvée et confirmée',
  },
  {
    value: 'refused',
    label: 'Refusé',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-500',
    description: 'Inscription refusée',
  },
  {
    value: 'awaiting',
    label: 'En attente',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-500',
    description: 'En attente de validation',
  },
  {
    value: 'cancelled',
    label: 'Annulé',
    icon: Ban,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-500',
    description: 'Inscription annulée',
  },
]

export const BulkStatusChangeModal: React.FC<BulkStatusChangeModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  selectedCount,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  const handleConfirm = () => {
    if (!selectedStatus) return
    onConfirm(selectedStatus)
    // Ne pas fermer ni réinitialiser ici - laissez le parent gérer
    // Le parent fermera le modal après avoir ouvert le modal de confirmation
  }

  const handleClose = () => {
    onClose()
    setSelectedStatus('')
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Changer le statut">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sélectionnez le nouveau statut pour{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {selectedCount} inscription{selectedCount > 1 ? 's' : ''}
          </span>
        </p>

        <div className="space-y-2">
          {STATUS_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedStatus === option.value

            return (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${option.borderColor} ${option.bgColor}`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                } cursor-pointer`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? option.color : 'text-gray-400'}`} />
                <div className="text-left flex-1">
                  <div className={`font-medium ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className={`h-5 w-5 ${option.color}`} />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onBack || handleClose}
          >
            Retour
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!selectedStatus}
          >
            Continuer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
