import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { TagFilterInput } from '@/features/tags'
import { Can } from '@/shared/acl/guards/Can'
import {
  Button,
  Input,
  Select,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
  LoadingSpinner,
} from '@/shared/ui'
import { CreateEventModal } from '@/features/events/ui/CreateEventModal'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import { DeleteEventModal } from '@/features/events/ui/DeleteEventModal'
import { formatDateForDisplay } from '@/shared/lib/date-utils'
import { formatAttendeesCount } from '@/shared/lib/utils'
import { Plus, Search, Calendar, MapPin, Users, Clock } from 'lucide-react'

interface EventsPageProps {}

export const EventsPage: React.FC<EventsPageProps> = () => {
  const { t } = useTranslation(['events', 'common'])

  // État pour les modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [deletingEvent, setDeletingEvent] = useState<any>(null)

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'createdAt'>(
    'createdAt'
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Récupération des événements avec filtres
  const queryParams = useMemo(() => {
    const params: any = {
      sortBy,
      sortOrder,
      limit: 50,
    }

    if (searchQuery) {
      params.search = searchQuery
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter
    }

    return params
  }, [searchQuery, statusFilter, sortBy, sortOrder])

  const { data: events = [], isLoading, error } = useGetEventsQuery(queryParams)

  // Filtrage côté client pour les tags (car l'API ne supporte pas encore le filtre par tag)
  const filteredEvents = useMemo(() => {
    if (!tagFilter) return events
    return events.filter((event) => 
      event.tags && Array.isArray(event.tags) && event.tags.includes(tagFilter)
    )
  }, [events, tagFilter])

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-body-sm text-gray-500 dark:text-gray-400 ml-4">
            Chargement des événements...
          </p>
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <Card variant="default" padding="lg" className="text-center">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">
              Erreur lors du chargement des événements
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={t('events:page.title')}
        description={`${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''} trouvé${filteredEvents.length > 1 ? 's' : ''}`}
        icon={Calendar}
        actions={
          <Can do="create" on="Event">
            <Button
              onClick={handleCreateEvent}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t('events:actions.create')}
            </Button>
          </Can>
        }
      />

      {/* Filtres et recherche */}
      <PageSection spacing="lg">
        <Card variant="default" padding="lg">
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Rechercher des événements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              {/* Tag Filter */}
              <div className="w-64">
                <TagFilterInput
                  value={tagFilter}
                  onChange={setTagFilter}
                  placeholder="Filtrer par tag..."
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </Select>

              {/* Sort */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as any)
                  setSortOrder(order as any)
                }}
                className="w-56"
              >
                <option value="createdAt-desc">Créé (plus récent)</option>
                <option value="createdAt-asc">Créé (plus ancien)</option>
                <option value="startDate-asc">Date (plus ancien)</option>
                <option value="startDate-desc">Date (plus récent)</option>
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Liste des événements */}
      <PageSection spacing="lg">
        {filteredEvents.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center py-12">
            <CardContent>
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-heading-sm mb-2">Aucun événement trouvé</h3>
              <p className="text-body text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Aucun événement ne correspond à votre recherche.'
                  : 'Commencez par créer votre premier événement.'}
              </p>
              <Can do="create" on="Event">
                <Button
                  onClick={handleCreateEvent}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Créer un événement
                </Button>
              </Can>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block group"
              >
                <Card
                  variant="elevated"
                  padding="none"
                  className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
                >
                  <CardContent className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-heading-sm line-clamp-2">
                        {event.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-body-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-body-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{formatDateForDisplay(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {formatAttendeesCount(event.currentAttendees, event.maxAttendees)}
                        </span>
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {event.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="text-caption">
                            +{event.tags.length - 3} autres
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageSection>

      {/* Modal de création d'événement */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal d'édition d'événement */}
      <EditEventModal
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
      />

      {/* Modal de suppression d'événement */}
      <DeleteEventModal
        event={deletingEvent}
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
      />
    </PageContainer>
  )
}

export default EventsPage
