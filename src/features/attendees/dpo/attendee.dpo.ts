// Domain Presentation Object - Client-side domain model
export interface AttendeeDPO {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  status: AttendeeStatus
  eventId: string
  orgId: string
  registrationDate: Date
  checkedInAt?: Date
  checkedInBy?: string
  metadata?: Record<string, any>
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  
  // Computed properties
  displayName: string
  isCheckedIn: boolean
  isConfirmed: boolean
  isPending: boolean
  canCheckIn: boolean
}

export type AttendeeStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'no_show'

export interface CreateAttendeeDPO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  eventId: string
  metadata?: Record<string, any>
  tags?: string[]
}

export interface UpdateAttendeeDPO extends Partial<CreateAttendeeDPO> {
  status?: AttendeeStatus
}

export interface UpdateAttendeeStatusDPO {
  status: AttendeeStatus
  checkedInBy?: string
}
