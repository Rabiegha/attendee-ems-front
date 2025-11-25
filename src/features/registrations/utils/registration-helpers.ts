import type { RegistrationDTO } from '../dpo/registration.dto'
import type { RegistrationDPO } from '../dpo/registration.dpo'

/**
 * Helper functions to get registration data with snapshot fallback
 * Priority: snapshot fields (if exist) > attendee fields (if exist) > empty string
 */

type RegistrationData = RegistrationDTO | RegistrationDPO

export const getRegistrationFirstName = (registration: RegistrationData): string => {
  return registration.snapshot_first_name || ''
}

export const getRegistrationLastName = (registration: RegistrationData): string => {
  return registration.snapshot_last_name || ''
}

export const getRegistrationFullName = (registration: RegistrationData): string => {
  const firstName = getRegistrationFirstName(registration)
  const lastName = getRegistrationLastName(registration)
  return `${firstName} ${lastName}`.trim() || 'N/A'
}

export const getRegistrationEmail = (registration: RegistrationData): string => {
  return registration.snapshot_email || ''
}

export const getRegistrationPhone = (registration: RegistrationData): string => {
  return registration.snapshot_phone || ''
}

export const getRegistrationCompany = (registration: RegistrationData): string => {
  return registration.snapshot_company || ''
}

export const getRegistrationJobTitle = (registration: RegistrationData): string => {
  return registration.snapshot_job_title || ''
}

export const getRegistrationCountry = (registration: RegistrationData): string => {
  return registration.snapshot_country || ''
}
