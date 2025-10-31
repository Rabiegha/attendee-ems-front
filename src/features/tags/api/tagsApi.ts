import { rootApi } from '@/services/rootApi'

export interface Tag {
  id: string
  name: string
  color?: string | null
  usage_count: number
  org_id: string
  created_at: string
  updated_at: string
}

export interface TagStatistics {
  tag_name: string
  usage_count: number
  event_count: number
}

export const tagsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /tags/search?search=...
    getTags: builder.query<Tag[], string | undefined>({
      query: (search) => {
        const params = search ? { search } : {}
        return {
          url: '/tags/search',
          params,
        }
      },
      providesTags: ['Tags'],
    }),

    // GET /tags/statistics
    getTagStatistics: builder.query<TagStatistics[], void>({
      query: () => '/tags/statistics',
      providesTags: ['Tags'],
    }),

    // POST /tags
    createTag: builder.mutation<Tag, { name: string; color?: string }>({
      query: (body) => ({
        url: '/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tags'],
    }),

    // GET /tags/events/:eventId
    getEventTags: builder.query<Tag[], string>({
      query: (eventId) => `/tags/events/${eventId}`,
      providesTags: (_result, _error, eventId) => [
        { type: 'Tags', id: eventId },
      ],
    }),

    // PUT /tags/events/:eventId
    updateEventTags: builder.mutation<
      Tag[],
      { eventId: string; tags: string[] }
    >({
      query: ({ eventId, tags }) => ({
        url: `/tags/events/${eventId}`,
        method: 'PUT',
        body: { tags },
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Tags', id: eventId },
        'Tags',
        'Events',
      ],
    }),
  }),
})

export const {
  useGetTagsQuery,
  useGetTagStatisticsQuery,
  useCreateTagMutation,
  useGetEventTagsQuery,
  useUpdateEventTagsMutation,
} = tagsApi
