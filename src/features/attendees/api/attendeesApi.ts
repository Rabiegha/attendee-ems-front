import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { env } from '@/app/config/env'
import { API_ENDPOINTS } from '@/app/config/constants'
import type {
  AttendeeDTO,
  AttendeesListResponse,
  ExportAttendeesResponse,
} from '../dpo/attendee.dto'
import type { 
  AttendeeDPO, 
  CreateAttendeeDPO, 
  UpdateAttendeeDPO, 
  UpdateAttendeeStatusDPO 
} from '../dpo/attendee.dpo'
import { 
  mapAttendeeDTOtoDPO, 
  mapCreateAttendeeDPOtoDTO, 
  mapUpdateAttendeeDPOtoDTO,
  mapUpdateAttendeeStatusDPOtoDTO 
} from '../dpo/attendee.mappers'

export interface AttendeesListParams {
  eventId?: string
  page?: number
  limit?: number
  status?: string
  search?: string
  tags?: string[]
  sortBy?: 'firstName' | 'lastName' | 'email' | 'registrationDate' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export const attendeesApi = createApi({
  reducerPath: 'attendeesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).session.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Attendees', 'Attendee'],
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
      transformResponse: (response: AttendeesListResponse) => 
        response.attendees.map(mapAttendeeDTOtoDPO),
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

    updateAttendeeStatus: builder.mutation<AttendeeDPO, { id: string; data: UpdateAttendeeStatusDPO }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.ATTENDEES.UPDATE_STATUS(id),
        method: 'PATCH',
        body: mapUpdateAttendeeStatusDPOtoDTO(data),
      }),
      transformResponse: (response: AttendeeDTO) => mapAttendeeDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Attendee', id },
        { type: 'Attendees', id: 'LIST' },
      ],
      // Optimistic update for status changes
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          attendeesApi.util.updateQueryData('getAttendeeById', id, (draft) => {
            draft.status = data.status
            if (data.status === 'checked_in') {
              draft.checkedInAt = new Date().toISOString()
              if (data.checkedInBy) draft.checkedInBy = data.checkedInBy
              draft.isCheckedIn = true
              draft.canCheckIn = false
            }
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
  }),
})

export const {
  useGetAttendeesQuery,
  useGetAttendeeByIdQuery,
  useCreateAttendeeMutation,
  useUpdateAttendeeMutation,
  useUpdateAttendeeStatusMutation,
  useExportAttendeesMutation,
  useDeleteAttendeeMutation,
} = attendeesApi
