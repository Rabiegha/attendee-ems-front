import React, { useState } from 'react'
import { Modal, Button, Alert } from '@/shared/ui'
import { AlertTriangle } from 'lucide-react'
import type { AttendeeType } from '../api/attendeeTypesApi'

interface DeleteAttendeeTypeModalProps {
  isOpen: boolean
  onClose: () => void
  type: AttendeeType | null
  onDelete: (id: string) => Promise<void>
}

export const DeleteAttendeeTypeModal: React.FC<DeleteAttendeeTypeModalProps> = ({
  isOpen,
  onClose,
  type,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!type) return

    setIsDeleting(true)
    try {
      await onDelete(type.id)
      onClose()
    } catch (error) {
      console.error('Error deleting attendee type:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!type) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer définitivement le type"
    >
      <div className="space-y-4">
        <Alert 
          variant="destructive"
          title="Attention !"
          description="Cette action est irréversible. Le type sera définitivement supprimé de la base de données."
          showIcon={true}
        />

        <p className="text-gray-600 dark:text-gray-400">
          Êtes-vous certain de vouloir supprimer définitivement le type{' '}
          <strong>{type.name}</strong> ?
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
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
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Annuler
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
        </Button>
      </div>
    </Modal>
  )
}
