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
  sm: 'space-compact mb-6',
  md: 'space-form mb-8',
  lg: 'space-section mb-10',
  xl: 'space-y-8 mb-12',
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
  spacing = 'lg',
}) => {
  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="section-title">{title}</h2>}
          {description && <p className="section-subtitle">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

PageSection.displayName = 'PageSection'
