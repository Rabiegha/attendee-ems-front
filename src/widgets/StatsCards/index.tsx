import React from 'react'
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import type { AttendeeDPO } from '@/features/attendees/dpo/attendee.dpo'

interface StatsCardsProps {
  events: EventDPO[]
  attendees: AttendeeDPO[]
  isLoading: boolean
}

export const StatsCards: React.FC<StatsCardsProps> = ({ events, attendees, isLoading }) => {
  const stats = React.useMemo(() => {
    const activeEvents = events.filter(e => e.isActive).length
    const totalAttendees = attendees.length
    const checkedInAttendees = attendees.filter(a => a.isCheckedIn).length
    const pendingAttendees = attendees.filter(a => a.isPending).length

    return [
      {
        title: 'Événements actifs',
        value: activeEvents,
        icon: Calendar,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        title: 'Total participants',
        value: totalAttendees,
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        title: 'Participants enregistrés',
        value: checkedInAttendees,
        icon: CheckCircle,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      {
        title: 'En attente',
        value: pendingAttendees,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
    ]
  }, [events, attendees])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse transition-colors duration-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
