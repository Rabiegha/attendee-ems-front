import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, FormField } from '@/shared/ui'
import { type AttendeeType, type UpdateAttendeeTypeDto } from '../api/attendeeTypesApi'
import { useAttendeeTypeNameAvailability } from '../hooks/useAttendeeTypeNameAvailability'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface EditAttendeeTypeModalProps {
  isOpen: boolean
  onClose: () => void
  type: AttendeeType | null
  onUpdate: (id: string, data: UpdateAttendeeTypeDto) => Promise<void>
}

export const EditAttendeeTypeModal: React.FC<EditAttendeeTypeModalProps> = ({
  isOpen,
  onClose,
  type,
  onUpdate,
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color_hex: '#4F46E5',
    text_color_hex: '#FFFFFF',
  })

  const { isChecking, isAvailable, errorMessage } = useAttendeeTypeNameAvailability(
    formData.name,
    type?.id
  )

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name || '',
        color_hex: type.color_hex || '#4F46E5',
        text_color_hex: type.text_color_hex || '#FFFFFF',
      })
    }
  }, [type])

  const handleSave = async () => {
    if (!type) return

    if (isAvailable === false) {
      return
    }

    setIsSaving(true)
    try {
      await onUpdate(type.id, formData)
      onClose()
    } catch (error: any) {
      console.error('Error saving attendee type:', error)
      if (error?.data?.message) {
        alert(error.data.message)
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (!type) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le type de participant">
      <div className="space-y-4">
        <FormField label="Nom" required>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="VIP"
          />
          {formData.name && formData.name !== type.name && (
            <>
              {isChecking && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Vérification de la disponibilité...</span>
                </div>
              )}
              {!isChecking && isAvailable === true && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ce nom est disponible</span>
                </div>
              )}
              {!isChecking && (isAvailable === false || errorMessage) && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
                  <XCircle className="h-4 w-4" />
                  <span>{errorMessage || 'Ce nom est déjà utilisé'}</span>
                </div>
              )}
            </>
          )}
        </FormField>

        {/* Aperçu */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aperçu :</p>
          <div
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              backgroundColor: formData.color_hex,
              color: formData.text_color_hex,
            }}
          >
            {formData.name || 'Type'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Couleur de fond">
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.color_hex}
                onChange={(e) =>
                  setFormData({ ...formData, color_hex: e.target.value })
                }
                className="h-10 w-16 p-1"
              />
              <Input
                value={formData.color_hex}
                onChange={(e) =>
                  setFormData({ ...formData, color_hex: e.target.value })
                }
                placeholder="#4F46E5"
              />
            </div>
          </FormField>

          <FormField label="Couleur du texte">
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.text_color_hex}
                onChange={(e) =>
                  setFormData({ ...formData, text_color_hex: e.target.value })
                }
                className="h-10 w-16 p-1"
              />
              <Input
                value={formData.text_color_hex}
                onChange={(e) =>
                  setFormData({ ...formData, text_color_hex: e.target.value })
                }
                placeholder="#FFFFFF"
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </Modal>
  )
}
