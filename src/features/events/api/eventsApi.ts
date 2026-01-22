import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import type { EventDTO } from '../dpo/event.dto'
import type { EventDPO, CreateEventDPO, UpdateEventDPO } from '../dpo/event.dpo'
import {
  mapEventDTOtoDPO,
  mapCreateEventDPOtoDTO,
  mapUpdateEventDPOtoDTO,
} from '../dpo/event.mappers'
import { AttendeeType } from '../../attendee-types/api/attendeeTypesApi'

export interface EventAttendeeType {
  id: string
  event_id: string
  org_id: string
  attendee_type_id: string
  capacity: number | null
  color_hex: string | null
  text_color_hex: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  attendeeType: AttendeeType
  _count?: {
    registrations: number
  }
}

export interface EventsListParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  startAfter?: string
  startBefore?: string
  sortBy?: 'name' | 'start_at' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface EventsListResponse {
  data: EventDTO[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const eventsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventDTO[], EventsListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v))
            } else {
              searchParams.append(key, String(value))
            }
          }
        })
        return `${API_ENDPOINTS.EVENTS.LIST}?${searchParams.toString()}`
      },
      transformResponse: (response: EventsListResponse) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
      // Garder les données en cache pendant 60 secondes seulement
      keepUnusedDataFor: 60,
    }),

    getEventById: builder.query<EventDPO, string>({
      query: (id) => API_ENDPOINTS.EVENTS.BY_ID(id),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
      // Refetch automatiquement si les données ont plus de 30 secondes
      // ou si la fenêtre reprend le focus
      keepUnusedDataFor: 30,
    }),

    checkEventNameAvailability: builder.query<
      { available: boolean; name: string },
      string
    >({
      query: (name) => `${API_ENDPOINTS.EVENTS.LIST}/check-name?name=${encodeURIComponent(name)}`,
    }),

    createEvent: builder.mutation<EventDPO, CreateEventDPO>({
      query: (eventData) => ({
        url: API_ENDPOINTS.EVENTS.CREATE,
        method: 'POST',
        body: mapCreateEventDPOtoDTO(eventData),
      }),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }),

    updateEvent: builder.mutation<
      EventDPO,
      { id: string; data: UpdateEventDPO }
    >({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.EVENTS.UPDATE(id),
        method: 'PUT',
        body: mapUpdateEventDPOtoDTO(data),
      }),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'Events', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          eventsApi.util.updateQueryData('getEventById', id, (draft) => {
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

    updateRegistrationFields: builder.mutation<
      EventDPO,
      {
        id: string
        fields: any[]
        submitButtonText?: string
        submitButtonColor?: string
        showTitle?: boolean
        showDescription?: boolean
        isDarkMode?: boolean
      }
    >({
      query: ({
        id,
        fields,
        submitButtonText,
        submitButtonColor,
        showTitle,
        showDescription,
        isDarkMode,
      }) => ({
        url: API_ENDPOINTS.EVENTS.UPDATE(id),
        method: 'PUT',
        body: {
          registration_fields: fields,
          ...(submitButtonText !== undefined && {
            submit_button_text: submitButtonText,
          }),
          ...(submitButtonColor !== undefined && {
            submit_button_color: submitButtonColor,
          }),
          ...(showTitle !== undefined && { show_title: showTitle }),
          ...(showDescription !== undefined && {
            show_description: showDescription,
          }),
          ...(isDarkMode !== undefined && { is_dark_mode: isDarkMode }),
        },
      }),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Event', id }],
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ENDPOINTS.EVENTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Event', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),

    bulkDeleteEvents: builder.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({
        url: `${API_ENDPOINTS.EVENTS.LIST}/bulk-delete`,
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, ids) => [
        ...ids.map((id) => ({ type: 'Event' as const, id })),
        { type: 'Events', id: 'LIST' },
      ],
    }),

    bulkExportEvents: builder.mutation<
      { downloadUrl: string; filename: string; expiresAt: string },
      { ids: string[]; format?: 'csv' | 'xlsx' }
    >({
      query: ({ ids, format = 'csv' }) => ({
        url: `${API_ENDPOINTS.EVENTS.LIST}/bulk-export`,
        method: 'POST',
        body: { ids, format },
      }),
    }),

    changeEventStatus: builder.mutation<
      EventDPO,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: API_ENDPOINTS.EVENTS.CHANGE_STATUS(id),
        method: 'PUT',
        body: { status },
      }),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Event', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),

    getEventAttendeeTypes: builder.query<EventAttendeeType[], string>({
      query: (eventId) => `/events/${eventId}/attendee-types`,
      providesTags: (_result, _error, eventId) => [{ type: 'AttendeeTypes', id: eventId }],
    }),

    addEventAttendeeType: builder.mutation<EventAttendeeType, { eventId: string; attendeeTypeId: string }>({
      query: ({ eventId, attendeeTypeId }) => ({
        url: `/events/${eventId}/attendee-types`,
        method: 'POST',
        body: { attendeeTypeId },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'AttendeeTypes', id: eventId }],
    }),

    removeEventAttendeeType: builder.mutation<void, { eventId: string; eventAttendeeTypeId: string }>({
      query: ({ eventId, eventAttendeeTypeId }) => ({
        url: `/events/${eventId}/attendee-types/${eventAttendeeTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'AttendeeTypes', id: eventId }],
    }),

    updateEventAttendeeType: builder.mutation<EventAttendeeType, { eventId: string; eventAttendeeTypeId: string; data: { color_hex?: string; text_color_hex?: string; capacity?: number } }>({
      query: ({ eventId, eventAttendeeTypeId, data }) => ({
        url: `/events/${eventId}/attendee-types/${eventAttendeeTypeId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'AttendeeTypes', id: eventId }],
    }),

    getEventAssignedUsers: builder.query<EventAssignedUser[], string>({
      query: (eventId) => `/events/${eventId}/assigned-users`,
      providesTags: (_result, _error, eventId) => [{ type: 'Event', id: `${eventId}-assigned-users` }],
    }),

    assignUsersToEvent: builder.mutation<
      { message: string; assignments: EventAssignedUser[] },
      { eventId: string; user_ids: string[]; reason?: string }
    >({
      query: ({ eventId, user_ids, reason }) => ({
        url: `/events/${eventId}/assign-users`,
        method: 'POST',
        body: { user_ids, reason },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Event', id: `${eventId}-assigned-users` },
        { type: 'Event', id: eventId },
      ],
    }),

    unassignUserFromEvent: builder.mutation<
      { message: string },
      { eventId: string; userId: string }
    >({
      query: ({ eventId, userId }) => ({
        url: `/events/${eventId}/assigned-users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Event', id: `${eventId}-assigned-users` },
        { type: 'Event', id: eventId },
      ],
    }),

    // Session endpoints
    getEventSessions: builder.query<Session[], string>({
      query: (eventId) => `/events/${eventId}/sessions`,
      providesTags: (_result, _error, eventId) => [{ type: 'Sessions', id: eventId }],
    }),

    getEventSessionHistory: builder.query<SessionScan[], { eventId: string; sessionId: string }>({
      query: ({ eventId, sessionId }) => `/events/${eventId}/sessions/${sessionId}/history`,
      providesTags: (_result, _error, { sessionId }) => [{ type: 'SessionHistory', id: sessionId }],
    }),

    createEventSession: builder.mutation<Session, { eventId: string; data: CreateSessionDto }>({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}/sessions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Sessions', id: eventId }],
    }),

    updateEventSession: builder.mutation<Session, { eventId: string; sessionId: string; data: UpdateSessionDto }>({
      query: ({ eventId, sessionId, data }) => ({
        url: `/events/${eventId}/sessions/${sessionId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Sessions', id: eventId }],
    }),

    deleteEventSession: builder.mutation<void, { eventId: string; sessionId: string }>({
      query: ({ eventId, sessionId }) => ({
        url: `/events/${eventId}/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Sessions', id: eventId }],
    }),

    scanSessionParticipant: builder.mutation<void, { eventId: string; sessionId: string; data: ScanSessionDto }>({
      query: ({ eventId, sessionId, data }) => ({
        url: `/events/${eventId}/sessions/${sessionId}/scan`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { eventId, sessionId }) => [
        { type: 'Sessions', id: eventId },
        { type: 'SessionHistory', id: sessionId }
      ],
    }),
  }),
  overrideExisting: false,
})

export interface EventAssignedUser {
  id: string
  org_id: string
  event_id: string
  user_id: string
  reason?: string
  granted_by?: string
  expires_at?: string
  created_at: string
  updated_at: string
  event?: {
    id: string
    name: string
  }
}

// Session types
export interface Session {
  id: string
  org_id: string
  event_id: string
  name: string
  description?: string | null
  location?: string | null
  capacity?: number | null
  start_at: string
  end_at: string
  allowedAttendeeTypes: string[]
  created_at: string
  updated_at: string
  _count?: {
    scans: number
  }
}

export interface SessionScan {
  id: string
  session_id: string
  registration_id: string
  scan_type: 'IN' | 'OUT'
  scanned_at: string
  registration: {
    id: string
    attendee: {
      first_name: string
      last_name: string
      company?: string | null
    }
  }
}

export interface CreateSessionDto {
  name: string
  description?: string
  location?: string
  capacity?: number
  start_at: string
  end_at: string
  allowedAttendeeTypes?: string[]
}

export interface UpdateSessionDto {
  name?: string
  description?: string
  location?: string
  capacity?: number
  start_at?: string
  end_at?: string
  allowedAttendeeTypes?: string[]
}

export interface ScanSessionDto {
  registrationId: string
  scanType: 'IN' | 'OUT'
}

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCheckEventNameAvailabilityQuery,
  useLazyCheckEventNameAvailabilityQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpdateRegistrationFieldsMutation,
  useDeleteEventMutation,
  useChangeEventStatusMutation,
  useBulkDeleteEventsMutation,
  useBulkExportEventsMutation,
  useGetEventAttendeeTypesQuery,
  useAddEventAttendeeTypeMutation,
  useRemoveEventAttendeeTypeMutation,
  useUpdateEventAttendeeTypeMutation,
  useGetEventAssignedUsersQuery,
  useAssignUsersToEventMutation,
  useUnassignUserFromEventMutation,
  useGetEventSessionsQuery,
  useGetEventSessionHistoryQuery,
  useCreateEventSessionMutation,
  useUpdateEventSessionMutation,
  useDeleteEventSessionMutation,
  useScanSessionParticipantMutation,
} = eventsApi
