import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Globe } from 'lucide-react'
import type { EventDPO } from '../dpo/event.dpo'
import { formatDate } from '@/shared/lib/utils'
import { DashboardEventListSkeleton } from '@/shared/ui'

interface EventListProps {
  events: EventDPO[]
  isLoading: boolean
}

export const EventList: React.FC<EventListProps> = ({ events, isLoading }) => {
  // const { t } = useTranslation('events')

  if (isLoading) {
    return <DashboardEventListSkeleton />
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
        <Link
          key={event.id}
          to={`/events/${event.id}`}
          className="block border-l-4 border-blue-500 dark:border-blue-400 pl-4 pr-4 py-2 bg-white dark:bg-gray-800 rounded-r-lg transition-all duration-200 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {event.name}
              </h3>
              <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(event.startDate)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.maxAttendees && event.maxAttendees > 0 && event.maxAttendees < 999999
                    ? `${event.currentAttendees}/${event.maxAttendees} participants`
                    : `${event.currentAttendees} participants`}
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                  {event.websiteUrl ? (
                    <a
                      href={event.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {event.websiteUrl}
                    </a>
                  ) : (
                    <span className="italic text-gray-400 dark:text-gray-500">Non spécifié</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center ml-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : event.status === 'draft'
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : event.status === 'cancelled'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                        : event.status === 'postponed'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : event.status === 'registration_closed'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                }`}
              >
                {event.status === 'published'
                  ? 'Publié'
                  : event.status === 'draft'
                    ? 'Brouillon'
                    : event.status === 'cancelled'
                      ? 'Annulé'
                      : event.status === 'postponed'
                        ? 'Reporté'
                        : event.status === 'registration_closed'
                          ? 'Inscriptions clôturées'
                          : event.status === 'archived'
                            ? 'Archivé'
                            : event.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
