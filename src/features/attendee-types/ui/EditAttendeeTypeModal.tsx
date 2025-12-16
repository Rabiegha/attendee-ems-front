import React, { useState, useEffect } from 'react'
import { Modal, Button, Input, FormField } from '@/shared/ui'
import type { AttendeeType, UpdateAttendeeTypeDto } from '../api/attendeeTypesApi'

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
    code: '',
    name: '',
    color_hex: '#4F46E5',
    text_color_hex: '#FFFFFF',
    icon: '',
  })

  useEffect(() => {
    if (type) {
      setFormData({
        code: type.code || '',
        name: type.name || '',
        color_hex: type.color_hex || '#4F46E5',
        text_color_hex: type.text_color_hex || '#FFFFFF',
        icon: type.icon || '',
      })
    }
  }, [type])

  const handleSave = async () => {
    if (!type) return

    setIsSaving(true)
    try {
      await onUpdate(type.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving attendee type:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!type) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier le type de participant">
      <div className="space-y-4">
        <FormField label="Code" required>
          <Input
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="VIP"
            className="uppercase"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lettres minuscules, chiffres et underscores uniquement
          </p>
        </FormField>

        <FormField label="Nom" required>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="VIP"
          />
        </FormField>

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

        <FormField label="Icône (optionnel)">
          <Input
            value={formData.icon}
            onChange={(e) =>
              setFormData({ ...formData, icon: e.target.value })
            }
            placeholder="star"
          />
        </FormField>

        {/* Aperçu */}
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
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
