import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/app/config/env'
import { API_ENDPOINTS } from '@/app/config/constants'
import { normalizeUserData, normalizeOrganizationData } from '@/shared/lib/user-utils'
import type { AppRule } from '@/shared/acl/app-ability'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
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
  roles: string[]
  orgId?: string
  org_id?: string      // Support backend format
  eventIds?: string[]
  isSuperAdmin?: boolean
}

export interface UserProfileResponse {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  org_id: string
  role: string
  permissions: string[]
  is_active: boolean
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

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).session.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Auth', 'Policy'],
  endpoints: (builder) => ({
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
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Policy'],
    }),
  }),
})

export const {
  useLoginMutation,
  useMeQuery,
  useGetPolicyQuery,
  useLogoutMutation,
} = authApi
