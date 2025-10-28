import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import type {
  AttendeeDTO,
  ExportAttendeesResponse,
} from '../dpo/attendee.dto'

// Types pour l'historique d'un attendee
export interface AttendeeHistoryItem {
  id: string
  attendeeId: string
  eventId: string
  status: string
  displayName: string
  email: string
  registrationDate: string
  checkedInAt?: string
  customData?: Record<string, any>
  event: {
    id: string
    name: string
    description?: string
    startDate: string
    endDate: string
    location?: string
    status: string
    organizationId: string
    organizationName?: string
  }
}
import type { 
  AttendeeDPO, 
  CreateAttendeeDPO, 
  UpdateAttendeeDPO
} from '../dpo/attendee.dpo'
import { 
  mapAttendeeDTOtoDPO, 
  mapCreateAttendeeDPOtoDTO, 
  mapUpdateAttendeeDPOtoDTO
} from '../dpo/attendee.mappers'

export interface AttendeesListParams {
  eventId?: string
  page?: number
  limit?: number
  pageSize?: number
  status?: string
  isActive?: boolean
  search?: string
  q?: string
  tags?: string[]
  sortBy?: 'created_at' | 'updated_at' | 'email' | 'last_name'
  sortDir?: 'asc' | 'desc'
  sortOrder?: 'asc' | 'desc'
}

export const attendeesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendees: builder.query<AttendeeDPO[], AttendeesListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => searchParams.append(key, v))
            } else {
              searchParams.append(key, String(value))
            }
          }
        })
        return `${API_ENDPOINTS.ATTENDEES.LIST}?${searchParams.toString()}`
      },
      transformResponse: (response: { data: AttendeeDTO[] }) => 
        response.data.map(mapAttendeeDTOtoDPO),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Attendee' as const, id })),
              { type: 'Attendees', id: 'LIST' },
            ]
          : [{ type: 'Attendees', id: 'LIST' }],
    }),

    getAttendeeById: builder.query<AttendeeDPO, string>({
      query: (id) => API_ENDPOINTS.ATTENDEES.BY_ID(id),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      providesTags: (_result, _error, id) => [{ type: 'Attendee', id }],
    }),

    createAttendee: builder.mutation<AttendeeDPO, CreateAttendeeDPO>({
      query: (attendeeData) => ({
        url: API_ENDPOINTS.ATTENDEES.LIST,
        method: 'POST',
        body: mapCreateAttendeeDPOtoDTO(attendeeData),
      }),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      invalidatesTags: [{ type: 'Attendees', id: 'LIST' }],
    }),

    updateAttendee: builder.mutation<AttendeeDPO, { id: string; data: UpdateAttendeeDPO }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.ATTENDEES.BY_ID(id),
        method: 'PUT',
        body: mapUpdateAttendeeDPOtoDTO(data),
      }),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          attendeesApi.util.updateQueryData('getAttendeeById', id, (draft) => {
            Object.assign(draft, data)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    toggleAttendeeStatus: builder.mutation<AttendeeDPO, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: API_ENDPOINTS.ATTENDEES.BY_ID(id),
        method: 'PATCH',
        body: { is_active: isActive },
      }),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
      // Optimistic update for status changes
      async onQueryStarted({ id, isActive }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          attendeesApi.util.updateQueryData('getAttendeeById', id, (draft) => {
            draft.isActive = isActive
            draft.canCheckIn = isActive
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    exportAttendees: builder.mutation<ExportAttendeesResponse, { eventId?: string; format?: 'csv' | 'xlsx' }>({
      query: ({ eventId, format = 'csv' }) => ({
        url: `${API_ENDPOINTS.ATTENDEES.EXPORT}?${new URLSearchParams({ 
          ...(eventId && { eventId }), 
          format 
        })}`,
        method: 'POST',
      }),
    }),

    getAttendeeHistory: builder.query<AttendeeHistoryItem[], { attendeeId: string; email: string }>({
      query: ({ attendeeId, email }) => {
        const searchParams = new URLSearchParams()
        searchParams.append('email', email)
        return `${API_ENDPOINTS.ATTENDEES.HISTORY(attendeeId)}?${searchParams.toString()}`
      },
      providesTags: (_result, _error, { attendeeId }) => [
        { type: 'Attendee', id: `history-${attendeeId}` }
      ],
    }),

    deleteAttendee: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.ATTENDEES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
    }),

    bulkDeleteAttendees: builder.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({
        url: `${API_ENDPOINTS.ATTENDEES.LIST}/bulk-delete`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, ids) => [
        ...ids.map(id => ({ type: 'Attendee' as const, id })),
        { type: 'Attendees', id: 'LIST' },
      ],
    }),

    bulkExportAttendees: builder.mutation<ExportAttendeesResponse, { ids: string[]; format?: 'csv' | 'xlsx' }>({
      query: ({ ids, format = 'csv' }) => ({
        url: `${API_ENDPOINTS.ATTENDEES.LIST}/bulk-export`,
        method: 'POST',
        body: { ids, format },
      }),
    }),

    // Restaurer un attendee supprimé
    restoreAttendee: builder.mutation<AttendeeDPO, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.ATTENDEES.BY_ID(id)}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
    }),

    // Supprimer définitivement un attendee
    permanentDeleteAttendee: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ENDPOINTS.ATTENDEES.BY_ID(id)}/permanent-delete`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
    }),

    // Restaurer plusieurs attendees
    bulkRestoreAttendees: builder.mutation<{ restoredCount: number }, string[]>({
      query: (ids) => ({
        url: `${API_ENDPOINTS.ATTENDEES.LIST}/bulk-restore`,
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, ids) => [
        ...ids.map(id => ({ type: 'Attendee' as const, id })),
        { type: 'Attendees', id: 'LIST' },
      ],
    }),

    // Supprimer définitivement plusieurs attendees
    bulkPermanentDeleteAttendees: builder.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({
        url: `${API_ENDPOINTS.ATTENDEES.LIST}/bulk-permanent-delete`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, ids) => [
        ...ids.map(id => ({ type: 'Attendee' as const, id })),
        { type: 'Attendees', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetAttendeesQuery,
  useGetAttendeeByIdQuery,
  useGetAttendeeHistoryQuery,
  useCreateAttendeeMutation,
  useUpdateAttendeeMutation,
  useToggleAttendeeStatusMutation,
  useExportAttendeesMutation,
  useDeleteAttendeeMutation,
  useBulkDeleteAttendeesMutation,
  useBulkExportAttendeesMutation,
  useRestoreAttendeeMutation,
  usePermanentDeleteAttendeeMutation,
  useBulkRestoreAttendeesMutation,
  useBulkPermanentDeleteAttendeesMutation,
} = attendeesApi
