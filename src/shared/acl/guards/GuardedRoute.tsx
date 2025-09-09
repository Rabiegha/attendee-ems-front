import React from 'react'
import { Navigate } from 'react-router-dom'
import { useCan } from '../hooks/useCan'
import type { Actions, Subjects } from '../app-ability'

interface GuardedRouteProps {
  action: Actions
  subject: Subjects
  data?: Record<string, any>
  children: React.ReactNode
  fallbackPath?: string
}

/**
 * Route guard component that redirects to a fallback path if user lacks permission
 */
export const GuardedRoute: React.FC<GuardedRouteProps> = ({
  action,
  subject,
  data,
  children,
  fallbackPath = '/403',
}) => {
  const canAccess = useCan(action, subject, data)

  if (!canAccess) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
