import React from 'react'
import { useCan } from '../hooks/useCan'
import type { Actions, Subjects } from '../app-ability'

interface CanProps {
  do: Actions
  on: Subjects
  data?: Record<string, any>
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Conditional rendering component based on user permissions
 * Only renders children if the user has the required permission
 */
export const Can: React.FC<CanProps> = ({
  do: action,
  on: subject,
  data,
  children,
  fallback = null,
}) => {
  const canPerformAction = useCan(action, subject, data)

  return canPerformAction ? <>{children}</> : <>{fallback}</>
}
