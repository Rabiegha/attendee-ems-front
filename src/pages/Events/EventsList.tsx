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

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Calendar, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react'
import { useToast } from '@/shared/hooks/useToast'

// Mock data import (temporary)
import { mockEvents } from '@/mocks/data/events.mock'
import type { Event, EventStatus } from '@/features/events/types'

const EventsList = () => {
  const { toast } = useToast()
  
  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock user org (TODO: get from Redux sessionSlice)
  const userOrgId = 'org-tech-corp'
  const userRole = 'ADMIN' // TODO: get from Redux

  // Filter events
  const filteredEvents = mockEvents.filter(event => {
    // RBAC: Non-SUPER_ADMIN see only their org
    if (userRole !== 'SUPER_ADMIN' && event.org_id !== userOrgId) {
      return false
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesSearch =
        event.name?.toLowerCase().includes(searchLower) ||
        event.code?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  // Handlers
  const handleDelete = (eventId: string) => {
    // TODO: Call API
    toast.success('Événement supprimé', 'L\'événement a été supprimé avec succès')
  }

  const handleDuplicate = (eventId: string) => {
    toast.info('Fonctionnalité à venir', 'La duplication d\'événement sera disponible prochainement')
  }

  // Status badge styles
  const getStatusBadge = (status: EventStatus) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      published: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    }

    const labels = {
      draft: 'Brouillon',
      published: 'Publié',
      active: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Événements</h1>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="active">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">{filteredEvents.length}</span>
              <span className="ml-1">événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Aucun événement trouvé</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          Essayez de modifier vos filtres ou créez un nouvel événement
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{event.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{event.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-white">
                            {new Date(event.start_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {new Date(event.start_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {event.location.city || 'En ligne'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">
                            {event.statistics.registered_count}
                          </span>
                          {event.settings.max_attendees && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              / {event.settings.max_attendees}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/events/${event.id}`}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/events/${event.id}/edit`}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
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

          {/* Pagination */}
          {totalPages > 1 && (
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

export default EventsList
