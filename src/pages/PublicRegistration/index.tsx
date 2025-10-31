import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { formatDate } from '@/shared/lib/utils'

interface EventSettings {
  name: string
  description?: string
  start_at: string
  address_formatted: string
  capacity?: number
  status?: string
  registration_fields: any[]
  submit_button_text?: string
  submit_button_color?: string
  show_title?: boolean
  show_description?: boolean
  is_dark_mode?: boolean
}

const PublicRegistration: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const toast = useToast()

  const [event, setEvent] = useState<EventSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Charger les données de l'événement
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${apiUrl}/public/events/${token}`)

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Événement non trouvé')
          } else {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`)
          }
        }

        const data = await response.json()
        setEvent(data)
      } catch (err) {
        console.error('Erreur de chargement:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchEvent()
    }
  }, [token])

  // Notifier la hauteur du contenu (pour l'iframe)
  useEffect(() => {
    const updateHeight = () => {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'attendee-ems-resize', height }, '*')
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [event, isSubmitted])

  // Contrôler le mode dark sur l'élément HTML
  useEffect(() => {
    if (event?.is_dark_mode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [event?.is_dark_mode])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Préparer les données selon le mapping des champs
      const attendee: any = {}
      const registrationData: any = {}
      const answers: any = {}

      // Helper pour convertir camelCase en snake_case
      const toSnakeCase = (str: string) => {
        return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      }

      event?.registration_fields?.forEach((field: any) => {
        const value = formData[field.id]
        if (!value) return

        if (field.attendeeField) {
          // Convertir de camelCase à snake_case pour le backend
          const backendFieldName = toSnakeCase(field.attendeeField)
          attendee[backendFieldName] = value
        } else if (field.registrationField) {
          registrationData[field.registrationField] = value
        } else if (field.storeInAnswers) {
          answers[field.key] = value
        }
      })

      // Email est requis
      if (!attendee.email) {
        toast.error('Email requis', "L'adresse email est obligatoire")
        setIsSubmitting(false)
        return
      }

      const payload = {
        attendee,
        attendance_type: 'onsite', // Valeur par défaut
        ...registrationData,
        answers: Object.keys(answers).length > 0 ? answers : undefined,
      }

      console.log('📤 Payload envoyé:', payload)

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(
        `${apiUrl}/public/events/${token}/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ Erreur backend:', errorData)

        // Messages d'erreur personnalisés
        let userMessage =
          errorData.detail ||
          errorData.message ||
          "Erreur lors de l'inscription"

        if (
          errorData.status === 403 ||
          userMessage.includes('not open for registration')
        ) {
          userMessage =
            'Les inscriptions pour cet événement ne sont pas encore ouvertes ou sont clôturées.'
        } else if (errorData.status === 409 || userMessage.includes('full')) {
          userMessage =
            "L'événement est complet. Aucune nouvelle inscription n'est possible."
        }

        throw new Error(userMessage)
      }

      setIsSubmitted(true)
      toast.success(
        'Inscription réussie !',
        'Votre inscription a été enregistrée avec succès'
      )
    } catch (err) {
      toast.error(
        'Erreur',
        err instanceof Error
          ? err.message
          : 'Impossible de soumettre le formulaire'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setFormData({})
  }

  const renderField = (field: any, disabled = false) => {
    const value = formData[field.id] || ''
    const baseClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            rows={4}
            className={baseClasses}
          />
        )
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            disabled={disabled}
            className={baseClasses}
          >
            <option value="" className="dark:bg-gray-700 dark:text-white">Sélectionnez une option</option>
            {field.options?.map(
              (option: { value: string; label: string }, idx: number) => (
                <option key={idx} value={option.value} className="dark:bg-gray-700 dark:text-white">
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
            disabled={disabled}
            className={baseClasses}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Événement non trouvé
          </h2>
          <p className="text-gray-600">
            {error ||
              "L'événement que vous recherchez n'existe pas ou n'est plus disponible."}
          </p>
        </div>
      </div>
    )
  }

  const showTitle = event.show_title !== false
  const showDescription = event.show_description !== false
  const submitButtonText = event.submit_button_text || "S'inscrire"
  const submitButtonColor = event.submit_button_color || '#4F46E5'
  const isDarkMode = event.is_dark_mode === true

  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Header */}
            {showTitle && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.start_at)}
                  </div>
                  <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.address_formatted}
                </div>
                {event.capacity && event.capacity < 100000 && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.capacity} places
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

          {/* Form avec overlay si nécessaire */}
          <div className="relative">
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Inscription confirmée !
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Votre inscription a été enregistrée avec succès
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Nouvelle inscription
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Inscription à l'événement
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.registration_fields?.map((field: any) => {
                      // Determine if this field should be full width or half
                      const isFullWidth = field.width !== 'half'
                      const isDisabled =
                        event.status === 'draft' ||
                        event.status === 'cancelled' ||
                        event.status === 'registration_closed' ||
                        event.status === 'archived'

                      return (
                        <div
                          key={field.id}
                          className={isFullWidth ? 'md:col-span-2' : 'md:col-span-1'}
                        >
                          {field.label && (
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          )}
                          {renderField(field, isDisabled)}
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        event.status === 'draft' ||
                        event.status === 'cancelled' ||
                        event.status === 'registration_closed' ||
                        event.status === 'archived'
                      }
                      className="w-full px-4 py-2 rounded-md text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                      style={{ backgroundColor: submitButtonColor }}
                    >
                      {isSubmitting
                        ? 'Inscription en cours...'
                        : submitButtonText}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Overlay avec message selon le statut */}
            {!isSubmitted &&
              (event.status === 'draft' ||
                event.status === 'cancelled' ||
                event.status === 'registration_closed' ||
                event.status === 'postponed') && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 flex items-center justify-center rounded-b-lg">
                  <div className="text-center px-6 py-8 max-w-md">
                    <AlertCircle
                      className={`h-16 w-16 mx-auto mb-4 ${
                        event.status === 'cancelled'
                          ? 'text-red-500 dark:text-red-400'
                          : event.status === 'registration_closed'
                            ? 'text-orange-500 dark:text-orange-400'
                            : event.status === 'postponed'
                              ? 'text-yellow-500 dark:text-yellow-400'
                              : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        event.status === 'cancelled'
                          ? 'text-red-800 dark:text-red-200'
                          : event.status === 'registration_closed'
                            ? 'text-orange-800 dark:text-orange-200'
                            : event.status === 'postponed'
                              ? 'text-yellow-800 dark:text-yellow-200'
                              : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {event.status === 'cancelled'
                        ? 'Événement annulé'
                        : event.status === 'registration_closed'
                          ? 'Inscriptions clôturées'
                          : event.status === 'postponed'
                            ? 'Événement reporté'
                            : 'Événement en cours de préparation'}
                    </h3>
                    <p
                      className={`text-sm ${
                        event.status === 'cancelled'
                          ? 'text-red-700 dark:text-red-300'
                          : event.status === 'registration_closed'
                            ? 'text-orange-700 dark:text-orange-300'
                            : event.status === 'postponed'
                              ? 'text-yellow-700 dark:text-yellow-300'
                              : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {event.status === 'cancelled'
                        ? 'Cet événement a été annulé. Les inscriptions ne sont plus acceptées.'
                        : event.status === 'registration_closed'
                          ? 'Les inscriptions pour cet événement sont fermées.'
                          : event.status === 'postponed'
                            ? 'Cet événement a été reporté. Veuillez consulter les nouvelles dates ci-dessus.'
                            : 'Cet événement est en cours de préparation. Les inscriptions ne sont pas encore ouvertes.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicRegistration
