/**
 * 🔒 GESTION DE LA HIÉRARCHIE DES RÔLES
 *
 * Règles de sécurité :
 * 1. Un utilisateur ne peut PAS modifier son propre rôle
 * 2. Un utilisateur peut modifier uniquement des utilisateurs de niveau STRICTEMENT INFÉRIEUR
 * 3. Un utilisateur peut assigner uniquement des rôles de niveau STRICTEMENT INFÉRIEUR au sien
 *
 * ATTENTION : Hiérarchie inversée dans la DB
 * (niveau plus BAS numériquement = plus de pouvoir) :
 * - SUPER_ADMIN : 1
 * - ADMIN : 2
 * - MANAGER : 3
 * - VIEWER : 4
 * - PARTNER : 5
 * - HOSTESS : 6
 */

export const ROLE_LEVELS: Record<string, number> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  MANAGER: 3,
  VIEWER: 4,
  PARTNER: 5,
  HOSTESS: 6,
}

export interface RoleHierarchyCheck {
  canModify: boolean
  canAssignRole: boolean
  reason?: string
}

/**
 * Vérifie si un utilisateur peut modifier un autre utilisateur
 * @param currentUserRoleCode Code du rôle de l'utilisateur connecté (ex: "ADMIN")
 * @param targetUserRoleCode Code du rôle de l'utilisateur cible (ex: "MANAGER")
 * @param currentUserId ID de l'utilisateur connecté
 * @param targetUserId ID de l'utilisateur cible
 */
export function canModifyUser(
  currentUserRoleCode: string,
  targetUserRoleCode: string,
  currentUserId: string,
  targetUserId: string
): RoleHierarchyCheck {
  // Règle 1 : Un utilisateur ne peut pas se modifier lui-même (changement de rôle)
  if (currentUserId === targetUserId) {
    return {
      canModify: false,
      canAssignRole: false,
      reason: 'Vous ne pouvez pas modifier votre propre rôle',
    }
  }

  const currentLevel = ROLE_LEVELS[currentUserRoleCode] || 0
  const targetLevel = ROLE_LEVELS[targetUserRoleCode] || 0

  // Règle 2 : Peut modifier uniquement des utilisateurs de niveau STRICTEMENT INFÉRIEUR
  // Niveau plus HAUT numériquement = moins de pouvoir
  // Un ADMIN (2) peut modifier : MANAGER (3), VIEWER (4), PARTNER (5), HOSTESS (6)
  // Un ADMIN ne peut PAS modifier : SUPER_ADMIN (1) ou autre ADMIN (2)
  if (targetLevel <= currentLevel) {
    return {
      canModify: false,
      canAssignRole: false,
      reason: `Vous ne pouvez pas modifier un utilisateur avec le rôle "${targetUserRoleCode}" (niveau ${targetLevel}). Votre niveau est ${currentLevel}.`,
    }
  }

  return {
    canModify: true,
    canAssignRole: true,
  }
}

/**
 * Vérifie si un utilisateur peut assigner un rôle spécifique
 * @param currentUserRoleCode Code du rôle de l'utilisateur connecté
 * @param targetRoleCode Code du rôle à assigner
 */
export function canAssignRole(
  currentUserRoleCode: string,
  targetRoleCode: string
): { canAssign: boolean; reason?: string } {
  const currentLevel = ROLE_LEVELS[currentUserRoleCode] || 0
  const targetLevel = ROLE_LEVELS[targetRoleCode] || 0

  // Règle 3 : Peut assigner uniquement des rôles de niveau STRICTEMENT INFÉRIEUR
  // Niveau plus HAUT numériquement = moins de pouvoir
  if (targetLevel <= currentLevel) {
    return {
      canAssign: false,
      reason: `Vous ne pouvez pas assigner le rôle "${targetRoleCode}" (niveau ${targetLevel}). Votre niveau est ${currentLevel}.`,
    }
  }

  return { canAssign: true }
}

/**
 * Filtre une liste de rôles pour ne garder que ceux que l'utilisateur peut assigner
 * @param currentUserRoleCode Code du rôle de l'utilisateur connecté
 * @param roles Liste des rôles disponibles
 */
export function filterAssignableRoles<
  T extends { code: string; level?: number },
>(currentUserRoleCode: string, roles: T[]): T[] {
  const currentLevel = ROLE_LEVELS[currentUserRoleCode] || 0

  return roles.filter((role) => {
    const roleLevel = role.level || ROLE_LEVELS[role.code] || 0
    // Ne garder que les rôles de niveau STRICTEMENT INFÉRIEUR
    // Niveau plus HAUT numériquement = moins de pouvoir
    return roleLevel > currentLevel
  })
}

/**
 * Obtient le niveau hiérarchique d'un rôle
 */
export function getRoleLevel(roleCode: string): number {
  return ROLE_LEVELS[roleCode] || 0
}

/**
 * Vérifie si un rôle est supérieur à un autre
 * @returns true si roleCode1 a plus de pouvoir que roleCode2
 */
export function isRoleHigher(roleCode1: string, roleCode2: string): boolean {
  const level1 = ROLE_LEVELS[roleCode1] || 0
  const level2 = ROLE_LEVELS[roleCode2] || 0
  // Niveau plus BAS numériquement = plus de pouvoir
  return level1 < level2
}
