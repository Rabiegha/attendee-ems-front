import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'

export interface Role {
  id: string
  code: string
  name: string
  description: string
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
    // Récupérer tous les rôles
    getRoles: builder.query<Role[], void>({
      query: () => API_ENDPOINTS.ROLES.LIST,
      providesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // Récupérer un rôle par ID
    getRole: builder.query<Role, string>({
      query: (id) => API_ENDPOINTS.ROLES.BY_ID(id),
      providesTags: (_, __, id) => [{ type: 'Role', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRolesQuery,
  useGetRoleQuery,
} = rolesApi