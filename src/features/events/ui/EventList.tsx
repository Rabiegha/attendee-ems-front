import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { EventDPO } from '../dpo/event.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'

interface EventListProps {
  events: EventDPO[]
  isLoading: boolean
}

export const EventList: React.FC<EventListProps> = ({ events, isLoading }) => {
  // const { t } = useTranslation('events')

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p>Aucun événement trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div 
          key={event.id} 
          className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 bg-white dark:bg-gray-800 rounded-r-lg transition-colors duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Link to={`/events/${event.id}`}>
                  {event.name}
                </Link>
              </h3>
              <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(event.startDate)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.currentAttendees}/{event.maxAttendees} participants
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                event.status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : event.status === 'draft'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
              }`}>
                {event.status}
              </span>
              <Can do="read" on="Event" data={event}>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/events/${event.id}`}>
                    Voir
                  </Link>
                </Button>
              </Can>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
