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
  created_by: string | null
  org_activity_sector_id: string | null
  org_event_type_id: string | null
  // Relations (optionnelles selon l'include)
  settings?: any
  activitySector?: any
  eventType?: any
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
  org_activity_sector_id?: string
  org_event_type_id?: string
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventDTO['status']
}
