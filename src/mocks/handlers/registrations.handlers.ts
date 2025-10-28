/**
 * MSW Handlers - Registrations API
 *
 * - GET /api/events/:eventId/registrations (liste des inscriptions)
 * - PUT /api/registrations/:id/status (changer statut)
 * - POST /api/events/:eventId/registrations/bulk-import (import Excel)
 */

import { http, HttpResponse } from 'msw'
import { mockRegistrations } from './public.handlers'
import { mockEvents } from '../data/events.mock'
import { mockAttendees } from '../data/attendees.mock'

const API_BASE = 'http://localhost:3000'

// Helper pour filtrer registrations
const filterRegistrations = (
  registrations: any[],
  filters: {
    status?: string
    search?: string
    attendeeTypeId?: string
    attendanceType?: string
    sortBy?: string
    sortOrder?: string
  }
) => {
  let filtered = [...registrations]

  if (filters.status) {
    filtered = filtered.filter((r) => r.status === filters.status)
  }

  if (filters.search && filters.search.length > 0) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter((r) => {
      const attendee = mockAttendees.find((a) => a.id === r.attendee_id)
      if (!attendee) return false

      return (
        attendee.first_name?.toLowerCase().includes(searchLower) ||
        attendee.last_name?.toLowerCase().includes(searchLower) ||
        attendee.email?.toLowerCase().includes(searchLower)
      )
    })
  }

  if (filters.attendeeTypeId) {
    filtered = filtered.filter(
      (r) => r.event_attendee_type_id === filters.attendeeTypeId
    )
  }

  if (filters.attendanceType) {
    filtered = filtered.filter(
      (r) => r.attendance_type === filters.attendanceType
    )
  }

  // Tri
  const sortBy = filters.sortBy || 'created_at'
  const sortOrder = filters.sortOrder || 'desc'

  filtered.sort((a, b) => {
    let aVal: any = (a as any)[sortBy]
    let bVal: any = (b as any)[sortBy]

    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })

  return filtered
}

// Helper pagination
const paginate = <T>(items: T[], page: number, limit: number) => {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    limit,
    total_pages: Math.ceil(items.length / limit),
  }
}

