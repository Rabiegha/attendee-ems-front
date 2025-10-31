import type { RegistrationDTO } from '../dpo/registration.dto'
import type { RegistrationDPO } from '../dpo/registration.dpo'

/**
 * Helper functions to get registration data with snapshot fallback
 * Priority: snapshot fields (if exist) > attendee fields (if exist) > empty string
 */

type RegistrationData = RegistrationDTO | RegistrationDPO

export const getRegistrationFirstName = (registration: RegistrationData): string => {
  if (registration.snapshot_first_name) return registration.snapshot_first_name
  if ('attendee' in registration && registration.attendee) {
    const attendee = registration.attendee as any
    return attendee.firstName || attendee.first_name || ''
  }
  return ''
}

export const getRegistrationLastName = (registration: RegistrationData): string => {
  if (registration.snapshot_last_name) return registration.snapshot_last_name
  if ('attendee' in registration && registration.attendee) {
    const attendee = registration.attendee as any
    return attendee.lastName || attendee.last_name || ''
  }
  return ''
}

export const getRegistrationFullName = (registration: RegistrationData): string => {
  const firstName = getRegistrationFirstName(registration)
  const lastName = getRegistrationLastName(registration)
  return `${firstName} ${lastName}`.trim() || 'N/A'
}

export const getRegistrationEmail = (registration: RegistrationData): string => {
  if (registration.snapshot_email) return registration.snapshot_email
  if ('attendee' in registration && registration.attendee) {
    return registration.attendee.email || ''
  }
  return ''
}

export const getRegistrationPhone = (registration: RegistrationData): string => {
  if (registration.snapshot_phone) return registration.snapshot_phone
  if ('attendee' in registration && registration.attendee) {
    return registration.attendee.phone || ''
  }
  return ''
}

export const getRegistrationCompany = (registration: RegistrationData): string => {
  if (registration.snapshot_company) return registration.snapshot_company
  if ('attendee' in registration && registration.attendee) {
    return registration.attendee.company || ''
  }
  return ''
}

export const getRegistrationJobTitle = (registration: RegistrationData): string => {
  if (registration.snapshot_job_title) return registration.snapshot_job_title
  if ('attendee' in registration && registration.attendee) {
    const attendee = registration.attendee as any
    return attendee.jobTitle || attendee.job_title || ''
  }
  return ''
}

export const getRegistrationCountry = (registration: RegistrationData): string => {
  if (registration.snapshot_country) return registration.snapshot_country
  if ('attendee' in registration && registration.attendee) {
    return registration.attendee.country || ''
  }
  return ''
}
