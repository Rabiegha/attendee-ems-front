/**
 * RBAC Admin API - Appels vers le backend hexagonal
 * Endpoints: /rbac/*
 */

import { rootApi } from '@/services/rootApi'

// ==================== TYPES ====================

export interface Permission {
  id: string
  code: string
  name: string
  scope: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface RolePermission {
  permission_id: string
  permission: Permission
}

export interface RoleWithDetails {
  id: string
  code: string
  name: string
  org_id: string
  level: number
  rank: number
  role_type: 'tenant' | 'platform'
  is_platform: boolean
  is_root: boolean
  is_locked: boolean
  is_active: boolean
  is_system_role: boolean
  managed_by_template: boolean
  created_at: string
  updated_at: string
  rolePermissions: RolePermission[]  // camelCase comme le backend
}

export interface CreateRoleDto {
  orgId: string
  code: string
  name: string
  level?: number
  rank?: number
}

export interface UpdateRoleDto {
  name?: string
  level?: number
  rank?: number
}

export interface AssignPermissionsDto {
  permissionIds: string[]
}

export interface UserWithRole {
  id: string
  first_name: string
  last_name: string
  email: string
  role: RoleWithDetails | null
}

export interface AssignRoleToUserDto {
  userId: string
  orgId: string
  roleId: string
}

export interface TenantUserRole {
  user_id: string
  org_id: string
  role_id: string
  created_at: string
  updated_at: string
}

export interface ReorderRolesDto {
  orderedRoleIds: string[]
}

// ==================== API ====================

export const rbacAdminApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ROLES ====================

    /**
     * GET /rbac/roles/:orgId
     * Liste tous les rôles d'une organisation (avec permissions)
     */
    getRbacRoles: builder.query<RoleWithDetails[], { orgId: string; includeInactive?: boolean }>({
      query: ({ orgId, includeInactive = false }) => ({
        url: `/rbac/roles/${orgId}`,
        params: includeInactive ? { includeInactive: 'true' } : {},
      }),
      providesTags: (result, _error, { orgId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RbacRole' as const, id })),
              { type: 'RbacRole', id: `ORG-${orgId}` },
            ]
          : [{ type: 'RbacRole', id: `ORG-${orgId}` }],
    }),

    /**
     * POST /rbac/roles
     * Créer un nouveau rôle
     */
    createRbacRole: builder.mutation<RoleWithDetails, CreateRoleDto>({
      query: (body) => ({
        url: '/rbac/roles',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacRole', id: `ORG-${orgId}` },
      ],
    }),

    /**
     * PUT /rbac/roles/:roleId
     * Mettre à jour un rôle
     */
    updateRbacRole: builder.mutation<
      RoleWithDetails,
      { roleId: string; data: UpdateRoleDto }
    >({
      query: ({ roleId, data }) => ({
        url: `/rbac/roles/${roleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'RbacRole', id: roleId },
      ],
    }),

    /**
     * DELETE /rbac/roles/:roleId
     * Désactiver un rôle (soft delete)
     */
    deleteRbacRole: builder.mutation<void, { roleId: string; orgId: string }>({
      query: ({ roleId }) => ({
        url: `/rbac/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacRole', id: `ORG-${orgId}` },
      ],
    }),

    /**
     * POST /rbac/roles/:roleId/restore
     * Réactiver un rôle désactivé
     */
    restoreRbacRole: builder.mutation<RoleWithDetails, { roleId: string; orgId: string }>({
      query: ({ roleId }) => ({
        url: `/rbac/roles/${roleId}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacRole', id: `ORG-${orgId}` },
      ],
    }),

    /**
     * DELETE /rbac/roles/:roleId/permanent
     * Supprimer définitivement un rôle (hard delete)
     */
    permanentlyDeleteRbacRole: builder.mutation<void, { roleId: string; orgId: string }>({
      query: ({ roleId }) => ({
        url: `/rbac/roles/${roleId}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacRole', id: `ORG-${orgId}` },
      ],
    }),

    // ==================== PERMISSIONS ====================

    /**
     * GET /rbac/permissions
     * Lister toutes les permissions système
     */
    getAllPermissions: builder.query<Permission[], void>({
      query: () => '/rbac/permissions',
      providesTags: ['RbacPermission'],
    }),

    /**
     * GET /rbac/roles/:roleId/permissions
     * Lister les permissions d'un rôle
     */
    getRolePermissions: builder.query<Permission[], string>({
      query: (roleId) => `/rbac/roles/${roleId}/permissions`,
      providesTags: (_result, _error, roleId) => [
        { type: 'RbacRole', id: roleId },
      ],
    }),

    /**
     * PUT /rbac/roles/:roleId/permissions
     * Assigner des permissions à un rôle (mode REPLACE)
     */
    assignPermissions: builder.mutation<
      RoleWithDetails,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `/rbac/roles/${roleId}/permissions`,
        method: 'PUT',
        body: { permissionIds },
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'RbacRole', id: roleId },
        'Policy', // Invalider le cache CASL
      ],
    }),

