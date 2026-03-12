import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import type { User } from '@/features/users/api/usersApi'

export interface PartnersListResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface PartnersQueryParams {
  page?: number
  limit?: number
  search?: string
  companyId?: string
}

export const partnersApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer la liste des partenaires (roleCode=PARTNER)
    getPartners: builder.query<PartnersListResponse, PartnersQueryParams>({
      query: ({ page = 1, limit = 10, search, companyId }) => {
        const params: Record<string, string> = {
          page: page.toString(),
          limit: limit.toString(),
          roleCode: 'PARTNER',
        }
        if (search) params.search = search
        if (companyId) params.companyId = companyId
        return {
          url: API_ENDPOINTS.USERS.LIST,
          params,
        }
      },
      providesTags: ['Users'],
      serializeQueryArgs: ({ queryArgs }) => {
        return `partners-${queryArgs.page}-${queryArgs.limit}-${queryArgs.search || ''}-${queryArgs.companyId || ''}`
      },
    }),

    // Récupérer un partenaire par ID
    getPartnerById: builder.query<User, string>({
      query: (id) => API_ENDPOINTS.USERS.BY_ID(id),
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPartnersQuery,
  useGetPartnerByIdQuery,
} = partnersApi
