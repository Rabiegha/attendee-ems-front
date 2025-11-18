/**
 * Checkbox Component
 * 
 * Composant checkbox accessible avec support indeterminate
 */

import React from 'react'
import { cn } from '@/shared/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => checkboxRef.current!)

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate ?? false
      }
    }, [indeterminate])

    return (
      <input
        type="checkbox"
        ref={checkboxRef}
        className={cn(
          'h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded flex-shrink-0 cursor-pointer',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-150',
          className
        )}
        {...props}
      />
    )
  }
)

Checkbox.displayName = 'Checkbox'
