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
import { 
  Button, 
  PageContainer, 
  PageHeader, 
  PageSection,
  Card,
  CardContent,
  ActionGroup
} from '@/shared/ui'
import { CreateEventModal } from '@/features/events/ui/CreateEventModal'
import { Plus, Users, Calendar, Building2, Mail, Shield, LayoutDashboard } from 'lucide-react'

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
    sortBy: 'email',
    sortDir: 'desc',
  })

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true)
  }

  // Dashboard pour les admins/managers (permissions complètes)
  if (canReadOrganization) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        {/* User & Organization Info Card */}
        <Card variant="default" padding="lg" className="mb-6">
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {organization?.name || 'Organisation inconnue'}
                  </h2>
                  <p className="text-body-sm text-gray-600 dark:text-gray-300">
                    Organisation ID: {organization?.id || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 text-body-sm">
                  <Shield className="h-4 w-4" />
                  <span>Rôle: {currentUser?.roles?.[0] || 'Inconnu'}</span>
                </div>
                {currentUser?.email && (
                  <div className="flex items-center space-x-2 text-body-sm mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{currentUser.email}</span>
                  </div>
                )}
                <p className="text-caption mt-2">
                  Utilisateur ID: {currentUser?.id || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Welcome message */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-body">
                Bienvenue{currentUser?.firstName ? ` ${currentUser.firstName}` : ''} ! 
                Vous êtes connecté en tant que <span className="font-medium">{currentUser?.roles?.[0]}</span> 
                {organization?.name && ` dans l'organisation ${organization.name}`}.
              </p>
            </div>
          </CardContent>
        </Card>

        <PageHeader 
          title={t('navigation.dashboard')}
          description="Vue d'ensemble de votre organisation"
          icon={LayoutDashboard}
          actions={
            <Can do="create" on="Event">
              <Button onClick={handleCreateEvent} leftIcon={<Plus className="h-4 w-4" />}>
                {t('events:events.create')}
              </Button>
            </Can>
          }
        />

        <PageSection spacing="lg">
          <StatsCards 
            events={events} 
            attendees={attendees}
            isLoading={eventsLoading || attendeesLoading}
          />
        </PageSection>

        <PageSection spacing="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="section-title">
                Événements récents
              </h2>
              <EventList events={events} isLoading={eventsLoading} />
            </div>

            <div className="space-y-4">
              <h2 className="section-title">
                Participants récents
              </h2>
              <Card variant="default" padding="md">
                <CardContent>
                  {attendeesLoading ? (
                    <div className="animate-pulse space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      ))}
                    </div>
                  ) : attendees.length > 0 ? (
                    <div className="space-y-2">
                      {attendees.slice(0, 5).map((attendee) => (
                        <div key={attendee.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {attendee.firstName} {attendee.lastName}
                          </span>
                          <span className="text-caption">
                            {attendee.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-body-sm text-gray-500 dark:text-gray-400">
                      {t('attendees:attendees.empty')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </PageSection>

        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </PageContainer>
    )
  }

  // Dashboard simplifié pour les utilisateurs avec permissions limitées (partenaires, staff, etc.)
  return (
    <PageContainer maxWidth="7xl" padding="lg">
      {/* En-tête avec informations utilisateur */}
      <Card variant="default" padding="lg" className="mb-6">
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="page-title">
                {t('common:welcome')}
              </h1>
              <p className="page-subtitle mt-1">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              {currentUser?.email && (
                <div className="flex items-center space-x-2 text-body-sm mt-2">
                  <Mail className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-body-sm">
                <Shield className="h-4 w-4" />
                <span>Rôle: {currentUser?.roles?.[0] || 'Utilisateur'}</span>
              </div>
              {organization && (
                <p className="text-body-sm mt-2">
                  {organization.name}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de base accessibles */}
      <PageSection title="Accès rapide" spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Événements */}
          {canReadEvent && (
            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Événements</h3>
                    <p className="text-body-sm">
                      {eventsLoading ? '...' : `${events.length} accessibles`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Participants */}
          {canReadAttendee && (
            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Participants</h3>
                    <p className="text-body-sm">
                      {attendeesLoading ? '...' : `${attendees.length} participants`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organisation (si permission) */}
          {organization && canReadOrganization && (
            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Organisation</h3>
                    <p className="text-body-sm">{organization.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageSection>

      {/* Accès rapide aux fonctions disponibles */}
      {(canReadEvent || canReadAttendee) && (
        <PageSection spacing="lg">
          <Card variant="default" padding="lg">
            <CardContent>
              <h3 className="section-title mb-4">Navigation rapide</h3>
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
            </CardContent>
          </Card>
        </PageSection>
      )}

      {/* Message d'aide si aucune permission */}
      {!canReadEvent && !canReadAttendee && !canReadOrganization && (
        <Card variant="default" padding="lg" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Besoin d'aide ou de permissions supplémentaires ?
                </h3>
                <p className="text-body-sm text-blue-700 dark:text-blue-300 mt-1">
                  Contactez votre administrateur pour obtenir l'accès aux fonctionnalités dont vous avez besoin.
                </p>
                {organization && (
                  <p className="text-body-sm text-blue-600 dark:text-blue-400 mt-2">
                    <strong>Organisation :</strong> {organization.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
