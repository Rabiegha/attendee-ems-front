import type { AppRule } from '../app-ability'

export type UserRole =
  | 'SUPER_ADMIN' // Accès global omniscient, peut créer des organisations (sans org)
  | 'ADMIN' // Gestion équipe + invitations (scope org)
  | 'MANAGER' // Gestion événements sans invitations (scope org)
  | 'VIEWER' // Lecture seule tous événements org (scope org)
  | 'PARTNER' // Lecture seule événements assignés (scope org)
  | 'HOSTESS' // Scan QR codes événements assignés uniquement (scope org)

export interface RoleContext {
  orgId?: string // Optionnel car SUPER_ADMIN n'a pas d'org
  userId: string
  eventIds?: string[]
}

/**
 * Matrice des permissions selon les 6 rôles du système EMS
 *
 * SUPER_ADMIN: Accès global omniscient, peut créer des organisations (sans org)
 * ADMIN: Gestion complète de l'organisation + équipe + invitations
 * MANAGER: Gestion événements sans invitations utilisateurs
 * VIEWER: Lecture seule sur tous événements de l'organisation
 * PARTNER: Lecture seule sur événements assignés uniquement
 * HOTESSE: Scan QR codes sur événements assignés uniquement
 */
export const rulesFor = (role: UserRole, ctx: RoleContext): AppRule[] => {
  const { orgId, eventIds = [] } = ctx

  switch (role) {
    case 'SUPER_ADMIN':
      return [
        // Accès total à tout - omniscient, peut créer des organisations
        // SUPER_ADMIN n'a pas d'organisation spécifique
        { action: 'manage', subject: 'all' },
      ]

    case 'ADMIN':
      // ADMIN doit avoir une organisation
      if (!orgId) return []
      return [
        // Accès complet à l'organisation + gestion équipe et invitations
        {
          action: 'manage',
          subject: 'Organization',
          conditions: { id: orgId },
        },
        { action: 'manage', subject: 'Event', conditions: { orgId } },
        { action: 'manage', subject: 'Subevent', conditions: { orgId } },
        { action: 'manage', subject: 'Attendee', conditions: { orgId } },
        // Gestion des utilisateurs (spécificité ADMIN)
        { action: 'manage', subject: 'User', conditions: { orgId } },
        { action: 'invite', subject: 'User', conditions: { orgId } },
        { action: 'create', subject: 'User', conditions: { orgId } },
        { action: 'assign', subject: 'User', conditions: { orgId } }, // Assigner des rôles
        { action: 'view-all', subject: 'Event', conditions: { orgId } }, // Voir tous les événements
        // Gestion des invitations
        { action: 'manage', subject: 'Invitation', conditions: { orgId } },
        // Accès aux rapports
        { action: 'read', subject: 'Report', conditions: { orgId } },
        { action: 'export', subject: 'Report', conditions: { orgId } },
        // Paramètres et badges
        { action: 'manage', subject: 'Settings', conditions: { orgId } },
        { action: 'manage', subject: 'Badge', conditions: { orgId } },
        // Gestion des rôles (future)
        { action: 'create', subject: 'Role', conditions: { orgId } },
        { action: 'manage', subject: 'Role', conditions: { orgId } },
        { action: 'manage', subject: 'Permission', conditions: { orgId } },
        // Gestion des factures
        { action: 'manage', subject: 'Invoice', conditions: { orgId } },
        { action: 'approve', subject: 'Invoice', conditions: { orgId } },
      ]

    case 'MANAGER':
      // MANAGER doit avoir une organisation
      if (!orgId) return []
      return [
        // Gestion événements sans invitations utilisateurs
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        { action: 'manage', subject: 'Event', conditions: { orgId } },
        { action: 'manage', subject: 'Subevent', conditions: { orgId } },
        { action: 'manage', subject: 'Attendee', conditions: { orgId } },
        { action: 'assign', subject: 'User', conditions: { orgId } }, // Peut assigner des partenaires aux événements
        { action: 'view-all', subject: 'Event', conditions: { orgId } }, // Voir tous les événements
        // Pas de gestion utilisateurs (différence avec ADMIN)
        { action: 'read', subject: 'User', conditions: { orgId } },
        // Accès aux rapports
        { action: 'read', subject: 'Report', conditions: { orgId } },
        { action: 'export', subject: 'Report', conditions: { orgId } },
        // Badges et paramètres en lecture
        { action: 'read', subject: 'Settings', conditions: { orgId } },
        { action: 'manage', subject: 'Badge', conditions: { orgId } },
      ]

    case 'VIEWER':
      // VIEWER doit avoir une organisation
      if (!orgId) return []
      return [
        // Lecture seule sur tous les événements de l'organisation
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        { action: 'read', subject: 'Event', conditions: { orgId } },
        { action: 'read', subject: 'Subevent', conditions: { orgId } },
        { action: 'read', subject: 'Attendee', conditions: { orgId } },
        { action: 'read', subject: 'User', conditions: { orgId } },
        // Accès aux rapports en lecture seule
        { action: 'read', subject: 'Report', conditions: { orgId } },
        { action: 'read', subject: 'Settings', conditions: { orgId } },
        { action: 'read', subject: 'Badge', conditions: { orgId } },
      ]

    case 'PARTNER':
      // PARTNER doit avoir une organisation
      if (!orgId) return []
      return [
        // Lecture seule uniquement sur les événements assignés
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
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
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Accès limité aux rapports des événements assignés
        {
          action: 'read',
          subject: 'Report',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Badge',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    case 'HOSTESS':
      // HOSTESS doit avoir une organisation
      if (!orgId) return []
      return [
        // Accès minimal pour scan QR codes uniquement sur événements assignés
        { action: 'read', subject: 'Organization', conditions: { id: orgId } },
        {
          action: 'read',
          subject: 'Event',
          conditions: { id: { $in: eventIds }, orgId },
        },
        {
          action: 'read',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Permission spéciale pour scanner les QR codes
        {
          action: 'scan',
          subject: 'QRCode',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        {
          action: 'check-in',
          subject: 'Attendee',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
        // Accès minimal aux badges nécessaires pour le scan
        {
          action: 'read',
          subject: 'Badge',
          conditions: { eventId: { $in: eventIds }, orgId },
        },
      ]

    default:
      console.warn(`[RBAC] Unknown role: ${role}, returning empty rules`)
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
