import { http, HttpResponse } from 'msw'
import { env } from '@/app/config/env'
import type { LoginRequest, LoginResponse, User, PolicyResponse } from '@/features/auth/api/authApi'
import type { EventDTO } from '@/features/events/dpo/event.dto'
import type { AttendeeDTO } from '@/features/attendees/dpo/attendee.dto'

// Mock data
const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  roles: ['ORG_ADMIN'],
  orgId: 'org-1',
  eventIds: ['event-1', 'event-2'],
}

const mockOrganization = {
  id: 'org-1',
  name: 'Mon Organisation',
  slug: 'mon-org',
}

const mockEvents: EventDTO[] = [
  {
    id: 'event-1',
    name: 'Conférence Tech 2024',
    description: 'Une conférence sur les dernières technologies',
    start_date: '2024-06-15T09:00:00Z',
    end_date: '2024-06-15T18:00:00Z',
    location: 'Centre de Conférences Paris',
    max_attendees: 200,
    current_attendees: 150,
    status: 'active',
    org_id: 'org-1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    created_by: '1',
    tags: ['tech', 'conference'],
  },
  {
    id: 'event-2',
    name: 'Workshop React',
    description: 'Atelier pratique sur React et TypeScript',
    start_date: '2024-07-10T14:00:00Z',
    end_date: '2024-07-10T17:00:00Z',
    location: 'Salle de Formation A',
    max_attendees: 30,
    current_attendees: 25,
    status: 'published',
    org_id: 'org-1',
    created_at: '2024-02-01T09:00:00Z',
    updated_at: '2024-02-05T11:00:00Z',
    created_by: '1',
    tags: ['workshop', 'react'],
  },
]

const mockAttendees: AttendeeDTO[] = [
  {
    id: 'attendee-1',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33123456789',
    company: 'Tech Corp',
    job_title: 'Développeur Senior',
    status: 'confirmed',
    event_id: 'event-1',
    org_id: 'org-1',
    registration_date: '2024-01-20T10:00:00Z',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    tags: ['vip'],
  },
  {
    id: 'attendee-2',
    first_name: 'Marie',
    last_name: 'Martin',
    email: 'marie.martin@example.com',
    company: 'Design Studio',
    job_title: 'UX Designer',
    status: 'checked_in',
    event_id: 'event-1',
    org_id: 'org-1',
    registration_date: '2024-01-22T14:30:00Z',
    checked_in_at: '2024-06-15T08:45:00Z',
    checked_in_by: '1',
    created_at: '2024-01-22T14:30:00Z',
    updated_at: '2024-06-15T08:45:00Z',
  },
]

const mockPolicyResponse: PolicyResponse = {
  rules: [
    { action: 'manage', subject: 'all', conditions: { orgId: 'org-1' } },
  ],
  version: '1.0.0',
}

export const handlers = [
  // Auth endpoints
  http.post(`${env.VITE_API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as LoginRequest
    
    if (body.email === 'admin@example.com' && body.password === 'password') {
      const response: LoginResponse = {
        token: 'mock-jwt-token',
        user: mockUser,
        organization: mockOrganization,
      }
      return HttpResponse.json(response)
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.get(`${env.VITE_API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  http.get(`${env.VITE_API_BASE_URL}/auth/policy`, () => {
    return HttpResponse.json(mockPolicyResponse)
  }),

  // Events endpoints
  http.get(`${env.VITE_API_BASE_URL}/events`, () => {
    return HttpResponse.json({
      events: mockEvents,
      total: mockEvents.length,
      page: 1,
      limit: 20,
    })
  }),

  http.get(`${env.VITE_API_BASE_URL}/events/:id`, ({ params }) => {
    const event = mockEvents.find(e => e.id === params.id)
    if (!event) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(event)
  }),

  // Attendees endpoints
  http.get(`${env.VITE_API_BASE_URL}/attendees`, () => {
    return HttpResponse.json({
      attendees: mockAttendees,
      total: mockAttendees.length,
      page: 1,
      limit: 50,
    })
  }),

  http.get(`${env.VITE_API_BASE_URL}/attendees/:id`, ({ params }) => {
    const attendee = mockAttendees.find(a => a.id === params.id)
    if (!attendee) {
      return HttpResponse.json(
        { message: 'Attendee not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(attendee)
  }),

  // Export endpoint
  http.post(`${env.VITE_API_BASE_URL}/attendees/export`, () => {
    return HttpResponse.json({
      downloadUrl: '/mock-export.csv',
      filename: 'attendees-export.csv',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    })
  }),
]
