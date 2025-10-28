import React from 'react'
import { cn } from '@/shared/lib/utils'

interface FormSectionProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  required?: boolean
}

/**
 * FormSection - Section de formulaire standardisée
 *
 * Usage:
 * ```tsx
 * <FormSection title="Informations personnelles" description="Remplissez vos coordonnées" required>
 *   <Input label="Nom" />
 *   <Input label="Prénom" />
 * </FormSection>
 * ```
 */
export const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className,
  required = false,
}) => {
  return (
    <div className={cn('space-form', className)}>
      {(title || description) && (
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-heading-sm flex items-center gap-2">
              {title}
              {required && (
                <span
                  className="text-red-500 text-sm font-normal"
                  aria-label="Required"
                >
                  *
                </span>
              )}
            </h3>
          )}
          {description && (
            <p className="section-subtitle mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-form">{children}</div>
    </div>
  )
}

FormSection.displayName = 'FormSection'
