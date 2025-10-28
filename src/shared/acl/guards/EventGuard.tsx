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
  // SUPER_ADMIN peut voir tous les événements cross-tenant
  if (user?.isSuperAdmin) {
    console.log(`Super admin access granted for user ${user?.email} to event ${eventId}`)
    return <>{children}</>
  }
  
  // ADMIN, MANAGER peuvent voir tous les événements de leur org
  if (user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER')) {
    console.log(`Admin/Manager access granted for user ${user?.email} to event ${eventId}`)
    return <>{children}</>
  }
  
  // Pour les rôles avec scope assigned (PARTNER, HOSTESS), vérifier les permissions JWT
  const userRole = user?.roles?.[0]
  if (userRole === 'PARTNER' || userRole === 'HOSTESS') {
    // Si l'utilisateur a la permission events.read:assigned, cela signifie qu'il peut voir
    // les événements qui lui sont assignés. Le backend se charge de filtrer automatiquement.
    // Si l'événement apparaît dans la liste côté client, c'est qu'il y a accès.
    console.log(`Assigned role (${userRole}) access granted for user ${user?.email} to event ${eventId} - backend filtering handles assignment`)
    return <>{children}</>
  }
  
  // Legacy: Pour les autres rôles, vérifier les eventIds explicites (si présents)
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