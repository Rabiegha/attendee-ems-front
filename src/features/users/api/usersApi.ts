import { rootApi } from '@/services/rootApi';
import { API_ENDPOINTS } from '@/app/config/constants';

export interface CreateUserRequest {
  email: string;
  password: string;
  role_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  country?: string;
  metadata?: any;
  is_active?: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  country?: string;
  metadata?: any;
  is_active: boolean;
  must_change_password?: boolean;
  reset_token?: string;
  reset_token_expires_at?: string;
  org_id: string;
  role: {
    id: string;
    code: string;
    name: string;
    description?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// 🆕 Interface pour les organisations
export interface Organization {
  id: string;
  name: string;
  slug: string;
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
    getUsers: builder.query<{
      users: User[];
      total: number;
      page: number;
      limit: number;
    }, {
      page?: number;
      limit?: number;
      search?: string;
    }>({
      query: ({ page = 1, limit = 10, search }) => ({
        url: API_ENDPOINTS.USERS.LIST,
        params: {
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { q: search }),
        },
      }),
      providesTags: ['Users'],
    }),

    // Récupérer un utilisateur par ID
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),

    // Mettre à jour un utilisateur
    updateUser: builder.mutation<User, { id: string; data: Partial<CreateUserRequest> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }],
    }),

    // Supprimer un utilisateur
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.USERS.BY_ID(id),
        method: 'DELETE',
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
      query: () => '/v1/organizations',
      providesTags: ['Organizations'],
    }),

    // 🆕 Récupérer une organisation par ID
    getOrganization: builder.query<Organization, string>({
      query: (id) => `/v1/organizations/${id}`,
      providesTags: ['Organizations'],
    }),

    // 🆕 Créer un utilisateur avec mot de passe généré automatiquement
    createUserWithGeneratedPassword: builder.mutation<
      {
        user: User & { mustChangePassword: boolean };
        emailSent: boolean;
        tempPasswordSent: boolean;
      },
      {
        email: string;
        password: string;
        role_id: string;
        is_active?: boolean;
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
        success: boolean;
        message: string;
        mustChangePassword: boolean;
      },
      {
        currentPassword: string;
        newPassword: string;
      }
    >({
      query: (passwordData) => ({
        url: API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        method: 'POST',
        body: passwordData,
      }),
    }),

    // 🆕 Récupérer les utilisateurs PARTNER et HOTESSE de l'organisation pour sélection dans les événements
    getPartnersForEvents: builder.query<Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>[], void>({
      query: () => `${API_ENDPOINTS.USERS.LIST}?roles=PARTNER,HOTESSE`,
      providesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetOrganizationsQuery, // 🆕 Hook pour les organisations
  useGetOrganizationQuery, // 🆕 Hook pour une organisation spécifique
  useGetPartnersForEventsQuery, // 🆕 Hook pour les partenaires
  // 🆕 Nouveaux hooks pour le workflow avec mdp généré
  useCreateUserWithGeneratedPasswordMutation,
  useChangePasswordMutation,
} = usersApi;