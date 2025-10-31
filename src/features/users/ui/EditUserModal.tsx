import React, { useState } from 'react'
import { Modal, Button, Input, FormField } from '@/shared/ui'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any | null
  onSave: (userId: string, data: any) => Promise<void>
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
  })

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        job_title: user.job_title || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await onSave(user.id, formData)
      onClose()
    } catch (error) {
      console.error('Error saving user:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'utilisateur">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prénom">
            <Input
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              placeholder="Prénom"
            />
          </FormField>
          <FormField label="Nom">
            <Input
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              placeholder="Nom"
            />
          </FormField>
        </div>
        
        <FormField label="Email" required>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="email@example.com"
          />
        </FormField>
        
        <FormField label="Téléphone">
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+33 6 12 34 56 78"
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Entreprise">
            <Input
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Nom de l'entreprise"
            />
          </FormField>
          <FormField label="Fonction">
            <Input
              value={formData.job_title}
              onChange={(e) =>
                setFormData({ ...formData, job_title: e.target.value })
              }
              placeholder="Fonction"
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !formData.email}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
