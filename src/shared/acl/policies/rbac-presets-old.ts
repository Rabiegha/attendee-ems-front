import type { AppRule } from '../app-ability'

export type UserRole =
  | 'SUPER_ADMIN' // Accès global, peut créer des organisations
  | 'ADMIN' // Gestion équipe + invitations (scope org)
  | 'MANAGER' // Gestion événements sans invitations (scope org)
  | 'VIEWER' // Lecture seule tous événements org (scope org)
  | 'PARTNER' // Lecture seule événements assignés (scope org)

  // Legacy pour compatibilité (à supprimer progressivement)
  | 'ORG_ADMIN'
  | 'ORG_MANAGER'
  | 'EVENT_MANAGER'
  | 'CHECKIN_STAFF'
  | 'READONLY'

export interface RoleContext {
  orgId: string
  userId: string
  eventIds?: string[]
}

/**
 * Matrice des permissions selon les 5 rôles du système EMS
 *
 * SUPER_ADMIN: Accès global, peut créer des organisations
 * ADMIN: Gestion complète de l'organisation + équipe + invitations
 * MANAGER: Gestion événements sans invitations utilisateurs
 * VIEWER: Lecture seule sur tous événements de l'organisation
 * PARTNER: Lecture seule sur événements assignés uniquement
 */

/**
 * Returns CASL rules for a given role and context
 * @param role - User role
 * @param ctx - Context with orgId, userId, and optional eventIds
 * @returns Array of CASL rules
 */
export const rulesFor = (role: UserRole, ctx: RoleContext): AppRule[] => {
  const { orgId, eventIds = [] } = ctx

  switch (role) {
    case 'SUPER_ADMIN':
      return [
        // Accès total à tout
        { action: 'manage', subject: 'all' },
      ]

    case 'ORG_ADMIN':
      return [
        // Organization admin can manage everything in their organization
        { action: 'manage', subject: 'all', conditions: { orgId } },
      ]

    case 'ORG_MANAGER':
      return [
        // Can manage organization settings
        {
          action: 'manage',
          subject: 'Organization',
          conditions: { id: orgId },
        },
        // Can manage all events in organization
        { action: 'manage', subject: 'Event', conditions: { orgId } },
        { action: 'manage', subject: 'Subevent', conditions: { orgId } },
        // Can manage attendees and users
        { action: 'manage', subject: 'Attendee', conditions: { orgId } },
        { action: 'read', subject: 'User', conditions: { orgId } },
        { action: 'update', subject: 'User', conditions: { orgId } },
        // Can access reports and settings
        { action: 'read', subject: 'Report', conditions: { orgId } },
        { action: 'export', subject: 'Report', conditions: { orgId } },
        { action: 'read', subject: 'Settings', conditions: { orgId } },
        { action: 'update', subject: 'Settings', conditions: { orgId } },
      ]

    case 'EVENT_MANAGER':
      return [
        // Can manage specific events they're assigned to
        {
          action: 'manage',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'manage',
          subject: 'Subevent',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can manage attendees for their events
        {
          action: 'manage',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can manage badges and scans
        {
          action: 'manage',
          subject: 'Badge',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Scan',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can export and print
        {
          action: 'export',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'print',
          subject: 'Badge',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can read reports for their events
        {
          action: 'read',
          subject: 'Report',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'CHECKIN_STAFF':
      return [
        // Can read events they're assigned to
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Subevent',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can read and check-in attendees
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'checkin',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'update',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['status', 'checkedInAt'],
        },
        // Can create scans
        {
          action: 'create',
          subject: 'Scan',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Scan',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can print badges
        {
          action: 'print',
          subject: 'Badge',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    // Deprecated roles - kept for backward compatibility
    case 'DEVELOPER' as any:
      return [
        // Accès au dashboard de base
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        // Accès aux projets de développement
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'email', 'status'],
        },
        {
          action: 'create',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'invite',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'GRAPHIC_DESIGNER' as any:
      return [
        // Accès au dashboard de base
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        // Accès aux projets de design graphique
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'email', 'status'],
        },
        {
          action: 'create',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'invite',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'JOURNALIST' as any:
      return [
        // Accès au dashboard de base
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        // Accès aux projets de journalisme
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          action: 'export',
          subject: 'Report',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'EDITOR' as any:
      return [
        // Accès au dashboard de base
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        // Accès aux projets éditoriaux
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          action: 'export',
          subject: 'Report',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'PARTNER':
      return [
        // Accès partenaire standard
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'email', 'status'],
        },
        {
          action: 'invite',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'create',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'READONLY':
      return [
        // Can only read events they have access to
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Subevent',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Can read attendees (limited fields)
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
          fields: ['id', 'firstName', 'lastName', 'status'],
        },
        // Can read basic reports
        {
          action: 'read',
          subject: 'Report',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    default:
      return []
  }
}

/**
 * Fallback rules when no role is assigned or API is unavailable
 * @param userId - User ID for self-management
 * @returns Minimal rules for basic functionality
 */
export const fallbackRules = (userId: string): AppRule[] => [
  // Users can always read and update their own profile
  { action: 'read', subject: 'User', conditions: { id: userId } },
  {
    action: 'update',
    subject: 'User',
    conditions: { id: userId },
    fields: ['firstName', 'lastName', 'email', 'preferences'],
  },
]
