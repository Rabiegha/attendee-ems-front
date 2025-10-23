/**
 * MSW Handlers - Attendees API (CRM)
 * 
 * - GET /api/attendees (CRM global avec filtres)
 * - GET /api/attendees/:id (profil + historique)
 * - PUT /api/attendees/:id (mise à jour CRM)
 * - DELETE /api/attendees/:id (suppression)
 * - GET /api/attendees/:id/export (export GDPR)
 */

import { http, HttpResponse } from 'msw'
import { mockAttendees, getAttendeesByOrgId, getAttendeesByLabels, getAttendeesByMinEvents } from '../data/attendees.mock'
import { mockRegistrations } from './public.handlers'
import { mockEvents } from '../data/events.mock'
import type { Attendee, UpdateAttendeeDTO, AttendeeProfile } from '@/features/attendees/types'

const API_BASE = 'http://localhost:3000'

// Helper pour filtrer attendees
const filterAttendees = (
  attendees: Attendee[],
  filters: {
    search?: string
    labels?: string[]
    minEvents?: number
  }
) => {
  let filtered = [...attendees]
  
  // Recherche texte (nom, email, téléphone)
  if (filters.search && filters.search.length > 0) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      a =>
        a.first_name?.toLowerCase().includes(searchLower) ||
        a.last_name?.toLowerCase().includes(searchLower) ||
        a.email?.toLowerCase().includes(searchLower) ||
        a.phone?.toLowerCase().includes(searchLower)
    )
  }
  
  // Filtrer par labels
  if (filters.labels && filters.labels.length > 0) {
    filtered = filtered.filter(
      a => filters.labels!.some(label => a.labels?.includes(label))
    )
  }
  
  // Filtrer par nombre minimum d'événements
  if (filters.minEvents) {
    filtered = filtered.filter(a => a.statistics.total_events >= filters.minEvents!)
  }
  
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

