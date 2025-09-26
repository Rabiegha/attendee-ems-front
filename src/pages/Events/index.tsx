import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingSpinner'
import { CreateEventModal } from '@/features/events/ui/CreateEventModal'
import { EditEventModal } from '@/features/events/ui/EditEventModal'
import { DeleteEventModal } from '@/features/events/ui/DeleteEventModal'
import { formatDateForDisplay } from '@/shared/lib/date-utils'
import { formatAttendeesCount } from '@/shared/lib/utils'
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

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
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'createdAt'>('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

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

  // Pas de filtrage côté client - l'API fait déjà le bon filtrage selon les permissions
  const filteredEvents = events

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
    return <LoadingState message="Chargement des événements..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erreur lors du chargement des événements</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('events:page.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <Can do="create" on="Event">
          <Button onClick={handleCreateEvent} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>{t('events:actions.create')}</span>
          </Button>
        </Can>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 transition-colors duration-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Rechercher des événements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="all">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="startDate-asc">Date (plus ancien)</option>
            <option value="startDate-desc">Date (plus récent)</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="createdAt-desc">Créé récemment</option>
          </select>
        </div>
      </div>

      {/* Liste des événements */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Aucun événement trouvé
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchQuery 
              ? "Aucun événement ne correspond à votre recherche."
              : "Commencez par créer votre premier événement."
            }
          </p>
          <Can do="create" on="Event">
            <Button onClick={handleCreateEvent} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Créer un événement
            </Button>
          </Can>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {event.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
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
                      <span className="text-xs text-gray-500">
                        +{event.tags.length - 3} autres
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between">
                {/* Lien "Voir détails" toujours visible pour les événements affichés */}
                <Link
                  to={`/events/${event.id}`}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Voir détails
                </Link>
                
                <div className="flex items-center space-x-2">
                  <Can do="update" on="Event" data={event}>
                    <button 
                      onClick={() => setEditingEvent(event)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier l'événement"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </Can>
                  
                  <Can do="delete" on="Event" data={event}>
                    <button 
                      onClick={() => setDeletingEvent(event)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer l'événement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Can>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  )
}

export default EventsPage
