/**
 * MSW Handlers - Public API (Sans authentification)
 *
 * Endpoints pour formulaires d'inscription embeddables
 * - GET /api/public/events/:publicToken
 * - POST /api/public/events/:publicToken/register
 */

import { http, HttpResponse } from 'msw'
import { mockEvents, getEventByPublicToken } from '../data/events.mock'
import { mockAttendees, getAttendeeByEmail } from '../data/attendees.mock'
import type {
  Event,
  Registration,
  PublicRegisterDTO,
} from '@/features/events/types'
import type { Attendee } from '@/features/attendees/types'

const API_BASE = 'http://localhost:3000'

// Simule une base de données pour les registrations
let mockRegistrations: any[] = []

// Helper pour générer un ID unique
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Helper pour générer un confirmation number
const generateConfirmationNumber = (eventCode: string, regId: string) => {
  return `CONF-${eventCode}-${regId.substring(0, 8).toUpperCase()}`
}

export const publicHandlers = [
  // GET /api/public/events/:publicToken
  http.get(`${API_BASE}/public/events/:publicToken`, ({ params }) => {
    const { publicToken } = params as { publicToken: string }

    const event = getEventByPublicToken(publicToken)

    if (!event) {
      return HttpResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Événement annulé ou terminé
    if (event.status === 'cancelled') {
      return HttpResponse.json(
        { error: 'Event cancelled', code: 'EVENT_CANCELLED' },
        { status: 410 }
      )
    }

    if (event.status === 'completed') {
      return HttpResponse.json(
        { error: 'Event completed', code: 'EVENT_COMPLETED' },
        { status: 410 }
      )
    }

    // Compter les registrations pour cet événement
    const registrationsForEvent = mockRegistrations.filter(
      (r) =>
        r.event_id === event.id && ['approved', 'awaiting'].includes(r.status)
    )
    const registeredCount = registrationsForEvent.length
    const remainingSpots = event.capacity
      ? event.capacity - registeredCount
      : null

    return HttpResponse.json({
      id: event.id,
      name: event.name,
      description: event.description,
      start_at: event.start_at,
      end_at: event.end_at,
      timezone: event.timezone,
      location: {
        type: event.location_type,
        formatted: event.address_formatted,
        city: event.address_city,
        country: event.address_country,
        latitude: event.latitude,
        longitude: event.longitude,
      },
      capacity: event.capacity,
      registered_count: registeredCount,
      remaining_spots: remainingSpots,
      settings: {
        registration_enabled: event.status === 'published',
        requires_approval: !event.settings?.registration_auto_approve,
        allowed_attendance_types:
          event.settings?.attendance_mode === 'hybrid'
            ? ['onsite', 'online']
            : [event.settings?.attendance_mode || 'onsite'],
        fields: event.settings?.registration_fields?.fields || [],
      },
    })
  }),

  // POST /api/public/events/:publicToken/register
  http.post(
    `${API_BASE}/public/events/:publicToken/register`,
    async ({ params, request }) => {
      const { publicToken } = params as { publicToken: string }
      const body = (await request.json()) as PublicRegisterDTO

      const event = getEventByPublicToken(publicToken)

      if (!event) {
        return HttpResponse.json(
          { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
          { status: 404 }
        )
      }

      // Vérifications événement
      if (event.status === 'cancelled') {
        return HttpResponse.json(
          { error: 'Event cancelled', code: 'EVENT_CANCELLED' },
          { status: 410 }
        )
      }

      if (event.status === 'completed') {
        return HttpResponse.json(
          { error: 'Event completed', code: 'EVENT_COMPLETED' },
          { status: 410 }
        )
      }

      // Vérifier capacité
      if (event.capacity) {
        const currentCount = mockRegistrations.filter(
          (r) =>
            r.event_id === event.id &&
            ['approved', 'awaiting'].includes(r.status)
        ).length

        if (currentCount >= event.capacity) {
          return HttpResponse.json(
            { error: 'Event is full', code: 'EVENT_FULL' },
            { status: 410 }
          )
        }
      }

      // Validation des champs requis
      if (!body.email || !body.first_name || !body.last_name) {
        return HttpResponse.json(
          {
            error: 'Missing required fields: email, first_name, last_name',
            code: 'VALIDATION_ERROR',
          },
          { status: 400 }
        )
      }

      // 3. Chercher ou créer attendee
      let attendee = getAttendeeByEmail(event.org_id, body.email)

      if (!attendee) {
        // Créer nouvel attendee
        const newAttendee: Attendee = {
          id: generateId(),
          org_id: event.org_id,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone || null,
          company: body.company || null,
          job_title: body.job_title || null,
          country: body.country || null,
          metadata: null,
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
      } else {
        // Mettre à jour attendee avec nouvelles infos
        attendee.first_name = body.first_name || attendee.first_name
        attendee.last_name = body.last_name || attendee.last_name
        attendee.phone = body.phone || attendee.phone
        attendee.company = body.company || attendee.company
        attendee.job_title = body.job_title || attendee.job_title
        attendee.country = body.country || attendee.country
        attendee.updated_at = new Date().toISOString()
      }

      // 4. Vérifier si déjà inscrit à cet événement
      const existingReg = mockRegistrations.find(
        (r) => r.event_id === event.id && r.attendee_id === attendee!.id
      )

      if (existingReg) {
        // Règle : Si refusé, bloquer réinscription
        if (existingReg.status === 'refused') {
          return HttpResponse.json(
            {
              error:
                'Your registration was previously declined. Please contact the organizer.',
              code: 'REGISTRATION_REFUSED',
            },
            { status: 403 }
          )
        }

        // Si déjà inscrit (awaiting ou approved), renvoyer erreur
        if (['awaiting', 'approved'].includes(existingReg.status)) {
          return HttpResponse.json(
            {
              error: 'You are already registered for this event',
              code: 'ALREADY_REGISTERED',
            },
            { status: 409 }
          )
        }
      }

      // 5. Créer registration
      const autoApprove = event.settings?.registration_auto_approve || false
      const regId = generateId()
      const confirmationNumber = generateConfirmationNumber(event.code, regId)

      const registration = {
        id: regId,
        org_id: event.org_id,
        event_id: event.id,
        attendee_id: attendee.id,
        status: autoApprove ? 'approved' : 'awaiting',
        attendance_type: body.attendance_type || 'onsite',
        answers: body.answers || {},
        invited_at: new Date().toISOString(),
        confirmed_at: autoApprove ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      mockRegistrations.push(registration)

      // Mettre à jour statistiques attendee
      attendee.statistics.total_registrations++
      if (autoApprove) {
        attendee.statistics.approved++
        attendee.statistics.total_events++
      } else {
        attendee.statistics.awaiting++
      }

      // Response succès
      const response: PublicRegisterResponse = {
        success: true,
        message: autoApprove
          ? 'Registration confirmed'
          : 'Registration received, pending approval',
        registration: {
          id: registration.id,
          status: registration.status as any,
          attendee: {
            id: attendee.id,
            first_name: attendee.first_name!,
            last_name: attendee.last_name!,
            email: attendee.email!,
          },
          confirmation_number: confirmationNumber,
          registered_at: registration.created_at,
        },
      }

      return HttpResponse.json(response, { status: 201 })
    }
  ),
]

// Export des registrations pour que les autres handlers puissent y accéder
export { mockRegistrations }
