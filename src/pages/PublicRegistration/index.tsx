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
  registration_fields: any[]
  submit_button_text?: string
  submit_button_color?: string
  show_title?: boolean
  show_description?: boolean
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

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
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
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
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
        toast.error('Email requis', 'L\'adresse email est obligatoire')
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
      const response = await fetch(`${apiUrl}/public/events/${token}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
        console.error('❌ Erreur backend:', errorData)
        
        // Messages d'erreur personnalisés
        let userMessage = errorData.detail || errorData.message || 'Erreur lors de l\'inscription'
        
        if (errorData.status === 403 || userMessage.includes('not open for registration')) {
          userMessage = 'Les inscriptions pour cet événement ne sont pas encore ouvertes ou sont clôturées.'
        } else if (errorData.status === 409 || userMessage.includes('full')) {
          userMessage = 'L\'événement est complet. Aucune nouvelle inscription n\'est possible.'
        }
        
        throw new Error(userMessage)
      }

      setIsSubmitted(true)
      toast.success('Inscription réussie !', 'Votre inscription a été enregistrée avec succès')
    } catch (err) {
      toast.error('Erreur', err instanceof Error ? err.message : 'Impossible de soumettre le formulaire')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setFormData({})
  }

  const renderField = (field: any) => {
    const value = formData[field.id] || ''
    const disabled = false

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionnez une option</option>
            {field.options?.map((option: { value: string; label: string }, idx: number) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            ))}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {error || 'L\'événement que vous recherchez n\'existe pas ou n\'est plus disponible.'}
          </p>
        </div>
      </div>
    )
  }

  const showTitle = event.show_title !== false
  const showDescription = event.show_description !== false
  const submitButtonText = event.submit_button_text || "S'inscrire"
  const submitButtonColor = event.submit_button_color || '#4F46E5'

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          {showTitle && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
            <div className="p-6 border-b border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Form */}
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Inscription confirmée !
                </h3>
                <p className="text-gray-600 mb-6">
                  Votre inscription a été enregistrée avec succès
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Nouvelle inscription
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Inscription à l'événement
                  </h3>
                </div>

                {event.registration_fields?.map((field: any) => (
                  <div key={field.id}>
                    {field.label && (
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    {renderField(field)}
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-md text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: submitButtonColor }}
                  >
                    {isSubmitting ? 'Inscription en cours...' : submitButtonText}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default PublicRegistration
