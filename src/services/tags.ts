import { rootApi } from './rootApi';

export interface Tag {
  id: string;
  name: string;
  color?: string;
  usage_count: number;
}

export interface SearchTagsParams {
  orgId: string;
  search?: string;
}

export interface UpdateEventTagsParams {
  eventId: string;
  tags: string[];
}

export const tagsApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query<Tag[], string | undefined>({
      query: (search) => {
        const params = search ? { search } : {};
        return {
          url: '/tags/search',
          params,
        };
      },
      providesTags: ['Tags'],
    }),
    
    getEventTags: builder.query<Tag[], string>({
      query: (eventId) => `/tags/events/${eventId}`,
      providesTags: (_result, _error, eventId) => [{ type: 'Tags', id: eventId }],
    }),
    
    updateEventTags: builder.mutation<Tag[], UpdateEventTagsParams>({
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
    
    getTagStatistics: builder.query<Tag[], void>({
      query: () => '/tags/statistics',
      providesTags: ['Tags'],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetEventTagsQuery,
  useUpdateEventTagsMutation,
  useGetTagStatisticsQuery,
} = tagsApi;
