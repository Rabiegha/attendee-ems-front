/**
 * Types complets pour Events & Registrations
 * Compatible avec la spec API backend
 */

// ========== EVENT TYPES ==========

export type EventStatus =
  | 'draft'
  | 'published'
  | 'registration_closed'
  | 'cancelled'
  | 'postponed'
  | 'archived'
export type LocationType = 'physical' | 'online' | 'hybrid'
export type AttendanceMode = 'onsite' | 'online' | 'hybrid'

// Champ de formulaire d'inscription
export interface RegistrationField {
  name: string
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
  label: string
  required: boolean
  enabled: boolean
  placeholder?: string
  custom?: boolean // true si champ custom (stocké dans answers)
  options?: string[] // Pour select/multiselect
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

// Configuration des champs d'inscription
export interface RegistrationFieldsConfig {
  fields: RegistrationField[]
}

// Settings d'un événement
export interface EventSettings {
  public_token?: string
  website_url?: string
  logo_asset_id?: string
  attendance_mode?: AttendanceMode
  registration_auto_approve?: boolean
  allow_checkin_out?: boolean
  auto_transition_to_active?: boolean
  auto_transition_to_completed?: boolean
  registration_fields?: RegistrationFieldsConfig
  submit_button_text?: string
  submit_button_color?: string
  show_title?: boolean
  show_description?: boolean
  is_dark_mode?: boolean
}

// Statistiques d'un événement
export interface EventStatistics {
  total_registrations: number
  approved: number
  awaiting: number
  refused: number
  cancelled: number
  checked_in?: number
  attendance_rate?: number
}

// Location d'un événement
export interface EventLocation {
  type: LocationType
  formatted?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
}

// Événement complet
export interface Event {
  id: string
  org_id: string
  code: string
  name: string
  description?: string
  start_at: string
  end_at: string
  timezone: string
  status: EventStatus
  capacity?: number | null

  // Location
  location_type?: LocationType
  address_formatted?: string
  address_street?: string
  address_city?: string
  address_region?: string
  address_postal_code?: string
  address_country?: string
  latitude?: number
  longitude?: number
  place_id?: string

  // Références
  org_activity_sector_id?: string
  org_event_type_id?: string
  created_by?: string

  // Settings
  settings?: EventSettings

  // Statistiques
  statistics?: EventStatistics

  // Timestamps
  created_at: string
  updated_at: string
}

// DTO pour créer un événement
export interface CreateEventDTO {
  code: string
  name: string
  description?: string
  start_at: string
  end_at: string
  timezone?: string
  status?: EventStatus
  capacity?: number | null

  location?: {
    type: LocationType
    address_formatted?: string
    address_city?: string
    address_country?: string
    latitude?: number
    longitude?: number
  }

  org_activity_sector_id?: string
  org_event_type_id?: string

  settings?: {
    website_url?: string
    attendance_mode?: AttendanceMode
    registration_auto_approve?: boolean
    allow_checkin_out?: boolean
    auto_transition_to_active?: boolean
    auto_transition_to_completed?: boolean
    registration_fields?: RegistrationFieldsConfig
  }

  partner_ids?: string[]
  org_id?: string // SUPER_ADMIN seulement
}

// DTO pour mettre à jour un événement
export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  // Tous les champs optionnels
}

// ========== REGISTRATION TYPES ==========

export type RegistrationStatus =
  | 'awaiting'
  | 'approved'
  | 'refused'
  | 'cancelled'
export type AttendanceType = 'online' | 'onsite' | 'hybrid'

// Registration complète
export interface Registration {
  id: string
  org_id: string
  event_id: string
  attendee_id: string
  status: RegistrationStatus
  attendance_type?: AttendanceType
  answers?: Record<string, any> // Réponses aux champs custom
  event_attendee_type_id?: string
  badge_template_id?: string
  invited_at?: string
  confirmed_at?: string
  created_at: string
  updated_at: string

  // Relations (peuplées par l'API)
  attendee?: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
    company: string | null
    job_title: string | null
  }
  event_attendee_type?: {
    id: string
    display_name: string
    color_hex: string
    text_color_hex?: string
  }

  // Infos supplémentaires
  confirmation_number?: string
  checked_in?: boolean
  checked_in_at?: string
}

// DTO pour inscription publique
export interface PublicRegisterDTO {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  attendance_type?: AttendanceType
  answers?: Record<string, any>
}

// Response inscription publique
export interface PublicRegisterResponse {
  success: boolean
  message: string
  registration: {
    id: string
    status: RegistrationStatus
    attendee: {
      id: string
      first_name: string
      last_name: string
      email: string
    }
    confirmation_number: string
    registered_at: string
  }
}

// DTO pour changer le statut d'une registration
export interface UpdateRegistrationStatusDTO {
  status: RegistrationStatus
  reason?: string
}
