import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetEventByIdQuery, useUpdateRegistrationFieldsMutation, useUpdateEventMutation } from '@/features/events/api/eventsApi'
import { useGetRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
import { skipToken } from '@reduxjs/toolkit/query/react'
import type { RegistrationDPO } from '@/features/registrations/dpo/registration.dpo'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { 
  Edit, 
  Download, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  FileText,
  Upload,
  ArrowLeft,
  Settings,
  FormInput,
  ChevronDown
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/lib/utils'
import { RegistrationsTable } from '@/features/registrations/ui/RegistrationsTable'
import { ImportExcelModal } from '@/features/registrations/ui/ImportExcelModal'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import { FormBuilder, type FormField, getFieldById } from '@/features/events/components/FormBuilder'
import { FormPreview } from '@/features/events/ui/FormPreview'
import { EmbedCodeGenerator } from '@/features/events/ui/EmbedCodeGenerator'

type TabType = 'details' | 'registrations' | 'form' | 'settings'

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const { data: event, isLoading: eventLoading, error } = useGetEventByIdQuery(id!)
  const [updateRegistrationFields] = useUpdateRegistrationFieldsMutation()
  const [updateEvent] = useUpdateEventMutation()
  
  // State pour le menu dropdown de statut
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  
  // State pour les champs du formulaire - chargé depuis la BDD ou valeurs par défaut
  const [formFields, setFormFields] = useState<FormField[]>([])
  
  // State pour la configuration du bouton submit
  const [submitButtonText, setSubmitButtonText] = useState<string>("S'inscrire")
  const [submitButtonColor, setSubmitButtonColor] = useState<string>('#4F46E5')
  const [showTitle, setShowTitle] = useState<boolean>(true)
  const [showDescription, setShowDescription] = useState<boolean>(true)
  
  // Charger les champs depuis event.settings.registration_fields quand l'événement est chargé
  useEffect(() => {
    if (event?.settings?.registration_fields && Array.isArray(event.settings.registration_fields)) {
      // Reconstituer les champs avec leurs icônes depuis PREDEFINED_FIELDS
      const fieldsWithIcons = event.settings.registration_fields.map((savedField: any) => {
        const predefinedField = getFieldById(savedField.key)
        if (predefinedField) {
          // Fusionner le champ sauvegardé avec l'icône du champ prédéfini
          return {
            ...savedField,
            icon: predefinedField.icon
          }
        }
        return savedField
      })
      setFormFields(fieldsWithIcons)
    } else {
      // Valeurs par défaut si aucun champ n'est configuré
      const firstName = getFieldById('first_name')
      const lastName = getFieldById('last_name')
      const email = getFieldById('email')
      
      if (firstName && lastName && email) {
        setFormFields([
          { ...firstName, id: `field_${Date.now()}_1`, order: 0 },
          { ...lastName, id: `field_${Date.now()}_2`, order: 1 },
          { ...email, id: `field_${Date.now()}_3`, order: 2 },
        ])
      }
    }
    
    // Charger la configuration du bouton submit
    if (event?.settings?.submitButtonText) {
      setSubmitButtonText(event.settings.submitButtonText)
    }
    if (event?.settings?.submitButtonColor) {
      setSubmitButtonColor(event.settings.submitButtonColor)
    }
    if (event?.settings?.showTitle !== undefined) {
      setShowTitle(event.settings.showTitle)
    }
    if (event?.settings?.showDescription !== undefined) {
      setShowDescription(event.settings.showDescription)
    }
  }, [event])
  
  // Fonction pour sauvegarder les champs
  const handleSaveFormFields = async (fields: FormField[]) => {
    if (!id) return
    
    try {
      // Nettoyer les champs en retirant les icônes (composants React non sérialisables)
      const cleanedFields = fields.map(field => {
        const { icon, ...rest } = field as any
        return rest
      })
      
      await updateRegistrationFields({ 
        id, 
        fields: cleanedFields,
        submitButtonText,
        submitButtonColor,
        showTitle,
        showDescription,
      }).unwrap()
      console.log('Champs sauvegardés avec succès')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des champs:', error)
      // Log plus de détails
      if (error && typeof error === 'object' && 'data' in error) {
        console.error('Détails de l\'erreur:', JSON.stringify(error.data, null, 2))
      }
    }
  }
  
  // Fonction pour changer le statut de l'événement
  const handleStatusChange = async (newStatus: string) => {
    if (!id || !event) return
    
    try {
      await updateEvent({
        id,
        data: { status: newStatus as any }
      }).unwrap()
      setShowStatusMenu(false)
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err)
    }
  }
  
  // Fonction pour sauvegarder la configuration du bouton
  const handleConfigChange = (config: { 
    submitButtonText?: string
    submitButtonColor?: string
    showTitle?: boolean
    showDescription?: boolean
  }) => {
    if (config.submitButtonText !== undefined) {
      setSubmitButtonText(config.submitButtonText)
    }
    if (config.submitButtonColor !== undefined) {
      setSubmitButtonColor(config.submitButtonColor)
    }
    if (config.showTitle !== undefined) {
      setShowTitle(config.showTitle)
    }
    if (config.showDescription !== undefined) {
      setShowDescription(config.showDescription)
    }
    
    // Sauvegarder immédiatement
    if (!id) return
    
    updateRegistrationFields({
      id,
      fields: formFields.map(field => {
        const { icon, ...rest } = field as any
        return rest
      }),
      submitButtonText: config.submitButtonText ?? submitButtonText,
      submitButtonColor: config.submitButtonColor ?? submitButtonColor,
      showTitle: config.showTitle ?? showTitle,
      showDescription: config.showDescription ?? showDescription,
    })
  }
  
  // Mode test pour le formulaire (permet de tester les inscriptions)
  const [isFormTestMode, setIsFormTestMode] = useState(false)
  
  const { data: apiRegistrations = [], isLoading: registrationsLoading } = useGetRegistrationsQuery(
    id ? { eventId: id } : skipToken
  )

  // Les inscriptions sont récupérées via l'API RTK Query
  const allRegistrations = apiRegistrations

  // Callback pour l'import Excel - plus besoin du mode local
  const handleImportSuccess = (result: any) => {
    console.log('Import terminé:', result)
    // La liste sera automatiquement rafraîchie par RTK Query invalidation
  }

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Événement non trouvé
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          L'événement que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Link to="/events">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux événements
          </Button>
        </Link>
      </div>
    )
  }

  const approvedCount = allRegistrations.filter((r: RegistrationDPO) => r.status === 'approved').length
  const awaitingCount = allRegistrations.filter((r: RegistrationDPO) => r.status === 'awaiting').length

  const tabs = [
    { id: 'details' as TabType, label: 'Détails', icon: FileText },
    { id: 'registrations' as TabType, label: `Inscriptions (${allRegistrations.length})`, icon: Users },
    { id: 'form' as TabType, label: 'Formulaire', icon: FormInput },
    { id: 'settings' as TabType, label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Link 
              to="/events"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.name}</h1>
            
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                  event.status === 'active' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50'
                    : event.status === 'draft'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : event.status === 'published'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50'
                }`}
              >
                {event.status}
                <ChevronDown className="ml-1 h-3 w-3" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <div className="py-1">
                    {['draft', 'published', 'active', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          event.status === status
                            ? 'font-medium text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(event.startDate)}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {approvedCount}/{event.maxAttendees > 100000 ? '∞' : event.maxAttendees} participants
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Can do="update" on="Event" data={event}>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
          </Can>
          <Can do="export" on="Attendee" data={{ eventId: event.id }}>
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description + Détails */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {event.description || 'Aucune description disponible'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informations détaillées
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de début</label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDateTime(event.startDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date de fin</label>
                      <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDateTime(event.endDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lieu</label>
                    <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                      {event.location}
                    </p>
                  </div>
                  {event.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques Sidebar */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Inscriptions totales</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{allRegistrations.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Approuvées</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{approvedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">En attente</span>
                    <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{awaitingCount}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Places restantes</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.maxAttendees > 100000 
                          ? "Illimité" 
                          : event.maxAttendees - approvedCount
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Durée</span>
                    <span className="text-gray-900 dark:text-white">{event.duration}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Jours restants</span>
                    <span className="text-gray-900 dark:text-white">
                      {event.daysUntilStart > 0 ? `${event.daysUntilStart} jours` : 'Commencé'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Créé le</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Inscriptions ({allRegistrations.length})
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importer depuis Excel</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={() => {
                    // TODO: Implement export
                    console.log('Export registrations')
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter</span>
                </Button>
              </div>
            </div>
            
            <RegistrationsTable
              registrations={allRegistrations}
              isLoading={registrationsLoading}
              eventId={id!}
            />
          </div>
        )}

        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Builder */}
            <div className="space-y-6">
              <FormBuilder
                fields={formFields}
                onChange={(fields: FormField[]) => {
                  setFormFields(fields)
                  handleSaveFormFields(fields)
                }}
                submitButtonText={submitButtonText}
                submitButtonColor={submitButtonColor}
                showTitle={showTitle}
                showDescription={showDescription}
                onConfigChange={handleConfigChange}
              />
              
              <EmbedCodeGenerator
                eventId={event.id}
                publicToken={event.id}
              />
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Aperçu en temps réel
                </h3>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFormTestMode}
                    onChange={(e) => setIsFormTestMode(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mode Test</span>
                </label>
              </div>
              <div className="sticky top-6">
                <FormPreview
                  event={event}
                  fields={formFields}
                  testMode={isFormTestMode}
                  submitButtonText={submitButtonText}
                  submitButtonColor={submitButtonColor}
                  showTitle={showTitle}
                  showDescription={showDescription}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Paramètres de l'événement
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Fonctionnalité à venir : configuration des formulaires, notifications, etc.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        eventId={event.id}
        onImportSuccess={handleImportSuccess}
      />

      <EditEventModal
        event={event}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  )
}
