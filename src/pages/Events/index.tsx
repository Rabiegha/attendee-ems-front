import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGetEventsQuery, eventsApi } from '@/features/events/api/eventsApi'
import { selectUser } from '@/features/auth/model/sessionSlice'
import { Can } from '@/shared/acl/guards/Can'
import {
  Button,
  Card,
  CardContent,
  PageContainer,
  PageHeader,
  PageSection,
  LoadingSpinner,
  LoadingState,
  SearchInput,
  EventsPageSkeleton,
  FilterBar,
  FilterButton,
  FilterTagMulti,
  FilterSort,
  type FilterValues,
  type SortOption,
} from '@/shared/ui'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import { DeleteEventModal } from '@/features/events/ui/DeleteEventModal'
import { formatDateForDisplay } from '@/shared/lib/date-utils'
import { formatAttendeesCount } from '@/shared/lib/utils'
import { Plus, Calendar, MapPin, Users, Clock, X } from 'lucide-react'

interface EventsPageProps {}

export const EventsPage: React.FC<EventsPageProps> = () => {
  const { t } = useTranslation(['events', 'common'])
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // État pour les modals
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [deletingEvent, setDeletingEvent] = useState<any>(null)

  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [sortValue, setSortValue] = useState<string>('createdAt-desc')

  // Récupérer l'utilisateur actuel
  const currentUser = useSelector(selectUser)

  // Extraction des valeurs de filtres et tri
  const statusFilter = filterValues.status as string | undefined
  const locationTypeFilter = filterValues.locationType as string | undefined
  const eventStateFilter = filterValues.eventState as string | undefined
  const assignedToMeFilter = filterValues.assignedToMe as string | undefined
  const [sortBy, sortOrder] = sortValue.split('-') as [string, 'asc' | 'desc']

  // Récupération des événements avec filtres
  const queryParams = useMemo(() => {
    const params: any = {
      sortBy,
      sortOrder,
      limit: 500, // Augmenté de 50 à 100 pour afficher plus d'événements
    }

    if (searchQuery) {
      params.search = searchQuery
    }

    return params
  }, [searchQuery, sortBy, sortOrder])

  const { data: events = [], isLoading, error } = useGetEventsQuery(queryParams)

  const handleRefresh = () => {
    dispatch(eventsApi.util.invalidateTags(['Events']))
  }

  // Filtrage côté client pour tags et autres filtres
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filtre par tags (multi-sélection - logique AND : l'événement doit avoir TOUS les tags sélectionnés)
      if (tagFilters.length > 0) {
        const hasAllTags = tagFilters.every(selectedTag => event.tags.includes(selectedTag))
        if (!hasAllTags) {
          return false
        }
      }

      // Filtre par attribution (événements assignés à l'utilisateur actuel)
      if (assignedToMeFilter && assignedToMeFilter !== 'all' && currentUser) {
        const isAssigned = event.partnerIds.includes(currentUser.id)
        
        // Si on veut les événements attribués et qu'il ne l'est pas, ou vice versa
        if (assignedToMeFilter === 'yes' && !isAssigned) {
          return false
        }
        if (assignedToMeFilter === 'no' && isAssigned) {
          return false
        }
      }

      // Filtre par statut (single select)
      if (statusFilter && statusFilter !== 'all' && event.status !== statusFilter) {
        return false
      }

      // Filtre par type de lieu
      if (locationTypeFilter && locationTypeFilter !== 'all' && event.locationType !== locationTypeFilter) {
        return false
      }

      // Filtre par état de l'événement (terminé, en cours, à venir)
      if (eventStateFilter && eventStateFilter !== 'all') {
        const now = new Date()
        const start = new Date(event.startDate)
        const end = new Date(event.endDate)
        
        if (eventStateFilter === 'completed' && end > now) return false
        if (eventStateFilter === 'ongoing' && (start > now || end < now)) return false
        if (eventStateFilter === 'upcoming' && start < now) return false
      }

      return true
    })
  }, [events, tagFilters, statusFilter, locationTypeFilter, eventStateFilter, assignedToMeFilter, currentUser])

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  // Configuration des filtres pour le popup
  const filterConfig = {
    status: {
      label: 'Statut',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'draft', label: 'Brouillon' },
        { value: 'published', label: 'Publié' },
        { value: 'active', label: 'Actif' },
        { value: 'completed', label: 'Terminé' },
        { value: 'cancelled', label: 'Annulé' },
      ],
    },
    locationType: {
      label: 'Type de lieu',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'online', label: 'En ligne' },
        { value: 'physical', label: 'Physique' },
        { value: 'hybrid', label: 'Hybride' },
      ],
    },
    eventState: {
      label: 'État de l\'événement',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'upcoming', label: 'À venir' },
        { value: 'ongoing', label: 'En cours' },
        { value: 'completed', label: 'Terminé' },
      ],
    },    assignedToMe: {
      label: 'Attribution',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les événements' },
        { value: 'yes', label: 'Attribués à moi' },
        { value: 'no', label: 'Non attribués' },
      ],
    },  }

  // Options de tri
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: 'Créé (plus récent)' },
    { value: 'createdAt-asc', label: 'Créé (plus ancien)' },
    { value: 'startDate-asc', label: 'Date (plus proche)' },
    { value: 'startDate-desc', label: 'Date (plus loin)' },
    { value: 'name-asc', label: 'Nom (A-Z)' },
    { value: 'name-desc', label: 'Nom (Z-A)' },
  ]

  const handleResetFilters = () => {
    setSearchQuery('')
    setTagFilters([])
    setFilterValues({})
    setSortValue('createdAt-desc')
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
        <PageHeader
          title="Événements"
          description="Gérez vos événements"
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
          <FilterBar
            resultCount={filteredEvents.length}
            resultLabel="événement"
            onReset={handleResetFilters}
            showResetButton={searchQuery !== '' || tagFilters.length > 0 || Object.keys(filterValues).length > 0}
          >
            <SearchInput
              placeholder="Rechercher des événements..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
            />

            <FilterTagMulti
              value={tagFilters}
              onChange={setTagFilters}
              placeholder="Filtrer par tags..."
              className="w-64"
            />

            <FilterButton
              filters={filterConfig}
              values={filterValues}
              onChange={setFilterValues}
            />

            <FilterSort
              value={sortValue}
              onChange={setSortValue}
              options={sortOptions}
            />
          </FilterBar>

          {/* Tags sélectionnés */}
          {tagFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tagFilters.map((tagName) => (
                <span
                  key={tagName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                >
                  {tagName}
                  <button
                    type="button"
                    onClick={() => setTagFilters(tagFilters.filter(t => t !== tagName))}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={`Retirer le tag ${tagName}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setTagFilters([])}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium transition-colors"
              >
                Tout effacer
              </button>
            </div>
          )}
        </PageSection>

        <PageSection spacing="lg">
          <EventsPageSkeleton />
        </PageSection>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement des événements
          </p>
        </div>
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
        <FilterBar
          resultCount={filteredEvents.length}
          resultLabel="événement"
          onReset={handleResetFilters}
          showResetButton={searchQuery !== '' || tagFilters.length > 0 || Object.keys(filterValues).length > 0}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder="Rechercher des événements..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <FilterTagMulti
            value={tagFilters}
            onChange={setTagFilters}
            placeholder="Filtrer par tags..."
            className="w-64 flex-shrink-0"
          />

          <FilterButton
            filters={filterConfig}
            values={filterValues}
            onChange={setFilterValues}
          />

          <FilterSort
            value={sortValue}
            onChange={setSortValue}
            options={sortOptions}
          />
        </FilterBar>

        {/* Tags sélectionnés */}
        {tagFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tagFilters.map((tagName) => (
              <span
                key={tagName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
              >
                {tagName}
                <button
                  type="button"
                  onClick={() => setTagFilters(tagFilters.filter(t => t !== tagName))}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label={`Retirer le tag ${tagName}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setTagFilters([])}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-sm font-medium transition-colors"
            >
              Tout effacer
            </button>
          </div>
        )}
      </PageSection>

      {/* Liste des événements */}
      <PageSection spacing="lg">{filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Aucun événement trouvé</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || tagFilters.length > 0 || Object.keys(filterValues).length > 0
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
          </div>
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
                  className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
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

                      {event.addressFormatted && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate">{event.addressFormatted}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {formatAttendeesCount(event.currentAttendees, event.capacity || 999999)}
                        </span>
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        {event.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
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
