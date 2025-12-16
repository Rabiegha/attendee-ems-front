import React, { useState } from 'react'
import { Modal, Button, Alert } from '@/shared/ui'
import type { AttendeeType, UpdateAttendeeTypeDto } from '../api/attendeeTypesApi'

interface DeactivateAttendeeTypeModalProps {
  isOpen: boolean
  onClose: () => void
  type: AttendeeType | null
  onDeactivate: (id: string, data: UpdateAttendeeTypeDto) => Promise<void>
}

export const DeactivateAttendeeTypeModal: React.FC<DeactivateAttendeeTypeModalProps> = ({
  isOpen,
  onClose,
  type,
  onDeactivate,
}) => {
  const [isDeactivating, setIsDeactivating] = useState(false)

  const handleDeactivate = async () => {
    if (!type) return

    setIsDeactivating(true)
    try {
      await onDeactivate(type.id, { is_active: false })
      onClose()
    } catch (error) {
      console.error('Error deactivating attendee type:', error)
    } finally {
      setIsDeactivating(false)
    }
  }

  if (!type) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Désactiver le type de participant"
    >
      <div className="space-y-4">
        <Alert variant="warning">
          <p className="font-medium">Êtes-vous sûr de vouloir désactiver ce type ?</p>
          <p className="text-sm mt-1">
            Le type <strong>{type.name}</strong> sera désactivé et n'apparaîtra plus dans les listes actives.
            Vous pourrez le restaurer plus tard si nécessaire.
          </p>
        </Alert>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: type.color_hex || '#4F46E5',
                color: type.text_color_hex || '#FFFFFF',
              }}
            >
              {type.icon || type.code.substring(0, 2)}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{type.code}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={isDeactivating}>
          Annuler
        </Button>
        <Button
          variant="default"
          onClick={handleDeactivate}
          disabled={isDeactivating}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isDeactivating ? 'Désactivation...' : 'Désactiver'}
        </Button>
      </div>
    </Modal>
  )
}