    // ==================== USERS ====================

    /**
     * GET /rbac/orgs/:orgId/users
     * Lister les utilisateurs d'une org avec leurs rôles
     */
    getOrgUsersWithRoles: builder.query<UserWithRole[], string>({
      query: (orgId) => `/rbac/orgs/${orgId}/users`,
      providesTags: (_result, _error, orgId) => [
        { type: 'RbacUserRole', id: `ORG-${orgId}` },
      ],
    }),

    /**
     * POST /rbac/users/assign-role
     * Assigner un rôle à un utilisateur
     */
    assignRoleToUser: builder.mutation<TenantUserRole, AssignRoleToUserDto>({
      query: (body) => ({
        url: '/rbac/users/assign-role',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacUserRole', id: `ORG-${orgId}` },
        'Policy', // Invalider le cache CASL
      ],
    }),

    /**
     * DELETE /rbac/users/:userId/orgs/:orgId/role
     * Retirer le rôle d'un utilisateur
     */
    unassignRoleFromUser: builder.mutation<
      void,
      { userId: string; orgId: string }
    >({
      query: ({ userId, orgId }) => ({
        url: `/rbac/users/${userId}/orgs/${orgId}/role`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacUserRole', id: `ORG-${orgId}` },
        'Policy', // Invalider le cache CASL
      ],
    }),

    // ==================== HIERARCHY (DRAG & DROP) ====================

    /**
     * PUT /rbac/orgs/:orgId/roles/reorder
     * Réorganiser la hiérarchie des rôles (drag-and-drop)
     */
    reorderRoles: builder.mutation<
      RoleWithDetails[],
      { orgId: string; roleOrder: { roleId: string; rank: number }[] }
    >({
      query: ({ orgId, roleOrder }) => ({
        url: `/rbac/roles/${orgId}/reorder`,
        method: 'PUT',
        body: { roleOrder },
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: 'RbacRole', id: `ORG-${orgId}` },
      ],
    }),

    /**
     * GET /rbac/roles/:orgId/next-rank
     * Obtenir le prochain rank disponible
     */
    getNextRank: builder.query<{ nextRank: number }, string>({
      query: (orgId) => `/rbac/roles/${orgId}/next-rank`,
    }),
  }),
})

// Export des hooks
export const {
  // Roles
  useGetRbacRolesQuery,
  useCreateRbacRoleMutation,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,
  useRestoreRbacRoleMutation,
  usePermanentlyDeleteRbacRoleMutation,
  // Permissions
  useGetAllPermissionsQuery,
  useGetRolePermissionsQuery,
  useAssignPermissionsMutation,
  // Users
  useGetOrgUsersWithRolesQuery,
  useAssignRoleToUserMutation,
  useUnassignRoleFromUserMutation,
  // Hierarchy
  useReorderRolesMutation,
  useGetNextRankQuery,
} = rbacAdminApi
