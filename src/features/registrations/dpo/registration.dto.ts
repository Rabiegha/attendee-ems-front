// DTO from API (snake_case)
export interface RegistrationDTO {
  id: string
  org_id: string
  event_id: string
  attendee_id: string
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  attendance_type: 'onsite' | 'online' | 'hybrid'
  answers: Record<string, any> | null
  event_attendee_type_id?: string | null
  badge_template_id?: string | null
  invited_at?: string | null
  confirmed_at?: string | null
  created_at: string
  updated_at: string
  attendee?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    company?: string
    job_title?: string
    country?: string
  }
}
