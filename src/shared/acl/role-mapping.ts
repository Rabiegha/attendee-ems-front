/**
 * Mapping entre les rôles backend (base de données) et les rôles CASL (frontend)
 *
 * Backend utilise snake_case en minuscules
 * CASL utilise UPPER_CASE avec underscore
 */

import type { UserRole } from './policies/rbac-presets'

// Mapping des rôles backend vers rôles CASL (6 rôles du système EMS)
export const ROLE_MAPPING: Record<string, UserRole> = {
  // Nouveaux rôles du système EMS
  SUPER_ADMIN: 'SUPER_ADMIN', // Accès global omniscient (sans org)
  ADMIN: 'ADMIN', // Gestion équipe + invitations (scope org)
  MANAGER: 'MANAGER', // Gestion événements sans invitations (scope org)
  VIEWER: 'VIEWER', // Lecture seule tous événements org (scope org)
  PARTNER: 'PARTNER', // Lecture seule événements assignés (scope org)
  HOSTESS: 'HOSTESS', // Scan QR codes événements assignés (scope org)

  // Support snake_case et minuscules du backend
  super_admin: 'SUPER_ADMIN',
  admin: 'ADMIN',
  manager: 'MANAGER',
  viewer: 'VIEWER',
  partner: 'PARTNER',
  hostess: 'HOSTESS',
  hotesse: 'HOSTESS', // French alias

  // Legacy roles (pour compatibilité avec anciennes données)
  org_admin: 'ADMIN',
  org_manager: 'MANAGER',
  event_manager: 'MANAGER',
  readonly: 'VIEWER',
  checkin_staff: 'HOSTESS',
}

/**
 * Convertit un rôle backend vers un rôle CASL
 * @param backendRole - Rôle depuis la base de données
 * @returns Rôle CASL correspondant
 */
export function mapBackendRoleToCASQL(backendRole: string): UserRole {
  const mapped = ROLE_MAPPING[backendRole]
  if (!mapped) {
    console.warn(
      `[RBAC] Unknown backend role: ${backendRole}, defaulting to VIEWER`
    )
    return 'VIEWER'
  }
  return mapped
}

/**
 * Convertit un tableau de rôles backend vers des rôles CASL
 * @param backendRoles - Rôles depuis la base de données
 * @returns Rôles CASL correspondants
 */
export function mapBackendRolesToCASQL(backendRoles: string[]): UserRole[] {
  return backendRoles.map(mapBackendRoleToCASQL)
}

/**
 * Labels user-friendly pour l'affichage des rôles
 */
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  VIEWER: 'Visualiseur',
  PARTNER: 'Partenaire',
  HOTESSE: "Hôtesse d'accueil",

  // Legacy labels pour compatibilité
  ORG_ADMIN: 'Administrateur Organisation',
  ORG_MANAGER: 'Manager Organisation',
  EVENT_MANAGER: 'Manager Événement',
  CHECKIN_STAFF: 'Personnel Accueil',
  READONLY: 'Lecture seule',
}

/**
 * Obtient le label user-friendly d'un rôle
 * @param role - Rôle CASL ou backend
 * @returns Label en français
 */
export function getRoleLabel(role: string): string {
  const caslRole = mapBackendRoleToCASQL(role)
  return ROLE_LABELS[caslRole] || role
}
