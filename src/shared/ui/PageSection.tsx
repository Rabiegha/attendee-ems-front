import React from 'react'
import { cn } from '@/shared/lib/utils'

interface PageSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

const spacingClasses = {
  sm: 'space-y-3',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8'
}

/**
 * PageSection - Section de page standardisée
 * 
 * Usage:
 * ```tsx
 * <PageSection title="Informations" description="Détails de l'événement">
 *   {content}
 * </PageSection>
 * ```
 */
export const PageSection: React.FC<PageSectionProps> = ({
  children,
  title,
  description,
  className,
  spacing = 'lg'
}) => {
  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

PageSection.displayName = 'PageSection'
