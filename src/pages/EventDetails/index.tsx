import React from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useGetEventByIdQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { skipToken } from '@reduxjs/toolkit/query/react'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { Edit, Users, Download } from 'lucide-react'
import { formatDate, formatDateTime } from '@/shared/lib/utils'

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation(['events', 'common'])
  
  const { data: event, isLoading: eventLoading, error } = useGetEventByIdQuery(id!)
  const { data: attendees = [] } = useGetAttendeesQuery(id ? { eventId: id } : skipToken)

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Événement non trouvé
        </h2>
        <p className="text-gray-600">
          L'événement que vous recherchez n'existe pas ou a été supprimé.
        </p>
      </div>
    )
  }

  const checkedInCount = attendees.filter(a => a.isCheckedIn).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-gray-600 mt-1">{event.location}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Can do="update" on="Event" data={event}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>{t('common:app.edit')}</span>
            </Button>
          </Can>
          <Can do="read" on="Attendee" data={{ eventId: event.id }}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Gérer les participants</span>
            </Button>
          </Can>
          <Can do="export" on="Attendee" data={{ eventId: event.id }}>
            <Button className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>{t('common:app.export')}</span>
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Détails de l'événement
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{event.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de début</label>
                  <p className="mt-1 text-gray-900">{formatDateTime(event.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de fin</label>
                  <p className="mt-1 text-gray-900">{formatDateTime(event.endDate)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Lieu</label>
                <p className="mt-1 text-gray-900">{event.location}</p>
              </div>
              {event.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'draft'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants inscrits</span>
                <span className="font-medium">{event.currentAttendees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants enregistrés</span>
                <span className="font-medium">{checkedInCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Places disponibles</span>
                <span className="font-medium">
                  {!event.maxAttendees || event.maxAttendees > 100000 
                    ? "Illimité" 
                    : event.maxAttendees - event.currentAttendees
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacité maximale</span>
                <span className="font-medium">
                  {!event.maxAttendees || event.maxAttendees > 100000 
                    ? "Sans limite" 
                    : event.maxAttendees
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Durée</span>
                <span>{event.duration}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jours restants</span>
                <span>{event.daysUntilStart > 0 ? `${event.daysUntilStart} jours` : 'Commencé'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Créé le</span>
                <span>{formatDate(event.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
