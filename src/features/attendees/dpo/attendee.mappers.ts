import type { AttendeeDTO, CreateAttendeeDTO, UpdateAttendeeDTO, UpdateAttendeeStatusDTO } from './attendee.dto'
import type { AttendeeDPO, CreateAttendeeDPO, UpdateAttendeeDPO, UpdateAttendeeStatusDPO } from './attendee.dpo'

/**
 * Maps AttendeeDTO from API to AttendeeDPO for client use
 */
export const mapAttendeeDTOtoDPO = (dto: AttendeeDTO): AttendeeDPO => {
  const fullName = `${dto.first_name} ${dto.last_name}`.trim()
  
  return {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    phone: dto.phone,
    company: dto.company,
    jobTitle: dto.job_title,
    status: dto.status,
    eventId: dto.event_id,
    orgId: dto.org_id,
    registrationDate: new Date(dto.registration_date),
    checkedInAt: dto.checked_in_at ? new Date(dto.checked_in_at) : undefined,
    checkedInBy: dto.checked_in_by,
    metadata: dto.metadata || {},
    tags: dto.tags || [],
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    
    // Computed properties
    fullName,
    isCheckedIn: dto.status === 'checked_in',
    isPending: dto.status === 'pending',
    isConfirmed: dto.status === 'confirmed',
    canCheckIn: dto.status === 'confirmed' || dto.status === 'pending',
  }
}

/**
 * Maps CreateAttendeeDPO to CreateAttendeeDTO for API
 */
export const mapCreateAttendeeDPOtoDTO = (dpo: CreateAttendeeDPO): CreateAttendeeDTO => ({
  first_name: dpo.firstName,
  last_name: dpo.lastName,
  email: dpo.email,
  phone: dpo.phone,
  company: dpo.company,
  job_title: dpo.jobTitle,
  event_id: dpo.eventId,
  metadata: dpo.metadata,
  tags: dpo.tags,
})

/**
 * Maps UpdateAttendeeDPO to UpdateAttendeeDTO for API
 */
export const mapUpdateAttendeeDPOtoDTO = (dpo: UpdateAttendeeDPO): UpdateAttendeeDTO => ({
  ...(dpo.firstName && { first_name: dpo.firstName }),
  ...(dpo.lastName && { last_name: dpo.lastName }),
  ...(dpo.email && { email: dpo.email }),
  ...(dpo.phone !== undefined && { phone: dpo.phone }),
  ...(dpo.company !== undefined && { company: dpo.company }),
  ...(dpo.jobTitle !== undefined && { job_title: dpo.jobTitle }),
  ...(dpo.eventId && { event_id: dpo.eventId }),
  ...(dpo.metadata && { metadata: dpo.metadata }),
  ...(dpo.tags && { tags: dpo.tags }),
  ...(dpo.status && { status: dpo.status }),
})

/**
 * Maps UpdateAttendeeStatusDPO to UpdateAttendeeStatusDTO for API
 */
export const mapUpdateAttendeeStatusDPOtoDTO = (dpo: UpdateAttendeeStatusDPO): UpdateAttendeeStatusDTO => ({
  status: dpo.status,
  checked_in_by: dpo.checkedInBy,
})
