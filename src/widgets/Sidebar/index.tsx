import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Calendar, Users, UserCog, Shield, BarChart3, Settings } from 'lucide-react'
import { ROUTES } from '@/app/config/constants'
import { Can } from '@/shared/acl/guards/Can'
import { cn } from '@/shared/lib/utils'

const navigation = [
  {
    name: 'navigation.dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    action: 'read' as const,
    subject: 'Organization' as const, // Tous les rôles peuvent voir le dashboard
  },
  {
    name: 'navigation.events',
    href: ROUTES.EVENTS,
    icon: Calendar,
    action: 'read' as const,
    subject: 'Event' as const, // VIEWER et + peuvent voir les événements
  },
  {
    name: 'navigation.attendees',
    href: ROUTES.ATTENDEES,
    icon: Users,
    action: 'read' as const,
    subject: 'Attendee' as const, // VIEWER et + peuvent voir les participants
  },
  {
    name: 'navigation.users',
    href: ROUTES.USERS,
    icon: UserCog,
    action: 'manage' as const, // Seuls SUPER_ADMIN et ADMIN peuvent gérer les utilisateurs
    subject: 'User' as const,
  },
  {
    name: 'navigation.roles_permissions',
    href: ROUTES.ROLES_PERMISSIONS,
    icon: Shield,
    action: 'manage' as const, // Seuls SUPER_ADMIN et ADMIN peuvent gérer les rôles et permissions
    subject: 'Role' as const,
  },
  {
    name: 'navigation.reports',
    href: '/reports',
    icon: BarChart3,
    action: 'read' as const,
    subject: 'Report' as const, // VIEWER et + peuvent voir les rapports
  },
  {
    name: 'navigation.settings',
    href: '/settings',
    icon: Settings,
    action: 'manage' as const, // Seuls SUPER_ADMIN et ADMIN peuvent gérer les paramètres
    subject: 'Settings' as const,
  },
]

export const Sidebar: React.FC = () => {
  const { t } = useTranslation('common')

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen transition-colors duration-200">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <Can key={item.href} do={item.action} on={item.subject}>
              <li>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-700'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {t(item.name)}
                </NavLink>
              </li>
            </Can>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
