import { rootApi } from '@/services/rootApi'

export interface PrintJob {
  id: string
  registration_id: string
  event_id: string
  user_id: string
  badge_url: string
  printer_name: string | null
  status: 'PENDING' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'OFFLINE'
  error: string | null
  duration_ms: number | null
  created_at: string
  updated_at: string
  registration?: {
    id: string
    snapshot_first_name: string | null
    snapshot_last_name: string | null
    attendee_first_name?: string | null
    attendee_last_name?: string | null
  }
}

export interface EmsClientStatus {
  connected: boolean
  clientCount: number
}

export interface ExposedPrinter {
  name: string
  displayName: string
  status: number
  isDefault: boolean
  deviceId?: string
  description?: string
  location?: string
  uri?: string
}

export const printQueueApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    // Récupérer l'historique des jobs pour un event
    getPrintJobs: builder.query<PrintJob[], { eventId: string; limit?: number }>({
      query: ({ eventId, limit = 100 }) => ({
        url: `/print-queue/history?eventId=${eventId}&limit=${limit}`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PrintJobs' as const, id })),
              { type: 'PrintJobs', id: 'LIST' },
            ]
          : [{ type: 'PrintJobs', id: 'LIST' }],
    }),

    // Statut du client EMS
    getEmsClientStatus: builder.query<EmsClientStatus, void>({
      query: () => '/print-queue/client-status',
    }),

    // Imprimantes exposées
    getExposedPrinters: builder.query<ExposedPrinter[], void>({
      query: () => '/print-queue/printers',
    }),

    // Ajouter un job à la queue
    addPrintJob: builder.mutation<PrintJob, {
      registrationId: string
      eventId: string
      userId: string
      badgeUrl: string
      printerName?: string
      status?: 'PENDING' | 'OFFLINE'
    }>({
      query: (body) => ({
        url: '/print-queue/add',
        method: 'POST',
        body: {
          registrationId: body.registrationId,
          eventId: body.eventId,
          userId: body.userId,
          badgeUrl: body.badgeUrl,
          ...(body.printerName ? { printerName: body.printerName } : {}),
          ...(body.status ? { status: body.status } : {}),
        },
      }),
      invalidatesTags: [{ type: 'PrintJobs', id: 'LIST' }],
    }),

    // Batch print: ajouter plusieurs jobs en une fois
    addBatchPrintJobs: builder.mutation<PrintJob[], {
      registrations: Array<{
        registrationId: string
        eventId: string
        userId: string
        badgeUrl: string
      }>
      printerName?: string
    }>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        const results: PrintJob[] = []
        for (const reg of arg.registrations) {
          const result = await fetchWithBQ({
            url: '/print-queue/add',
            method: 'POST',
            body: {
              registrationId: reg.registrationId,
              eventId: reg.eventId,
              userId: reg.userId,
              badgeUrl: reg.badgeUrl,
              ...(arg.printerName ? { printerName: arg.printerName } : {}),
            },
          })
          if (result.data) {
            results.push(result.data as PrintJob)
          }
        }
        return { data: results }
      },
      invalidatesTags: [{ type: 'PrintJobs', id: 'LIST' }],
    }),

    // Retry les jobs offline
    retryOfflineJobs: builder.mutation<{ count: number }, void>({
      query: () => ({
        url: '/print-queue/offline/retry-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'PrintJobs', id: 'LIST' }],
    }),

    // Dismiss les jobs offline
    dismissOfflineJobs: builder.mutation<{ count: number }, void>({
      query: () => ({
        url: '/print-queue/offline/dismiss-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'PrintJobs', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetPrintJobsQuery,
  useGetEmsClientStatusQuery,
  useGetExposedPrintersQuery,
  useAddPrintJobMutation,
  useAddBatchPrintJobsMutation,
  useRetryOfflineJobsMutation,
  useDismissOfflineJobsMutation,
} = printQueueApi
