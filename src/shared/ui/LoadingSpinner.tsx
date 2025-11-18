import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  variant?: 'primary' | 'white' | 'gray'
}

/**
 * LoadingSpinner - Composant de chargement uniforme
 * Utilise Loader2 de lucide-react pour une animation cohérente
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  variant = 'primary',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }

  const variantClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    white: 'text-white',
    gray: 'text-gray-400 dark:text-gray-500',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * LoadingState - État de chargement avec spinner et message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  className = '',
  size = 'lg',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        className
      )}
    >
      <LoadingSpinner size={size} />
      <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
        {message}
      </p>
    </div>
  )
}

interface InlineLoadingProps {
  message?: string
  className?: string
}

/**
 * InlineLoading - Chargement inline pour les petits espaces
 */
export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Chargement...',
  className = '',
}) => {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400', className)}>
      <LoadingSpinner size="sm" />
      <span>{message}</span>
    </div>
  )
}
