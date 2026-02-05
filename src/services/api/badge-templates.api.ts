import { rootApi } from '../rootApi';
import type {
  BadgeTemplate,
  BadgeTemplateListResponse,
  CreateBadgeTemplateDto,
  UpdateBadgeTemplateDto,
  DuplicateBadgeTemplateDto,
  BadgeTemplatePreview,
} from '../../shared/types/badge.types';

export interface BadgeTemplatesQuery {
  search?: string;
  page?: number;
  limit?: number;
  eventId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const badgeTemplatesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getBadgeTemplates: builder.query<BadgeTemplateListResponse, BadgeTemplatesQuery>({
      query: (params = {}) => ({
        url: '/badges/templates',
        params: {
          search: params.search,
          page: params.page || 1,
          limit: params.limit || 10,
          eventId: params.eventId,
          isActive: params.isActive,
          isDefault: params.isDefault,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }),
      transformResponse: (response: any) => {
        // Normaliser la réponse : pagination -> meta (pour compatibilité)
        if (response.pagination && !response.meta) {
          return {
            data: response.data,
            meta: response.pagination
          };
        }
        return response;
      },
      providesTags: ['Badges'],
    }),

    getBadgeTemplate: builder.query<BadgeTemplate, string>({
      query: (id) => `/badges/templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Badge', id }],
    }),

    createBadgeTemplate: builder.mutation<BadgeTemplate, CreateBadgeTemplateDto>({
      query: (data) => ({
        url: '/badges/templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Badges'],
    }),

    updateBadgeTemplate: builder.mutation<BadgeTemplate, { id: string; data: UpdateBadgeTemplateDto }>({
      query: ({ id, data }) => ({
        url: `/badges/templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        'Badges',
        { type: 'Badge', id },
      ],
    }),

    deleteBadgeTemplate: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/badges/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        'Badges',
        { type: 'Badge', id },
      ],
    }),

    duplicateBadgeTemplate: builder.mutation<BadgeTemplate, { id: string; data: DuplicateBadgeTemplateDto }>({
      query: ({ id, data }) => ({
        url: `/badges/templates/${id}/duplicate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Badges'],
    }),

    previewBadgeTemplate: builder.query<BadgeTemplatePreview, { id: string; attendeeId?: string }>({
      query: ({ id, attendeeId }) => {
        const params: Record<string, any> = {};
        if (attendeeId) {
          params.attendeeId = attendeeId;
        }
        return {
          url: `/badges/templates/${id}/preview`,
          params,
        };
      },
    }),
  }),
});

export const {
  useGetBadgeTemplatesQuery,
  useGetBadgeTemplateQuery,
  useCreateBadgeTemplateMutation,
  useUpdateBadgeTemplateMutation,
  useDeleteBadgeTemplateMutation,
  useDuplicateBadgeTemplateMutation,
  usePreviewBadgeTemplateQuery,
  useLazyPreviewBadgeTemplateQuery,
} = badgeTemplatesApi;