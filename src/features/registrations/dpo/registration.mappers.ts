import type { RegistrationDTO } from './registration.dto'
import type { RegistrationDPO } from './registration.dpo'

export function mapRegistrationDTOtoDPO(dto: RegistrationDTO): RegistrationDPO {
  const result: RegistrationDPO = {
    id: dto.id,
    eventId: dto.event_id,
    attendeeId: dto.attendee_id,
    status: dto.status,
    formData: dto.form_data,
    registeredAt: dto.registered_at,
  }
  
  if (dto.updated_at !== undefined) {
    result.updatedAt = dto.updated_at
  }
  
  if (dto.attendee) {
    result.attendee = {
      id: dto.attendee.id,
      firstName: dto.attendee.first_name,
      lastName: dto.attendee.last_name,
      email: dto.attendee.email,
    }
    if (dto.attendee.phone !== undefined) result.attendee.phone = dto.attendee.phone
    if (dto.attendee.company !== undefined) result.attendee.company = dto.attendee.company
  }
  
  return result
}

export function mapRegistrationDPOtoDTO(dpo: RegistrationDPO): RegistrationDTO {
  const result: RegistrationDTO = {
    id: dpo.id,
    event_id: dpo.eventId,
    attendee_id: dpo.attendeeId,
    status: dpo.status,
    form_data: dpo.formData,
    registered_at: dpo.registeredAt,
  }
  
  if (dpo.updatedAt !== undefined) {
    result.updated_at = dpo.updatedAt
  }
  
  if (dpo.attendee) {
    result.attendee = {
      id: dpo.attendee.id,
      first_name: dpo.attendee.firstName,
      last_name: dpo.attendee.lastName,
      email: dpo.attendee.email,
    }
    if (dpo.attendee.phone !== undefined) result.attendee.phone = dpo.attendee.phone
    if (dpo.attendee.company !== undefined) result.attendee.company = dpo.attendee.company
  }
  
  return result
}

