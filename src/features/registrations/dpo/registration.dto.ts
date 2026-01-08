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
  eventAttendeeType?: {
    id: string
    color_hex?: string | null
    text_color_hex?: string | null
    attendeeType: {
      id: string
      name: string
      color_hex: string
      text_color_hex: string | null
    }
  } | null
  badge_template_id?: string | null
  invited_at?: string | null
  confirmed_at?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  source?: 'public_form' | 'test_form' | 'manual' | 'import'
  
  // Snapshot fields (données figées au moment de l'inscription)
  snapshot_first_name?: string | null
  snapshot_last_name?: string | null
  snapshot_email?: string | null
  snapshot_phone?: string | null
  snapshot_company?: string | null
  snapshot_job_title?: string | null
  snapshot_country?: string | null
  
  // Badge URLs (générés par le backend)
  badge_pdf_url?: string | null
  badge_image_url?: string | null
  
  // Check-in tracking
  checked_in_at?: string | null // ISO date
  checked_in_by?: string | null // User ID
  checkin_location?: {
    lat: number
    lng: number
  } | null
  
  // Check-out tracking (when participant leaves)
  checked_out_at?: string | null // ISO date
  checked_out_by?: string | null // User ID
  checkout_location?: {
    lat: number
    lng: number
  } | null
  
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
