import { rootApi } from '@/services/rootApi';

export interface BadgeTemplate {
  id: string;
  org_id: string;
  event_id?: string;
  code: string;
  name: string;
  description?: string;
  html?: string;
  css?: string;
  width: number;
  height: number;
  template_data?: any;
  variables?: string[];
  is_active: boolean;
  is_default: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBadgeTemplateDto {
  event_id?: string;
  name: string;
  description?: string;
  html?: string;
  css?: string;
  width?: number;
  height?: number;
  template_data?: any;
  variables?: string[];
  is_default?: boolean;
}

export interface UpdateBadgeTemplateDto {
  name?: string;
  description?: string;
  html?: string;
  css?: string;
  width?: number;
  height?: number;
  template_data?: any;
  variables?: string[];
  is_active?: boolean;
  is_default?: boolean;
}

export interface PreviewBadgeTemplateDto {
  html: string;
  css?: string;
  data: Record<string, any>;
}

export interface BadgeTemplatesListParams {
  eventId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
}

export const badgeTemplatesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getBadgeTemplates: builder.query<BadgeTemplate[], BadgeTemplatesListParams | void>({
      query: (params) => {
        if (!params) {
          return '/badge-templates';
        }
        const searchParams = new URLSearchParams();
        if (params.eventId) searchParams.append('eventId', params.eventId);
        if (params.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
        if (params.isDefault !== undefined) searchParams.append('isDefault', String(params.isDefault));
        if (params.search) searchParams.append('search', params.search);
        return `/badge-templates?${searchParams.toString()}`;
      },
      transformResponse: (response: { data: BadgeTemplate[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'BadgeTemplate' as const, id })),
              { type: 'BadgeTemplates', id: 'LIST' },
            ]
          : [{ type: 'BadgeTemplates', id: 'LIST' }],
    }),

    getBadgeTemplateById: builder.query<BadgeTemplate, string>({
      query: (id) => `/badge-templates/${id}`,
      transformResponse: (response: { data: BadgeTemplate }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'BadgeTemplate', id }],
    }),

    createBadgeTemplate: builder.mutation<BadgeTemplate, CreateBadgeTemplateDto>({
      query: (data) => ({
        url: '/badge-templates',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { data: BadgeTemplate }) => response.data,
      invalidatesTags: [{ type: 'BadgeTemplates', id: 'LIST' }],
    }),

    updateBadgeTemplate: builder.mutation<
      BadgeTemplate,
      { id: string; data: UpdateBadgeTemplateDto }
    >({
      query: ({ id, data }) => ({
        url: `/badge-templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { data: BadgeTemplate }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'BadgeTemplate', id },
        { type: 'BadgeTemplates', id: 'LIST' },
      ],
    }),

    deleteBadgeTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/badge-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'BadgeTemplate', id },
        { type: 'BadgeTemplates', id: 'LIST' },
      ],
    }),

    previewBadgeTemplate: builder.mutation<{ html: string }, PreviewBadgeTemplateDto>({
      query: (data) => ({
        url: '/badge-templates/preview',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { data: { html: string } }) => response.data,
    }),
  }),
});

export const {
  useGetBadgeTemplatesQuery,
  useGetBadgeTemplateByIdQuery,
  useCreateBadgeTemplateMutation,
  useUpdateBadgeTemplateMutation,
  useDeleteBadgeTemplateMutation,
  usePreviewBadgeTemplateMutation,
} = badgeTemplatesApi;
