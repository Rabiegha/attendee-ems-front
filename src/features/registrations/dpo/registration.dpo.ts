// DPO for frontend (camelCase)
export interface RegistrationDPO {
  id: string
  orgId: string
  eventId: string
  attendeeId: string
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  attendanceType: 'onsite' | 'online' | 'hybrid'
  answers: Record<string, any> | null
  eventAttendeeTypeId?: string | null
  eventAttendeeType?: {
    id: string
    color_hex?: string | null
    attendeeType: {
      id: string
      name: string
      color_hex: string
    }
  } | null
  badgeTemplateId?: string | null
  invitedAt?: string | null
  confirmedAt?: string | null
  createdAt: string // Date d'inscription
  updatedAt: string
  deletedAt?: string | null
  source: 'public_form' | 'test_form' | 'manual' | 'import' | 'mobile_app'
  comment?: string | null
  
  // Snapshot fields (données figées au moment de l'inscription)
  snapshot_first_name?: string | null
  snapshot_last_name?: string | null
  snapshot_email?: string | null
  snapshot_phone?: string | null
  snapshot_company?: string | null
  snapshot_job_title?: string | null
  snapshot_country?: string | null
  
  // Badge URLs (générés par le backend)
  badgePdfUrl?: string | null
  badgeImageUrl?: string | null
  
  // Check-in tracking
  checkedInAt?: string | null // ISO date
  checkedInBy?: string | null // User ID
  checkinLocation?: {
    lat: number
    lng: number
  } | null
  
  attendee?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    company?: string
    jobTitle?: string
    country?: string
  }
}
