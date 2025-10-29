/**
 * Public Events API - Routes publiques sans authentification
 * 
 * Utilisé pour :
 * - Afficher les informations d'événement via landing page publique
 * - Permettre les inscriptions publiques via formulaire embed
 */

import { rootApi } from '@/services/rootApi'

interface PublicEventInfo {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  location: string
  location_type: 'onsite' | 'online' | 'hybrid'
  max_attendees: number
  current_attendees: number
  status: string
  public_token: string
  registration_fields: any[]
}

interface PublicRegistrationData {
  attendee: {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
    company?: string
    job_title?: string
    country?: string
  }
  attendance_type?: 'onsite' | 'online' | 'hybrid'
  event_attendee_type_id?: string
  answers?: Record<string, any>
}

interface PublicRegistrationResponse {
  success: boolean
  message: string
  registration_id: string
  attendee_id: string
}

export const publicEventsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Récupérer les informations d'un événement via son token public
     * Route publique - pas d'authentification requise
     */
    getPublicEvent: builder.query<PublicEventInfo, string>({
      query: (publicToken) => `/public/events/${publicToken}`,
      providesTags: (_result, _error, publicToken) => [
        { type: 'Event', id: `PUBLIC-${publicToken}` },
      ],
    }),

    /**
     * Créer une inscription publique (formulaire embed, landing page)
     * Route publique - pas d'authentification requise
     */
    createPublicRegistration: builder.mutation<
      PublicRegistrationResponse,
      {
        publicToken: string
        data: PublicRegistrationData
        eventId?: string // Optionnel : pour invalider les bons tags RTK Query
      }
    >({
      query: ({ publicToken, data }) => ({
        url: `/public/events/${publicToken}/register`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { publicToken, eventId }) => {
        const tags: any[] = [{ type: 'Event', id: `PUBLIC-${publicToken}` }]
        
        // Si on connaît l'eventId, on invalide aussi les tags registrations/attendees
        if (eventId) {
          tags.push(
            { type: 'Registration', id: `EVENT-${eventId}` },
            { type: 'Attendee', id: `EVENT-${eventId}` },
            { type: 'Event', id: eventId }
          )
        }
        
        return tags
      },
    }),
  }),
})

export const {
  useGetPublicEventQuery,
  useLazyGetPublicEventQuery,
  useCreatePublicRegistrationMutation,
} = publicEventsApi
