import type {
  AttendeeDTO,
  CreateAttendeeDTO,
  UpdateAttendeeDTO,
} from './attendee.dto'
import type {
  AttendeeDPO,
  CreateAttendeeDPO,
  UpdateAttendeeDPO,
} from './attendee.dpo'

/**
 * Maps AttendeeDTO from API to AttendeeDPO for client use
 */
export const mapAttendeeDTOtoDPO = (dto: AttendeeDTO): AttendeeDPO => {
  const dpo: AttendeeDPO = {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    orgId: dto.org_id,
    registrationDate: dto.created_at, // Use created_at as registration date
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,

    // Statistics - always defined even if 0
    totalEvents: dto.statistics?.total_events ?? 0,
    totalRegistrations: dto.statistics?.total_registrations ?? 0,
    checkedInCount: dto.statistics?.checked_in ?? 0,

    // Computed properties
    displayName: `${dto.first_name} ${dto.last_name}`.trim() || dto.email,
    canCheckIn: dto.is_active, // Active users can check in
  }
  
  // Optional fields
  if (dto.statistics?.last_event_at) dpo.lastEventAt = dto.statistics.last_event_at

  if (dto.phone) dpo.phone = dto.phone
  if (dto.company) dpo.company = dto.company
  if (dto.job_title) dpo.jobTitle = dto.job_title
  if (dto.country) dpo.country = dto.country
  if (dto.metadata) dpo.metadata = dto.metadata
  if (dto.labels) dpo.labels = dto.labels

  return dpo
}

/**
 * Maps CreateAttendeeDPO to CreateAttendeeDTO for API
 */
export const mapCreateAttendeeDPOtoDTO = (
  dpo: CreateAttendeeDPO
): CreateAttendeeDTO => {
  const dto: CreateAttendeeDTO = {
    first_name: dpo.firstName,
    last_name: dpo.lastName,
    email: dpo.email,
  }

  if (dpo.phone) dto.phone = dpo.phone
  if (dpo.company) dto.company = dpo.company
  if (dpo.jobTitle) dto.job_title = dpo.jobTitle
  if (dpo.country) dto.country = dpo.country
  if (dpo.metadata) dto.metadata = dpo.metadata
  if (dpo.labels) dto.labels = dpo.labels

  return dto
}

/**
 * Maps UpdateAttendeeDPO to UpdateAttendeeDTO for API
 */
export const mapUpdateAttendeeDPOtoDTO = (
  dpo: UpdateAttendeeDPO
): UpdateAttendeeDTO => ({
  ...(dpo.firstName && { first_name: dpo.firstName }),
  ...(dpo.lastName && { last_name: dpo.lastName }),
  ...(dpo.email && { email: dpo.email }),
  ...(dpo.phone !== undefined && { phone: dpo.phone }),
  ...(dpo.company !== undefined && { company: dpo.company }),
  ...(dpo.jobTitle !== undefined && { job_title: dpo.jobTitle }),
  ...(dpo.country !== undefined && { country: dpo.country }),
  ...(dpo.metadata && { metadata: dpo.metadata }),
  ...(dpo.labels && { labels: dpo.labels }),
  ...(dpo.isActive !== undefined && { is_active: dpo.isActive }),
})
