import { rootApi } from '@/services/rootApi'

export interface PartnerScanDTO {
  id: string
  org_id: string
  event_id: string
  scanned_by: string
  registration_id: string | null
  attendee_data: {
    first_name?: string
    last_name?: string
    email?: string
    company?: string
    job_title?: string
    phone?: string
    country?: string
    registration_status?: string
    registration_id?: string
  }
  comment: string | null
  scanned_at: string
  updated_at: string
  deleted_at: string | null
  scanner?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  registration?: {
    id: string
    status: string
  } | null
  event?: {
    id: string
    name: string
  }
}

export interface PartnerScansListResponse {
  data: PartnerScanDTO[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PartnerScansQueryParams {
  event_id: string
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

export interface PartnerScansAllQueryParams {
  page?: number
  limit?: number
  search?: string | undefined
  is_active?: boolean
  user_id?: string
}

export const partnerScansApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /partner-scans?event_id=xxx — Scans pour un event
    getPartnerScans: builder.query<PartnerScansListResponse, PartnerScansQueryParams>({
      query: ({ event_id, ...params }) => ({
        url: '/partner-scans',
        params: { event_id, ...params },
      }),
      providesTags: (result, _error, { event_id }) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'PartnerScan' as const, id })),
              { type: 'PartnerScan', id: `EVENT-${event_id}` },
              { type: 'PartnerScan', id: 'LIST' },
            ]
          : [
              { type: 'PartnerScan', id: `EVENT-${event_id}` },
              { type: 'PartnerScan', id: 'LIST' },
            ],
    }),

    // GET /partner-scans/all — Tous les scans cross-events
    getAllPartnerScans: builder.query<PartnerScansListResponse, PartnerScansAllQueryParams>({
      query: (params) => ({
        url: '/partner-scans/all',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'PartnerScan' as const, id })),
              { type: 'PartnerScan', id: 'ALL' },
              { type: 'PartnerScan', id: 'LIST' },
            ]
          : [
              { type: 'PartnerScan', id: 'ALL' },
              { type: 'PartnerScan', id: 'LIST' },
            ],
    }),

    // GET /partner-scans/:id — Détail d'un scan
    getPartnerScan: builder.query<PartnerScanDTO, string>({
      query: (id) => `/partner-scans/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PartnerScan', id }],
    }),

    // PATCH /partner-scans/:id — Modifier le commentaire
    updatePartnerScan: builder.mutation<PartnerScanDTO, { id: string; comment: string }>({
      query: ({ id, comment }) => ({
        url: `/partner-scans/${id}`,
        method: 'PATCH',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PartnerScan', id },
        { type: 'PartnerScan', id: 'LIST' },
      ],
    }),

    // DELETE /partner-scans/:id — Soft delete
    deletePartnerScan: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/partner-scans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PartnerScan', id },
        { type: 'PartnerScan', id: 'LIST' },
      ],
    }),

    // PATCH /partner-scans/:id/restore — Restaurer un scan
    restorePartnerScan: builder.mutation<PartnerScanDTO, string>({
      query: (id) => ({
        url: `/partner-scans/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PartnerScan', id },
        { type: 'PartnerScan', id: 'LIST' },
      ],
    }),

    // DELETE /partner-scans/:id/permanent — Suppression définitive
    permanentDeletePartnerScan: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/partner-scans/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PartnerScan', id },
        { type: 'PartnerScan', id: 'LIST' },
      ],
    }),

    // DELETE /partner-scans/bulk-delete — Suppression en masse (soft)
    bulkDeletePartnerScans: builder.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({
        url: '/partner-scans/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'PartnerScan', id: 'LIST' }],
    }),

    // PATCH /partner-scans/bulk-restore — Restauration en masse
    bulkRestorePartnerScans: builder.mutation<{ restoredCount: number }, string[]>({
      query: (ids) => ({
        url: '/partner-scans/bulk-restore',
        method: 'PATCH',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'PartnerScan', id: 'LIST' }],
    }),

    // DELETE /partner-scans/bulk-permanent-delete — Suppression définitive en masse
    bulkPermanentDeletePartnerScans: builder.mutation<{ deletedCount: number }, string[]>({
      query: (ids) => ({
        url: '/partner-scans/bulk-permanent-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'PartnerScan', id: 'LIST' }],
    }),

    // GET /partner-scans/export-excel — Export Excel
    exportPartnerScansExcel: builder.query<Blob, { event_id?: string; is_active?: boolean }>({
      query: (params) => ({
        url: '/partner-scans/export-excel',
        params,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPartnerScansQuery,
  useGetAllPartnerScansQuery,
  useGetPartnerScanQuery,
  useUpdatePartnerScanMutation,
  useDeletePartnerScanMutation,
  useRestorePartnerScanMutation,
  usePermanentDeletePartnerScanMutation,
  useBulkDeletePartnerScansMutation,
  useBulkRestorePartnerScansMutation,
  useBulkPermanentDeletePartnerScansMutation,
  useLazyExportPartnerScansExcelQuery,
} = partnerScansApi
