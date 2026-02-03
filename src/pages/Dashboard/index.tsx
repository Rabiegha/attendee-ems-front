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
import { useMeQuery } from '@/features/auth/api/authApi'
import { StatsCards } from '@/widgets/StatsCards'
import { EventList } from '@/features/events/ui/EventList'
import { formatDateForDisplay } from '@/shared/lib/date-utils'

import { useCan } from '@/shared/acl/hooks/useCan'
import {
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
  DashboardAttendeeListSkeleton,
} from '@/shared/ui'
import {
  Users,
  Calendar,
  Mail,
  LayoutDashboard,
  User,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'events', 'auth'])
  const currentUser = useSelector(selectUser)
  const organization = useSelector(selectOrganization)

  // Récupérer les infos à jour depuis l'API
  const { data: userProfile } = useMeQuery(undefined, {
    skip: !currentUser,
  })

  // Permissions
  const canReadOrganization = useCan('read', 'Organization')
  const canReadEvent = useCan('read', 'Event')
  const canReadAttendee = useCan('read', 'Attendee')
  const canCreateEvent = useCan('create', 'Event')
  const canInviteUser = useCan('create', 'User')

  // Note: L'API backend filtre automatiquement selon le scope de l'utilisateur
  // Si l'utilisateur a "read:assigned", le backend retourne seulement les éléments assignés
  // Si l'utilisateur a "read:any", le backend retourne tout

  // Récupérer les 10 derniers événements pour l'affichage (seulement si l'utilisateur a la permission)
  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery(
    {
      limit: 10, // Augmenté de 5 à 10 pour afficher plus d'événements récents
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    {
      skip: !canReadEvent, // Ne pas faire l'appel si pas de permission
    }
  )

  // Récupérer TOUS les événements pour le comptage total (seulement si l'utilisateur a la permission)
  const { data: allEvents = [] } = useGetEventsQuery(
    {
      limit: 1000, // Limite haute pour avoir tous les événements
    },
    {
      skip: !canReadEvent, // Ne pas faire l'appel si pas de permission
    }
  )

  const { data: attendeesResponse, isLoading: attendeesLoading } =
    useGetAttendeesQuery(
      {
        page: 1,
        pageSize: 5,
        sortBy: 'created_at',
        sortDir: 'desc',
      },
      {
        skip: !canReadAttendee, // Ne pas faire l'appel si pas de permission
      }
    )

  // Récupérer le total des participants depuis meta
  const attendees = attendeesResponse?.data || []
  const totalAttendees = attendeesResponse?.meta?.total || attendees.length

  // Dashboard unifié avec éléments conditionnels
  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={t('navigation.dashboard')}
        description={`Bienvenue ${currentUser?.firstName || currentUser?.first_name || ''} ! Vous êtes connecté en tant que ${userProfile?.role?.name || 'Utilisateur'}${organization?.name ? ` dans l'organisation ${organization.name}` : ''}.`}
        icon={LayoutDashboard}
      />

      {/* Cartes de statistiques avec boutons d'action conditionnels */}
      <PageSection spacing="lg">
        <StatsCards
          events={allEvents}
          attendees={attendees}
          totalAttendees={totalAttendees}
          isLoading={eventsLoading || attendeesLoading}
          canCreateEvent={canCreateEvent}
          canInviteUser={canInviteUser}
        />
      </PageSection>

      {/* Listes détaillées (afficher selon les permissions de lecture) */}
      {(canReadEvent || canReadAttendee) && (
        <PageSection spacing="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {canReadEvent && (
              <div className="space-y-4">
                <h2 className="section-title">Événements récents</h2>
                <EventList events={events} isLoading={eventsLoading} />
              </div>
            )}

            {canReadAttendee && (
              <div className="space-y-4">
                <h2 className="section-title">Participants récents</h2>
                {attendeesLoading ? (
                  <DashboardAttendeeListSkeleton />
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
            )}
          </div>
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
