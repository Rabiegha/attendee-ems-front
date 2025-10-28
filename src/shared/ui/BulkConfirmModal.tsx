import React from 'react'
import { AlertTriangle, Download, Trash2 } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'

interface BulkConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  actionType: 'delete' | 'export' | 'edit'
  selectedCount: number
  itemType: string // 'attendees', 'events', 'registrations'
}

const actionConfig = {
  delete: {
    icon: Trash2,
    title: 'Supprimer les éléments',
    color: 'red',
    buttonText: 'Supprimer',
    loadingText: 'Suppression...',
    getMessage: (count: number, itemType: string) => 
      `Êtes-vous sûr de vouloir supprimer ${count} ${itemType} sélectionné${count > 1 ? 's' : ''} ?`,
    warning: 'Cette action est irréversible.'
  },
  export: {
    icon: Download,
    title: 'Exporter les éléments',
    color: 'blue',
    buttonText: 'Exporter',
    loadingText: 'Export en cours...',
    getMessage: (count: number, itemType: string) => 
      `Exporter ${count} ${itemType} sélectionné${count > 1 ? 's' : ''} au format CSV ?`,
    warning: null
  },
  edit: {
    icon: AlertTriangle,
    title: 'Modifier les éléments',
    color: 'yellow',
    buttonText: 'Modifier',
    loadingText: 'Modification...',
    getMessage: (count: number, itemType: string) => 
      `Modifier ${count} ${itemType} sélectionné${count > 1 ? 's' : ''} ?`,
    warning: 'Cette action affectera tous les éléments sélectionnés.'
  }
}

export const BulkConfirmModal: React.FC<BulkConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  actionType,
  selectedCount,
  itemType
}) => {
  const config = actionConfig[actionType]
  const Icon = config.icon

  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      icon: 'text-red-500',
      button: 'destructive' as const
    },
    blue: {
      bg: 'bg-blue-500/10',
      icon: 'text-blue-500',
      button: 'default' as const
    },
    yellow: {
      bg: 'bg-yellow-500/10',
      icon: 'text-yellow-500',
      button: 'default' as const
    }
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${colors.bg} mb-4`}>
          <Icon className={`h-8 w-8 ${colors.icon}`} />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {config.getMessage(selectedCount, itemType)}
        </p>
        
        {config.warning && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {config.warning}
          </p>
        )}

        <div className="flex justify-center space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant={colors.button}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? config.loadingText : config.buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}