// DPO for frontend (camelCase)
export interface RegistrationDPO {
  id: string
  eventId: string
  attendeeId: string
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  formData: Record<string, any>
  registeredAt: string
  updatedAt?: string
  attendee?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    company?: string
  }
}
