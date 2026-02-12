import React, { useState } from 'react'
import { Users, Check } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui'
import { EventAttendeeType } from '@/features/events/api/eventsApi'

interface BulkAttendeeTypeChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  onConfirm: (attendeeTypeId: string) => Promise<void>
  selectedCount: number
  attendeeTypes: EventAttendeeType[]
}

export const BulkAttendeeTypeChangeModal: React.FC<BulkAttendeeTypeChangeModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onConfirm,
  selectedCount,
  attendeeTypes,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!selectedType) return

    setIsSubmitting(true)
    try {
      await onConfirm(selectedType)
      onClose()
    } catch (error) {
      console.error('Error updating attendee types:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Ajouter l'option "Aucun" à la liste et filtrer les types désactivés
  const allOptions = [
    {
      id: 'none',
      name: 'Aucun',
      color_hex: '#9ca3af',
      is_active: true,
    },
    ...attendeeTypes
      .filter(t => t.attendeeType.is_active) // Ne garder que les types actifs
      .map(t => ({
        id: t.id, // ID de la liaison event_attendee_type
        name: t.attendeeType.name,
        color_hex: t.color_hex || t.attendeeType.color_hex,
        is_active: t.is_active,
      }))
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Changer le type de participant"
      maxWidth="2xl"
      contentPadding={false}
    >
      <div className="p-6 space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sélectionnez le nouveau type pour les{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {selectedCount} inscriptions sélectionnées
          </span>
          .
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allOptions.map((option) => {
            const isSelected = selectedType === option.id
            const isDeactivated = !option.is_active

            return (
              <div
                key={option.id}
                onClick={() => setSelectedType(option.id)}
                className={`
                  relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDeactivated
                      ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: option.color_hex || '#9ca3af' }}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white block">
                    {option.name}
                  </span>
                  {isDeactivated && (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Désactivé
                    </span>
                  )}
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onBack || onClose}
            disabled={isSubmitting}
          >
            Retour
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedType || isSubmitting}
            loading={isSubmitting}
          >
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
