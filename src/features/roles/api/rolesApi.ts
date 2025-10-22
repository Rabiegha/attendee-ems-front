import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'

export interface Role {
  id: string
  code: string
  name: string
  description: string
  level: number  // Hiérarchie du rôle (0=SUPER_ADMIN, 1=ADMIN, 2=MANAGER, etc.)
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
    // Récupérer tous les rôles (filtrés par organisation côté backend)
    getRoles: builder.query<Role[], void>({
      query: () => API_ENDPOINTS.ROLES.LIST,
      providesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // Récupérer un rôle par ID
    getRole: builder.query<Role, string>({
      query: (id) => API_ENDPOINTS.ROLES.BY_ID(id),
      providesTags: (_, __, id) => [{ type: 'Role', id }],
    }),

    // Mettre à jour les permissions d'un rôle
    updateRolePermissions: builder.mutation<Role, { roleId: string; permissionIds: string[] }>({
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
  useGetRolesQuery,
  useGetRoleQuery,
  useUpdateRolePermissionsMutation,
  useGetPermissionsQuery,
} = rolesApi