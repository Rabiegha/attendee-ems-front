import { MongoAbility, createMongoAbility } from '@casl/ability'

// Define all possible actions in the system
export type Actions =
  | 'manage' // Special action that represents all actions
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'checkin'
  | 'export'
  | 'invite'
  | 'approve'
  | 'refuse'
  | 'print'
  | 'scan' // Scan QR codes (HOTESSE)
  | 'check-in' // Check-in attendees (HOTESSE)
  | 'assign' // Assign users to events/roles
  | 'view-all' // View all resources in organization (vs assigned only)
  | 'approve' // Approve invoices/payments

// Define all possible subjects (resources) in the system
export type Subjects =
  | 'Organization'
  | 'Event'
  | 'Subevent'
  | 'Attendee'
  | 'User'
  | 'Badge'
  | 'Scan'
  | 'Report'
  | 'Settings'
  | 'QRCode' // QR code scanning (HOTESSE)
  | 'Role' // Role management (future)
  | 'Permission' // Permission management (future)
  | 'Invitation' // Invitation management
  | 'Invoice' // Invoice management
  | 'all' // Special subject that represents all subjects

// Define the shape of our ability using MongoAbility for conditions support
export type AppAbility = MongoAbility<[Actions, Subjects]>

// Helper type for CASL rules
export interface AppRule {
  action: Actions
  subject: Subjects
  conditions?: Record<string, any>
  fields?: string[]
  inverted?: boolean
  reason?: string
}

// Create a default ability with MongoDB-style conditions matcher
export const createAppAbility = (rules: AppRule[] = []): AppAbility => {
  return createMongoAbility<AppAbility>(rules)
}

// Default empty ability
export const defaultAbility = createAppAbility([])
