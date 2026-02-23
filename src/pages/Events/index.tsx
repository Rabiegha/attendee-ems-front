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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

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
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
    }

    if (searchQuery) {
      params.search = searchQuery
    }

    return params
  }, [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder])

  const { data: eventsResponse, isLoading, error } = useGetEventsQuery(queryParams)
  const events = eventsResponse?.data || []
  const totalPages = eventsResponse?.meta?.totalPages || 1
  const totalEvents = eventsResponse?.meta?.total || 0

  const handleRefresh = () => {
    dispatch(eventsApi.util.invalidateTags(['Events']))
  }

  // Réinitialiser la page à 1 quand les filtres changent
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, tagFilters, filterValues, sortValue])

  // Détecte si des filtres locaux (non gérés par l'API) sont actifs
  const hasLocalFilters = tagFilters.length > 0 
    || (statusFilter && statusFilter !== 'all') 
    || (locationTypeFilter && locationTypeFilter !== 'all')
    || (eventStateFilter && eventStateFilter !== 'all')
    || (assignedToMeFilter && assignedToMeFilter !== 'all')

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

  // Nombre total à afficher : si des filtres locaux sont actifs, on affiche le nombre filtré
  // Sinon on affiche le total de l'API qui prend en compte la recherche
  const displayCount = hasLocalFilters ? filteredEvents.length : totalEvents

  const handleCreateEvent = () => {
    navigate('/events/create')
  }

  // Configuration des filtres pour le popup
  const filterConfig = {
    status: {
      label: t('events:filters.status'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:filters.all') },
        { value: 'draft', label: t('events:status.draft') },
        { value: 'published', label: t('events:status.published') },
        { value: 'active', label: t('events:status.active') },
        { value: 'completed', label: t('events:status.completed') },
        { value: 'cancelled', label: t('events:status.cancelled') },
      ],
    },
    locationType: {
      label: t('events:filters.venue_type'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:filters.all') },
        { value: 'online', label: t('events:filters.online') },
        { value: 'physical', label: t('events:filters.physical') },
        { value: 'hybrid', label: t('events:filters.hybrid') },
      ],
    },
    eventState: {
      label: t('events:filters.event_state'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:filters.all') },
        { value: 'upcoming', label: t('events:filters.upcoming') },
        { value: 'ongoing', label: t('events:filters.ongoing') },
        { value: 'completed', label: t('events:filters.past') },
      ],
    },    assignedToMe: {
      label: t('events:filters.assignment'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('events:filters.all_events') },
        { value: 'yes', label: t('events:filters.assigned_to_me') },
        { value: 'no', label: t('events:filters.unassigned') },
      ],
    },  }

  // Options de tri
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: t('events:filters.sort_created_newest') },
    { value: 'createdAt-asc', label: t('events:filters.sort_created_oldest') },
    { value: 'startDate-asc', label: t('events:filters.sort_date_closest') },
    { value: 'startDate-desc', label: t('events:filters.sort_date_farthest') },
    { value: 'name-asc', label: t('events:filters.sort_name_az') },
    { value: 'name-desc', label: t('events:filters.sort_name_za') },
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
          title={t('events:page.title')}
          description={t('events:page.description')}
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
            resultCount={displayCount}
            resultLabel={t('events:page.result_label')}
            onReset={handleResetFilters}
            showResetButton={searchQuery !== '' || tagFilters.length > 0 || Object.keys(filterValues).length > 0}
          >
            <SearchInput
              placeholder={t('events:page.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
              className="flex-1"
            />

            <FilterTagMulti
              value={tagFilters}
              onChange={setTagFilters}
              placeholder={t('events:page.filter_by_tags')}
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
                {t('common:app.clear_all')}
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
            {t('events:page.loading_error')}
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={t('events:page.title')}
        description={filteredEvents.length > 1 ? t('events:page.found_many', { count: filteredEvents.length }) : t('events:page.found_one', { count: filteredEvents.length })}
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
          resultCount={displayCount}
          resultLabel={t('events:page.result_label')}
          onReset={handleResetFilters}
          showResetButton={searchQuery !== '' || tagFilters.length > 0 || Object.keys(filterValues).length > 0}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder={t('events:page.search_placeholder')}
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <FilterTagMulti
            value={tagFilters}
            onChange={setTagFilters}
            placeholder={t('events:page.filter_by_tags')}
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
              {t('common:app.clear_all')}
            </button>
          </div>
        )}
      </PageSection>

      {/* Liste des événements */}
      <PageSection spacing="lg">{filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('events:page.no_events')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || tagFilters.length > 0 || Object.keys(filterValues).length > 0
                ? t('events:page.no_events_filtered')
                : t('events:page.no_events_default')}
            </p>
            <Can do="create" on="Event">
              <Button
                onClick={handleCreateEvent}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {t('events:events.create')}
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
                            +{event.tags.length - 3} {t('common:table.others')}
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

        {/* Pagination */}
        {!isLoading && !error && filteredEvents.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            {/* Info pagination et sélecteur de taille */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>
                {t('common:pagination.showing', { from: (currentPage - 1) * itemsPerPage + 1, to: Math.min(currentPage * itemsPerPage, totalEvents), total: totalEvents })}
              </span>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">{t('common:pagination.per_page')}</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newSize = Number(e.target.value)
                    setItemsPerPage(newSize)
                    setCurrentPage(1) // Reset à la page 1 quand on change la taille
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[12, 24, 48, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Contrôles pagination - affichés seulement s'il y a plusieurs pages */}
            {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Première page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                title={t('common:pagination.first_page')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Page précédente */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Numéros de pages */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages: (number | string)[] = []
                  
                  if (totalPages <= 7) {
                    // Afficher toutes les pages si 7 ou moins
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    // Toujours afficher la première page
                    pages.push(1)
                    
                    if (currentPage > 3) pages.push('...')
                    
                    // Afficher les pages autour de la page courante
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push('...')
                    
                    // Toujours afficher la dernière page
                    pages.push(totalPages)
                  }
                  
                  return pages.map((page, idx) =>
                    typeof page === 'number' ? (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                          currentPage === page
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                    )
                  )
                })()}
              </div>
              
              {/* Page suivante */}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Dernière page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                title={t('common:pagination.last_page')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            )}
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
