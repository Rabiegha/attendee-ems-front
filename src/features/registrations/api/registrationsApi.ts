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

    approveWithEmail: builder.mutation<
      RegistrationDPO,
      { id: string; sendEmail: boolean }
    >({
      query: ({ id, sendEmail }) => ({
        url: `/registrations/${id}/approve-with-email`,
        method: 'POST',
        body: { sendEmail },
      }),
      transformResponse: (response: RegistrationDTO) =>
        mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attendee', id }],
    }),

    rejectWithEmail: builder.mutation<
      RegistrationDPO,
      { id: string; sendEmail: boolean; rejectionReason?: string }
    >({
      query: ({ id, sendEmail, rejectionReason }) => ({
        url: `/registrations/${id}/reject-with-email`,
        method: 'POST',
        body: { sendEmail, rejectionReason },
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
          // Admin fields for manual registration
          admin_status?: 'awaiting' | 'approved' | 'refused' | 'cancelled'
          admin_is_checked_in?: boolean
          admin_checked_in_at?: string
          admin_registered_at?: string
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
          eventAttendeeTypeId?: string | null
          attendanceType?: 'onsite' | 'online' | 'hybrid'
          status?: string
        }
      }
    >({
      query: ({ id, data }) => {
        // Map camelCase to snake_case for API
        const payload: any = { ...data }
        
        if (data.eventAttendeeTypeId !== undefined) {
          payload.event_attendee_type_id = data.eventAttendeeTypeId
          delete payload.eventAttendeeTypeId
        }
        
        if (data.attendanceType !== undefined) {
          payload.attendance_type = data.attendanceType
          delete payload.attendanceType
        }

        return {
          url: `/registrations/${id}`,
          method: 'PATCH',
          body: payload,
        }
      },
      transformResponse: (response: RegistrationDTO) =>
        mapRegistrationDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: `EVENT-${eventId}` },
        { type: 'AttendeeTypes', id: eventId }, // Invalider pour mettre à jour les compteurs
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

    checkIn: builder.mutation<
      { success: boolean; message: string; registration: RegistrationDPO },
      { id: string; eventId: string; checkinLocation?: { lat: number; lng: number } }
    >({
      query: ({ id, eventId, checkinLocation }) => ({
        url: `/registrations/${id}/check-in`,
        method: 'POST',
        body: { eventId, checkinLocation },
      }),
      transformResponse: (response: { success: boolean; message: string; registration: RegistrationDTO }) => ({
        ...response,
        registration: mapRegistrationDTOtoDPO(response.registration),
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: 'LIST' },
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    undoCheckIn: builder.mutation<
      { success: boolean; message: string; registration: RegistrationDPO },
      { id: string; eventId: string }
    >({
      query: ({ id, eventId }) => ({
        url: `/registrations/${id}/undo-check-in`,
        method: 'POST',
        body: { eventId },
      }),
      transformResponse: (response: { success: boolean; message: string; registration: RegistrationDTO }) => ({
        ...response,
        registration: mapRegistrationDTOtoDPO(response.registration),
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: 'LIST' },
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    checkOut: builder.mutation<
      { success: boolean; message: string; registration: RegistrationDPO },
      { id: string; eventId: string; checkoutLocation?: { lat: number; lng: number } }
    >({
      query: ({ id, eventId, checkoutLocation }) => ({
        url: `/registrations/${id}/check-out`,
        method: 'POST',
        body: { eventId, checkoutLocation },
      }),
      transformResponse: (response: { success: boolean; message: string; registration: RegistrationDTO }) => ({
        ...response,
        registration: mapRegistrationDTOtoDPO(response.registration),
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: 'LIST' },
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),

    undoCheckOut: builder.mutation<
      { success: boolean; message: string; registration: RegistrationDPO },
      { id: string; eventId: string }
    >({
      query: ({ id, eventId }) => ({
        url: `/registrations/${id}/undo-check-out`,
        method: 'POST',
        body: { eventId },
      }),
      transformResponse: (response: { success: boolean; message: string; registration: RegistrationDTO }) => ({
        ...response,
        registration: mapRegistrationDTOtoDPO(response.registration),
      }),
      invalidatesTags: (_result, _error, { id, eventId }) => [
        { type: 'Attendee', id },
        { type: 'Attendee', id: 'LIST' },
        { type: 'Attendee', id: `EVENT-${eventId}` },
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
        cache: 'no-cache',
        responseHandler: async (response) => {
          const blob = await response.blob()
          const downloadUrl = URL.createObjectURL(blob)
          const contentDisposition = response.headers.get('content-disposition')
          const filename =
            contentDisposition?.match(/filename="(.+)"/)?.[1] ||
            `inscriptions_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' || format === 'xlsx' ? 'xlsx' : 'csv'}`
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

    getRegistrationTemplate: builder.mutation<Blob, void>({
      query: () => ({
        url: '/registrations/template',
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) {
            const text = await response.text()
            try {
              return JSON.parse(text)
            } catch {
              return { error: text, status: response.status }
            }
          }
          return response.blob()
        },
      }),
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

    checkFieldData: builder.mutation<
      { affectedCount: number; canDelete: boolean },
      { eventId: string; fieldId: string }
    >({
      query: ({ eventId, fieldId }) => ({
        url: `/registrations/events/${eventId}/check-field-data/${fieldId}`,
        method: 'POST',
      }),
    }),

    cleanFieldData: builder.mutation<
      { cleanedCount: number },
      { eventId: string; fieldId: string }
    >({
      query: ({ eventId, fieldId }) => ({
        url: `/registrations/events/${eventId}/clean-field-data/${fieldId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Attendee', id: `EVENT-${eventId}` },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRegistrationsQuery,
  useUpdateRegistrationStatusMutation,
  useApproveWithEmailMutation,
  useRejectWithEmailMutation,
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
  useCheckInMutation,
  useUndoCheckInMutation,
  useCheckOutMutation,
  useUndoCheckOutMutation,
  useBulkExportRegistrationsMutation,
  useGenerateBadgesForEventMutation,
  useGenerateBadgesBulkMutation,
  useGenerateBadgeMutation,
  useDownloadBadgeMutation,
  useGetRegistrationTemplateMutation,
  useCheckFieldDataMutation,
  useCleanFieldDataMutation,
} = registrationsApi
