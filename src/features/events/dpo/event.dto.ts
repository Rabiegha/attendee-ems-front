// Data Transfer Object - Raw API response structure
export interface EventDTO {
  id: string
  name: string
  description: string
  start_date: string // ISO string from API
  end_date: string // ISO string from API
  location: string
  max_attendees: number
  current_attendees: number
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled'
  org_id: string
  created_at: string
  updated_at: string
  created_by: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CreateEventDTO {
  name: string
  description?: string
  start_date: string
  end_date: string
  location?: string
  max_attendees?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  status?: EventDTO['status']
}
