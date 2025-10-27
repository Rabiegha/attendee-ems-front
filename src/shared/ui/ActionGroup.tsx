import React from 'react'
import { cn } from '@/shared/lib/utils'

interface ActionGroupProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right' | 'between' | 'around'
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
  vertical?: boolean
  divider?: boolean
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
}

const spacingClasses = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4'
}

/**
 * ActionGroup - Groupe d'actions standardisé (boutons, liens, etc.)
 * 
 * Usage:
 * ```tsx
 * <ActionGroup align="right" spacing="md" divider>
 *   <Button variant="outline">Annuler</Button>
 *   <Button>Enregistrer</Button>
 * </ActionGroup>
 * ```
 */
export const ActionGroup: React.FC<ActionGroupProps> = ({
  children,
  align = 'right',
  spacing = 'md',
  className,
  vertical = false,
  divider = false
}) => {
  return (
    <div 
      className={cn(
        'flex items-center',
        vertical ? 'flex-col items-stretch' : 'flex-row',
        !vertical && alignClasses[align],
        vertical ? 'space-y-3' : spacingClasses[spacing],
        divider && 'pt-6 border-t border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  )
}

ActionGroup.displayName = 'ActionGroup'
