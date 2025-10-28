import { rootApi } from '@/services/rootApi'
import type { RegistrationDTO, RegistrationDPO } from '../dpo'
import { mapRegistrationDTOtoDPO } from '../dpo'

interface RegistrationsListResponse {
  data: RegistrationDTO[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const registrationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrations: builder.query<RegistrationDPO[], { eventId: string }>({
      query: ({ eventId }) => `/events/${eventId}/registrations`,
      transformResponse: (response: RegistrationsListResponse) =>
        response.data.map(mapRegistrationDTOtoDPO),
      providesTags: (result, _error, { eventId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Attendee' as const, id })),
              { type: 'Attendee', id: `EVENT-${eventId}` },
            ]
          : [{ type: 'Attendee', id: `EVENT-${eventId}` }],
    }),

    updateRegistrationStatus: builder.mutation<
      RegistrationDPO,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/registrations/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: RegistrationDTO) =>
        mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attendee', id }],
    }),

    importRegistrations: builder.mutation<
      { count: number; errors: string[] },
      { eventId: string; data: any[] }
    >({
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

    // Import Excel avec upload de fichier
    importExcelRegistrations: builder.mutation<
      {
        success: boolean
        summary: {
          total_rows: number
          created: number
          updated: number
          skipped: number
          errors: any[]
        }
        details: Array<{
          row: number
          email: string
          status: 'created' | 'updated' | 'skipped' | 'error'
          attendee_id?: string
          registration_id?: string
          error?: string
        }>
      },
      {
        eventId: string
        file: File
        autoApprove?: boolean
      }
    >({
      query: ({ eventId, file, autoApprove }) => {
        const formData = new FormData()
        formData.append('file', file)
        if (autoApprove !== undefined) {
          formData.append('autoApprove', autoApprove.toString())
        }

        return {
          url: `/events/${eventId}/registrations/bulk-import`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'Event', id: eventId },
      ],
    }),

    exportRegistrations: builder.mutation<
      Blob,
      { eventId: string; format: 'csv' | 'excel' }
    >({
      query: ({ eventId, format }) => ({
        url: `/events/${eventId}/registrations/export`,
        method: 'GET',
        params: { format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    createRegistration: builder.mutation<
      RegistrationDPO,
      {
        eventId: string
        data: {
          attendee: {
            email: string
            first_name?: string
            last_name?: string
            phone?: string
            company?: string
            job_title?: string
            country?: string
          }
          attendance_type: 'onsite' | 'online' | 'hybrid'
          event_attendee_type_id?: string
          answers?: Record<string, any>
        }
      }
    >({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}/registrations`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: RegistrationDTO) =>
        mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'Event', id: eventId },
      ],
    }),

    updateRegistration: builder.mutation<
      RegistrationDPO,
      {
        id: string
        eventId: string
        data: {
          attendee?: {
            email?: string
            first_name?: string
            last_name?: string
            phone?: string
            company?: string
            job_title?: string
            country?: string
          }
          answers?: Record<string, any>
        }
      }
    >({
      query: ({ id, data }) => ({
        url: `/registrations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: RegistrationDTO) =>
        mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    deleteRegistration: builder.mutation<void, { id: string; eventId: string }>(
      {
        query: ({ id }) => ({
          url: `/registrations/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, { id, eventId }) => [
          { type: 'Attendee', id },
          { type: 'Attendee', id: `EVENT-${eventId}` },
          { type: 'Event', id: eventId },
        ],
      }
    ),

    bulkDeleteRegistrations: builder.mutation<
      { deletedCount: number },
      string[]
    >({
      query: (ids) => ({
        url: '/registrations/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Attendee'],
    }),

    bulkExportRegistrations: builder.mutation<
      { downloadUrl: string; filename: string },
      { ids: string[]; format?: string }
    >({
      query: ({ ids, format = 'csv' }) => ({
        url: '/registrations/bulk-export',
        method: 'POST',
        body: { ids, format },
        responseHandler: async (response) => {
          const blob = await response.blob()
          const downloadUrl = URL.createObjectURL(blob)
          const contentDisposition = response.headers.get('content-disposition')
          const filename =
            contentDisposition?.match(/filename="(.+)"/)?.[1] ||
            `inscriptions_export_${new Date().toISOString().split('T')[0]}.csv`
          return { downloadUrl, filename }
        },
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRegistrationsQuery,
  useUpdateRegistrationStatusMutation,
  useImportRegistrationsMutation,
  useImportExcelRegistrationsMutation,
  useExportRegistrationsMutation,
  useCreateRegistrationMutation,
  useUpdateRegistrationMutation,
  useDeleteRegistrationMutation,
  useBulkDeleteRegistrationsMutation,
  useBulkExportRegistrationsMutation,
} = registrationsApi
