import type { EventDTO, CreateEventDTO, UpdateEventDTO } from './event.dto'
import type { EventDPO, CreateEventDPO, UpdateEventDPO } from './event.dpo'

/**
 * Maps EventDTO from API to EventDPO for client use
 */
export const mapEventDTOtoDPO = (dto: EventDTO): EventDPO => {
  const startDate = new Date(dto.start_at)
  const endDate = new Date(dto.end_at)
  const now = new Date()
  
  // Construire le location string à partir des données d'adresse
  const location = dto.address_formatted || 
    [dto.address_city, dto.address_country].filter(Boolean).join(', ') || 
    (dto.location_type === 'online' ? 'En ligne' : 
     dto.location_type === 'hybrid' ? 'Hybride' : 'Non spécifié')
  
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    startDate: dto.start_at, // Keep as ISO string
    endDate: dto.end_at,     // Keep as ISO string
    location: location,
    locationType: dto.location_type,
    maxAttendees: dto.capacity || 999999, // Si null, considérer comme illimité
    currentAttendees: 0, // TODO: À calculer depuis les registrations si disponible
    status: dto.status === 'archived' ? 'completed' : dto.status as any, // Map archived -> completed
    orgId: dto.org_id,
    createdAt: dto.created_at, // Keep as ISO string
    updatedAt: dto.updated_at, // Keep as ISO string
    createdBy: dto.created_by || '',
    tags: [], // TODO: À implémenter si le backend ajoute des tags
    partnerIds: [], // TODO: À implémenter
    metadata: {}, // TODO: À implémenter si le backend ajoute metadata
    settings: dto.settings, // Pass through settings including registration_fields
    
    // Computed properties (calculated from dates but stored as primitives)
    isActive: dto.status === 'published',
    isDraft: dto.status === 'draft',
    isCompleted: dto.status === 'archived',
    isFull: false, // TODO: Calculer quand currentAttendees sera disponible
    daysUntilStart: Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    duration: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)),
  }
}

/**
 * Maps CreateEventDPO to CreateEventDTO for API
 */
export const mapCreateEventDPOtoDTO = (dpo: CreateEventDPO): CreateEventDTO => {
  const dto: CreateEventDTO = {
    name: dpo.name,
    code: dpo.name.toLowerCase().replace(/\s+/g, '-').substring(0, 50), // Auto-generate code from name
    start_at: dpo.startDate, // Already ISO string from form
    end_at: dpo.endDate,     // Already ISO string from form
  }
  
  // Only include optional fields if they have values
  if (dpo.description) dto.description = dpo.description
  if (dpo.maxAttendees !== undefined) dto.capacity = dpo.maxAttendees
  // TODO: Mapper location vers address_formatted quand le formulaire sera mis à jour
  if (dpo.location) dto.address_formatted = dpo.location
  
  return dto
}

/**
 * Maps UpdateEventDPO to UpdateEventDTO for API
 */
export const mapUpdateEventDPOtoDTO = (dpo: UpdateEventDPO): UpdateEventDTO => {
  const dto: UpdateEventDTO = {}
  
  if (dpo.name) dto.name = dpo.name
  if (dpo.description !== undefined) dto.description = dpo.description
  if (dpo.startDate) dto.start_at = dpo.startDate
  if (dpo.endDate) dto.end_at = dpo.endDate
  if (dpo.maxAttendees !== undefined) dto.capacity = dpo.maxAttendees
  if (dpo.location) dto.address_formatted = dpo.location
  
  // Map status: completed -> archived pour le backend
  if (dpo.status) {
    dto.status = dpo.status === 'completed' ? 'archived' : 
                 dpo.status === 'active' ? 'published' : 
                 dpo.status as any
  }
  
  return dto
}
