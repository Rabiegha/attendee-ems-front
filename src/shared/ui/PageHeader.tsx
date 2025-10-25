import React from 'react'
import { cn } from '@/shared/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
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
  className
}) => {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
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
