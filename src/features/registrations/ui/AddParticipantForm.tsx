import React, { useState } from 'react'
import type { FormField } from '@/features/events/components/FormBuilder'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/hooks/useToast'
import { useCreateRegistrationMutation } from '../api/registrationsApi'
import { CheckCircle, Clock, XCircle, Ban } from 'lucide-react'

interface EventAttendeeType {
  id: string
  attendeeType: {
    id: string
    name: string
    description?: string
  }
}

interface AddParticipantFormProps {
  fields: FormField[]
  eventId: string
  publicToken: string
  eventAttendeeTypes?: EventAttendeeType[]
  onSuccess?: () => void
  submitButtonText?: string
  submitButtonColor?: string
}

export const AddParticipantForm: React.FC<AddParticipantFormProps> = ({
  fields,
  eventId,
  publicToken,
  eventAttendeeTypes = [],
  onSuccess,
  submitButtonText = "Ajouter",
  submitButtonColor = '#4F46E5',
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [selectedAttendeeTypeId, setSelectedAttendeeTypeId] = useState<string>('')
  const [adminStatus, setAdminStatus] = useState<'awaiting' | 'approved' | 'refused' | 'cancelled'>('approved')
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkedInAt, setCheckedInAt] = useState(() => {
    const now = new Date()
    // Convertir en heure locale pour datetime-local
    const offset = now.getTimezoneOffset()
    const localTime = new Date(now.getTime() - offset * 60 * 1000)
    return localTime.toISOString().slice(0, 16) // Format YYYY-MM-DDTHH:mm
  })
  const [registeredAt, setRegisteredAt] = useState(() => {
    const now = new Date()
    // Convertir en heure locale pour datetime-local
    const offset = now.getTimezoneOffset()
    const localTime = new Date(now.getTime() - offset * 60 * 1000)
    return localTime.toISOString().slice(0, 16)
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const [createRegistration] = useCreateRegistrationMutation()

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const attendee: any = {}
      const registrationData: any = {}
      const answers: any = {}

      const toSnakeCase = (str: string) => {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      }

      fields.forEach((field) => {
        const value = formData[field.id]
        if (!value) return

        if (field.attendeeField) {
          const backendFieldName = toSnakeCase(field.attendeeField)
          attendee[backendFieldName] = value
        } else if (field.registrationField) {
          registrationData[field.registrationField] = value
        } else if (field.storeInAnswers) {
          answers[field.key] = value
        }
      })

      if (!attendee.email) {
        toast.error('Email requis', "L'adresse email est obligatoire")
        setIsSubmitting(false)
        return
      }

      const requestData: any = {
        attendee,
        attendance_type: registrationData.attendance_type || 'onsite',
        source: 'manual',
        admin_status: adminStatus,
        admin_is_checked_in: isCheckedIn,
        admin_checked_in_at: isCheckedIn ? new Date(checkedInAt).toISOString() : undefined,
        admin_registered_at: new Date(registeredAt).toISOString(),
      }

      // Priorité : attendee type sélectionné explicitement, sinon depuis le champ du formulaire
      if (selectedAttendeeTypeId) {
        requestData.event_attendee_type_id = selectedAttendeeTypeId
      } else if (registrationData.attendee_type) {
        requestData.event_attendee_type_id = registrationData.attendee_type
      }

      if (Object.keys(answers).length > 0) {
        requestData.answers = answers
      }

      await createRegistration({
        eventId,
        data: requestData,
      }).unwrap()

      toast.success(
        'Participant ajouté !',
        "L'inscription a été enregistrée"
      )

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erreur lors de l'ajout:", error)
      console.error("Error details:", error?.data)

      let errorMessage = "Une erreur est survenue"
      const backendMessage = error?.data?.message || ''

      if (error?.status === 400) {
        // Erreur de validation - afficher le message du backend
        errorMessage = backendMessage || "Données invalides"
        
        // Si c'est un tableau d'erreurs de validation
        if (Array.isArray(error?.data?.message)) {
          errorMessage = error.data.message.join(', ')
        }
      } else if (error?.status === 409) {
        if (backendMessage.includes('full')) {
          errorMessage = "L'événement est complet"
        } else {
          errorMessage = 'Cet email est déjà inscrit à cet événement'
        }
      } else if (error?.status === 403) {
        errorMessage = "L'événement n'accepte plus d'inscriptions"
      } else if (backendMessage) {
        errorMessage = backendMessage
      }

      toast.error("Erreur d'inscription", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const commonClasses = 'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className={commonClasses}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className={commonClasses}
          >
            <option value="">Sélectionner...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-blue-600"
                />
                <span className="dark:text-white">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const isChecked = value.split(',').includes(option.value)
              return (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const currentValues = value ? value.split(',') : []
                      if (e.target.checked) {
                        handleInputChange(field.id, [...currentValues, option.value].join(','))
                      } else {
                        handleInputChange(field.id, currentValues.filter(v => v !== option.value).join(','))
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="dark:text-white">{option.label}</span>
                </label>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Champs du formulaire */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Informations du participant
        </h3>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {field.helpText && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {field.helpText}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Section 2: Configuration avancée (admin) */}
      <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          Configuration avancée
        </h3>

        {/* Type de participant */}
        {eventAttendeeTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de participant
            </label>
            <select
              value={selectedAttendeeTypeId}
              onChange={(e) => setSelectedAttendeeTypeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner un type (optionnel)</option>
              {eventAttendeeTypes.map((eat) => (
                <option key={eat.id} value={eat.id}>
                  {eat.attendeeType.name}
                  {eat.attendeeType.description && ` - ${eat.attendeeType.description}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Statut de l'inscription
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAdminStatus('approved')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                adminStatus === 'approved'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Approuvé</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAdminStatus('awaiting')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                adminStatus === 'awaiting'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-700'
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">En attente</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAdminStatus('refused')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                adminStatus === 'refused'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
              }`}
            >
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Refusé</span>
            </button>
            
            <button
              type="button"
              onClick={() => setAdminStatus('cancelled')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                adminStatus === 'cancelled'
                  ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              <Ban className="h-5 w-5" />
              <span className="font-medium">Annulé</span>
            </button>
          </div>
        </div>

        {/* Check-in */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isCheckedIn}
              onChange={(e) => setIsCheckedIn(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Marquer comme check-in
            </span>
          </label>
          
          {isCheckedIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date et heure du check-in
              </label>
              <input
                type="datetime-local"
                value={checkedInAt}
                onChange={(e) => setCheckedInAt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Date d'inscription */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date et heure d'inscription
          </label>
          <input
            type="datetime-local"
            value={registeredAt}
            onChange={(e) => setRegisteredAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={isSubmitting}
          style={{ backgroundColor: submitButtonColor }}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'Ajout en cours...' : submitButtonText}
        </Button>
      </div>
    </form>
  )
}
