import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { selectUser, selectUserRoles } from '@/features/auth/model/sessionSlice'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { LoadingState } from '@/shared/ui/LoadingSpinner'
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
  const user = useSelector(selectUser)
  const userRoles = useSelector(selectUserRoles)
  
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

  // Filtrage des événements selon les permissions utilisateur
  const filteredEvents = useMemo(() => {
    if (!events || !user) return []
    
    return events.filter(event => {
      // Si l'utilisateur est ORG_ADMIN ou ORG_MANAGER, il voit tous les événements de l'org
      if (userRoles.includes('ORG_ADMIN') || userRoles.includes('ORG_MANAGER')) {
        return event.orgId === user.orgId
      }
      
      // Pour les autres rôles, vérifier les événements assignés
      if (user.eventIds && user.eventIds.includes(event.id)) {
        return true
      }
      
      // Pour les événements publics ou si l'utilisateur a des droits de lecture globaux
      return event.status === 'published' && event.orgId === user.orgId
    })
  }, [events, user, userRoles])

  const handleCreateEvent = () => {
    // TODO: Ouvrir modal de création d'événement
    console.log('Créer un nouvel événement')
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher des événements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucun événement trouvé
          </h3>
          <p className="mt-2 text-gray-500">
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
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.name}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                
                {event.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.startDate)}</span>
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
                      {event.currentAttendees || 0} / {event.maxAttendees || '∞'} participants
                    </span>
                  </div>
                </div>
                
                {event.tags && event.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {event.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
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
                <Can do="read" on="Event" data={event}>
                  <Link
                    to={`/events/${event.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir détails
                  </Link>
                </Can>
                
                <div className="flex items-center space-x-2">
                  <Can do="update" on="Event" data={event}>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Can>
                  
                  <Can do="delete" on="Event" data={event}>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Can>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsPage
