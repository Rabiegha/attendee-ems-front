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
  badgeTemplateId?: string | null
  invitedAt?: string | null
  confirmedAt?: string | null
  createdAt: string // Date d'inscription
  updatedAt: string
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
