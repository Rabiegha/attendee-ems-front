import React, { useState } from 'react'
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react'
import type { FormField } from '../components/FormBuilder'
import type { EventDPO } from '../dpo/event.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/hooks/useToast'
import { useCreatePublicRegistrationMutation } from '../api/publicEventsApi'

interface FormPreviewProps {
  event: EventDPO
  fields: FormField[]
  testMode?: boolean // Si true, le formulaire est fonctionnel
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  event,
  fields,
  testMode = false,
  submitButtonText = "S'inscrire",
  submitButtonColor = '#4F46E5',
  showTitle = true,
  showDescription = true,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const [createPublicRegistration] = useCreatePublicRegistrationMutation()

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testMode) return

    setIsSubmitting(true)

    try {
      // Extract fields based on their database mapping
      const attendee: any = {}
      const registrationData: any = {}
      const answers: any = {}

      // Helper pour convertir camelCase en snake_case
      const toSnakeCase = (str: string) => {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      }

      // Group form data by field configuration
      fields.forEach((field) => {
        const value = formData[field.id]
        if (!value) return

        if (field.attendeeField) {
          // Map to attendee table column (convert camelCase to snake_case)
          const backendFieldName = toSnakeCase(field.attendeeField)
          attendee[backendFieldName] = value
        } else if (field.registrationField) {
          // Map to registration table column
          registrationData[field.registrationField] = value
        } else if (field.storeInAnswers) {
          // Store in answers JSON
          answers[field.key] = value
        }
      })

      // Email is required
      if (!attendee.email) {
        toast.error('Email requis', "L'adresse email est obligatoire")
        return
      }

      // Determine attendance type
      let attendanceType: 'onsite' | 'online' | 'hybrid' = 'onsite'
      if (registrationData.attendance_type) {
        attendanceType = registrationData.attendance_type
      } else if (event.locationType === 'online') {
        attendanceType = 'online'
      } else if (event.locationType === 'hybrid') {
        attendanceType = 'hybrid'
      }

      const requestData: any = {
        attendee,
        attendance_type: attendanceType,
      }

      // Add registration-specific data
      if (registrationData.attendee_type) {
        requestData.attendee_type = registrationData.attendee_type
      }

      // Add custom answers
      if (Object.keys(answers).length > 0) {
        requestData.answers = answers
      }

      // Utiliser le public_token de l'événement pour la route publique
      if (!event.publicToken) {
        toast.error('Erreur configuration', "L'événement n'a pas de token public")
        return
      }

      await createPublicRegistration({
        publicToken: event.publicToken,
        data: requestData,
        eventId: event.id, // Passer l'eventId pour invalider les bons tags
      }).unwrap()

      setIsSubmitted(true)
      toast.success(
        'Inscription réussie !',
        'Votre inscription a été enregistrée'
      )
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error)

      // Handle specific error cases
      let errorMessage = "Une erreur est survenue lors de l'inscription"

      if (error?.status === 409) {
        errorMessage = 'Cet email est déjà inscrit à cet événement'
      } else if (error?.status === 403) {
        errorMessage = "L'événement n'accepte plus d'inscriptions"
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }

      toast.error("Erreur d'inscription", errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({})
    setIsSubmitted(false)
  }
  const renderField = (field: FormField) => {
    const baseClasses =
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors duration-200'

    const value = formData[field.id] || ''
    const disabled = !testMode || isSubmitted

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseClasses}
            disabled={disabled}
          />
        )
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={baseClasses}
            required={field.required}
            disabled={disabled}
          >
            <option value="">Sélectionnez une option</option>
            {field.options?.map(
              (option: { value: string; label: string }, idx: number) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </select>
        )
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseClasses}
            disabled={disabled}
          />
        )
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-200">
      {/* Header */}
      {showTitle && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {event.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(event.startDate)}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
            {event.maxAttendees && event.maxAttendees < 100000 && (
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                {event.maxAttendees} places
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {showDescription && event.description && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}

      {/* Form */}
      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        {isSubmitted ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Inscription confirmée !
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Votre inscription a été enregistrée avec succès (mode test)
            </p>
            <Button variant="outline" onClick={resetForm} type="button">
              Nouvelle inscription
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Inscription à l'événement
              </h3>
              {testMode && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Mode Test
                </span>
              )}
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Aucun champ configuré</p>
                <p className="text-sm mt-2">
                  Ajoutez des champs dans la configuration
                </p>
              </div>
            ) : (
              <>
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!testMode || isSubmitting}
                    className="w-full px-4 py-2 rounded-md text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: submitButtonColor }}
                  >
                    {isSubmitting
                      ? 'Inscription en cours...'
                      : submitButtonText}
                  </button>
                </div>

                {testMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    * Ce formulaire est en mode test - Les inscriptions ne
                    seront pas réellement enregistrées
                  </p>
                )}

                {!testMode && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    * Champs obligatoires - Activez le mode test pour essayer le
                    formulaire
                  </p>
                )}
              </>
            )}
          </>
        )}
      </form>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Propulsé par Attendee EMS
        </p>
      </div>
    </div>
  )
}
