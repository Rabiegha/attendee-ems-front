export interface Permission {
  id: string
  code: string
  name: string
  category: string
  description: string
}

export interface Role {
  id: string
  code: string
  name: string
  description: string
  color: string
  permissions: string[] // Array of permission IDs
}

export interface RolePermissionUpdate {
  roleId: string
  permissionId: string
  granted: boolean
}

export interface UpdateRolePermissionsRequest {
  roleId: string
  permissionIds: string[]
}

export interface UpdateRolePermissionsResponse {
  success: boolean
  role: Role
  message?: string
}

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  EVENTS: 'Événements',
  USERS: 'Utilisateurs', 
  ATTENDEES: 'Participants',
  REPORTS: 'Rapports',
  SETTINGS: 'Paramètres',
  ORGANIZATION: 'Organisation'
} as const

export type PermissionCategory = keyof typeof PERMISSION_CATEGORIES