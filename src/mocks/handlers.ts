import { http, HttpResponse } from 'msw'
import { env } from '@/app/config/env'
import type { EventDTO } from '@/features/events/dpo/event.dto'
import type { AttendeeDTO } from '@/features/attendees/dpo/attendee.dto'
import { authDemoHandlers, users, events as demoEvents } from './auth-demo'

console.log('📋 Nouveaux handlers de démo importés:', authDemoHandlers.length)

// Conversion des événements demo vers EventDTO
const mockEvents: EventDTO[] = demoEvents.map(event => ({
  id: event.id,
  name: event.title,
  description: event.description,
  start_date: event.startDate,
  end_date: event.endDate,
  location: event.location,
  max_attendees: event.maxAttendees,
  current_attendees: Math.floor(event.maxAttendees * 0.7), // 70% de remplissage par défaut
  status: event.status as 'active' | 'published' | 'draft',
  org_id: event.org_id,
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  created_by: '1',
  tags: [event.category]
}))

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
        // Super Admin voit tous les événements
        if (currentUser.isSuperAdmin) {
          filteredEvents = mockEvents
        } else {
          // Filtrer par organisation d'abord pour les utilisateurs normaux
          filteredEvents = mockEvents.filter(event => event.org_id === currentUser.orgId)
          
          // Filtrage spécifique pour les utilisateurs avec eventIds restreints
          // MAIS les admins d'organisation voient tout dans leur org
          if (currentUser.eventIds && currentUser.eventIds.length > 0 && currentUser.role.code !== 'ORG_ADMIN') {
            filteredEvents = filteredEvents.filter(event => 
              currentUser.eventIds!.includes(event.id)
            )
          }
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
          // Super Admin a accès à tous les événements
          if (currentUser.isSuperAdmin) {
            // Pas de vérification pour les Super Admins
          } else {
            // Vérifier l'organisation pour les autres utilisateurs
            if (event.org_id !== currentUser.orgId) {
              return HttpResponse.json(
                { message: 'Event not found' },
                { status: 404 }
              )
            }
            
            // Vérifier les permissions spécifiques des partenaires
            if (currentUser.eventIds && currentUser.eventIds.length > 0 && currentUser.role.code !== 'ORG_ADMIN') {
              if (!currentUser.eventIds.includes(event.id)) {
                return HttpResponse.json(
                  { message: 'Event not found' },
                  { status: 404 }
                )
              }
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

  // ======================
  // INVITATIONS HANDLERS
  // ======================

  // Simuler un stockage des invitations
  ...(function() {
    const mockInvitations: any[] = []
    let invitationIdCounter = 1

    return [
      // POST /api/invitations - Envoyer une invitation
      http.post(`${env.VITE_API_BASE_URL}/invitations`, async ({ request }) => {
        const body = await request.json() as any
        const { email, role, orgId, eventIds, personalizedMessage } = body

        // Validation basique
        if (!email || !role) {
          return HttpResponse.json(
            { message: 'Email and role are required' },
            { status: 400 }
          )
        }

        // Vérifier si l'email existe déjà
        const existingUser = users.find(u => u.email === email)
        if (existingUser) {
          return HttpResponse.json(
            { message: 'User with this email already exists' },
            { status: 409 }
          )
        }

        // Vérifier la limite d'invitations (10 max)
        const pendingInvitations = mockInvitations.filter(i => i.status === 'pending')
        if (pendingInvitations.length >= 10) {
          return HttpResponse.json(
            { message: 'Invitation limit reached (10 max)' },
            { status: 429 }
          )
        }

        // Créer l'invitation
        const newInvitation = {
          id: `invitation-${invitationIdCounter++}`,
          email,
          role,
          orgId: orgId || 'org-1',
          eventIds: eventIds || [],
          personalizedMessage: personalizedMessage || null,
          status: 'pending',
          token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          invitedBy: 'current-user-id'
        }

        mockInvitations.push(newInvitation)

        console.log('📧 Nouvelle invitation créée:', newInvitation)

        return HttpResponse.json({
          invitation: newInvitation,
          emailSent: true
        })
      }),

      // GET /api/invitations - Liste des invitations
      http.get(`${env.VITE_API_BASE_URL}/invitations`, ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        
        let filteredInvitations = [...mockInvitations]
        
        if (status) {
          filteredInvitations = filteredInvitations.filter(i => i.status === status)
        }

        // Trier par date de création (plus récent en premier)
        filteredInvitations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return HttpResponse.json({
          invitations: filteredInvitations,
          total: filteredInvitations.length
        })
      }),

      // POST /api/invitations/:id/resend - Renvoyer une invitation
      http.post(`${env.VITE_API_BASE_URL}/invitations/:id/resend`, ({ params }) => {
        const { id } = params
        const invitation = mockInvitations.find(i => i.id === id)

        if (!invitation) {
          return HttpResponse.json(
            { message: 'Invitation not found' },
            { status: 404 }
          )
        }

        if (invitation.status !== 'pending') {
          return HttpResponse.json(
            { message: 'Cannot resend non-pending invitation' },
            { status: 400 }
          )
        }

        // Générer un nouveau token et prolonger l'expiration
        invitation.token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

        console.log('📧 Invitation renvoyée:', invitation)

        return HttpResponse.json({
          invitation,
          emailSent: true
        })
      }),

      // DELETE /api/invitations/:id - Annuler une invitation
      http.delete(`${env.VITE_API_BASE_URL}/invitations/:id`, ({ params }) => {
        const { id } = params
        const invitationIndex = mockInvitations.findIndex(i => i.id === id)

        if (invitationIndex === -1) {
          return HttpResponse.json(
            { message: 'Invitation not found' },
            { status: 404 }
          )
        }

        const invitation = mockInvitations[invitationIndex]
        
        if (invitation.status !== 'pending') {
          return HttpResponse.json(
            { message: 'Cannot cancel non-pending invitation' },
            { status: 400 }
          )
        }

        // Marquer comme annulée au lieu de supprimer
        invitation.status = 'cancelled'
        invitation.cancelledAt = new Date().toISOString()

        console.log('❌ Invitation annulée:', invitation)

        return HttpResponse.json({ message: 'Invitation cancelled successfully' })
      }),

      // GET /api/invitations/validate/:token - Valider un token d'invitation (public)
      http.get(`${env.VITE_API_BASE_URL}/invitations/validate/:token`, ({ params }) => {
        const { token } = params
        const invitation = mockInvitations.find(i => i.token === token)

        if (!invitation) {
          return HttpResponse.json(
            { message: 'Invalid invitation token' },
            { status: 404 }
          )
        }

        if (invitation.status !== 'pending') {
          return HttpResponse.json(
            { message: 'Invitation is no longer valid' },
            { status: 400 }
          )
        }

        if (new Date() > new Date(invitation.expiresAt)) {
          invitation.status = 'expired'
          return HttpResponse.json(
            { message: 'Invitation has expired' },
            { status: 410 }
          )
        }

        return HttpResponse.json({
          invitation: {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            orgId: invitation.orgId,
            eventIds: invitation.eventIds,
            personalizedMessage: invitation.personalizedMessage,
            expiresAt: invitation.expiresAt
          }
        })
      }),

      // POST /api/invitations/accept/:token - Accepter une invitation et créer un compte
      http.post(`${env.VITE_API_BASE_URL}/invitations/accept/:token`, async ({ params, request }) => {
        const { token } = params
        const body = await request.json() as any
        const { firstName, lastName } = body

        const invitation = mockInvitations.find(i => i.token === token)

        if (!invitation || invitation.status !== 'pending') {
          return HttpResponse.json(
            { message: 'Invalid or expired invitation' },
            { status: 400 }
          )
        }

        if (new Date() > new Date(invitation.expiresAt)) {
          invitation.status = 'expired'
          return HttpResponse.json(
            { message: 'Invitation has expired' },
            { status: 410 }
          )
        }

        // Créer le nouvel utilisateur
        const newUser = {
          id: `user-${users.length + 1}`,
          email: invitation.email,
          firstName,
          lastName,
          roleId: invitation.role,
          role: { 
            id: invitation.role, 
            orgId: invitation.orgId,
            code: invitation.role,
            name: invitation.role,
            description: `${invitation.role} role` 
          },
          orgId: invitation.orgId,
          eventIds: invitation.eventIds || [],
          isActive: true
        }

        users.push(newUser)

        // Marquer l'invitation comme acceptée
        invitation.status = 'accepted'
        invitation.acceptedAt = new Date().toISOString()
        invitation.acceptedBy = newUser.id

        console.log('✅ Invitation acceptée, nouvel utilisateur créé:', newUser)

        return HttpResponse.json({
          user: newUser,
          message: 'Account created successfully'
        })
      })
    ]
  })(),
]
