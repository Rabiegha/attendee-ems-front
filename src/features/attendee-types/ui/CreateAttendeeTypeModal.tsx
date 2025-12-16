import React, { useState } from 'react'
import { Modal, Button, Input, FormField } from '@/shared/ui'
import type { CreateAttendeeTypeDto } from '../api/attendeeTypesApi'

interface CreateAttendeeTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateAttendeeTypeDto) => Promise<void>
}

export const CreateAttendeeTypeModal: React.FC<CreateAttendeeTypeModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState<CreateAttendeeTypeDto>({
    code: '',
    name: '',
    color_hex: '#4F46E5',
    text_color_hex: '#FFFFFF',
    icon: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleChange = (field: keyof CreateAttendeeTypeDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCodeChange = (value: string) => {
    // Force uppercase
    handleChange('code', value.toUpperCase())
  }

  const handleCreate = async () => {
    if (!formData.code || !formData.name) {
      alert('Code et nom sont requis')
      return
    }

    setIsCreating(true)
    try {
      await onCreate(formData)
      // Reset form
      setFormData({
        code: '',
        name: '',
        color_hex: '#4F46E5',
        text_color_hex: '#FFFFFF',
        icon: '',
      })
      onClose()
    } catch (error) {
      console.error('Error creating attendee type:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer un nouveau type de participant"
    >
      <div className="space-y-4">
        <FormField label="Code" required>
          <Input
            value={formData.code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="VIP"
            maxLength={10}
          />
        </FormField>

        <FormField label="Nom" required>
          <Input
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="VIP"
          />
        </FormField>

        <FormField label="Couleur de fond">
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.color_hex}
              onChange={(e) => handleChange('color_hex', e.target.value)}
              className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={formData.color_hex}
              onChange={(e) => handleChange('color_hex', e.target.value)}
              placeholder="#4F46E5"
            />
          </div>
        </FormField>

        <FormField label="Couleur du texte">
          <div className="flex gap-2">
            <input
              type="color"
              value={formData.text_color_hex}
              onChange={(e) => handleChange('text_color_hex', e.target.value)}
              className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={formData.text_color_hex}
              onChange={(e) => handleChange('text_color_hex', e.target.value)}
              placeholder="#FFFFFF"
            />
          </div>
        </FormField>

        <FormField label="Icône (optionnel)">
          <Input
            value={formData.icon}
            onChange={(e) => handleChange('icon', e.target.value)}
            placeholder="★"
            maxLength={2}
          />
        </FormField>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aperçu :</div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: formData.color_hex,
              color: formData.text_color_hex,
            }}
          >
            {formData.icon && <span>{formData.icon}</span>}
            <span>{formData.name || 'Nom du type'}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={isCreating}>
          Annuler
        </Button>
        <Button
          variant="default"
          onClick={handleCreate}
          disabled={isCreating || !formData.code || !formData.name}
        >
          {isCreating ? 'Création...' : 'Créer'}
        </Button>
      </div>
    </Modal>
  )
}
