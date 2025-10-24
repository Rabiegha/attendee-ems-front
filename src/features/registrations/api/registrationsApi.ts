import { rootApi } from '@/services/rootApi'
import type { RegistrationDTO, RegistrationDPO } from '../dpo'
import { mapRegistrationDTOtoDPO } from '../dpo'

export const registrationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrations: builder.query<RegistrationDPO[], { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}/registrations`,
      transformResponse: (response: RegistrationDTO[]) => 
        response.map(mapRegistrationDTOtoDPO),
      providesTags: (result, _error, { eventId }) => 
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Attendee' as const, id })),
              { type: 'Attendee', id: `EVENT-${eventId}` },
            ]
          : [{ type: 'Attendee', id: `EVENT-${eventId}` }],
    }),
    
    updateRegistrationStatus: builder.mutation<RegistrationDPO, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/registrations/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: RegistrationDTO) => mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attendee', id }],
    }),
    
    importRegistrations: builder.mutation<{ count: number; errors: string[] }, { eventId: string; data: any[] }>({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}/registrations/import`,
        method: 'POST',
        body: { registrations: data },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'Event', id: eventId },
      ],
    }),
    
    exportRegistrations: builder.mutation<Blob, { eventId: string; format: 'csv' | 'excel' }>({
      query: ({ eventId, format }) => ({
        url: `/events/${eventId}/registrations/export`,
        method: 'GET',
        params: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRegistrationsQuery,
  useUpdateRegistrationStatusMutation,
  useImportRegistrationsMutation,
  useExportRegistrationsMutation,
} = registrationsApi
