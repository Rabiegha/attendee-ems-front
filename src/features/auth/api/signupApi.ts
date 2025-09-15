/**
 * 🔐 API RTK QUERY POUR LE SIGNUP SÉCURISÉ
 * 
 * Endpoints:
 * - validateToken: Valide un token d'invitation
 * - completeSignup: Complète l'inscription et active le compte
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/app/config/env'
import type { 
  TokenValidationResponse, 
  CompleteSignupRequest, 
  CompleteSignupResponse 
} from '../types/signup.types'

export const signupApi = createApi({
  reducerPath: 'signupApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${env.VITE_API_BASE_URL}/auth`,
  }),
  tagTypes: ['Signup'],
  endpoints: (builder) => ({
    
    // Valider un token d'invitation
    validateToken: builder.query<TokenValidationResponse, string>({
      query: (token) => ({
        url: `/signup/${token}/validate`,
        method: 'GET',
      }),
      providesTags: ['Signup'],
    }),
    
    // Compléter l'inscription
    completeSignup: builder.mutation<CompleteSignupResponse, CompleteSignupRequest>({
      query: (data) => ({
        url: `/signup/${data.token}`,
        method: 'POST',
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          phone: data.phone,
        },
      }),
      invalidatesTags: ['Signup'],
    }),
    
  }),
})

export const {
  useValidateTokenQuery,
  useCompleteSignupMutation,
} = signupApi