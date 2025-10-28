/**
 * Normalisation des données utilisateur entre format backend et frontend
 */

import type { User } from '@/features/auth/api/authApi'

/**
 * Normalise les données utilisateur depuis l'API backend
 * - Convertit first_name/last_name vers firstName/lastName
 * - Convertit org_id vers orgId
 * - Assure la cohérence des types
 */
export function normalizeUserData(rawUser: any): User {
  return {
    id: rawUser.id,
    email: rawUser.email,

    // Support des deux formats de noms
    firstName: rawUser.firstName || rawUser.first_name || '',
    lastName: rawUser.lastName || rawUser.last_name || '',

    // Support des deux formats d'orgId
    orgId: rawUser.orgId || rawUser.org_id,

    // Rôles (assurer que c'est un tableau)
    roles: Array.isArray(rawUser.roles)
      ? rawUser.roles
      : [rawUser.role].filter(Boolean),

    // Champs optionnels
    eventIds: rawUser.eventIds || rawUser.event_ids || [],
    isSuperAdmin: rawUser.isSuperAdmin || rawUser.is_super_admin || false,
  }
}

/**
 * Normalise les données organisation depuis l'API backend
 */
export function normalizeOrganizationData(rawOrg: any) {
  if (!rawOrg) return null

  return {
    id: rawOrg.id,
    name: rawOrg.name,
    slug: rawOrg.slug,
  }
}
