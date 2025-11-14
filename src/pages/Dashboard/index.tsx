import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import {
  selectUser,
  selectOrganization,
} from '@/features/auth/model/sessionSlice'
import { StatsCards } from '@/widgets/StatsCards'
import { EventList } from '@/features/events/ui/EventList'
import { formatDateForDisplay } from '@/shared/lib/date-utils'

import { useCan } from '@/shared/acl/hooks/useCan'
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
} from '@/shared/ui'
import {
  Users,
  Calendar,
  Building2,
  Mail,
  Shield,
  LayoutDashboard,
  User,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'events', 'auth'])
  const currentUser = useSelector(selectUser)
  const organization = useSelector(selectOrganization)

  // Permissions
  const canReadOrganization = useCan('read', 'Organization')
  const canReadEvent = useCan('read', 'Event')
  const canReadAttendee = useCan('read', 'Attendee')

  // Récupérer les 5 derniers événements pour l'affichage
  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({
    limit: 5,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  // Récupérer TOUS les événements pour le comptage total
  const { data: allEvents = [] } = useGetEventsQuery({
    limit: 1000, // Limite haute pour avoir tous les événements
  })

  const { data: attendeesResponse, isLoading: attendeesLoading } =
    useGetAttendeesQuery({
      page: 1,
      pageSize: 5,
      sortBy: 'created_at',
      sortDir: 'desc',
    })

  // Récupérer le total des participants depuis meta
  const attendees = attendeesResponse?.data || []
  const totalAttendees = attendeesResponse?.meta?.total || attendees.length

  // Dashboard pour les admins/managers (permissions complètes)
  if (canReadOrganization) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader
          title={t('navigation.dashboard')}
          description={`Bienvenue ${currentUser?.firstName || ''} ! Vous êtes connecté en tant que ${currentUser?.roles?.[0] || 'Utilisateur'}${organization?.name ? ` dans l'organisation ${organization.name}` : ''}.`}
          icon={LayoutDashboard}
        />

        <PageSection spacing="lg">
          <StatsCards
            events={allEvents}
            attendees={attendees}
            totalAttendees={totalAttendees}
            isLoading={eventsLoading || attendeesLoading}
          />
        </PageSection>

        <PageSection spacing="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="section-title">Événements récents</h2>
              <EventList events={events} isLoading={eventsLoading} />
            </div>

            <div className="space-y-4">
              <h2 className="section-title">Participants récents</h2>
              {attendeesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p>{t('attendees:attendees.empty')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendees.map((attendee) => (
                    <Link
                      key={attendee.id}
                      to={`/attendees/${attendee.id}`}
                      className="block border-l-4 border-blue-500 dark:border-blue-400 pl-4 pr-4 py-2 bg-white dark:bg-gray-800 rounded-r-lg transition-all duration-200 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {attendee.firstName} {attendee.lastName}
                          </h3>
                          <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {attendee.email}
                            </div>
                            {attendee.createdAt && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDateForDisplay(attendee.createdAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                            Actif
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PageSection>
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
              <h1 className="page-title">{t('common:welcome')}</h1>
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
                <p className="text-body-sm mt-2">{organization.name}</p>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Événements
                    </h3>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Participants
                    </h3>
                    <p className="text-body-sm">
                      {attendeesLoading
                        ? '...'
                        : `${attendees.length} participants`}
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Organisation
                    </h3>
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
                    onClick={() => (window.location.href = '/events')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Voir les événements</span>
                  </Button>
                )}

                {canReadAttendee && (
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => (window.location.href = '/attendees')}
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
        <Card
          variant="default"
          padding="lg"
          className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        >
          <CardContent>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Besoin d'aide ou de permissions supplémentaires ?
                </h3>
                <p className="text-body-sm text-blue-700 dark:text-blue-300 mt-1">
                  Contactez votre administrateur pour obtenir l'accès aux
                  fonctionnalités dont vous avez besoin.
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
