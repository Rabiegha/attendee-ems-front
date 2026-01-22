import { rootApi } from '@/services/rootApi'

export interface EventBadgeRule {
  id: string
  eventId: string
  badgeTemplateId: string
  name: string
  priority: number
  attendeeTypeIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateEventBadgeRuleDto {
  name: string
  badgeTemplateId: string
  attendeeTypeIds: string[]
  priority?: number
}

export interface UpdateEventBadgeRuleDto {
  name?: string
  badgeTemplateId?: string
  attendeeTypeIds?: string[]
  priority?: number
}

export const eventBadgeRulesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventBadgeRules: builder.query<EventBadgeRule[], string>({
      query: (eventId) => `/events/${eventId}/badge-rules`,
      providesTags: (result, error, eventId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'EventBadgeRules' as const, id })),
              { type: 'EventBadgeRules', id: `EVENT_${eventId}` },
            ]
          : [{ type: 'EventBadgeRules', id: `EVENT_${eventId}` }],
    }),

    createEventBadgeRule: builder.mutation<EventBadgeRule, { eventId: string; data: CreateEventBadgeRuleDto }>({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}/badge-rules`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId }) => [
        { type: 'EventBadgeRules', id: `EVENT_${eventId}` },
      ],
    }),

    updateEventBadgeRule: builder.mutation<EventBadgeRule, { eventId: string; ruleId: string; data: UpdateEventBadgeRuleDto }>({
      query: ({ eventId, ruleId, data }) => ({
        url: `/events/${eventId}/badge-rules/${ruleId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { eventId, ruleId }) => [
        { type: 'EventBadgeRules', id: ruleId },
        { type: 'EventBadgeRules', id: `EVENT_${eventId}` },
      ],
    }),

    deleteEventBadgeRule: builder.mutation<{ message: string }, { eventId: string; ruleId: string }>({
      query: ({ eventId, ruleId }) => ({
        url: `/events/${eventId}/badge-rules/${ruleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { eventId, ruleId }) => [
        { type: 'EventBadgeRules', id: ruleId },
        { type: 'EventBadgeRules', id: `EVENT_${eventId}` },
      ],
    }),
  }),
})

export const {
  useGetEventBadgeRulesQuery,
  useCreateEventBadgeRuleMutation,
  useUpdateEventBadgeRuleMutation,
  useDeleteEventBadgeRuleMutation,
} = eventBadgeRulesApi
