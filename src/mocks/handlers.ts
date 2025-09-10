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
    description: 'Une conférence sur les dernières technologies web et mobiles',
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
    tags: ['tech', 'conference', 'web'],
  },
  {
    id: 'event-2',
    name: 'Workshop React',
    description: 'Atelier pratique sur React et TypeScript pour débutants',
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
    tags: ['workshop', 'react', 'typescript'],
  },
  {
    id: 'event-3',
    name: 'Meetup DevOps',
    description: 'Rencontre mensuelle des professionnels DevOps',
    start_date: '2024-08-20T19:00:00Z',
    end_date: '2024-08-20T21:30:00Z',
    location: 'Espace Coworking Lyon',
    max_attendees: 50,
    current_attendees: 12,
    status: 'published',
    org_id: 'org-1',
    created_at: '2024-02-15T16:00:00Z',
    updated_at: '2024-02-15T16:00:00Z',
    created_by: '1',
    tags: ['meetup', 'devops', 'networking'],
  },
  {
    id: 'event-4',
    name: 'Formation Sécurité Web',
    description: 'Formation intensive sur la sécurité des applications web',
    start_date: '2024-09-25T09:00:00Z',
    end_date: '2024-09-27T17:00:00Z',
    location: 'Centre de Formation Marseille',
    max_attendees: 20,
    current_attendees: 18,
    status: 'draft',
    org_id: 'org-1',
    created_at: '2024-03-01T11:00:00Z',
    updated_at: '2024-03-10T15:30:00Z',
    created_by: '1',
    tags: ['formation', 'security', 'web'],
  },
  {
    id: 'event-5',
    name: 'Hackathon AI 2024',
    description: 'Compétition de développement sur l\'intelligence artificielle',
    start_date: '2024-10-15T09:00:00Z',
    end_date: '2024-10-17T18:00:00Z',
    location: 'Campus Université Toulouse',
    max_attendees: 100,
    current_attendees: 87,
    status: 'active',
    org_id: 'org-1',
    created_at: '2024-03-15T14:00:00Z',
    updated_at: '2024-04-01T09:30:00Z',
    created_by: '1',
    tags: ['hackathon', 'ai', 'competition'],
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
  {
    id: 'attendee-3',
    first_name: 'Pierre',
    last_name: 'Bernard',
    email: 'pierre.bernard@startup.com',
    phone: '+33987654321',
    company: 'Startup Innovante',
    job_title: 'CTO',
    status: 'pending',
    event_id: 'event-1',
    org_id: 'org-1',
    registration_date: '2024-01-25T09:15:00Z',
    created_at: '2024-01-25T09:15:00Z',
    updated_at: '2024-01-25T09:15:00Z',
    tags: ['speaker'],
  },
  {
    id: 'attendee-4',
    first_name: 'Sophie',
    last_name: 'Durand',
    email: 'sophie.durand@consultancy.fr',
    company: 'Consultancy Pro',
    job_title: 'Consultante',
    status: 'confirmed',
    event_id: 'event-2',
    org_id: 'org-1',
    registration_date: '2024-02-02T16:30:00Z',
    created_at: '2024-02-02T16:30:00Z',
    updated_at: '2024-02-02T16:30:00Z',
  },
  {
    id: 'attendee-5',
    first_name: 'Thomas',
    last_name: 'Petit',
    email: 'thomas.petit@agency.com',
    phone: '+33156789012',
    company: 'Digital Agency',
    job_title: 'Developer',
    status: 'pending',
    event_id: 'event-2',
    org_id: 'org-1',
    registration_date: '2024-02-05T11:00:00Z',
    created_at: '2024-02-05T11:00:00Z',
    updated_at: '2024-02-05T11:00:00Z',
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

  // Create event endpoint
  http.post(`${env.VITE_API_BASE_URL}/events`, async ({ request }) => {
    const eventData = await request.json() as any
    
    // Simuler un délai réaliste
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Générer un nouvel événement avec ID
    const newEvent: EventDTO = {
      id: `event-${Date.now()}`,
      name: eventData.name,
      description: eventData.description || '', // Peut être vide
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: eventData.location || '', // Peut être vide
      max_attendees: eventData.max_attendees || 1000000, // Sans limite = grand nombre
      current_attendees: 0,
      status: eventData.status || 'published', // Par défaut publié
      org_id: mockUser.orgId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: mockUser.id,
      tags: eventData.tags || [],
    }
    
    // Ajouter à la liste mock (pour les futures requêtes GET)
    mockEvents.push(newEvent)
    
    return HttpResponse.json(newEvent, { status: 201 })
  }),
]
