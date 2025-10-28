// Data Transfer Object - Raw API response structure
export interface AttendeeDTO {
  id: string
  org_id: string
  default_type_id?: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  company?: string
  job_title?: string
  country?: string
  metadata?: Record<string, any>
  labels?: string[]
  notes?: string
  is_active: boolean
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
  country?: string
  metadata?: Record<string, any>
  labels?: string[]
}

export interface UpdateAttendeeDTO extends Partial<CreateAttendeeDTO> {
  is_active?: boolean
}

export interface UpdateAttendeeStatusDTO {
  is_active: boolean
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
