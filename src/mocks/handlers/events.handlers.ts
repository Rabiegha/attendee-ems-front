/**
 * MSW Handlers - Events API (Authentifié)
 * 
 * Endpoints CRUD pour les événements
 * - GET /api/events (liste avec filtres, pagination)
 * - POST /api/events (création)
 * - GET /api/events/:id (détails)
 * - PUT /api/events/:id (modification)
 * - DELETE /api/events/:id (suppression)
 * - PUT /api/events/:id/status (changement statut manuel)
 */

import { http, HttpResponse } from 'msw'
import { mockEvents, getEventsByOrgId, getEventsByStatus } from '../data/events.mock'
import type { Event, CreateEventDTO, UpdateEventDTO } from '@/features/events/types'

const API_BASE = 'http://localhost:3000'

// Helper pour générer un ID unique
const generateId = () => `550e8400-e29b-41d4-a716-${Math.random().toString(36).substr(2, 12)}`

// Helper pour générer un public_token
const generatePublicToken = () => `evt_pub_${Math.random().toString(36).substr(2, 24)}`

// Helper pour filtrer/rechercher les événements
const filterEvents = (
  events: Event[],
  filters: {
    search?: string
    status?: string
    startAfter?: string
    startBefore?: string
    sortBy?: string
    sortOrder?: string
  }
): Event[] => {
  let filtered = [...events]
  
  // Recherche texte (nom, description, code)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.code.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower)
    )
  }
  
  // Filtrer par statut
  if (filters.status) {
    filtered = filtered.filter(e => e.status === filters.status)
  }
  
  // Filtrer par date de début
  if (filters.startAfter) {
    filtered = filtered.filter(e => e.start_at >= filters.startAfter!)
  }
  
  if (filters.startBefore) {
    filtered = filtered.filter(e => e.start_at <= filters.startBefore!)
  }
  
  // Tri
  const sortBy = filters.sortBy || 'start_at'
  const sortOrder = filters.sortOrder || 'asc'
  
  filtered.sort((a, b) => {
    let aVal: any = (a as any)[sortBy]
    let bVal: any = (b as any)[sortBy]
    
    // Tri par dates
    if (sortBy === 'start_at' || sortBy === 'created_at' || sortBy === 'updated_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }
    
    // Tri par strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  
  return filtered
}

// Helper pagination
const paginate = <T,>(items: T[], page: number, limit: number) => {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    items: items.slice(start, end),
    total: items.length,
    page,
    limit,
    total_pages: Math.ceil(items.length / limit)
  }
}

export const eventsHandlers = [
  // GET /api/events
  http.get(`${API_BASE}/events`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || undefined
    const status = url.searchParams.get('status') || undefined
    const startAfter = url.searchParams.get('startAfter') || undefined
    const startBefore = url.searchParams.get('startBefore') || undefined
    const sortBy = url.searchParams.get('sortBy') || 'start_at'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'
    const orgId = url.searchParams.get('orgId') || undefined
    
    // TODO: Récupérer user depuis JWT mock (pour l'instant, assume org-tech-corp)
    const userOrgId = orgId || 'org-tech-corp' // En prod, vient du JWT
    const userRole = 'ADMIN' // Mock, vient du JWT
    
    // Filtrer par org (sauf SUPER_ADMIN)
    let events = mockEvents
    if (userRole !== 'SUPER_ADMIN') {
      events = getEventsByOrgId(userOrgId)
    } else if (orgId) {
      // SUPER_ADMIN peut filtrer par org spécifique
      events = getEventsByOrgId(orgId)
    }
    
    // Appliquer filtres
    const filtered = filterEvents(events, {
      search,
      status,
      startAfter,
      startBefore,
      sortBy,
      sortOrder
    })
    
    // Paginer
    const paginated = paginate(filtered, page, limit)
    
    return HttpResponse.json({
      events: paginated.items,
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit
    })
  }),

  // POST /api/events
  http.post(`${API_BASE}/events`, async ({ request }) => {
    const body = await request.json() as any // Frontend uses different structure
    
    console.log('[MOCK] POST /events - Body received:', body)
    
    // TODO: Récupérer user depuis JWT
    const userId = 'user-admin-001'
    const userOrgId = 'org-tech-corp'
    const userRole = 'ADMIN'
    
    // Validation: Frontend sends start_date/end_date, not start_at/end_at
    // Code is auto-generated by backend
    if (!body.name || !body.start_date || !body.end_date) {
      console.error('[MOCK] POST /events - Validation failed:', {
        name: body.name,
        start_date: body.start_date,
        end_date: body.end_date
      })
      return HttpResponse.json(
        { error: 'Missing required fields: name, start_date, end_date' },
        { status: 400 }
      )
    }
    
    // Auto-generate code from name (like backend would do)
    const autoCode = body.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 20) + '-' + Date.now().toString(36).toUpperCase()
    
    // Vérifier code unique
    const existingCode = mockEvents.find(
      e => e.code === autoCode && e.org_id === (body.org_id || userOrgId)
    )
    
    if (existingCode) {
      return HttpResponse.json(
        { error: `Event with code "${autoCode}" already exists` },
        { status: 409 }
      )
    }
    
    // Déterminer org_id (SUPER_ADMIN peut choisir, autres = leur org)
    const orgId = userRole === 'SUPER_ADMIN' && body.org_id ? body.org_id : userOrgId
    
    // Générer public_token
    const publicToken = generatePublicToken()
    
    // Créer event - Map frontend structure to backend structure
    const newEvent: Event = {
      id: generateId(),
      org_id: orgId,
      code: autoCode, // Auto-generated
      name: body.name,
      description: body.description || null,
      start_at: body.start_date, // Frontend sends start_date
      end_at: body.end_date,     // Frontend sends end_date
      timezone: body.timezone || 'Europe/Paris',
      status: body.status || 'draft',
      capacity: body.max_attendees || null,
      
      location_type: body.location?.type || 'physical',
      address_formatted: body.location?.address_formatted,
      address_city: body.location?.address_city,
      address_country: body.location?.address_country,
      latitude: body.location?.latitude,
      longitude: body.location?.longitude,
      
      org_activity_sector_id: body.org_activity_sector_id,
      org_event_type_id: body.org_event_type_id,
      created_by: userId,
      
      settings: {
        public_token: publicToken,
        website_url: body.settings?.website_url,
        attendance_mode: body.settings?.attendance_mode || 'onsite',
        registration_auto_approve: body.settings?.registration_auto_approve || false,
        allow_checkin_out: body.settings?.allow_checkin_out !== false,
        auto_transition_to_active: body.settings?.auto_transition_to_active !== false,
        auto_transition_to_completed: body.settings?.auto_transition_to_completed !== false,
        registration_fields: body.settings?.registration_fields
      },
      
      statistics: {
        total_registrations: 0,
        approved: 0,
        awaiting: 0,
        refused: 0,
        cancelled: 0,
        checked_in: 0
      },
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockEvents.push(newEvent)
    
    // TODO: Créer event_access pour les partners si partner_ids fournis
    
    // Transform Event to EventDTO (backend returns start_date/end_date to frontend)
    return HttpResponse.json({
      id: newEvent.id,
      name: newEvent.name,
      description: newEvent.description,
      start_date: newEvent.start_at, // Transform start_at -> start_date for frontend
      end_date: newEvent.end_at,     // Transform end_at -> end_date for frontend
      location: newEvent.address_formatted || '',
      max_attendees: newEvent.capacity || 0,
      current_attendees: newEvent.statistics?.approved || 0,
      status: newEvent.status,
      org_id: newEvent.org_id,
      created_at: newEvent.created_at,
      updated_at: newEvent.updated_at,
      created_by: newEvent.created_by || '',
      tags: [],
      metadata: {},
      embed_url: `https://ems.example.com/embed/event/${publicToken}`
    }, { status: 201 })
  }),

  // GET /api/events/:id
  http.get(`${API_BASE}/events/:id`, ({ params }) => {
    const { id } = params as { id: string }
    
    const event = mockEvents.find(e => e.id === id)
    
    if (!event) {
      return HttpResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (event_access pour PARTNER/HOSTESS)
    
    return HttpResponse.json({
      ...event,
      embed_url: `https://ems.example.com/embed/event/${event.settings?.public_token}`
    })
  }),

  // PUT /api/events/:id
  http.put(`${API_BASE}/events/:id`, async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json() as UpdateEventDTO
    
    const eventIndex = mockEvents.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return HttpResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    const event = mockEvents[eventIndex]
    
    // TODO: Vérifier permissions (ADMIN/MANAGER de l'org)
    
    // Mettre à jour
    const updatedEvent: Event = {
      ...event,
      name: body.name || event.name,
      description: body.description !== undefined ? body.description : event.description,
      start_at: body.start_at || event.start_at,
      end_at: body.end_at || event.end_at,
      timezone: body.timezone || event.timezone,
      status: body.status || event.status,
      capacity: body.capacity !== undefined ? body.capacity : event.capacity,
      
      address_formatted: body.location?.address_formatted || event.address_formatted,
      address_city: body.location?.address_city || event.address_city,
      address_country: body.location?.address_country || event.address_country,
      latitude: body.location?.latitude || event.latitude,
      longitude: body.location?.longitude || event.longitude,
      
      settings: {
        ...event.settings,
        ...body.settings
      },
      
      updated_at: new Date().toISOString()
    }
    
    mockEvents[eventIndex] = updatedEvent
    
    return HttpResponse.json(updatedEvent)
  }),

  // DELETE /api/events/:id
  http.delete(`${API_BASE}/events/:id`, ({ params }) => {
    const { id } = params as { id: string }
    
    const eventIndex = mockEvents.findIndex(e => e.id === id)
    
    if (eventIndex === -1) {
      return HttpResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (SUPER_ADMIN ou ADMIN de l'org)
    
    mockEvents.splice(eventIndex, 1)
    
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT /api/events/:id/status
  http.put(`${API_BASE}/events/:id/status`, async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json() as { status: string; reason?: string }
    
    const event = mockEvents.find(e => e.id === id)
    
    if (!event) {
      return HttpResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (SUPER_ADMIN, ADMIN, MANAGER)
    
    event.status = body.status as any
    event.updated_at = new Date().toISOString()
    
    return HttpResponse.json({
      id: event.id,
      status: event.status,
      updated_at: event.updated_at
    })
  })
]
