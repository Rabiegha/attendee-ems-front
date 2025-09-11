import { http, HttpResponse } from 'msw'
import { env } from '@/app/config/env'
import type { EventDTO } from '@/features/events/dpo/event.dto'
import type { AttendeeDTO } from '@/features/attendees/dpo/attendee.dto'
import { authDemoHandlers, users } from './auth-demo'

console.log('📋 Nombre de handlers de démo importés:', authDemoHandlers.length)

// Mock data
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
  // Événements Creative Agency - Tests isolation partenaires
  {
    id: 'event-tech-1',
    name: 'Workshop React Native',
    description: 'Atelier développement mobile avec React Native',
    start_date: '2024-11-15T09:00:00Z',
    end_date: '2024-11-15T17:00:00Z',
    location: 'Creative Agency - Salle Tech',
    max_attendees: 25,
    current_attendees: 15,
    status: 'published',
    org_id: 'org-2',
    created_at: '2024-04-01T10:00:00Z',
    updated_at: '2024-04-01T10:00:00Z',
    created_by: 'user-2-admin',
    tags: ['tech', 'mobile', 'react'],
  },
  {
    id: 'event-tech-2',
    name: 'Conférence DevOps & Cloud',
    description: 'Dernières tendances en DevOps et infrastructure cloud',
    start_date: '2024-12-05T14:00:00Z',
    end_date: '2024-12-05T18:00:00Z',
    location: 'Creative Agency - Auditorium',
    max_attendees: 100,
    current_attendees: 78,
    status: 'published',
    org_id: 'org-2',
    created_at: '2024-04-02T11:00:00Z',
    updated_at: '2024-04-02T11:00:00Z',
    created_by: 'user-2-admin',
    tags: ['tech', 'devops', 'cloud'],
  },
  {
    id: 'event-design-1',
    name: 'Atelier UX Design Thinking',
    description: 'Méthodes de design thinking appliquées à l\'UX',
    start_date: '2024-11-20T10:00:00Z',
    end_date: '2024-11-20T16:00:00Z',
    location: 'Creative Agency - Studio Design',
    max_attendees: 20,
    current_attendees: 18,
    status: 'published',
    org_id: 'org-2',
    created_at: '2024-04-03T09:00:00Z',
    updated_at: '2024-04-03T09:00:00Z',
    created_by: 'user-2-admin',
    tags: ['design', 'ux', 'thinking'],
  },
  {
    id: 'event-design-2',
    name: 'Masterclass UI Animation',
    description: 'Techniques avancées d\'animation d\'interfaces',
    start_date: '2024-12-10T13:00:00Z',
    end_date: '2024-12-10T17:00:00Z',
    location: 'Creative Agency - Lab Animation',
    max_attendees: 15,
    current_attendees: 12,
    status: 'published',
    org_id: 'org-2',
    created_at: '2024-04-04T14:00:00Z',
    updated_at: '2024-04-04T14:00:00Z',
    created_by: 'user-2-admin',
    tags: ['design', 'ui', 'animation'],
  },
  {
    id: 'event-shared-1',
    name: 'Creative & Tech Summit',
    description: 'Conférence commune design et développement',
    start_date: '2024-12-15T09:00:00Z',
    end_date: '2024-12-15T18:00:00Z',
    location: 'Creative Agency - Grand Amphithéâtre',
    max_attendees: 200,
    current_attendees: 145,
    status: 'published',
    org_id: 'org-2',
    created_at: '2024-04-05T08:00:00Z',
    updated_at: '2024-04-05T08:00:00Z',
    created_by: 'user-2-admin',
    tags: ['tech', 'design', 'collaboration'],
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

export const handlers = [
  // Handlers de démo pour l'authentification multi-tenant
  ...authDemoHandlers,

  // Events endpoints avec filtrage par permissions
  http.get(`${env.VITE_API_BASE_URL}/events`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    // Si pas d'auth, retourner tous les événements (pour compatibilité)
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({
        events: mockEvents,
        total: mockEvents.length,
        page: 1,
        limit: 20,
      })
    }

    try {
      // Extraction des informations utilisateur du token
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token))
      
      // Recherche de l'utilisateur dans nos données de démo
      const currentUser = users.find(u => u.id === payload.userId)
      
      let filteredEvents = mockEvents
      
      // Filtrage selon le rôle utilisateur
      if (currentUser) {
        // Filtrer par organisation d'abord
        filteredEvents = mockEvents.filter(event => event.org_id === currentUser.orgId)
        
        // Filtrage spécifique pour les partenaires avec eventIds
        if (currentUser.eventIds && currentUser.eventIds.length > 0) {
          filteredEvents = filteredEvents.filter(event => 
            currentUser.eventIds!.includes(event.id)
          )
        }
      }
      
      return HttpResponse.json({
        events: filteredEvents,
        total: filteredEvents.length,
        page: 1,
        limit: 20,
      })
    } catch (error) {
      // En cas d'erreur, retourner tous les événements
      return HttpResponse.json({
        events: mockEvents,
        total: mockEvents.length,
        page: 1,
        limit: 20,
      })
    }
  }),

  http.get(`${env.VITE_API_BASE_URL}/events/:id`, ({ params, request }) => {
    const event = mockEvents.find(e => e.id === params.id)
    if (!event) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    // Vérification des permissions d'accès à cet événement
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const payload = JSON.parse(atob(token))
        const currentUser = users.find(u => u.id === payload.userId)
        
        if (currentUser) {
          // Vérifier l'organisation
          if (event.org_id !== currentUser.orgId) {
            return HttpResponse.json(
              { message: 'Event not found' },
              { status: 404 }
            )
          }
          
          // Vérifier les permissions spécifiques des partenaires
          if (currentUser.eventIds && currentUser.eventIds.length > 0) {
            if (!currentUser.eventIds.includes(event.id)) {
              return HttpResponse.json(
                { message: 'Event not found' },
                { status: 404 }
              )
            }
          }
        }
      } catch (error) {
        // Token invalide, mais on laisse passer pour compatibilité
      }
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
      org_id: 'org-1', // Organisation par défaut
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '1', // Utilisateur par défaut
      tags: eventData.tags || [],
    }
    
    // Ajouter à la liste mock (pour les futures requêtes GET)
    mockEvents.push(newEvent)
    
    return HttpResponse.json(newEvent, { status: 201 })
  }),

  // Update event endpoint
  http.put(`${env.VITE_API_BASE_URL}/events/:id`, async ({ request, params }) => {
    const eventData = await request.json() as any
    const eventId = params.id as string
    
    // Simuler un délai réaliste
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Trouver l'événement existant
    const existingEventIndex = mockEvents.findIndex(e => e.id === eventId)
    if (existingEventIndex === -1) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    
    const existingEvent = mockEvents[existingEventIndex]!
    
    // Mettre à jour l'événement
    const updatedEvent: EventDTO = {
      ...existingEvent,
      name: eventData.name || existingEvent.name,
      description: eventData.description !== undefined ? eventData.description : existingEvent.description,
      start_date: eventData.start_date || existingEvent.start_date,
      end_date: eventData.end_date || existingEvent.end_date,
      location: eventData.location !== undefined ? eventData.location : existingEvent.location,
      max_attendees: eventData.max_attendees !== undefined ? eventData.max_attendees : existingEvent.max_attendees,
      tags: eventData.tags || existingEvent.tags,
      updated_at: new Date().toISOString(),
    }
    
    // Remplacer dans la liste
    mockEvents[existingEventIndex] = updatedEvent
    
    return HttpResponse.json(updatedEvent)
  }),

  // Delete event endpoint
  http.delete(`${env.VITE_API_BASE_URL}/events/:id`, async ({ params }) => {
    const eventId = params.id as string
    
    // Simuler un délai réaliste
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Trouver et supprimer l'événement
    const eventIndex = mockEvents.findIndex(e => e.id === eventId)
    if (eventIndex === -1) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Supprimer l'événement
    mockEvents.splice(eventIndex, 1)
    
    // Supprimer aussi les participants associés
    const attendeesToRemove = mockAttendees.filter(a => a.event_id === eventId)
    attendeesToRemove.forEach(attendee => {
      const index = mockAttendees.findIndex(a => a.id === attendee.id)
      if (index !== -1) {
        mockAttendees.splice(index, 1)
      }
    })
    
    return HttpResponse.json({ message: 'Event deleted successfully' })
  }),
]
