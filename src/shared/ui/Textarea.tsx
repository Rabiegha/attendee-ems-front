/**
 * 🎨 COMPOSANT TEXTAREA AVEC DARK MODE
 * 
 * Textarea réutilisable avec support complet du thème sombre
 */

import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          // Base styles
          'w-full px-3 py-2 rounded-md resize-none transition-colors duration-200',
          'text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400',
          
          // Background & text colors
          'bg-white dark:bg-gray-800',
          'text-gray-900 dark:text-white',
          
          // Border styles
          'border border-gray-300 dark:border-gray-600',
          
          // Focus states
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'dark:focus:ring-blue-400',
          
          // Disabled state
          'disabled:bg-gray-50 dark:disabled:bg-gray-700',
          'disabled:text-gray-500 dark:disabled:text-gray-400',
          'disabled:cursor-not-allowed',
          'disabled:border-gray-200 dark:disabled:border-gray-600',
          
          // Error state
          error && 'border-red-300 dark:border-red-500 focus:ring-red-500 dark:focus:ring-red-400',
          
          // Hover state (when not disabled)
          'hover:border-gray-400 dark:hover:border-gray-500',
          'disabled:hover:border-gray-200 dark:disabled:hover:border-gray-600',
          
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'