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
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="pb-3 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}

FormSection.displayName = 'FormSection'
