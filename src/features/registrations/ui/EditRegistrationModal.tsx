import React, { useState, useEffect } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { RegistrationDPO } from '../dpo/registration.dpo'

interface EditRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
}

export const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    firstName: registration.attendee?.firstName || '',
    lastName: registration.attendee?.lastName || '',
    email: registration.attendee?.email || '',
    phone: registration.attendee?.phone || '',
    company: registration.attendee?.company || '',
  })

  useEffect(() => {
    if (registration.attendee) {
      setFormData({
        firstName: registration.attendee.firstName || '',
        lastName: registration.attendee.lastName || '',
        email: registration.attendee.email || '',
        phone: registration.attendee.phone || '',
        company: registration.attendee.company || '',
      })
    }
  }, [registration])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updateData: any = {
      attendee: {}
    }
    
    if (formData.firstName) updateData.attendee.first_name = formData.firstName
    if (formData.lastName) updateData.attendee.last_name = formData.lastName
    if (formData.email) updateData.attendee.email = formData.email
    if (formData.phone) updateData.attendee.phone = formData.phone
    if (formData.company) updateData.attendee.company = formData.company
    
    await onSave(updateData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier l'inscription"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Entreprise
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
