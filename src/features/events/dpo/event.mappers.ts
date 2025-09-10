import type { EventDTO, CreateEventDTO, UpdateEventDTO } from './event.dto'
import type { EventDPO, CreateEventDPO, UpdateEventDPO } from './event.dpo'

/**
 * Maps EventDTO from API to EventDPO for client use
 */
export const mapEventDTOtoDPO = (dto: EventDTO): EventDPO => {
  const startDate = new Date(dto.start_date)
  const endDate = new Date(dto.end_date)
  const now = new Date()
  
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    startDate: dto.start_date, // Keep as ISO string
    endDate: dto.end_date,     // Keep as ISO string
    location: dto.location,
    maxAttendees: dto.max_attendees,
    currentAttendees: dto.current_attendees,
    status: dto.status,
    orgId: dto.org_id,
    createdAt: dto.created_at, // Keep as ISO string
    updatedAt: dto.updated_at, // Keep as ISO string
    createdBy: dto.created_by,
    tags: dto.tags || [],
    metadata: dto.metadata || {},
    
    // Computed properties (calculated from dates but stored as primitives)
    isActive: dto.status === 'active',
    isDraft: dto.status === 'draft',
    isCompleted: dto.status === 'completed',
    isFull: dto.current_attendees >= dto.max_attendees,
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
    start_date: dpo.startDate, // Already ISO string from form
    end_date: dpo.endDate,     // Already ISO string from form
  }
  
  // Only include optional fields if they have values
  if (dpo.description) dto.description = dpo.description
  if (dpo.location) dto.location = dpo.location
  if (dpo.maxAttendees !== undefined) dto.max_attendees = dpo.maxAttendees
  if (dpo.tags) dto.tags = dpo.tags
  if (dpo.metadata) dto.metadata = dpo.metadata
  
  return dto
}

/**
 * Maps UpdateEventDPO to UpdateEventDTO for API
 */
export const mapUpdateEventDPOtoDTO = (dpo: UpdateEventDPO): UpdateEventDTO => ({
  ...(dpo.name && { name: dpo.name }),
  ...(dpo.description && { description: dpo.description }),
  ...(dpo.startDate && { start_date: dpo.startDate }), // Already ISO string
  ...(dpo.endDate && { end_date: dpo.endDate }),       // Already ISO string
  ...(dpo.location && { location: dpo.location }),
  ...(dpo.maxAttendees && { max_attendees: dpo.maxAttendees }),
  ...(dpo.tags && { tags: dpo.tags }),
  ...(dpo.metadata && { metadata: dpo.metadata }),
  ...(dpo.status && { status: dpo.status }),
})
