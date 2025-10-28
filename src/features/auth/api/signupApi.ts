/**
 * 🔐 API RTK QUERY POUR LE SIGNUP SÉCURISÉ
 *
 * Endpoints:
 * - validateToken: Valide un token d'invitation
 * - completeSignup: Complète l'inscription et active le compte
 */

import { rootApi } from '@/services/rootApi'
import type {
  TokenValidationResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
} from '../types/signup.types'

export const signupApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Valider un token d'invitation
    validateToken: builder.query<TokenValidationResponse, string>({
      query: (token) => ({
        url: `/auth/signup/${token}/validate`,
        method: 'GET',
      }),
      providesTags: ['Signup'],
    }),

    // Compléter l'inscription
    completeSignup: builder.mutation<
      CompleteSignupResponse,
      CompleteSignupRequest
    >({
      query: (data) => ({
        url: `/auth/signup/${data.token}`,
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
  overrideExisting: false,
})

export const { useValidateTokenQuery, useCompleteSignupMutation } = signupApi
