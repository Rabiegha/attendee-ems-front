import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetAttendeeByIdQuery,
  useGetAttendeeHistoryQuery,
} from '@/features/attendees/api/attendeesApi'
import { useSelector } from 'react-redux'
import { selectUser } from '@/features/auth/model/sessionSlice'
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
  LoadingSpinner,
  ActionGroup,
} from '@/shared/ui'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Activity,
  BarChart3,
} from 'lucide-react'
import { formatDate } from '@/shared/lib/utils'

export const AttendeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  // Vérifier si l'utilisateur est SUPER_ADMIN
  const isSuperAdmin = user?.roles?.[0] === 'SUPER_ADMIN'

  // Fonction pour naviguer vers un événement
  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  const {
    data: attendee,
    isLoading: attendeeLoading,
    error: attendeeError,
  } = useGetAttendeeByIdQuery(id!, { skip: !id })

  const {
    data: history = [],
    isLoading: historyLoading,
    error: historyError,
  } = useGetAttendeeHistoryQuery(
    { attendeeId: id!, email: attendee?.email || '' },
    { skip: !id || !attendee?.email }
  )

  if (!id) {
    navigate('/attendees')
    return null
  }

  if (attendeeLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            Chargement des détails du participant...
          </span>
        </div>
      </PageContainer>
    )
  }

  if (attendeeError || !attendee) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-2">
              ❌ Erreur lors du chargement
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Impossible de charger les détails du participant.
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/attendees')}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Retour aux participants
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  // Calculer les statistiques à partir de l'historique
  const stats = {
    totalEvents: history.length,
    completedEvents: history.filter((h) => h.event.status === 'completed')
      .length,
    upcomingEvents: history.filter(
      (h) => h.event.status === 'active' || h.event.status === 'published'
    ).length,
    lastParticipation:
      history.length > 0 && history[0]?.event?.startDate
        ? history[0].event.startDate
        : null,
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={`${attendee.displayName}`}
        description={`Profil détaillé et historique de participation`}
        icon={User}
        actions={
          <ActionGroup align="right" spacing="md">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate('/attendees')}
            >
              Retour
            </Button>
          </ActionGroup>
        }
      />

      {/* Informations principales */}
      <PageSection spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Contact */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Email
                  </h3>
                  <p className="text-body-sm text-gray-600 dark:text-gray-300 break-all">
                    {attendee.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Entreprise */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Entreprise
                  </h3>
                  <p className="text-body-sm text-gray-600 dark:text-gray-300">
                    {attendee.company || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Téléphone */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Téléphone
                  </h3>
                  <p className="text-body-sm text-gray-600 dark:text-gray-300">
                    {attendee.phone || 'Non renseigné'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Inscription */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Inscription
                  </h3>
                  <p className="text-body-sm text-gray-600 dark:text-gray-300">
                    {formatDate(attendee.registrationDate)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Statistiques */}
      <PageSection title="Statistiques" spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    Total événements
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {stats.totalEvents}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    Événements terminés
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {stats.completedEvents}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    Événements à venir
                  </p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                    {stats.upcomingEvents}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    Dernière participation
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                    {stats.lastParticipation
                      ? formatDate(stats.lastParticipation)
                      : 'Aucune'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Historique des participations */}
      <PageSection title="Historique des participations" spacing="lg">
        <Card variant="default" padding="none">
          <CardContent>
            {historyLoading ? (
              <div className="p-6 text-center">
                <LoadingSpinner size="md" />
                <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-4">
                  Chargement de l'historique...
                </p>
              </div>
            ) : historyError ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">
                  Erreur lors du chargement de l'historique
                </p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3 mx-auto" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Aucune participation trouvée
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Ce participant n'a pas encore participé à d'événements
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Événement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Lieu
                      </th>
                      {isSuperAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Organisation
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut événement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut participation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nom utilisé
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {history.map((participation) => (
                      <tr
                        key={`${participation.event.id}-${participation.id}`}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                        onClick={() => handleEventClick(participation.event.id)}
                        title="Cliquer pour voir l'événement"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            {participation.event.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {participation.event.description &&
                            participation.event.description.length > 50
                              ? `${participation.event.description.substring(0, 50)}...`
                              : participation.event.description ||
                                'Aucune description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(participation.event.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            {participation.event.location || 'Non spécifié'}
                          </div>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                              {participation.event.organizationName ||
                                'Organisation inconnue'}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              participation.event.status === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : participation.event.status === 'active'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : participation.event.status === 'published'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {participation.event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              participation.status === 'confirmed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : participation.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : participation.status === 'checked_in'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {participation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {participation.displayName !==
                          attendee.displayName ? (
                            <div className="space-y-1">
                              <div className="font-medium">
                                {participation.displayName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                (Différent du nom actuel)
                              </div>
                            </div>
                          ) : (
                            participation.displayName
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Données personnalisées du formulaire */}
      {attendee.metadata && Object.keys(attendee.metadata).length > 0 && (
        <PageSection title="Données du formulaire" spacing="lg">
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(attendee.metadata).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {typeof value === 'object'
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </PageSection>
      )}
    </PageContainer>
  )
}
