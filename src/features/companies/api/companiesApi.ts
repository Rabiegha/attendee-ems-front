import { rootApi } from '@/services/rootApi'

export interface Company {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
  _count?: {
    users: number
  }
}

export interface CreateCompanyRequest {
  name: string
}

export interface UpdateCompanyRequest {
  name?: string
  is_active?: boolean
}

export const companiesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Liste des entreprises
    getCompanies: builder.query<Company[], string | void>({
      query: (search) => {
        const result: { url: string; params?: Record<string, any> } = { url: '/companies' }
        if (search) result.params = { search }
        return result
      },
      providesTags: ['Companies'],
    }),

    // Détail d'une entreprise
    getCompanyById: builder.query<Company, string>({
      query: (id) => `/companies/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Companies', id }],
    }),

    // Créer une entreprise
    createCompany: builder.mutation<Company, CreateCompanyRequest>({
      query: (body) => ({
        url: '/companies',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Companies'],
    }),

    // Mettre à jour une entreprise
    updateCompany: builder.mutation<Company, { id: string; data: UpdateCompanyRequest }>({
      query: ({ id, data }) => ({
        url: `/companies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Companies'],
    }),

    // Supprimer une entreprise
    deleteCompany: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Companies', 'Users'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApi
