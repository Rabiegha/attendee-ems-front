import { rootApi } from '@/services/rootApi'
import type { EmailTemplate, EmailStatus, UpdateEmailTemplatePayload, SendTestEmailPayload, SendTestEmailResponse } from '../types/email.types'

export const emailApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<EmailTemplate[], void>({
      query: () => '/email/templates',
      providesTags: ['EmailTemplates'],
    }),

    getEmailTemplate: builder.query<EmailTemplate, string>({
      query: (id) => `/email/templates/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'EmailTemplates', id }],
    }),

    updateEmailTemplate: builder.mutation<EmailTemplate, { id: string; data: UpdateEmailTemplatePayload }>({
      query: ({ id, data }) => ({
        url: `/email/templates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'EmailTemplates', id },
        'EmailTemplates',
      ],
    }),

    getEmailStatus: builder.query<EmailStatus, void>({
      query: () => '/email/status',
    }),

    sendTestEmail: builder.mutation<SendTestEmailResponse, SendTestEmailPayload>({
      query: (data) => ({
        url: '/email/test',
        method: 'POST',
        body: data,
      }),
    }),

    getEmailTemplatePreview: builder.query<{ html: string; templateId: string }, string>({
      query: (id) => `/email/templates/${id}/preview`,
    }),
  }),
})

export const {
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useUpdateEmailTemplateMutation,
  useGetEmailStatusQuery,
  useSendTestEmailMutation,
  useGetEmailTemplatePreviewQuery,
  useLazyGetEmailTemplatePreviewQuery,
} = emailApi
