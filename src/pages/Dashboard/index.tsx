import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { StatsCards } from '@/widgets/StatsCards'
import { EventList } from '@/features/events/ui/EventList'
import { Can } from '@/shared/acl/guards/Can'
import { useCan } from '@/shared/acl/hooks/useCan'
import { Button } from '@/shared/ui/Button'
import { CreateEventModal } from '@/features/events/ui/CreateEventModal'
import { Plus, Users, Calendar, Building2, Mail, Shield } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'events', 'auth'])
  const currentUser = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  
  // État pour la modal de création d'événement
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Permissions
  const canReadOrganization = useCan('read', 'Organization')
  const canReadEvent = useCan('read', 'Event')
  const canReadAttendee = useCan('read', 'Attendee')
  
  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({
    limit: 5,
    sortBy: 'startDate',
    sortOrder: 'asc',
  })
  
  const { data: attendees = [], isLoading: attendeesLoading } = useGetAttendeesQuery({
    limit: 10,
    sortBy: 'registrationDate',
    sortOrder: 'desc',
  })

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true)
  }

  // Dashboard pour les admins/managers (permissions complètes)
  if (canReadOrganization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('navigation.dashboard')}
          </h1>
          <Can do="create" on="Event">
            <Button onClick={handleCreateEvent} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('events:events.create')}</span>
            </Button>
          </Can>
        </div>

        <StatsCards 
          events={events} 
          attendees={attendees}
          isLoading={eventsLoading || attendeesLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('events:events.recent')}
            </h2>
            <EventList events={events} isLoading={eventsLoading} />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('attendees:attendees.recent')}
            </h2>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {attendeesLoading ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : attendees.length > 0 ? (
                <div className="space-y-2">
                  {attendees.slice(0, 5).map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {attendee.firstName} {attendee.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {attendee.email}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('attendees:attendees.empty')}
                </p>
              )}
            </div>
          </div>
        </div>

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    )
  }

  // Dashboard simplifié pour les utilisateurs avec permissions limitées (partenaires, staff, etc.)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('common:welcome')}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="h-4 w-4" />
          <span>{currentUser?.roles?.[0] || 'Utilisateur'}</span>
        </div>
      </div>

      {/* Informations de base accessibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mon Profil</h3>
              <p className="text-sm text-gray-600">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Organisation */}
        {organization && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Organisation</h3>
                <p className="text-sm text-gray-600">{organization.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nombre d'événements accessibles */}
        {canReadEvent && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Événements</h3>
                <p className="text-sm text-gray-600">
                  {eventsLoading ? '...' : `${events.length} accessibles`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact administrateur si besoin */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Besoin d'aide ou de permissions supplémentaires ?
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Contactez votre administrateur pour obtenir l'accès aux fonctionnalités dont vous avez besoin.
            </p>
            <p className="text-sm text-blue-600 mt-2">
              <strong>Organisation :</strong> {organization?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Accès rapide aux fonctions disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canReadEvent && (
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/events'}
          >
            <Calendar className="h-6 w-6" />
            <span>Voir les événements</span>
          </Button>
        )}
        
        {canReadAttendee && (
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2"
            onClick={() => window.location.href = '/attendees'}
          >
            <Users className="h-6 w-6" />
            <span>Voir les participants</span>
          </Button>
        )}
      </div>
    </div>
  )
}
