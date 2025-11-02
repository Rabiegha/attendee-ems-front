/**
 * CreateEvent Page - Création d'événement en plusieurs étapes
 * 
 * Étape 1: Informations de base (nom, description, dates)
 * Étape 2: Lieu et participants (type de lieu, adresse, capacité, tags, partenaires)
 * Étape 3: Options (approbation auto, emails, etc.)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PageContainer, 
  PageHeader, 
  PageSection,
  Button,
  Card,
  CardContent,
} from '@/shared/ui'
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  MapPin,
  Settings,
} from 'lucide-react'
import { useCreateEventMutation } from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/hooks/useToast'

// Import des composants d'étapes
import { StepOne, StepTwo, StepThree } from './steps'

// Type pour les données du formulaire
export interface CreateEventFormData {
  // Étape 1: Informations de base
  name: string
  description?: string
  start_at: string
  end_at: string
  timezone: string
  
  // Étape 2: Lieu et participants
  location_type: 'physical' | 'online' | 'hybrid'
  address_formatted?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  latitude?: number
  longitude?: number
  capacity?: number
  tags?: string[]
  assigned_user_ids?: string[]
  
  // Étape 3: Options
  website_url?: string
  registration_auto_approve: boolean
  require_email_verification: boolean
  confirmation_email_enabled: boolean
  approval_email_enabled: boolean
  reminder_email_enabled: boolean
}

const STEPS = [
  { id: 1, name: 'Informations', icon: Calendar },
  { id: 2, name: 'Lieu & Participants', icon: MapPin },
  { id: 3, name: 'Options', icon: Settings },
]

export function CreateEventPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [createEvent, { isLoading }] = useCreateEventMutation()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CreateEventFormData>({
    name: '',
    description: '',
    start_at: '',
    end_at: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location_type: 'physical',
    registration_auto_approve: false,
    require_email_verification: false,
    confirmation_email_enabled: true,
    approval_email_enabled: true,
    reminder_email_enabled: false,
    tags: [],
    assigned_user_ids: [],
  })

  const updateFormData = (updates: Partial<CreateEventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Préparer les données pour l'API (conversion au format DPO)
      const eventData: any = {
        name: formData.name,
        description: formData.description || undefined,
        startDate: formData.start_at,
        endDate: formData.end_at,
        location: formData.address_formatted || undefined,
        maxAttendees: formData.capacity || undefined,
        tags: formData.tags || undefined,
        partnerIds: formData.assigned_user_ids || undefined,
        websiteUrl: formData.website_url || undefined,
        registrationAutoApprove: formData.registration_auto_approve,
        requireEmailVerification: formData.require_email_verification,
        confirmationEmailEnabled: formData.confirmation_email_enabled,
        approvalEmailEnabled: formData.approval_email_enabled,
        reminderEmailEnabled: formData.reminder_email_enabled,
      }

      const result = await createEvent(eventData).unwrap()
      toast.success('Événement créé avec succès !', 'L\'événement a été créé et est maintenant disponible')
      navigate(`/events/${result.id}`)
    } catch (error: any) {
      console.error('Erreur création événement:', error)
      toast.error('Erreur', error?.data?.message || 'Erreur lors de la création de l\'événement')
    }
  }

  const canGoNext = () => {
    if (currentStep === 1) {
      return formData.name && formData.start_at && formData.end_at
    }
    return true
  }

  return (
    <PageContainer maxWidth="5xl" padding="lg">
      <PageHeader
        title="Créer un événement"
        description="Créez un nouvel événement en quelques étapes"
        icon={Calendar}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate('/events')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Annuler
          </Button>
        }
      />

      {/* Stepper */}
      <PageSection spacing="lg">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${
                      currentStep === step.id
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : currentStep > step.id
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400'
                    }
                  `}
                >
                  {currentStep > step.id ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${
                      currentStep >= step.id
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }
                  `}
                >
                  {step.name}
                </span>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    h-0.5 flex-1 mx-4 transition-all duration-300
                    ${
                      currentStep > step.id
                        ? 'bg-green-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card variant="default" padding="lg">
          <CardContent>
            {currentStep === 1 && (
              <StepOne 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            )}
            {currentStep === 2 && (
              <StepTwo 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            )}
            {currentStep === 3 && (
              <StepThree 
                formData={formData} 
                updateFormData={updateFormData} 
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Précédent
          </Button>

          <div className="flex gap-3">
            {currentStep < 3 ? (
              <Button
                variant="default"
                onClick={handleNext}
                disabled={!canGoNext()}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleSubmit}
                loading={isLoading}
                rightIcon={<Check className="h-4 w-4" />}
              >
                Créer l'événement
              </Button>
            )}
          </div>
        </div>
      </PageSection>
    </PageContainer>
  )
}
