import { rootApi } from '@/services/rootApi'
import { API_ENDPOINTS } from '@/app/config/constants'
import type { EventDTO } from '../dpo/event.dto'
import type { EventDPO, CreateEventDPO, UpdateEventDPO } from '../dpo/event.dpo'
import { mapEventDTOtoDPO, mapCreateEventDPOtoDTO, mapUpdateEventDPOtoDTO } from '../dpo/event.mappers'

export interface EventsListParams {
  page?: number
  limit?: number
  status?: string
  search?: string
  tags?: string[]
  sortBy?: 'name' | 'startDate' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface EventsListResponse {
  events: EventDTO[]
  total: number
  page: number
  limit: number
}

export const eventsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<EventDPO[], EventsListParams>({
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
        return `${API_ENDPOINTS.EVENTS.LIST}?${searchParams.toString()}`
      },
      transformResponse: (response: EventsListResponse) => 
        response.events.map(mapEventDTOtoDPO),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Event' as const, id })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),

    getEventById: builder.query<EventDPO, string>({
      query: (id) => API_ENDPOINTS.EVENTS.BY_ID(id),
      transformResponse: (response: EventDTO) => mapEventDTOtoDPO(response),
      providesTags: (_result, _error, id) => [{ type: 'Event', id }],
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

    updateEvent: builder.mutation<EventDPO, { id: string; data: UpdateEventDPO }>({
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

    changeEventStatus: builder.mutation<EventDPO, { id: string; status: string }>({
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
  }),
  overrideExisting: false,
})

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useChangeEventStatusMutation,
} = eventsApi
