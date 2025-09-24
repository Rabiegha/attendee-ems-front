/**
 * Mapping entre les rôles backend (base de données) et les rôles CASL (frontend)
 * 
 * Backend utilise snake_case en minuscules
 * CASL utilise UPPER_CASE avec underscore
 */

import type { UserRole } from './policies/rbac-presets'

// Mapping des rôles backend vers rôles CASL
export const ROLE_MAPPING: Record<string, UserRole> = {
  // Super Admin (global)
  'super_admin': 'SUPER_ADMIN',
  
  // Organisation level
  'org_admin': 'ORG_ADMIN',
  'org_manager': 'ORG_MANAGER',
  
  // Event level  
  'event_manager': 'EVENT_MANAGER',
  
  // Staff level
  'checkin_staff': 'CHECKIN_STAFF',
  
  // External
  'partner': 'PARTNER',
  
  // Read only
  'readonly': 'READONLY',
  
  // Legacy roles (support for existing demo data)
  'SUPER_ADMIN': 'SUPER_ADMIN',
  'ORG_ADMIN': 'ORG_ADMIN',
  'ORG_MANAGER': 'ORG_MANAGER',
  'EVENT_MANAGER': 'EVENT_MANAGER',
  'DEVELOPER': 'DEVELOPER',
  'GRAPHIC_DESIGNER': 'GRAPHIC_DESIGNER',
  'JOURNALIST': 'JOURNALIST',
  'EDITOR': 'EDITOR',
  'CHECKIN_STAFF': 'CHECKIN_STAFF',
  'PARTNER': 'PARTNER',
  'READONLY': 'READONLY',
}

/**
 * Convertit un rôle backend vers un rôle CASL
 * @param backendRole - Rôle depuis la base de données
 * @returns Rôle CASL correspondant
 */
export function mapBackendRoleToCASQL(backendRole: string): UserRole {
  const mapped = ROLE_MAPPING[backendRole]
  if (!mapped) {
    console.warn(`[RBAC] Unknown backend role: ${backendRole}, defaulting to READONLY`)
    return 'READONLY'
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
export const ROLE_LABELS: Record<UserRole, string> = {
  'SUPER_ADMIN': 'Super Administrateur',
  'ORG_ADMIN': 'Administrateur Organisation', 
  'ORG_MANAGER': 'Manager Organisation',
  'EVENT_MANAGER': 'Manager Événement',
  'CHECKIN_STAFF': 'Personnel Accueil',
  'PARTNER': 'Partenaire',
  'READONLY': 'Lecture seule',
  'DEVELOPER': 'Développeur',
  'GRAPHIC_DESIGNER': 'Graphiste',
  'JOURNALIST': 'Journaliste',
  'EDITOR': 'Rédacteur',
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