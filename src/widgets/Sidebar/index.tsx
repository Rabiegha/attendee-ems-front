import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  Shield,
  BarChart3,
  Settings,
  Mail,
  Building2,
  CreditCard,
  Tag,
  Smartphone,
} from 'lucide-react'
import { ROUTES } from '@/app/config/constants'
import { Can } from '@/shared/acl/guards/Can'
import { cn } from '@/shared/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// Temp: masquer Reports et Settings dans la sidebar
const TEMP_HIDE_REPORTS_SETTINGS = true;

const navigation = [
  {
    name: 'navigation.dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    // Pas de guard - accessible à tous
  },
  {
    name: 'navigation.organizations',
    href: '/organizations',
    icon: Building2,
    action: 'read' as const,
    subject: 'Organization' as const,
  },
  {
    name: 'navigation.events',
    href: ROUTES.EVENTS,
    icon: Calendar,
    action: 'read' as const,
    subject: 'Event' as const,
  },
  {
    name: 'navigation.badge_designer',
    href: '/badges',
    icon: CreditCard,
    action: 'read' as const,
    subject: 'Badge' as const,
  },
  {
    name: 'navigation.attendees',
    href: ROUTES.ATTENDEES,
    icon: Users,
    action: 'read' as const,
    subject: 'Attendee' as const,
  },
  {
    name: 'navigation.attendee_types',
    href: ROUTES.ATTENDEE_TYPES,
    icon: Tag,
    action: 'read' as const,
    subject: 'AttendeeType' as const,
  },
  {
    name: 'navigation.users',
    href: ROUTES.USERS,
    icon: UserCog,
    action: 'read' as const,
    subject: 'User' as const,
  },
  {
    name: 'navigation.invitations',
    href: '/invitations',
    icon: Mail,
    action: 'create' as const,
    subject: 'Invitation' as const,
  },
  {
    name: 'navigation.roles_permissions',
    href: ROUTES.ROLES_PERMISSIONS,
    icon: Shield,
    action: 'manage' as const,
    subject: 'Role' as const,
  },
  {
    name: 'navigation.reports',
    href: '/reports',
    icon: BarChart3,
    action: 'export' as const,
    subject: 'Report' as const,
  },
  {
    name: 'navigation.settings',
    href: '/settings',
    icon: Settings,
    action: 'update' as const,
    subject: 'Organization' as const,
  },
  {
    name: 'navigation.application',
    href: '/application',
    icon: Smartphone,
    // Pas de guard - accessible à tous
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { t } = useTranslation('common')

  const items = TEMP_HIDE_REPORTS_SETTINGS
    ? navigation.filter((i) => i.href !== '/reports' && i.href !== '/settings')
    : navigation;

  return (
    <aside
      className={cn(
        'fixed left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300 overflow-hidden',
        isOpen ? 'w-64' : 'w-16'
      )}
      style={{ top: '69px' }}
    >
      {/* Bouton chevrons en haut de la sidebar */}
      <div className="flex items-center h-12 border-b border-gray-200 dark:border-gray-700 px-2 relative">
        <button
          onClick={onToggle}
          className="absolute p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          style={{
            right: isOpen ? '8px' : '50%',
            transform: isOpen ? 'translateX(0)' : 'translateX(50%)',
            transition: 'right 0.3s ease, transform 0.3s ease'
          }}
          aria-label="Toggle sidebar"
        >
          <svg
            className={cn(
              "w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-300",
              isOpen ? "rotate-0" : "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {/* Chevrons doubles pointant vers la gauche */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <nav className="px-2 overflow-y-auto pb-20">
        <ul className="space-y-2 pt-4">
          {items.map((item) => {
            // Dashboard accessible à tous sans guard
            if (!item.action || !item.subject) {
              return (
                <li key={item.href}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center py-2 text-sm font-medium rounded-md transition-all duration-300 relative overflow-hidden group',
                        'px-4',
                        isActive
                          ? 'bg-blue-600 text-white dark:bg-blue-700'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      )
                    }
                    title={!isOpen ? t(item.name) : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                    <span className={cn(
                      "whitespace-nowrap transition-opacity duration-300",
                      isOpen ? "opacity-100" : "opacity-0"
                    )}>
                      {t(item.name)}
                    </span>
                  </NavLink>
                </li>
              )
            }

            // Autres items avec guard CASL
            return (
              <Can key={item.href} do={item.action} on={item.subject}>
                <li>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center py-2 text-sm font-medium rounded-md transition-all duration-300 relative overflow-hidden group',
                        'px-4',
                        isActive
                          ? 'bg-blue-600 text-white dark:bg-blue-700'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      )
                    }
                    title={!isOpen ? t(item.name) : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                    <span className={cn(
                      "whitespace-nowrap transition-opacity duration-300",
                      isOpen ? "opacity-100" : "opacity-0"
                    )}>
                      {t(item.name)}
                    </span>
                  </NavLink>
                </li>
              </Can>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
