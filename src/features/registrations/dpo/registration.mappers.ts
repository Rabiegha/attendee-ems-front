import type { RegistrationDTO } from './registration.dto'
import type { RegistrationDPO } from './registration.dpo'

export function mapRegistrationDTOtoDPO(dto: RegistrationDTO): RegistrationDPO {
  const result: RegistrationDPO = {
    id: dto.id,
    orgId: dto.org_id,
    eventId: dto.event_id,
    attendeeId: dto.attendee_id,
    status: dto.status,
    attendanceType: dto.attendance_type,
    answers: dto.answers,
    eventAttendeeTypeId: dto.event_attendee_type_id || null,
    badgeTemplateId: dto.badge_template_id || null,
    invitedAt: dto.invited_at || null,
    confirmedAt: dto.confirmed_at || null,
    createdAt: dto.created_at, // Date d'inscription réelle
    updatedAt: dto.updated_at,
    source: dto.source || 'public_form',
    
    // Snapshot fields
    snapshot_first_name: dto.snapshot_first_name || null,
    snapshot_last_name: dto.snapshot_last_name || null,
    snapshot_email: dto.snapshot_email || null,
    snapshot_phone: dto.snapshot_phone || null,
    snapshot_company: dto.snapshot_company || null,
    snapshot_job_title: dto.snapshot_job_title || null,
    snapshot_country: dto.snapshot_country || null,
    
    // Badge URLs
    badgePdfUrl: dto.badge_pdf_url || null,
    badgeImageUrl: dto.badge_image_url || null,
    
    // Check-in tracking
    checkedInAt: dto.checked_in_at || null,
    checkedInBy: dto.checked_in_by || null,
    checkinLocation: dto.checkin_location || null,
  }

  if (dto.attendee) {
    result.attendee = {
      id: dto.attendee.id,
      firstName: dto.attendee.first_name,
      lastName: dto.attendee.last_name,
      email: dto.attendee.email,
    }
    if (dto.attendee.phone !== undefined)
      result.attendee.phone = dto.attendee.phone
    if (dto.attendee.company !== undefined)
      result.attendee.company = dto.attendee.company
    if (dto.attendee.job_title !== undefined)
      result.attendee.jobTitle = dto.attendee.job_title
    if (dto.attendee.country !== undefined)
      result.attendee.country = dto.attendee.country
  }

  return result
}

export function mapRegistrationDPOtoDTO(dpo: RegistrationDPO): RegistrationDTO {
  const result: RegistrationDTO = {
    id: dpo.id,
    org_id: dpo.orgId,
    event_id: dpo.eventId,
    attendee_id: dpo.attendeeId,
    status: dpo.status,
    attendance_type: dpo.attendanceType,
    answers: dpo.answers,
    event_attendee_type_id: dpo.eventAttendeeTypeId || null,
    badge_template_id: dpo.badgeTemplateId || null,
    invited_at: dpo.invitedAt || null,
    confirmed_at: dpo.confirmedAt || null,
    created_at: dpo.createdAt,
    updated_at: dpo.updatedAt,
  }

  if (dpo.attendee) {
    result.attendee = {
      id: dpo.attendee.id,
      first_name: dpo.attendee.firstName,
      last_name: dpo.attendee.lastName,
      email: dpo.attendee.email,
    }
    if (dpo.attendee.phone !== undefined)
      result.attendee.phone = dpo.attendee.phone
    if (dpo.attendee.company !== undefined)
      result.attendee.company = dpo.attendee.company
    if (dpo.attendee.jobTitle !== undefined)
      result.attendee.job_title = dpo.attendee.jobTitle
    if (dpo.attendee.country !== undefined)
      result.attendee.country = dpo.attendee.country
  }

  return result
}
