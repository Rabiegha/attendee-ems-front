/**
 * Page Events List - Liste de tous les événements
 *
 * Features:
 * - Table complète avec filtres (search, status, dates)
 * - Pagination
 * - Actions : Create, Edit, View, Delete
 * - RBAC : SUPER_ADMIN voit tout, autres voient leur org
 * - Dark mode support
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, selectOrgId } from '@/features/auth/model/sessionSlice'
import {
  SearchInput,
  FilterBar,
  FilterButton,
  LoadingState,
  EventsGridSkeleton,
  type FilterValues,
} from '@/shared/ui'

// Real API calls
import {
  useGetEventsQuery,
  useDeleteEventMutation,
  useBulkDeleteEventsMutation,
  useBulkExportEventsMutation,
  eventsApi,
} from '@/features/events/api/eventsApi'
import { useGetTagsQuery, type Tag } from '@/features/tags'
import type { EventStatus } from '@/features/events/types'

// Multi-select components
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'

const EventsList = () => {
  const toast = useToast()
  const dispatch = useDispatch()

  // Get user from Redux
  const user = useSelector(selectUser)
  const orgId = useSelector(selectOrgId)

  // Filters state
  const [search, setSearch] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Extract filter values
  const statusFilter = filterValues.status as string | undefined
  const hasCheckinFilter = filterValues.hasCheckin as string | undefined

  // API calls - Real data instead of mocks
  const {
    data: events = [],
    isLoading,
    error,
  } = useGetEventsQuery({
    page: currentPage,
    limit: itemsPerPage,
    ...(search && { search }),
  })

  const [deleteEvent] = useDeleteEventMutation()
  const [bulkDeleteEvents] = useBulkDeleteEventsMutation()
  const [bulkExportEvents] = useBulkExportEventsMutation()

  // Get user role for RBAC
  const userRole = user?.roles?.[0] || 'VIEWER'
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  // Filter events based on user role and filters
  const filteredEvents = events.filter((event) => {
    // RBAC: SUPER_ADMIN sees all events, others see only their org events
    if (!isSuperAdmin && event.org_id !== orgId) {
      return false
    }
    
    // Filter by status (single select)
    if (statusFilter && statusFilter !== 'all' && event.status !== statusFilter) {
      return false
    }

    // Filter by check-in
    if (hasCheckinFilter && hasCheckinFilter !== 'all') {
      // TODO: Add enableCheckin property to EventDPO
      const hasCheckin = (event as any).enableCheckin || false
      if (hasCheckinFilter === 'yes' && !hasCheckin) return false
      if (hasCheckinFilter === 'no' && hasCheckin) return false
    }
    
    return true
  })

  // Configuration des filtres pour le popup
  const filterConfig = {
    status: {
      label: 'Statut',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'draft', label: 'Brouillon' },
        { value: 'published', label: 'Publié' },
        { value: 'registration_closed', label: 'Inscriptions closes' },
        { value: 'cancelled', label: 'Annulé' },
        { value: 'postponed', label: 'Reporté' },
        { value: 'archived', label: 'Archivé' },
      ],
    },
    hasCheckin: {
      label: 'Check-in',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous' },
        { value: 'yes', label: 'Avec check-in' },
        { value: 'no', label: 'Sans check-in' },
      ],
    },
  }

  const handleResetFilters = () => {
    setSearch('')
    setFilterValues({})
  }

  const handleRefresh = () => {
    dispatch(eventsApi.util.invalidateTags(['Events']))
  }

  // Pagination (if not handled by API)
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const paginatedEvents = filteredEvents

  // Multi-select logic
  const {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    unselectAll,
    selectedCount,
    selectedItems,
  } = useMultiSelect({
    items: paginatedEvents,
    getItemId: (event) => event.id,
  })

  // Bulk actions configuration
  const bulkActions = useMemo(() => {
    const actions = []

    // Default export action using API mutation
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        try {
          const response = await bulkExportEvents({
            ids: Array.from(selectedIds),
            format: 'csv',
          }).unwrap()

          // Download the file using the URL provided by the API
          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = response.downloadUrl
          a.download = response.filename || 'events.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          unselectAll()
        } catch (error) {
          console.error("Erreur lors de l'export:", error)
          throw error
        }
      })
    )

    // Default delete action using API mutation
    actions.push(
      createBulkActions.delete(async (selectedIds) => {
        try {
          await bulkDeleteEvents(Array.from(selectedIds)).unwrap()
          toast.success(
            'Événements supprimés',
            `${selectedIds.size} événement(s) supprimé(s) avec succès`
          )
          unselectAll()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          toast.error('Erreur', 'Impossible de supprimer les événements')
          throw error
        }
      })
    )

    return actions
  }, [bulkDeleteEvents, bulkExportEvents, unselectAll, toast])

  // Handlers
  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId).unwrap()
      toast.success(
        'Événement supprimé',
        "L'événement a été supprimé avec succès"
      )
    } catch (err) {
      toast.error('Erreur', "Impossible de supprimer l'événement")
    }
  }

  const handleRowClick = (eventId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a')
    ) {
      return
    }
    // Toggle selection on row click
    toggleItem(eventId)
  }

  // Status badge styles
  const getStatusBadge = (status: EventStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      published:
        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      registration_closed:
        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      postponed:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      archived:
        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    }

    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      registration_closed: 'Inscriptions closes',
      cancelled: 'Annulé',
      postponed: 'Reporté',
      archived: 'Archivé',
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Événements
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Gérez tous vos événements en un seul endroit
              </p>
            </div>
            <Link
              to="/events/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un événement
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar
          resultCount={filteredEvents.length}
          resultLabel="événement"
          onReset={handleResetFilters}
          showResetButton={search !== '' || Object.keys(filterValues).length > 0}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder="Rechercher un événement..."
            value={search}
            onChange={setSearch}
          />

          <FilterButton
            filters={filterConfig}
            values={filterValues}
            onChange={setFilterValues}
          />
        </FilterBar>

        {/* Events Table */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          {/* Bulk Actions */}
          <BulkActions
            selectedCount={selectedCount}
            selectedIds={selectedIds}
            selectedItems={selectedItems}
            actions={bulkActions}
            onClearSelection={unselectAll}
            itemType="événements"
          />
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">
                Chargement des événements...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="text-red-600 dark:text-red-400 mb-2">
                  Erreur lors du chargement
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Impossible de charger les événements. Veuillez réessayer.
                </div>
              </div>
            </div>
          )}

          {/* Table Content */}
          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 w-16 min-w-[4rem]">
                      <label className="flex items-center justify-center cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isIndeterminate
                          }}
                          onChange={toggleAll}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0 cursor-pointer"
                        />
                      </label>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Inscrits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40 min-w-[10rem]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                          <p className="text-gray-600 dark:text-gray-300 font-medium">
                            Aucun événement trouvé
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Essayez de modifier vos filtres ou créez un nouvel
                            événement
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedEvents.map((event) => (
                      <tr
                        key={event.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer ${
                          isSelected(event.id)
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : ''
                        }`}
                        onClick={(e) => handleRowClick(event.id, e)}
                      >
                        <td
                          className="px-6 py-4 w-16 min-w-[4rem]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="flex items-center justify-center w-full h-full cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                            <input
                              type="checkbox"
                              checked={isSelected(event.id)}
                              onChange={() => toggleItem(event.id)}
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0 cursor-pointer"
                            />
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {event.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {event.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-900 dark:text-white">
                              {new Date(event.start_at).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(event.start_at).toLocaleTimeString(
                                'fr-FR',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {event.location_type === 'online' ? 'En ligne' : ((event as any).location || 'En ligne')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm">
                            <Users className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-gray-900 dark:text-white font-medium">
                              {(event as any).currentAttendees || 0}
                            </span>
                            {(event as any).maxAttendees && (
                              <span className="text-gray-500 dark:text-gray-400 ml-1">
                                / {(event as any).maxAttendees}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(event.status)}
                        </td>
                        <td className="px-6 py-4 text-right w-40 min-w-[10rem]">
                          <div className="flex items-center justify-end gap-2 flex-shrink-0">
                            <Link
                              to={`/events/${event.id}`}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150 flex-shrink-0"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/events/${event.id}/edit`}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150 flex-shrink-0"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150 flex-shrink-0"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Page <span className="font-medium">{currentPage}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const EventsListProtected = () => (
  <ProtectedPage
    action="read"
    subject="Event"
    deniedTitle="Accès aux événements refusé"
    deniedMessage="Vous n'avez pas les permissions nécessaires pour consulter les événements."
  >
    <EventsList />
  </ProtectedPage>
)

export default EventsListProtected
