import React from 'react'
import { cn } from '@/shared/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton - Composant de chargement skeleton de base
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  )
}

/**
 * SkeletonText - Lignes de texte skeleton
 */
export const SkeletonText: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-4"
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonAvatar - Avatar skeleton
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeClasses[size], className)}
    />
  )
}

/**
 * SkeletonCard - Card skeleton
 */
export const SkeletonCard: React.FC<{
  className?: string
  children?: React.ReactNode
}> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3',
        className
      )}
    >
      {children || (
        <>
          <Skeleton className="h-6 w-3/4" />
          <SkeletonText lines={2} />
        </>
      )}
    </div>
  )
}

/**
 * TableLoadingSkeleton - Skeleton pour tableaux
 */
export const TableLoadingSkeleton: React.FC<{
  rows?: number
  columns?: number
  className?: string
}> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 px-6 py-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4"
                width={colIndex === 0 ? '80%' : '60%'}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * TableRowSkeleton - Une ligne de tableau skeleton
 */
export const TableRowSkeleton: React.FC<{
  columns?: number
}> = ({ columns = 4 }) => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
