import { MongoAbility, createMongoAbility } from '@casl/ability'

// Define all possible actions in the system
export type Actions =
  | 'manage'
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
  | 'scan'
  | 'check-in'
  | 'assign'
  | 'view-all'
  | 'approve'

// Define all possible subjects (resources) in the system
export type Subjects =
  | 'Organization'
  | 'Event'
  | 'Subevent'
  | 'Attendee'
  | 'AttendeeType'
  | 'User'
  | 'Badge'
  | 'Scan'
  | 'Report'
  | 'Settings'
  | 'QRCode'
  | 'Role'
  | 'Permission'
  | 'Invitation'
  | 'Invoice'
  | 'Registration'
  | 'Analytics'
  | 'all'

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
