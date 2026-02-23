import React from 'react'
import { Calendar, Users, UserPlus, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import type { AttendeeDPO } from '@/features/attendees/dpo/attendee.dpo'
import { DashboardStatsCardsSkeleton } from '@/shared/ui'

interface StatsCardsProps {
  events: EventDPO[]
  attendees: AttendeeDPO[]
  totalAttendees?: number // Total depuis l'API (peut différer de attendees.length si paginé)
  isLoading: boolean
  canCreateEvent?: boolean
  canInviteUser?: boolean
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  events,
  attendees,
  totalAttendees,
  isLoading,
  canCreateEvent = false,
  canInviteUser = false,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation(['events', 'common'])

  // Utiliser le total fourni ou la longueur du tableau
  const attendeesCount = totalAttendees ?? attendees.length

  const quickActions = [
    {
      title: t('events:dashboard.stats.events'),
      description: t('events:dashboard.stats.manage_events'),
      count: events.length,
      activeCount: events.filter((e) => e.isActive).length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgGlow: 'bg-blue-500/10',
      onClick: () => navigate('/events'),
    },
    {
      title: t('events:dashboard.stats.participants'),
      description: t('events:dashboard.stats.view_all_participants'),
      count: attendeesCount,
      activeCount: attendees.filter((a) => a.isActive).length,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgGlow: 'bg-green-500/10',
      onClick: () => navigate('/attendees'),
    },
    ...(canCreateEvent ? [{
      title: t('events:dashboard.stats.create_event'),
      description: t('events:dashboard.stats.new_event'),
      icon: Plus,
      color: 'from-purple-500 to-purple-600',
      bgGlow: 'bg-purple-500/10',
      isAction: true,
      onClick: () => navigate('/events/create'),
    }] : []),
    ...(canInviteUser ? [{
      title: t('events:dashboard.stats.invite_user'),
      description: t('events:dashboard.stats.add_member'),
      icon: UserPlus,
      color: 'from-orange-500 to-orange-600',
      bgGlow: 'bg-orange-500/10',
      isAction: true,
      onClick: () => navigate('/invitations'),
    }] : []),
  ]

  if (isLoading) {
    return <DashboardStatsCardsSkeleton />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-left transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-gray-300 dark:hover:border-gray-600"
        >
          {/* Glow effect on hover */}
          <div className={`absolute inset-0 ${action.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          
          {/* Content */}
          <div className="relative z-10 space-y-3">
            {/* Icon with gradient */}
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} p-2.5 transform group-hover:scale-110 transition-transform duration-300`}>
              <action.icon className="w-full h-full text-white" />
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {action.title}
            </h3>

            {/* Description with count or action text */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {action.description}
              </p>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transform group-hover:translate-x-1 transition-all duration-300" />
            </div>

            {/* Stats badges for non-action items */}
            {!action.isAction && (
              <div className="flex gap-2 pt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {action.activeCount} {t('events:dashboard.stats.active')}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {action.count} {t('events:dashboard.stats.total')}
                </span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
