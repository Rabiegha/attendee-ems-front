import type { AttendeeDTO, CreateAttendeeDTO, UpdateAttendeeDTO, UpdateAttendeeStatusDTO } from './attendee.dto'
import type { AttendeeDPO, CreateAttendeeDPO, UpdateAttendeeDPO, UpdateAttendeeStatusDPO } from './attendee.dpo'

/**
 * Maps AttendeeDTO from API to AttendeeDPO for client use
 */
export const mapAttendeeDTOtoDPO = (dto: AttendeeDTO): AttendeeDPO => {
  const dpo: AttendeeDPO = {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    status: dto.status,
    eventId: dto.event_id,
    orgId: dto.org_id,
    registrationDate: dto.registration_date, // Keep as ISO string
    createdAt: dto.created_at,               // Keep as ISO string
    updatedAt: dto.updated_at,               // Keep as ISO string
    
    // Computed properties
    displayName: `${dto.first_name} ${dto.last_name}`,
    isCheckedIn: dto.status === 'checked_in',
    isConfirmed: dto.status === 'confirmed',
    isPending: dto.status === 'pending',
    canCheckIn: dto.status === 'confirmed',
  }
  
  if (dto.checked_in_at) dpo.checkedInAt = dto.checked_in_at // Keep as ISO string
  if (dto.checked_in_by) dpo.checkedInBy = dto.checked_in_by
  if (dto.phone) dpo.phone = dto.phone
  if (dto.company) dpo.company = dto.company
  if (dto.job_title) dpo.jobTitle = dto.job_title
  if (dto.metadata) dpo.metadata = dto.metadata
  if (dto.tags) dpo.tags = dto.tags
  
  return dpo
}

/**
 * Maps CreateAttendeeDPO to CreateAttendeeDTO for API
 */
export const mapCreateAttendeeDPOtoDTO = (dpo: CreateAttendeeDPO): CreateAttendeeDTO => {
  const dto: CreateAttendeeDTO = {
    first_name: dpo.firstName,
    last_name: dpo.lastName,
    email: dpo.email,
    event_id: dpo.eventId,
  }
  
  if (dpo.phone) dto.phone = dpo.phone
  if (dpo.company) dto.company = dpo.company
  if (dpo.jobTitle) dto.job_title = dpo.jobTitle
  if (dpo.metadata) dto.metadata = dpo.metadata
  if (dpo.tags) dto.tags = dpo.tags
  
  return dto
}

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
export const mapUpdateAttendeeStatusDPOtoDTO = (dpo: UpdateAttendeeStatusDPO): UpdateAttendeeStatusDTO => {
  const dto: UpdateAttendeeStatusDTO = {
    status: dpo.status,
  }
  
  if (dpo.checkedInBy) dto.checked_in_by = dpo.checkedInBy
  
  return dto
}
