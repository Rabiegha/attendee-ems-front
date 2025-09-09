// Data Transfer Object - Raw API response structure
export interface AttendeeDTO {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'no_show'
  event_id: string
  org_id: string
  registration_date: string
  checked_in_at?: string
  checked_in_by?: string
  metadata?: Record<string, any>
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface CreateAttendeeDTO {
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  event_id: string
  metadata?: Record<string, any>
  tags?: string[]
}

export interface UpdateAttendeeDTO extends Partial<CreateAttendeeDTO> {
  status?: AttendeeDTO['status']
}

export interface UpdateAttendeeStatusDTO {
  status: AttendeeDTO['status']
  checked_in_by?: string
}

export interface AttendeesListResponse {
  attendees: AttendeeDTO[]
  total: number
  page: number
  limit: number
}

export interface ExportAttendeesResponse {
  downloadUrl: string
  filename: string
  expiresAt: string
}
