import { rootApi } from '@/services/rootApi'

export interface AttendeeType {
  id: string
  org_id: string
  code: string
  name: string
  color_hex: string | null
  text_color_hex: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  usage_count?: number
  registration_count?: number
}

export interface CreateAttendeeTypeDto {
  code?: string
  name: string
  color_hex?: string
  text_color_hex?: string
  icon?: string
}

export interface UpdateAttendeeTypeDto {
  code?: string
  name?: string
  color_hex?: string
  text_color_hex?: string
  icon?: string
  is_active?: boolean
}

export const attendeeTypesApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendeeTypes: builder.query<AttendeeType[], string>({
      query: (orgId) => `/orgs/${orgId}/attendee-types`,
      providesTags: ['AttendeeTypes'],
    }),

    getAttendeeType: builder.query<AttendeeType, { orgId: string; id: string }>({
      query: ({ orgId, id }) => `/orgs/${orgId}/attendee-types/${id}`,
      providesTags: ['AttendeeTypes'],
    }),

    createAttendeeType: builder.mutation<AttendeeType, { orgId: string; data: CreateAttendeeTypeDto }>({
      query: ({ orgId, data }) => ({
        url: `/orgs/${orgId}/attendee-types`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AttendeeTypes'],
    }),

    updateAttendeeType: builder.mutation<AttendeeType, { orgId: string; id: string; data: UpdateAttendeeTypeDto }>({
      query: ({ orgId, id, data }) => ({
        url: `/orgs/${orgId}/attendee-types/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AttendeeTypes'],
    }),

    deleteAttendeeType: builder.mutation<void, { orgId: string; id: string }>({
      query: ({ orgId, id }) => ({
        url: `/orgs/${orgId}/attendee-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttendeeTypes'],
    }),

    checkAttendeeTypeName: builder.query<{ available: boolean; name: string }, { orgId: string; name: string; excludeId?: string }>({
      query: ({ orgId, name, excludeId }) => {
        const params = new URLSearchParams({ name })
        if (excludeId) params.append('excludeId', excludeId)
        return `/orgs/${orgId}/attendee-types/check-name?${params.toString()}`
      },
    }),
  }),
})

export const {
  useGetAttendeeTypesQuery,
  useGetAttendeeTypeQuery,
  useCreateAttendeeTypeMutation,
  useUpdateAttendeeTypeMutation,
  useDeleteAttendeeTypeMutation,
  useLazyCheckAttendeeTypeNameQuery,
} = attendeeTypesApi
