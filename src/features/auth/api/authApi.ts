import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import { normalizeUserData, normalizeOrganizationData } from '@/shared/lib/user-utils'
import type { AppRule } from '@/shared/acl/app-ability'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  expires_in: number
  user?: User | undefined
  organization?: Organization | null | undefined
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  first_name?: string  // Support backend format
  last_name?: string   // Support backend format
  phone?: string
  company?: string
  job_title?: string
  country?: string
  metadata?: any
  roles: string[]
  orgId?: string
  org_id?: string      // Support backend format
  eventIds?: string[]
  isSuperAdmin?: boolean
  is_active?: boolean
  must_change_password?: boolean
}

export interface UserProfileResponse {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company: string | null
  job_title: string | null
  country: string | null
  metadata: any
  org_id: string
  role: {
    id: string
    code: string
    name: string
    description?: string
  }
  organization?: {
    id: string
    name: string
    slug: string
  }
  is_active: boolean
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
}

export interface PolicyResponse {
  rules: AppRule[]
  version: string
}

export const authApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    refresh: builder.mutation<{ access_token: string; expires_in: number }, void>({
      query: () => ({ url: API_ENDPOINTS.AUTH.REFRESH, method: 'POST' }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        // Normaliser les données utilisateur et organisation
        return {
          access_token: response.access_token,
          expires_in: response.expires_in || 900, // 15 minutes par défaut
          user: response.user ? normalizeUserData(response.user) : undefined,
          organization: response.organization ? normalizeOrganizationData(response.organization) : undefined,
        }
      },
      invalidatesTags: ['Auth'],
    }),
    
    me: builder.query<UserProfileResponse, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      providesTags: ['Auth'],
    }),
    
    getPolicy: builder.query<PolicyResponse, string>({
      query: (orgId) => `${API_ENDPOINTS.AUTH.POLICY}?orgId=${orgId}`,
      providesTags: ['Policy'],
    }),
    
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Policy'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useRefreshMutation,
  useLoginMutation,
  useMeQuery,
  useLazyMeQuery,
  useGetPolicyQuery,
  useLogoutMutation,
} = authApi
