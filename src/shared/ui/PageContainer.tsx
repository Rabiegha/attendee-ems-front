import React from 'react'
import { cn } from '@/shared/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '3xl': 'max-w-[1920px]',
  '4xl': 'max-w-[2560px]',
  '5xl': 'max-w-[3200px]',
  '6xl': 'max-w-[3840px]',
  '7xl': 'max-w-[4096px]',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
}

/**
 * PageContainer - Conteneur de page standardisé
 * 
 * Usage:
 * ```tsx
 * <PageContainer maxWidth="7xl" padding="lg">
 *   <PageHeader title="Mon titre" />
 *   <div className="space-y-6">
 *     {content}
 *   </div>
 * </PageContainer>
 * ```
 */
export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  className,
  maxWidth = '7xl',
  padding = 'lg'
}) => {
  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

PageContainer.displayName = 'PageContainer'
