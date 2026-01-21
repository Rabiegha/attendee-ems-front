import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectOrganization } from '@/features/auth/model/sessionSlice'
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
 * 
 * Pour les scopes 'assigned', le backend filtre les événements.
 * Si l'événement est visible dans la liste, l'utilisateur y a accès.
 */
export const EventGuard: React.FC<EventGuardProps> = ({
  eventId,
  action = 'read',
  children,
  fallbackPath = '/403',
}) => {
  const organization = useSelector(selectOrganization)

  // Vérifier si l'utilisateur a la permission générale (sans conditions)
  // Pour les scopes 'assigned', pas besoin de vérifier eventId car le backend filtre
  const canAccessEvents = useCan(action, 'Event')

  // Si l'utilisateur peut accéder aux événements (any/org/assigned), autoriser
  if (canAccessEvents) {
    return <>{children}</>
  }

  // Sinon, vérifier avec les données spécifiques (pour les cas avec conditions)
  const eventData = {
    id: eventId,
    orgId: organization?.id,
  }

  const canAccessThisEvent = useCan(action, 'Event', eventData)

  if (!canAccessThisEvent) {
    return <Navigate to={fallbackPath} replace />
  }

  return <>{children}</>
}
