// Data Transfer Object - Raw API response structure (matches backend exactly)
export interface EventDTO {
  id: string
  name: string
  code: string
  description: string | null
  start_at: string // ISO string from API
  end_at: string // ISO string from API
  timezone: string
  status: 'draft' | 'published' | 'archived'
  capacity: number | null
  location_type: 'physical' | 'online' | 'hybrid'
  public_token: string // For public registration forms
  address_formatted: string | null
  address_street: string | null
  address_city: string | null
  address_region: string | null
  address_postal_code: string | null
  address_country: string | null
  latitude: string | null
  longitude: string | null
  place_id: string | null
  org_id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  created_by: string | null
  org_activity_sector_id: string | null
  org_event_type_id: string | null
  // Relations (optionnelles selon l'include)
  settings?: {
    public_token?: string
    website_url?: string
    registration_auto_approve?: boolean
    registration_fields?: any[]
    [key: string]: any
  }
  emailSettings?: {
    require_email_verification?: boolean
    confirmation_enabled?: boolean
    approval_enabled?: boolean
    reminder_enabled?: boolean
    [key: string]: any
  }
  activitySector?: any
  eventType?: any
  eventTags?: Array<{
    tag: {
      id: string
      name: string
      color?: string | null
    }
  }>
  _count?: {
    registrations: number
  }
}

export interface CreateEventDTO {
  name: string
  code: string
  description?: string
  start_at: string
  end_at: string
  timezone?: string
  capacity?: number
  location_type?: 'physical' | 'online' | 'hybrid'
  address_formatted?: string
  address_street?: string
  address_city?: string
  address_postal_code?: string
  address_country?: string
  latitude?: number
  longitude?: number
  org_activity_sector_id?: string
  org_event_type_id?: string
  assigned_user_ids?: string[]
  tags?: string[]
  website_url?: string
  registration_auto_approve?: boolean
  require_email_verification?: boolean
  confirmation_enabled?: boolean
  approval_enabled?: boolean
  reminder_enabled?: boolean
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventDTO['status']
}
