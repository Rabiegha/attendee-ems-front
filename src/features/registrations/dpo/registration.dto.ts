// DTO from API (snake_case)
export interface RegistrationDTO {
  id: string
  event_id: string
  attendee_id: string
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  form_data: Record<string, any>
  registered_at: string
  updated_at?: string
  attendee?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    company?: string
  }
}
