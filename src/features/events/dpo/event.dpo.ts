// Domain Presentation Object - Client-side domain model
export interface EventDPO {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  maxAttendees: number
  currentAttendees: number
  status: EventStatus
  orgId: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  tags: string[]
  metadata: Record<string, any>
  // Computed properties
  isActive: boolean
  isDraft: boolean
  isCompleted: boolean
  isFull: boolean
  daysUntilStart: number
  duration: number // in hours
}

export type EventStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled'

export interface CreateEventDPO {
  name: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  maxAttendees: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateEventDPO extends Partial<CreateEventDPO> {
  status?: EventStatus
}