export const registrationsHandlers = [
  // GET /api/events/:eventId/registrations
  http.get(
    `${API_BASE}/events/:eventId/registrations`,
    ({ params, request }) => {
      const { eventId } = params as { eventId: string }
      const url = new URL(request.url)

      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const status = url.searchParams.get('status') || undefined
      const search = url.searchParams.get('search') || undefined
      const attendeeTypeId = url.searchParams.get('attendeeTypeId') || undefined
      const attendanceType = url.searchParams.get('attendanceType') || undefined
      const sortBy = url.searchParams.get('sortBy') || 'created_at'
      const sortOrder = url.searchParams.get('sortOrder') || 'desc'

      // TODO: Récupérer user role depuis JWT
      const userRole = 'ADMIN' // Mock

      // Récupérer registrations pour cet événement
      let registrations = mockRegistrations.filter(
        (r) => r.event_id === eventId
      )

      // Appliquer filtres
      registrations = filterRegistrations(registrations, {
        status,
        search,
        attendeeTypeId,
        attendanceType,
        sortBy,
        sortOrder,
      })

      // Peupler avec les données attendees
      const registrationsWithAttendees = registrations.map((reg) => {
        const attendee = mockAttendees.find((a) => a.id === reg.attendee_id)

        // Masquage pour HOSTESS (seulement first_name et last_name)
        if (userRole === 'HOSTESS') {
          return {
            ...reg,
            attendee: {
              id: attendee?.id,
              first_name: attendee?.first_name,
              last_name: attendee?.last_name,
              // email, phone, company MASQUÉS
            },
            confirmation_number:
              `CONF-${eventId.substring(0, 8)}-${reg.id.substring(0, 8)}`.toUpperCase(),
            checked_in: false, // Mock
          }
        }

        // Pour tous les autres rôles, données complètes
        return {
          ...reg,
          attendee: {
            id: attendee?.id,
            first_name: attendee?.first_name,
            last_name: attendee?.last_name,
            email: attendee?.email,
            phone: attendee?.phone,
            company: attendee?.company,
            job_title: attendee?.job_title,
          },
          confirmation_number:
            `CONF-${eventId.substring(0, 8)}-${reg.id.substring(0, 8)}`.toUpperCase(),
          checked_in: false, // Mock
        }
      })

      // Paginer
      const paginated = paginate(registrationsWithAttendees, page, limit)

      // Calculer summary
      const summary = {
        total: mockRegistrations.filter((r) => r.event_id === eventId).length,
        approved: mockRegistrations.filter(
          (r) => r.event_id === eventId && r.status === 'approved'
        ).length,
        awaiting: mockRegistrations.filter(
          (r) => r.event_id === eventId && r.status === 'awaiting'
        ).length,
        refused: mockRegistrations.filter(
          (r) => r.event_id === eventId && r.status === 'refused'
        ).length,
        cancelled: mockRegistrations.filter(
          (r) => r.event_id === eventId && r.status === 'cancelled'
        ).length,
        checked_in: 0, // Mock
      }

      return HttpResponse.json({
        registrations: paginated.items,
        pagination: {
          total: paginated.total,
          page: paginated.page,
          limit: paginated.limit,
          total_pages: paginated.total_pages,
        },
        summary,
      })
    }
  ),

  // PUT /api/registrations/:id/status
  http.put(
    `${API_BASE}/registrations/:id/status`,
    async ({ params, request }) => {
      const { id } = params as { id: string }
      const body = (await request.json()) as { status: string; reason?: string }

      const registration = mockRegistrations.find((r) => r.id === id)

      if (!registration) {
        return HttpResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        )
      }

      // TODO: Vérifier permissions (SUPER_ADMIN, ADMIN, MANAGER, PARTNER)

      const oldStatus = registration.status
      registration.status = body.status
      registration.updated_at = new Date().toISOString()

      // Si passage à approved, mettre confirmed_at
      if (body.status === 'approved' && oldStatus !== 'approved') {
        registration.confirmed_at = new Date().toISOString()
      }

      // Mettre à jour statistiques attendee
      const attendee = mockAttendees.find(
        (a) => a.id === registration.attendee_id
      )
      if (attendee) {
        // Décrémenter ancien statut
        if (oldStatus === 'awaiting') attendee.statistics.awaiting--
        if (oldStatus === 'approved') attendee.statistics.approved--
        if (oldStatus === 'refused') attendee.statistics.refused--

        // Incrémenter nouveau statut
        if (body.status === 'awaiting') attendee.statistics.awaiting++
        if (body.status === 'approved') {
          attendee.statistics.approved++
          attendee.statistics.total_events++
        }
        if (body.status === 'refused') attendee.statistics.refused++
      }

      return HttpResponse.json({
        id: registration.id,
        status: registration.status,
        confirmed_at: registration.confirmed_at,
        updated_at: registration.updated_at,
      })
    }
  ),

  // POST /api/events/:eventId/registrations/bulk-import
  http.post(
    `${API_BASE}/events/:eventId/registrations/bulk-import`,
    async ({ params, request }) => {
      const { eventId } = params as { eventId: string }

      // Mock: simuler parsing Excel (en prod, utiliser XLSX.js)
      const formData = await request.formData()
      const file = formData.get('file')
      const autoApprove = formData.get('autoApprove') === 'true'

      if (!file) {
        return HttpResponse.json({ error: 'File required' }, { status: 400 })
      }

      const event = mockEvents.find((e) => e.id === eventId)

      if (!event) {
        return HttpResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      // Mock de données Excel (dans la vraie vie, parser le fichier)
      const mockExcelRows = [
        {
          email: 'import1@test.com',
          first_name: 'Import',
          last_name: 'User1',
          phone: '+33 6 11 11 11 11',
          company: 'Import Company',
          job_title: 'Developer',
          attendance_type: 'onsite',
          dietary_restrictions: 'Végétarien',
        },
        {
          email: 'import2@test.com',
          first_name: 'Import',
          last_name: 'User2',
          attendance_type: 'online',
        },
        {
          email: 'corentin.kistler@techcorp.com', // Déjà existant
          first_name: 'Corentin',
          last_name: 'Kistler',
        },
      ]

      const results = {
        total_rows: mockExcelRows.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as any[],
      }

      for (let i = 0; i < mockExcelRows.length; i++) {
        const row = mockExcelRows[i]

        try {
          if (!row.email) {
            results.errors.push({ row: i + 1, error: 'Email required' })
            results.skipped++
            continue
          }

          // Chercher ou créer attendee
          let attendee = mockAttendees.find(
            (a) => a.org_id === event!.org_id && a.email === row.email
          )

          if (!attendee) {
            // Créer nouveau
            const newAttendee: any = {
              id: `att-import-${Date.now()}-${i}`,
              org_id: event.org_id,
              first_name: row.first_name || null,
              last_name: row.last_name || null,
              email: row.email,
              phone: row.phone || null,
              company: row.company || null,
              job_title: row.job_title || null,
              country: null,
              default_type_id: null,
              labels: null,
              notes: null,
              statistics: {
                total_events: 0,
                total_registrations: 0,
                approved: 0,
                awaiting: 0,
                refused: 0,
                checked_in: 0,
                attendance_rate: 0,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }

            mockAttendees.push(newAttendee)
            attendee = newAttendee
            results.created++
          } else {
            // Mettre à jour
            attendee.first_name = row.first_name || attendee.first_name
            attendee.last_name = row.last_name || attendee.last_name
            attendee.phone = row.phone || attendee.phone
            attendee.company = row.company || attendee.company
            attendee.job_title = row.job_title || attendee.job_title
            attendee.updated_at = new Date().toISOString()
            results.updated++
          }

          // Vérifier si déjà inscrit
          const existingReg = mockRegistrations.find(
            (r) => r.event_id === eventId && r.attendee_id === attendee!.id
          )

          if (existingReg) {
            results.skipped++
            continue
          }

          // Créer registration
          const customAnswers: any = {}
          Object.keys(row).forEach((key) => {
            if (
              ![
                'email',
                'first_name',
                'last_name',
                'phone',
                'company',
                'job_title',
                'country',
                'attendance_type',
              ].includes(key)
            ) {
              customAnswers[key] = (row as any)[key]
            }
          })

          const shouldAutoApprove =
            autoApprove !== undefined
              ? autoApprove
              : event.settings?.registration_auto_approve || false

          mockRegistrations.push({
            id: `reg-import-${Date.now()}-${i}`,
            org_id: event.org_id,
            event_id: eventId,
            attendee_id: attendee.id,
            status: shouldAutoApprove ? 'approved' : 'awaiting',
            attendance_type: row.attendance_type || 'onsite',
            answers: customAnswers,
            invited_at: new Date().toISOString(),
            confirmed_at: shouldAutoApprove ? new Date().toISOString() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          // Mettre à jour stats attendee
          attendee.statistics.total_registrations++
          if (shouldAutoApprove) {
            attendee.statistics.approved++
            attendee.statistics.total_events++
          } else {
            attendee.statistics.awaiting++
          }
        } catch (error: any) {
          results.errors.push({
            row: i + 1,
            email: row.email,
            error: error.message,
          })
          results.skipped++
        }
      }

      return HttpResponse.json({
        success: true,
        summary: results,
      })
    }
  ),
]
