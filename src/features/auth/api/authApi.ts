import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/app/config/env'
import { API_ENDPOINTS } from '@/app/config/constants'
import type { AppRule } from '@/shared/acl/app-ability'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  organization: Organization
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
  orgId: string
  eventIds?: string[]
  isSuperAdmin?: boolean
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
      invalidatesTags: ['Auth'],
    }),
    
    me: builder.query<User, void>({
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
