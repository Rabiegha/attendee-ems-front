import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'

export interface Role {
  id: string
  code: string
  name: string
  description: string
  level: number // Hiérarchie du rôle (0=SUPER_ADMIN, 1=ADMIN, 2=MANAGER, etc.)
  org_id: string | null
  is_system_role: boolean
  created_at: string
  updated_at: string
  permissions?: Permission[]
}

export interface Permission {
  id: string
  code: string
  name: string
  description: string
}

export const rolesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔥 NOUVEAU NOM pour forcer le rechargement du cache
    getRolesFiltered: builder.query<
      Role[],
      { orgId?: string; templatesOnly?: boolean }
    >({
      query: (params) => {
        console.log('🔍 [ROLES API] Building query with params:', params)
        const queryParams = new URLSearchParams()
        if (params.orgId) queryParams.append('orgId', params.orgId)
        if (params.templatesOnly) queryParams.append('templatesOnly', 'true')
        const queryString = queryParams.toString()
        const finalUrl = queryString
          ? `${API_ENDPOINTS.ROLES.LIST}?${queryString}`
          : API_ENDPOINTS.ROLES.LIST
        console.log('🌐 [ROLES API] Final URL:', finalUrl)
        return finalUrl
      },
      // 🔥 Cache dynamique basé sur les paramètres
      providesTags: (_result, _error, params) => {
        if (params.templatesOnly) {
          return [{ type: 'Role', id: 'TEMPLATES' }]
        } else if (params.orgId) {
          return [{ type: 'Role', id: `ORG-${params.orgId}` }]
        }
        return [{ type: 'Role', id: 'LIST' }]
      },
    }),

    // Récupérer tous les rôles (filtrés par organisation côté backend) - ANCIEN
    getRoles: builder.query<
      Role[],
      { orgId?: string; templatesOnly?: boolean } | void
    >({
      query: (params) => {
        console.log('🔍 [ROLES API] Building query with params:', params)
        const queryParams = new URLSearchParams()
        if (params && typeof params === 'object') {
          if (params.orgId) queryParams.append('orgId', params.orgId)
          if (params.templatesOnly) queryParams.append('templatesOnly', 'true')
        }
        const queryString = queryParams.toString()
        const finalUrl = queryString
          ? `${API_ENDPOINTS.ROLES.LIST}?${queryString}`
          : API_ENDPOINTS.ROLES.LIST
        console.log('🌐 [ROLES API] Final URL:', finalUrl)
        return finalUrl
      },
      // 🔥 FIX: Cache dynamique basé sur les paramètres pour éviter les collisions
      providesTags: (result, error, params) => {
        if (params && typeof params === 'object') {
          if (params.templatesOnly) {
            return [{ type: 'Role', id: 'TEMPLATES' }]
          } else if (params.orgId) {
            return [{ type: 'Role', id: `ORG-${params.orgId}` }]
          }
        }
        return [{ type: 'Role', id: 'LIST' }]
      },
    }),

    // Récupérer un rôle par ID
    getRole: builder.query<Role, string>({
      query: (id) => API_ENDPOINTS.ROLES.BY_ID(id),
      providesTags: (_, __, id) => [{ type: 'Role', id }],
    }),

    // Mettre à jour les permissions d'un rôle
    updateRolePermissions: builder.mutation<
      Role,
      { roleId: string; permissionIds: string[] }
    >({
      query: ({ roleId, permissionIds }) => ({
        url: `${API_ENDPOINTS.ROLES.LIST}/${roleId}/permissions`,
        method: 'PATCH',
        body: { permissionIds },
      }),
      invalidatesTags: (_, __, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
        'Policy', // Invalider le cache de /auth/policy pour forcer le refresh des permissions CASL
      ],
    }),

    // Récupérer toutes les permissions disponibles
    getPermissions: builder.query<Permission[], void>({
      query: () => API_ENDPOINTS.PERMISSIONS.LIST,
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRolesFilteredQuery, // 🔥 NOUVEAU hook
  useGetRolesQuery,
  useGetRoleQuery,
  useUpdateRolePermissionsMutation,
  useGetPermissionsQuery,
} = rolesApi
