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
  className
}) => {
  const badgeColors = {
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  }

  return (
    <div className={cn(
      'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className={cn(
                'px-3 py-1 text-xs font-medium rounded-full',
                badgeColors[badge.variant || 'blue']
              )}>
                {badge.text}
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-600 dark:text-gray-300 mt-1.5">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  )
}

PageHeader.displayName = 'PageHeader'
