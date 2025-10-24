import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetEventByIdQuery } from '@/features/events/api/eventsApi'
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
  FormInput
} from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/lib/utils'
import { RegistrationsTable } from '@/features/registrations/ui/RegistrationsTable'
import { ImportExcelModal } from '@/features/registrations/ui/ImportExcelModal'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import { FormBuilder, type FormField } from '@/features/events/ui/FormBuilder'
import { FormPreview } from '@/features/events/ui/FormPreview'
import { EmbedCodeGenerator } from '@/features/events/ui/EmbedCodeGenerator'

type TabType = 'details' | 'registrations' | 'form' | 'settings'

// Helper pour générer des IDs uniques
const generateId = () => `local-${Date.now()}-${Math.random().toString(36).substring(7)}`

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // State local pour les inscriptions importées (disparaissent au reload)
  const [localRegistrations, setLocalRegistrations] = useState<RegistrationDPO[]>([])
  
  // State pour les champs du formulaire
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: 'firstName', name: 'firstName', label: 'Prénom', type: 'text', required: true },
    { id: 'lastName', name: 'lastName', label: 'Nom', type: 'text', required: true },
    { id: 'email', name: 'email', label: 'Email', type: 'email', required: true },
  ])
  
  // Mode test pour le formulaire (permet de tester les inscriptions)
  const [isFormTestMode, setIsFormTestMode] = useState(false)
  
  const { data: event, isLoading: eventLoading, error } = useGetEventByIdQuery(id!)
  const { data: apiRegistrations = [], isLoading: registrationsLoading } = useGetRegistrationsQuery(
    id ? { eventId: id } : skipToken
  )

  // Combiner les inscriptions API + locales
  const allRegistrations = [...apiRegistrations, ...localRegistrations]

  // Callback pour l'import Excel local
  const handleImportSuccess = (importedData: any[]) => {
    const newRegistrations: RegistrationDPO[] = importedData.map(data => ({
      id: generateId(),
      eventId: id!,
      attendeeId: generateId(),
      status: 'awaiting' as const,
      formData: data.formData || {},
      registeredAt: new Date().toISOString(),
      attendee: {
        id: generateId(),
        firstName: data.firstName || 'N/A',
        lastName: data.lastName || 'N/A',
        email: data.email || 'no-email@local.dev',
        phone: data.phone,
        company: data.company,
      }
    }))
    
    setLocalRegistrations(prev => [...prev, ...newRegistrations])
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.status === 'active' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : event.status === 'draft'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
            }`}>
              {event.status}
            </span>
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
              <div>
                {localRegistrations.length > 0 && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    <span className="mr-2">💾</span>
                    {localRegistrations.length} inscription{localRegistrations.length > 1 ? 's' : ''} locale{localRegistrations.length > 1 ? 's' : ''} (disparaîtront au reload)
                  </div>
                )}
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
            />
          </div>
        )}

        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Builder */}
            <div className="space-y-6">
              <FormBuilder
                fields={formFields}
                onChange={setFormFields}
              />
              
              <EmbedCodeGenerator
                eventId={event.id}
                publicToken={event.publicToken || ''}
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
