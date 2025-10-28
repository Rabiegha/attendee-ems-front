import { rootApi } from '@/services/rootApi'
import type {
  CreateInvitationRequest,
  CreateInvitationResponse,
  CompleteInvitationRequest,
  UserInvitation,
} from '../types/invitation.types'

export const invitationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Envoyer une invitation
    sendInvitation: builder.mutation<
      CreateInvitationResponse,
      CreateInvitationRequest
    >({
      query: (invitation) => ({
        url: '/invitations/send',
        method: 'POST',
        body: invitation,
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Récupérer les invitations (pour la page de gestion)
    getInvitations: builder.query<
      {
        invitations: UserInvitation[]
        total: number
        pending: number
      },
      {
        status?: 'pending' | 'accepted' | 'expired' | 'cancelled'
        limit?: number
        offset?: number
      }
    >({
      query: ({ status, limit = 20, offset = 0 } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        })
        if (status) {
          params.append('status', status)
        }
        return `/invitations?${params}`
      },
      providesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Annuler une invitation
    cancelInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Renvoyer une invitation
    resendInvitation: builder.mutation<CreateInvitationResponse, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/resend`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),

    // Valider un token d'invitation (page publique)
    validateInvitationToken: builder.query<
      {
        valid: boolean
        email: string
        organization: string
        role: string
        expiresAt: string
      },
      string
    >({
      query: (token) => `/invitations/validate/${token}`,
    }),

    // Compléter une invitation (page publique)
    completeInvitation: builder.mutation<
      {
        user: any
        message: string
      },
      {
        token: string
        userData: CompleteInvitationRequest
      }
    >({
      query: ({ token, userData }) => ({
        url: `/invitations/complete/${token}`,
        method: 'POST',
        body: userData,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useSendInvitationMutation,
  useGetInvitationsQuery,
  useCancelInvitationMutation,
  useResendInvitationMutation,
  useValidateInvitationTokenQuery,
  useCompleteInvitationMutation,
} = invitationsApi
