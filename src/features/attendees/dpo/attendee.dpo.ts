// Domain Presentation Object - Client-side domain model
export interface AttendeeDPO {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  country?: string
  orgId: string
  registrationDate: string // ISO string for Redux serialization (created_at)
  metadata?: Record<string, any>
  labels?: string[]
  isActive: boolean
  createdAt: string // ISO string for Redux serialization
  updatedAt: string // ISO string for Redux serialization

  // Statistics - always defined
  totalEvents: number
  totalRegistrations: number
  checkedInCount: number
  lastEventAt?: string

  // Computed properties
  displayName: string
  canCheckIn: boolean
}

export interface CreateAttendeeDPO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  country?: string
  metadata?: Record<string, any>
  labels?: string[]
}

export interface UpdateAttendeeDPO extends Partial<CreateAttendeeDPO> {
  isActive?: boolean
}
