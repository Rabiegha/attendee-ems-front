import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { useCan } from '../hooks/useCan'

interface EventGuardProps {
  eventId: string
  action?: 'read' | 'update' | 'delete' | 'manage'
  children: React.ReactNode
  fallbackPath?: string
}

/**
 * Guard spécialisé pour les événements
 * Vérifie que l'utilisateur a accès à l'événement spécifique
 */
export const EventGuard: React.FC<EventGuardProps> = ({
  eventId,
  action = 'read',
  children,
  fallbackPath = '/403',
}) => {
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  
  // Pour les admins et super admins, accès direct
  if (user?.isSuperAdmin || user?.roles?.includes('ORG_ADMIN')) {
    console.log(`Admin access granted for user ${user?.email} to event ${eventId}`)
    return <>{children}</>
  }
  
  // Pour les autres rôles, vérifier les eventIds
  if (user?.eventIds?.includes(eventId)) {
    console.log(`Event access granted for user ${user?.email} to event ${eventId} (in authorized list)`)
    return <>{children}</>
  }
  
  // Fallback : utiliser CASL pour les cas complexes
  const eventData = {
    id: eventId,
    orgId: organization?.id,
  }
  
  const canAccess = useCan(action, 'Event', eventData)

  if (!canAccess) {
    console.log(`Access denied for user ${user?.email} to event ${eventId} with action ${action}`)
    return <Navigate to={fallbackPath} replace />
  }

  console.log(`CASL access granted for user ${user?.email} to event ${eventId} with action ${action}`)
  return <>{children}</>
}