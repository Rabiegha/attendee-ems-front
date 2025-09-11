import { useCan } from '@/shared/acl/hooks/useCan'
import { ROUTES } from '@/app/config/constants'

/**
 * Hook pour déterminer la route par défaut selon les permissions de l'utilisateur
 */
export const useDefaultRoute = (): string => {
  const canReadOrganization = useCan('read', 'Organization')
  const canReadEvent = useCan('read', 'Event')
  const canReadAttendee = useCan('read', 'Attendee')

  // Admins et managers peuvent accéder au dashboard complet
  if (canReadOrganization) {
    return ROUTES.DASHBOARD
  }

  // Partenaires et autres utilisateurs avec accès aux événements
  if (canReadEvent) {
    return ROUTES.EVENTS
  }

  // Staff avec accès uniquement aux attendees
  if (canReadAttendee) {
    return ROUTES.ATTENDEES
  }

  // Par défaut, aller aux événements (ils verront une liste vide si pas de permissions)
  return ROUTES.EVENTS
}
