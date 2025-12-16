import React, { useState } from 'react'
import { Modal, Button } from '@/shared/ui'
import type { AttendeeType, UpdateAttendeeTypeDto } from '../api/attendeeTypesApi'

interface RestoreAttendeeTypeModalProps {
  isOpen: boolean
  onClose: () => void
  type: AttendeeType | null
  onRestore: (id: string, data: UpdateAttendeeTypeDto) => Promise<void>
}

export const RestoreAttendeeTypeModal: React.FC<RestoreAttendeeTypeModalProps> = ({
  isOpen,
  onClose,
  type,
  onRestore,
}) => {
  const [isRestoring, setIsRestoring] = useState(false)

  const handleRestore = async () => {
    if (!type) return

    setIsRestoring(true)
    try {
      await onRestore(type.id, { is_active: true })
      onClose()
    } catch (error) {
      console.error('Error restoring attendee type:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  if (!type) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restaurer le type de participant"
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Voulez-vous réactiver le type <strong>{type.name}</strong> ?
          Il redeviendra disponible dans les listes actives.
        </p>

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
        <Button variant="outline" onClick={onClose} disabled={isRestoring}>
          Annuler
        </Button>
        <Button
          variant="default"
          onClick={handleRestore}
          disabled={isRestoring}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isRestoring ? 'Restauration...' : 'Restaurer'}
        </Button>
      </div>
    </Modal>
  )
}
