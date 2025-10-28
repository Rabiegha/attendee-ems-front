import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import type {
  Organization,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  GetOrganizationsResponse,
  GetOrganizationUsersResponse,
} from '../types'

export const organizationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Créer une organisation (SUPER_ADMIN uniquement)
    createOrganization: builder.mutation<
      CreateOrganizationResponse,
      CreateOrganizationRequest
    >({
      query: (data) => ({
        url: API_ENDPOINTS.ORGANIZATIONS.CREATE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organizations'],
    }),

    // Récupérer l'organisation de l'utilisateur connecté
    getMyOrganization: builder.query<Organization, void>({
      query: () => API_ENDPOINTS.ORGANIZATIONS.ME,
      providesTags: ['Organizations'],
    }),

    // Liste toutes les organisations (SUPER_ADMIN uniquement)
    getOrganizations: builder.query<GetOrganizationsResponse, void>({
      query: () => API_ENDPOINTS.ORGANIZATIONS.LIST,
      providesTags: ['Organizations'],
      transformResponse: (response: Organization[]) => ({
        organizations: response,
      }),
    }),

    // Récupérer les utilisateurs d'une organisation spécifique
    getOrganizationUsers: builder.query<GetOrganizationUsersResponse, string>({
      query: (orgId) => API_ENDPOINTS.ORGANIZATIONS.USERS(orgId),
      providesTags: (_result, _error, orgId) => [
        { type: 'User', id: 'LIST' },
        { type: 'Organizations', id: orgId },
      ],
    }),

    // Mettre à jour une organisation
    updateOrganization: builder.mutation<
      Organization,
      { id: string; data: Partial<Organization> }
    >({
      query: ({ id, data }) => ({
        url: `/organizations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Organizations', id },
      ],
    }),

    // Supprimer une organisation (SUPER_ADMIN uniquement)
    deleteOrganization: builder.mutation<void, string>({
      query: (id) => ({
        url: `/organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Organizations'],
    }),
  }),
})

export const {
  useCreateOrganizationMutation,
  useGetOrganizationsQuery,
  useGetMyOrganizationQuery,
  useGetOrganizationUsersQuery,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} = organizationsApi
