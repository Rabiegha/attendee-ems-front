// Domain Presentation Object - Client-side domain model
export interface EventDPO {
  id: string
  name: string
  description: string
  startDate: string // ISO string for Redux serialization
  endDate: string // ISO string for Redux serialization
  location: string
  locationType: 'physical' | 'online' | 'hybrid'
  maxAttendees: number
  currentAttendees: number
  status: EventStatus
  orgId: string
  publicToken: string // Token for public registration forms
  createdAt: string // ISO string for Redux serialization
  updatedAt: string // ISO string for Redux serialization
  deletedAt: string | null // ISO string for soft delete
  createdBy: string
  tags: string[]
  partnerIds: string[]
  metadata: Record<string, any>
  websiteUrl?: string
  addressFormatted?: string
  addressStreet?: string
  addressCity?: string
  addressPostalCode?: string
  addressCountry?: string
  latitude?: number
  longitude?: number
  capacity?: number
  registrationAutoApprove?: boolean
  requireEmailVerification?: boolean
  confirmationEmailEnabled?: boolean
  approvalEmailEnabled?: boolean
  reminderEmailEnabled?: boolean
  badgeTemplateId?: string
  settings?: {
    registration_fields?: any[]
    [key: string]: any
  } | undefined
  // Computed properties
  isActive: boolean
  isDraft: boolean
  isCompleted: boolean
  isDeleted: boolean
  isFull: boolean
  daysUntilStart: number
  duration: number // in hours
}

export type EventStatus =
  | 'draft'
  | 'published'
  | 'registration_closed'
  | 'cancelled'
  | 'postponed'
  | 'archived'

export interface CreateEventDPO {
  name: string
  description?: string // Optionnel
  startDate: string // ISO string from form
  endDate: string // ISO string from form
  location?: string // Optionnel
  maxAttendees?: number // Optionnel (sans limite par défaut)
  status?: EventStatus // Optionnel (sera 'published' par défaut)
  tags?: string[]
  partnerIds?: string[]
  metadata?: Record<string, any>
  websiteUrl?: string
  addressFormatted?: string
  addressStreet?: string
  addressCity?: string
  addressPostalCode?: string
  addressCountry?: string
  latitude?: number
  longitude?: number
  capacity?: number
  registrationAutoApprove?: boolean
  requireEmailVerification?: boolean
  confirmationEmailEnabled?: boolean
  approvalEmailEnabled?: boolean
  reminderEmailEnabled?: boolean
  badgeTemplateId?: string
}

export interface UpdateEventDPO extends Partial<CreateEventDPO> {
  status?: EventStatus
  badgeTemplateId?: string
}
