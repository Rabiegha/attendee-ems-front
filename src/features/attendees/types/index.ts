/**
 * Types pour le module Attendees (CRM)
 */

// Attendee complet (profil CRM)
export interface Attendee {
  id: string
  org_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  company: string | null
  job_title: string | null
  country: string | null
  metadata?: Record<string, any> | null
  default_type_id: string | null
  labels: string[] | null
  notes: string | null
  statistics: AttendeeStatistics
  created_at: string
  updated_at: string
}

// Statistiques pré-calculées pour un attendee
export interface AttendeeStatistics {
  total_events: number
  total_registrations: number
  approved: number
  awaiting: number
  refused: number
  checked_in: number
  attendance_rate: number
  last_event_at?: string
  first_event_at?: string
}

// Création d'attendee (depuis formulaire public)
export interface CreateAttendeeDTO {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
}

// Mise à jour attendee (CRM)
export interface UpdateAttendeeDTO {
  first_name?: string
  last_name?: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  default_type_id?: string | null
  labels?: string[]
  notes?: string
}

// Historique des registrations d'un attendee
export interface AttendeeRegistrationHistory {
  id: string
  event: {
    id: string
    code: string
    name: string
    start_at: string
  }
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  attendance_type: 'online' | 'onsite' | 'hybrid'
  registered_at: string
  checked_in: boolean
  checked_in_at?: string
}

// Profil complet avec historique
export interface AttendeeProfile extends Attendee {
  registrations_history: AttendeeRegistrationHistory[]
}
