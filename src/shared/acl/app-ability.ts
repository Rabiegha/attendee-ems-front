import { PureAbility, AbilityBuilder } from '@casl/ability'

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
  | 'all' // Special subject that represents all subjects

// Define the shape of our ability
export type AppAbility = PureAbility<[Actions, Subjects]>

// Helper type for CASL rules
export interface AppRule {
  action: Actions
  subject: Subjects
  conditions?: Record<string, any>
  fields?: string[]
  inverted?: boolean
  reason?: string
}

// Create a default ability (no permissions)
export const createAppAbility = (rules: AppRule[] = []): AppAbility => {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility)
  
  rules.forEach(rule => {
    if (rule.inverted) {
      cannot(rule.action, rule.subject, rule.conditions)
    } else {
      can(rule.action, rule.subject, rule.conditions)
    }
  })
  
  return build()
}

// Default empty ability
export const defaultAbility = createAppAbility([])

// Export subject helper for creating typed subjects
export { subject }
