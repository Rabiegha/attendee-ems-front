import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { useGetRecentRegistrationsQuery } from '@/features/registrations/api/registrationsApi'
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
  ChevronDown,
  CalendarDays,
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'events', 'auth'])
  const currentUser = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  
  // États pour gérer le nombre d'éléments affichés
  const [eventsLimit, setEventsLimit] = useState(5)
  const [attendeesLimit, setAttendeesLimit] = useState(5)
  const [registrationsLimit, setRegistrationsLimit] = useState(5)

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

  // Récupérer les événements récents pour l'affichage (seulement si l'utilisateur a la permission)
  const { data: eventsResponse, isLoading: eventsLoading } = useGetEventsQuery(
    {
      limit: eventsLimit,
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    {
      skip: !canReadEvent, // Ne pas faire l'appel si pas de permission
    }
  )
  const events = eventsResponse?.data || []
  const totalEvents = eventsResponse?.meta?.total || 0

  // Récupérer TOUS les événements pour le comptage total (seulement si l'utilisateur a la permission)
  const { data: allEventsResponse } = useGetEventsQuery(
    {
      limit: 1000, // Limite haute pour avoir tous les événements
    },
    {
      skip: !canReadEvent, // Ne pas faire l'appel si pas de permission
    }
  )
  const allEvents = allEventsResponse?.data || []

  const { data: attendeesResponse, isLoading: attendeesLoading } =
    useGetAttendeesQuery(
      {
        page: 1,
        limit: attendeesLimit,
        sortBy: 'created_at',
        sortDir: 'desc',
      },
      {
        skip: !canReadAttendee, // Ne pas faire l'appel si pas de permission
      }
    )

  // Récupérer les inscriptions récentes pour l'affichage
  const { data: recentRegistrationsResponse, isLoading: registrationsLoading } =
    useGetRecentRegistrationsQuery(
      {
        limit: registrationsLimit,
      },
      {
        skip: !canReadAttendee, // Utilise la même permission que les attendees
      }
    )

  const recentRegistrations = recentRegistrationsResponse || []

  // Récupérer le total des inscriptions
  const { data: allRegistrationsResponse } = useGetRecentRegistrationsQuery(
    {
      limit: 1000, // Limite haute pour avoir toutes les inscriptions
    },
    {
      skip: !canReadAttendee,
    }
  )
  const totalRegistrations = allRegistrationsResponse?.length || 0

  // Récupérer le total des participants depuis meta
  const attendees = attendeesResponse?.data || []
  const totalAttendees = attendeesResponse?.meta?.total || attendees.length
  
  // Fonctions pour charger plus d'éléments
  const handleLoadMoreEvents = () => {
    setEventsLimit(prev => prev + 5)
  }
  
  const handleLoadMoreAttendees = () => {
    setAttendeesLimit(prev => prev + 5)
  }

  const handleLoadMoreRegistrations = () => {
    setRegistrationsLimit(prev => prev + 5)
  }

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
                {events.length < totalEvents && (
                  <button
                    onClick={handleLoadMoreEvents}
                    className="w-full py-2 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Voir plus
                  </button>
                )}
              </div>
            )}

            {canReadAttendee && (
              <div className="space-y-4">
                <h2 className="section-title">Inscriptions récentes</h2>
                {registrationsLoading ? (
                  <DashboardAttendeeListSkeleton />
                ) : !recentRegistrations || recentRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>Aucune inscription récente</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {recentRegistrations.map((registration) => (
                        <Link
                          key={registration.id}
                          to={`/attendees/${registration.attendeeId}`}
                          className="block border-l-4 border-green-500 dark:border-green-400 pl-4 pr-4 py-2 bg-white dark:bg-gray-800 rounded-r-lg transition-all duration-200 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                {registration.attendee?.firstName} {registration.attendee?.lastName}
                              </h3>
                              <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                                  {registration.attendee?.email}
                                </div>
                                {registration.createdAt && (
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDateForDisplay(registration.createdAt)}
                                  </div>
                                )}
                                {registration.event && (
                                  <div className="flex items-center">
                                    <CalendarDays className="h-4 w-4 mr-1 flex-shrink-0" />
                                    <Link
                                      to={`/events/${registration.event.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                      {registration.event.name}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  registration.status === 'approved'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                    : registration.status === 'awaiting'
                                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                }`}
                              >
                                {registration.status === 'approved'
                                  ? 'Approuvé'
                                  : registration.status === 'awaiting'
                                    ? 'En attente'
                                    : 'Refusé'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {recentRegistrations.length < totalRegistrations && (
                      <button
                        onClick={handleLoadMoreRegistrations}
                        className="w-full py-2 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Voir plus
                      </button>
                    )}
                  </>
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
