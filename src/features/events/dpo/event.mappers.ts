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
    startDate,
    endDate,
    location: dto.location,
    maxAttendees: dto.max_attendees,
    currentAttendees: dto.current_attendees,
    status: dto.status,
    orgId: dto.org_id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    createdBy: dto.created_by,
    tags: dto.tags || [],
    metadata: dto.metadata || {},
    
    // Computed properties
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
    description: dpo.description,
    start_date: dpo.startDate.toISOString(),
    end_date: dpo.endDate.toISOString(),
    location: dpo.location,
    max_attendees: dpo.maxAttendees,
  }
  
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
  ...(dpo.startDate && { start_date: dpo.startDate.toISOString() }),
  ...(dpo.endDate && { end_date: dpo.endDate.toISOString() }),
  ...(dpo.location && { location: dpo.location }),
  ...(dpo.maxAttendees && { max_attendees: dpo.maxAttendees }),
  ...(dpo.tags && { tags: dpo.tags }),
  ...(dpo.metadata && { metadata: dpo.metadata }),
  ...(dpo.status && { status: dpo.status }),
})