export const attendeesHandlers = [
  // GET /api/attendees
  http.get(`${API_BASE}/attendees`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || undefined
    const labelsParam = url.searchParams.get('labels')
    const minEvents = url.searchParams.get('minEvents')
      ? parseInt(url.searchParams.get('minEvents')!)
      : undefined
    const sortBy = url.searchParams.get('sortBy') || 'last_name'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'
    
    const labels = labelsParam ? labelsParam.split(',') : undefined
    
    // TODO: Récupérer user org_id depuis JWT
    const userOrgId = 'org-tech-corp' // Mock
    
    // Filtrer par org
    let attendees = getAttendeesByOrgId(userOrgId)
    
    // Appliquer filtres
    attendees = filterAttendees(attendees, {
      search,
      labels,
      minEvents
    })
    
    // Tri
    attendees.sort((a, b) => {
      let aVal: any = (a as any)[sortBy]
      let bVal: any = (b as any)[sortBy]
      
      if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || ''
        bVal = bVal?.toLowerCase() || ''
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
    
    // Paginer
    const paginated = paginate(attendees, page, limit)
    
    return HttpResponse.json({
      attendees: paginated.items,
      pagination: {
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        total_pages: paginated.total_pages
      }
    })
  }),

  // GET /api/attendees/:id
  http.get(`${API_BASE}/attendees/:id`, ({ params }) => {
    const { id } = params as { id: string }
    
    const attendee = mockAttendees.find(a => a.id === id)
    
    if (!attendee) {
      return HttpResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (même org)
    
    // Récupérer historique des registrations
    const attendeeRegistrations = mockRegistrations.filter(r => r.attendee_id === attendee.id)
    
    const registrations_history = attendeeRegistrations.map(reg => {
      const event = mockEvents.find(e => e.id === reg.event_id)
      
      return {
        id: reg.id,
        event: {
          id: event?.id || '',
          code: event?.code || '',
          name: event?.name || '',
          start_at: event?.start_at || ''
        },
        status: reg.status,
        attendance_type: reg.attendance_type,
        registered_at: reg.created_at,
        checked_in: false, // Mock
        checked_in_at: undefined
      }
    })
    
    const profile: AttendeeProfile = {
      ...attendee,
      registrations_history
    }
    
    return HttpResponse.json(profile)
  }),

  // PUT /api/attendees/:id
  http.put(`${API_BASE}/attendees/:id`, async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = await request.json() as UpdateAttendeeDTO
    
    const attendee = mockAttendees.find(a => a.id === id)
    
    if (!attendee) {
      return HttpResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (SUPER_ADMIN, ADMIN, MANAGER)
    
    // Mettre à jour
    attendee.first_name = body.first_name !== undefined ? body.first_name : attendee.first_name
    attendee.last_name = body.last_name !== undefined ? body.last_name : attendee.last_name
    attendee.phone = body.phone !== undefined ? body.phone : attendee.phone
    attendee.company = body.company !== undefined ? body.company : attendee.company
    attendee.job_title = body.job_title !== undefined ? body.job_title : attendee.job_title
    attendee.country = body.country !== undefined ? body.country : attendee.country
    attendee.default_type_id = body.default_type_id !== undefined ? body.default_type_id : attendee.default_type_id
    attendee.labels = body.labels !== undefined ? body.labels : attendee.labels
    attendee.notes = body.notes !== undefined ? body.notes : attendee.notes
    attendee.updated_at = new Date().toISOString()
    
    // Récupérer historique pour response
    const attendeeRegistrations = mockRegistrations.filter(r => r.attendee_id === attendee.id)
    
    const registrations_history = attendeeRegistrations.map(reg => {
      const event = mockEvents.find(e => e.id === reg.event_id)
      
      return {
        id: reg.id,
        event: {
          id: event?.id || '',
          code: event?.code || '',
          name: event?.name || '',
          start_at: event?.start_at || ''
        },
        status: reg.status,
        attendance_type: reg.attendance_type,
        registered_at: reg.created_at,
        checked_in: false,
        checked_in_at: undefined
      }
    })
    
    const profile: AttendeeProfile = {
      ...attendee,
      registrations_history
    }
    
    return HttpResponse.json(profile)
  }),

  // DELETE /api/attendees/:id
  http.delete(`${API_BASE}/attendees/:id`, ({ params }) => {
    const { id } = params as { id: string }
    
    const attendeeIndex = mockAttendees.findIndex(a => a.id === id)
    
    if (attendeeIndex === -1) {
      return HttpResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (SUPER_ADMIN, ADMIN)
    
    // Supprimer attendee
    mockAttendees.splice(attendeeIndex, 1)
    
    // Supprimer toutes les registrations associées (cascade)
    const registrationsToDelete = mockRegistrations.filter(r => r.attendee_id === id)
    registrationsToDelete.forEach(reg => {
      const regIndex = mockRegistrations.indexOf(reg)
      if (regIndex > -1) {
        mockRegistrations.splice(regIndex, 1)
      }
    })
    
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/attendees/:id/export
  http.get(`${API_BASE}/attendees/:id/export`, ({ params }) => {
    const { id } = params as { id: string }
    
    const attendee = mockAttendees.find(a => a.id === id)
    
    if (!attendee) {
      return HttpResponse.json(
        { error: 'Attendee not found' },
        { status: 404 }
      )
    }
    
    // TODO: Vérifier permissions (SUPER_ADMIN, ADMIN, MANAGER)
    
    // Récupérer toutes les données (GDPR compliance)
    const attendeeRegistrations = mockRegistrations.filter(r => r.attendee_id === attendee.id)
    
    const registrations = attendeeRegistrations.map(reg => {
      const event = mockEvents.find(e => e.id === reg.event_id)
      
      return {
        id: reg.id,
        event: {
          id: event?.id,
          code: event?.code,
          name: event?.name,
          start_at: event?.start_at
        },
        status: reg.status,
        attendance_type: reg.attendance_type,
        answers: reg.answers,
        registered_at: reg.created_at
      }
    })
    
    return HttpResponse.json({
      attendee: {
        id: attendee.id,
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        email: attendee.email,
        phone: attendee.phone,
        company: attendee.company,
        job_title: attendee.job_title,
        country: attendee.country,
        labels: attendee.labels,
        notes: attendee.notes,
        created_at: attendee.created_at,
        updated_at: attendee.updated_at
      },
      registrations,
      badges: [], // Mock
      presence_visits: [] // Mock
    })
  })
]
