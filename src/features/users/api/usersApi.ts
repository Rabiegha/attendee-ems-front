import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'

export interface CreateUserRequest {
  email: string
  password: string
  role_id: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  metadata?: any
  is_active?: boolean
}

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  metadata?: any
  is_active: boolean
  must_change_password?: boolean
  reset_token?: string
  reset_token_expires_at?: string
  org_id: string
  role: {
    id: string
    code: string
    name: string
    description?: string
  }
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  code: string
  name: string
  description?: string
  level: number // Hiérarchie du rôle (0=SUPER_ADMIN, 1=ADMIN, 2=MANAGER, etc.)
  org_id?: string | null
  is_system_role?: boolean
}

// 🆕 Interface pour les organisations
export interface Organization {
  id: string
  name: string
  slug: string
}

// RTK Query API definition
export const usersApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Créer un utilisateur
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: API_ENDPOINTS.USERS.CREATE,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // Récupérer la liste des utilisateurs
    getUsers: builder.query<
      {
        users: User[]
        total: number
        page: number
        limit: number
      },
      {
        page?: number
        limit?: number
        search?: string
        isActive?: boolean
      }
    >({
      query: ({ page = 1, limit = 10, search, isActive }) => ({
        url: API_ENDPOINTS.USERS.LIST,
        params: {
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { q: search }),
          ...(isActive !== undefined && { isActive: isActive.toString() }),
        },
      }),
      providesTags: (_result, _error, arg) => [
        'Users',
        { type: 'Users', id: `LIST-${arg.isActive}` }, // Tag unique par filtre isActive
      ],
      keepUnusedDataFor: 0, // Désactiver complètement le cache
      // Force RTK Query à considérer chaque combinaison de paramètres comme unique
      serializeQueryArgs: ({ queryArgs }) => {
        return `users-${queryArgs.isActive}-${queryArgs.page}-${queryArgs.limit}-${queryArgs.search || ''}`
      },
    }),

    // Récupérer un utilisateur par ID
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    // Mettre à jour un utilisateur
    updateUser: builder.mutation<
      User,
      { id: string; data: Partial<CreateUserRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users', 'Roles', 'Auth'],
      async onQueryStarted({ id }, { dispatch, queryFulfilled, getState }) {
        try {
          const result = await queryFulfilled
          const state = getState() as any
          const currentUser = state.session?.user
          
          // Si l'utilisateur modifié est l'utilisateur connecté
          if (currentUser && currentUser.id === id) {
            // Mettre à jour le Redux store
            const { updateUser: updateSessionUser } = await import('@/features/auth/model/sessionSlice')
            dispatch(updateSessionUser(result.data))
            
            // Invalider spécifiquement la query 'me' pour forcer le refetch
            dispatch(
              (await import('@/features/auth/api/authApi')).authApi.util.invalidateTags(['Auth'])
            )
          }
        } catch {
          // Erreur déjà gérée par le composant
        }
      },
    }),

    // Supprimer un utilisateur
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.USERS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    // Suppression définitive en masse
    bulkDeleteUsers: builder.mutation<void, string[]>({
      query: (userIds) => ({
        url: '/users/bulk-delete',
        method: 'POST',
        body: { ids: userIds }, // Backend attend "ids" pas "userIds"
      }),
      invalidatesTags: ['Users'],
    }),

    // Récupérer les rôles disponibles
    getRoles: builder.query<Role[], void>({
      query: () => API_ENDPOINTS.ROLES.LIST,
      providesTags: ['Roles'],
    }),

    // 🆕 Récupérer toutes les organisations (SUPER_ADMIN uniquement)
    getOrganizations: builder.query<Organization[], void>({
      query: () => '/organizations',
      providesTags: ['Organizations'],
    }),

    // 🆕 Récupérer une organisation par ID
    getOrganization: builder.query<Organization, string>({
      query: (id) => `/organizations/${id}`,
      providesTags: ['Organizations'],
    }),

    // 🆕 Créer un utilisateur avec mot de passe généré automatiquement
    createUserWithGeneratedPassword: builder.mutation<
      {
        user: User & { mustChangePassword: boolean }
        emailSent: boolean
        tempPasswordSent: boolean
      },
      {
        email: string
        password: string
        role_id?: string
        is_active?: boolean
      }
    >({
      query: (userData) => ({
        url: API_ENDPOINTS.USERS.CREATE,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    // 🆕 Changer le mot de passe (première connexion obligatoire)
    changePassword: builder.mutation<
      {
        success: boolean
        message: string
        mustChangePassword: boolean
      },
      {
        currentPassword: string
        newPassword: string
      }
    >({
      query: (passwordData) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body: passwordData,
      }),
    }),

    // 🆕 Récupérer les utilisateurs PARTNER et HOTESSE de l'organisation pour sélection dans les événements
    getPartnersForEvents: builder.query<
      Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>[],
      void
    >({
      query: () => `${API_ENDPOINTS.USERS.LIST}?roles=PARTNER,HOTESSE`,
      transformResponse: (response: { users: User[] }) => {
        // Filtrer côté client car le backend ne filtre pas correctement
        const filtered = response.users.filter(
          (user) =>
            user.role?.code === 'PARTNER' || user.role?.code === 'HOSTESS'
        )
        return filtered.map((user) => ({
          id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email,
        }))
      },
      providesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkDeleteUsersMutation, // 🆕 Hook pour suppression en masse
  useGetRolesQuery,
  useGetOrganizationsQuery, // 🆕 Hook pour les organisations
  useGetOrganizationQuery, // 🆕 Hook pour une organisation spécifique
  useGetPartnersForEventsQuery, // 🆕 Hook pour les partenaires
  // 🆕 Nouveaux hooks pour le workflow avec mdp généré
  useCreateUserWithGeneratedPasswordMutation,
  useChangePasswordMutation,
} = usersApi
