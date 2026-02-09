import React, { useState, useEffect } from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import type { FormField } from '@/features/events/components/FormBuilder/types'
import {
  getRegistrationFirstName,
  getRegistrationLastName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
} from '../utils/registration-helpers'

interface EditRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  registration: RegistrationDPO
  onSave: (data: any) => Promise<void>
  isLoading?: boolean
  formFields?: FormField[]
}

export const EditRegistrationModal: React.FC<EditRegistrationModalProps> = ({
  isOpen,
  onClose,
  registration,
  onSave,
  isLoading = false,
  formFields = [],
}) => {
  const [formData, setFormData] = useState({
    firstName: getRegistrationFirstName(registration),
    lastName: getRegistrationLastName(registration),
    email: getRegistrationEmail(registration),
    phone: getRegistrationPhone(registration),
    company: getRegistrationCompany(registration),
  })

  useEffect(() => {
    setFormData({
      firstName: getRegistrationFirstName(registration),
      lastName: getRegistrationLastName(registration),
      email: getRegistrationEmail(registration),
      phone: getRegistrationPhone(registration),
      company: getRegistrationCompany(registration),
    })
  }, [registration])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData: any = {
      attendee: {},
    }

    if (formData.firstName) updateData.attendee.first_name = formData.firstName
    if (formData.lastName) updateData.attendee.last_name = formData.lastName
    if (formData.email) updateData.attendee.email = formData.email
    if (formData.phone) updateData.attendee.phone = formData.phone
    if (formData.company) updateData.attendee.company = formData.company

    await onSave(updateData)
  }

  const isFieldVisible = (key: string) => {
    if (!formFields || formFields.length === 0) return true
    const field = formFields.find((f: any) => f.key === key)
    return field ? field.visibleInAdminForm !== false : true
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
          {isFieldVisible('first_name') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          )}
          {isFieldVisible('last_name') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
          )}
        </div>

        {isFieldVisible('email') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        )}

        {isFieldVisible('phone') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        )}

        {isFieldVisible('company') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entreprise
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
