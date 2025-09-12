import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/app/config/env'
import type { 
  UserInvitation, 
  CreateInvitationRequest, 
  CreateInvitationResponse 
} from '../types/invitation.types'

export const invitationsApi = createApi({
  reducerPath: 'invitationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${env.VITE_API_BASE_URL}/invitations`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).session.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Invitation'],
  endpoints: (builder) => ({
    // Envoyer une invitation
    sendInvitation: builder.mutation<CreateInvitationResponse, CreateInvitationRequest>({
      query: (invitation) => ({
        url: '',
        method: 'POST',
        body: invitation,
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Récupérer les invitations (pour la page de gestion)
    getInvitations: builder.query<{
      invitations: UserInvitation[]
      total: number
      pending: number
    }, { 
      status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
      limit?: number
      offset?: number 
    }>({
      query: ({ status, limit = 20, offset = 0 } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        })
        if (status) {
          params.append('status', status)
        }
        return `?${params}`
      },
      providesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Annuler une invitation
    cancelInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/${invitationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Renvoyer une invitation
    resendInvitation: builder.mutation<CreateInvitationResponse, string>({
      query: (invitationId) => ({
        url: `/${invitationId}/resend`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Valider un token d'invitation (page publique)
    validateInvitationToken: builder.query<{
      valid: boolean
      invitation?: Omit<UserInvitation, 'token'>
      expired?: boolean
    }, string>({
      query: (token) => `/validate/${token}`,
    }),

    // Accepter une invitation (page publique)
    acceptInvitation: builder.mutation<{
      success: boolean
      userId: string
    }, {
      token: string
      profileData: {
        firstName: string
        lastName: string
        password: string
      }
    }>({
      query: ({ token, profileData }) => ({
        url: `/accept/${token}`,
        method: 'POST',
        body: profileData,
      }),
    }),
  }),
})

export const {
  useSendInvitationMutation,
  useGetInvitationsQuery,
  useCancelInvitationMutation,
  useResendInvitationMutation,
  useValidateInvitationTokenQuery,
  useAcceptInvitationMutation,
} = invitationsApi