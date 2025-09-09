import React from 'react'
import { useTranslation } from 'react-i18next'
import { useGetEventsQuery } from '@/features/events/api/eventsApi'
import { useGetAttendeesQuery } from '@/features/attendees/api/attendeesApi'
import { StatsCards } from '@/widgets/StatsCards'
import { EventList } from '@/features/events/ui/EventList'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { Plus } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'events'])
  
  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery({
    limit: 5,
    sortBy: 'startDate',
    sortOrder: 'asc',
  })
  
  const { data: attendees = [], isLoading: attendeesLoading } = useGetAttendeesQuery({
    limit: 10,
    sortBy: 'registrationDate',
    sortOrder: 'desc',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('navigation.dashboard')}
        </h1>
        <Can do="create" on="Event">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>{t('events:events.create')}</span>
          </Button>
        </Can>
      </div>

      <StatsCards 
        events={events} 
        attendees={attendees}
        isLoading={eventsLoading || attendeesLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Événements à venir
            </h2>
            <Can do="read" on="Event">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </Can>
          </div>
          <EventList events={events.slice(0, 3)} isLoading={eventsLoading} />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Inscriptions récentes
            </h2>
            <Can do="read" on="Attendee">
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </Can>
          </div>
          <div className="space-y-3">
            {attendees.slice(0, 5).map((attendee) => (
              <div key={attendee.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {attendee.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{attendee.email}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  attendee.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : attendee.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {attendee.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
