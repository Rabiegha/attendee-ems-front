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
    statusCounts: {
      awaiting: number
      approved: number
      refused: number
    }
  }
}

export interface RegistrationsQueryParams {
  eventId: string
  page?: number
  limit?: number
  status?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}

export const registrationsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegistrations: builder.query<
      { data: RegistrationDPO[]; meta: RegistrationsListResponse['meta'] },
      RegistrationsQueryParams
    >({
      query: ({ eventId, ...params }) => ({
        url: `/events/${eventId}/registrations`,
        params,
      }),
      transformResponse: (response: RegistrationsListResponse) => ({
        data: response.data.map(mapRegistrationDTOtoDPO),
        meta: response.meta,
      }),
      providesTags: (result, _error, { eventId }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Attendee' as const, id })),
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
        replaceExisting?: boolean
      }
    >({
      query: ({ eventId, file, autoApprove, replaceExisting }) => {
        const formData = new FormData()
        formData.append('file', file)
        if (autoApprove !== undefined) {
          formData.append('autoApprove', autoApprove.toString())
        }
        if (replaceExisting !== undefined) {
          formData.append('replaceExisting', replaceExisting.toString())
        }

        return {
          url: `/events/${eventId}/registrations/bulk-import`,
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: any) => {
        // Backend renvoie directement les stats, on les wrappe dans summary
        return {
          success: true,
          summary: {
            total_rows: response.total_rows || 0,
            created: response.created || 0,
            updated: response.updated || 0,
            skipped: response.skipped || 0,
            errors: response.errors || [],
          },
          details: [], // Le backend ne renvoie pas de détails pour l'instant
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
          source?: 'public_form' | 'test_form' | 'manual' | 'import'
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

    restoreRegistration: builder.mutation<RegistrationDPO, { id: string; eventId: string }>(
      {
        query: ({ id }) => ({
          url: `/registrations/${id}/restore`,
          method: 'POST',
        }),
        transformResponse: (response: RegistrationDTO) =>
          mapRegistrationDTOtoDPO(response),
        invalidatesTags: (_result, _error, { id, eventId }) => [
          { type: 'Attendee', id },
          { type: 'Attendee', id: `EVENT-${eventId}` },
          { type: 'Event', id: eventId },
        ],
      }
    ),

    permanentDeleteRegistration: builder.mutation<void, { id: string; eventId: string }>(
      {
        query: ({ id }) => ({
          url: `/registrations/${id}/permanent`,
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
      { ids: string[]; eventId: string }
    >({
      query: ({ ids }) => ({
        url: '/registrations/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'Event', id: eventId },
      ],
    }),

    bulkUpdateRegistrationStatus: builder.mutation<
      { updatedCount: number },
      { ids: string[]; status: string }
    >({
      query: ({ ids, status }) => ({
        url: '/registrations/bulk-update-status',
        method: 'PATCH',
        body: { ids, status },
      }),
      invalidatesTags: (_result, _error, { ids }) => [
        ...ids.map(id => ({ type: 'Attendee' as const, id })),
        { type: 'Attendee', id: 'LIST' },
      ],
    }),

    bulkCheckIn: builder.mutation<
      { checkedInCount: number },
      { ids: string[] }
    >({
      query: ({ ids }) => ({
        url: '/registrations/bulk-checkin',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, { ids }) => [
        ...ids.map(id => ({ type: 'Attendee' as const, id })),
        { type: 'Attendee', id: 'LIST' },
      ],
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

    // Génération de badges
    generateBadgesForEvent: builder.mutation<
      { success: boolean; message: string; generated: number },
      { eventId: string }
    >({
      query: ({ eventId }) => ({
        url: `/events/${eventId}/registrations/generate-badges`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'Event', id: eventId },
      ],
    }),

    generateBadgesBulk: builder.mutation<
      { success: boolean; message: string; generated: number },
      { eventId: string; registrationIds: string[] }
    >({
      query: ({ eventId, registrationIds }) => ({
        url: `/events/${eventId}/registrations/generate-badges-bulk`,
        method: 'POST',
        body: { registrationIds },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    generateBadge: builder.mutation<
      { success: boolean; message: string; generated: number },
      { eventId: string; registrationId: string }
    >({
      query: ({ eventId, registrationId }) => ({
        url: `/events/${eventId}/registrations/${registrationId}/generate-badge`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { eventId, registrationId }) => [
        { type: 'Attendee', id: registrationId },
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    downloadBadge: builder.mutation<
      Blob,
      { eventId: string; registrationId: string; format: 'pdf' | 'html' | 'image' }
    >({
      query: ({ eventId, registrationId, format }) => ({
        url: `/events/${eventId}/registrations/${registrationId}/badge/download?format=${format}`,
        method: 'GET',
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
  useImportExcelRegistrationsMutation,
  useExportRegistrationsMutation,
  useCreateRegistrationMutation,
  useUpdateRegistrationMutation,
  useDeleteRegistrationMutation,
  useRestoreRegistrationMutation,
  usePermanentDeleteRegistrationMutation,
  useBulkDeleteRegistrationsMutation,
  useBulkUpdateRegistrationStatusMutation,
  useBulkCheckInMutation,
  useBulkExportRegistrationsMutation,
  useGenerateBadgesForEventMutation,
  useGenerateBadgesBulkMutation,
  useGenerateBadgeMutation,
  useDownloadBadgeMutation,
} = registrationsApi
