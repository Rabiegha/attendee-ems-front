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
  ActionGroup,
} from '@/shared/ui'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
  Clock,
  Activity,
  BarChart3,
} from 'lucide-react'
import { formatDate } from '@/shared/lib/utils'
import { HistoryTable } from './HistoryTable'

export const AttendeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  // État de pagination pour l'historique
  const [historyPage, setHistoryPage] = React.useState(1)
  const [historyPageSize, setHistoryPageSize] = React.useState(10)

  // Vérifier si l'utilisateur est SUPER_ADMIN
  const isSuperAdmin = user?.roles?.[0] === 'SUPER_ADMIN'

  const {
    data: attendee,
    isLoading: attendeeLoading,
    error: attendeeError,
  } = useGetAttendeeByIdQuery(id!, { skip: !id })

  const {
    data: historyResponse,
    isLoading: historyLoading,
    error: historyError,
  } = useGetAttendeeHistoryQuery(
    { 
      attendeeId: id!, 
      email: attendee?.email || '', 
      page: historyPage,
      limit: historyPageSize 
    },
    { skip: !id || !attendee?.email }
  )

  const history = historyResponse?.data.map(item => ({
    ...item,
    checkedIn: !!item.checkedInAt,
  })) || []
  const historyMeta = historyResponse?.meta

  if (!id) {
    navigate('/attendees')
    return null
  }

  if (attendeeLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Info Cards Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="default" padding="lg">
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} variant="default" padding="lg">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* History Table Skeleton */}
        <div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <Card variant="default" padding="none">
            <CardContent>
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
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
              Erreur lors du chargement
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
            {historyError ? (
              <div className="p-6 text-center">
                <p className="text-red-600 dark:text-red-400">
                  Erreur lors du chargement de l'historique
                </p>
              </div>
            ) : history.length === 0 && !historyLoading ? (
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
              <HistoryTable
                history={history}
                currentDisplayName={attendee.displayName}
                isSuperAdmin={isSuperAdmin}
                isLoading={historyLoading}
                currentPage={historyPage}
                pageSize={historyPageSize}
                totalPages={historyMeta?.totalPages || 0}
                totalItems={historyMeta?.total || 0}
                onPageChange={setHistoryPage}
                onPageSizeChange={setHistoryPageSize}
              />
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
