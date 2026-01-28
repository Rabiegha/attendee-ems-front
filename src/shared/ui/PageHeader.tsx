import React from 'react'
import { cn } from '@/shared/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
  badge?: {
    text: string
    variant?: 'purple' | 'blue' | 'green' | 'red' | 'yellow'
  }
  className?: string
}

/**
 * PageHeader - En-tête de page standardisé
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   title="Gestion des événements"
 *   description="Créez et gérez vos événements"
 *   icon={Calendar}
 *   actions={<Button>Créer</Button>}
 * />
 * ```
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  className,
}) => {
  const badgeColors = {
    purple:
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    yellow:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 mb-4 pb-4 sm:mb-6 sm:pb-6 border-b border-gray-200 dark:border-gray-700',
        'md:flex-row md:justify-between md:items-center',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-0">
              {title}
            </h1>
            {badge && (
              <span
                className={cn(
                  'px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-medium rounded-full whitespace-nowrap',
                  badgeColors[badge.variant || 'blue']
                )}
              >
                {badge.text}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-0 mt-1 sm:mt-1.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}

PageHeader.displayName = 'PageHeader'
