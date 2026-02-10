/**
 * Maps backend permissions in "code:scope" format to CASL rules
 * This allows creating abilities directly from JWT permissions without API calls
 */

import type { AppRule, Actions, Subjects } from './app-ability'

/**
 * Maps permissions from JWT token to CASL rules
 * @param permissions Array of permissions in "code:scope" format (e.g., "events.read:org")
 * @param userId Current user ID for "own" scope conditions
 * @param orgId Current organization ID for "org" scope conditions
 * @returns Array of CASL rules
 */
export function mapPermissionsToCASlRules(
  permissions: string[],
  userId: string,
  orgId: string
): AppRule[] {
  const rules: AppRule[] = []
  
  // Debug: log all received permissions
  console.log('[PermissionMapper] Received permissions:', permissions)
  
  // Track which resources have full CRUD permissions by scope
  const resourcePermissions: Record<string, Record<string, Set<string>>> = {}

  permissions.forEach((permission) => {
    // Parse permission format: "resource.action:scope" or "resource.action:scope:extra"
    const parts = permission.split(':')
    if (parts.length < 2) {
      console.warn(
        `[PermissionMapper] Invalid permission format: ${permission}`
      )
      return
    }

    // Take only first two parts, ignore extra (e.g., :none suffix)
    const [codeWithAction, scope] = parts

    if (!codeWithAction || !scope) {
      console.warn(
        `[PermissionMapper] Invalid permission format: ${permission}`
      )
      return
    }

    const [resource, action] = codeWithAction.split('.')

    if (!resource || !action) {
      console.warn(
        `[PermissionMapper] Invalid permission code: ${codeWithAction}`
      )
      return
    }
    
    // Track CRUD permissions for auto-manage detection
    if (!resourcePermissions[resource]) {
      resourcePermissions[resource] = {}
    }
    if (!resourcePermissions[resource][scope]) {
      resourcePermissions[resource][scope] = new Set()
    }
    resourcePermissions[resource][scope].add(action)

    // Map actions to CASL actions
    let caslActions: string[] = []
    switch (action) {
      case 'create':
        caslActions = ['create']
        break
      case 'read':
        caslActions = ['read']
        break
      case 'update':
        caslActions = ['update']
        break
      case 'delete':
        caslActions = ['delete']
        break
      case 'manage':
        caslActions = ['manage'] // CASL 'manage' = all actions
        console.log(`[PermissionMapper] Direct manage permission: ${resource}.${action}:${scope}`)
        break
      case 'publish':
        caslActions = ['publish'] // Custom action
        break
      case 'checkin':
        caslActions = ['checkin'] // Custom action
        break
      case 'export':
        caslActions = ['export'] // Custom action
        break
      case 'import':
        caslActions = ['import'] // Custom action
        break
      case 'assign':
        caslActions = ['assign'] // Custom action
        break
      case 'send':
        caslActions = ['send'] // Custom action
        break
      case 'view':
        caslActions = ['view'] // Custom action
        break
      default:
        caslActions = [action] // Use as-is for other custom actions
    }

    // Map resources to CASL subjects
    const subjectMap: Record<string, string> = {
      users: 'User',
      roles: 'Role',
      events: 'Event',
      attendees: 'Attendee',
      organizations: 'Organization',
      invitations: 'Invitation',
      analytics: 'Analytics',
      registrations: 'Registration',
      permissions: 'Permission',
      badges: 'Badge',
      'badge-templates': 'Badge',
      'attendee-types': 'AttendeeType',
      reports: 'Report',
      email: 'Email',
    }

    const subject = subjectMap[resource] || resource

    // Build conditions based on scope
    let conditions: any = {}

    switch (scope) {
      case 'own':
        // Access limited to user's own resources
        if (resource === 'users') {
          conditions = { id: userId }
        } else {
          conditions = { user_id: userId }
        }
        break
      case 'org':
        // Access limited to organization
        conditions = { org_id: orgId }
        break
      case 'assigned':
        // Access limited to assigned resources (e.g., events for PARTNER)
        // This will be handled by the backend filtering, frontend just allows access
        break
      case 'any':
        // Global access - no conditions
        break
      case 'none':
        // No scope restrictions - full access (backend will enforce org limits)
        break
      default:
        console.warn(`[PermissionMapper] Unknown scope: ${scope}`)
    }

    // Create rules for each action
    caslActions.forEach((caslAction) => {
      const rule: AppRule = {
        action: caslAction as Actions,
        subject: subject as Subjects,
      }

      // Add conditions only if they exist
      if (Object.keys(conditions).length > 0) {
        rule.conditions = conditions
      }

      rules.push(rule)
    })
  })
  
  // Auto-grant 'manage' if user has all CRUD permissions (read, create, update, delete)
  Object.entries(resourcePermissions).forEach(([resource, scopes]) => {
    Object.entries(scopes).forEach(([scope, actions]) => {
      const hasCRUD = ['read', 'create', 'update', 'delete'].every(action => 
        actions.has(action)
      )
      
      if (hasCRUD) {
        const subjectMap: Record<string, string> = {
          users: 'User',
          roles: 'Role',
          events: 'Event',
          attendees: 'Attendee',
          organizations: 'Organization',
          invitations: 'Invitation',
          analytics: 'Analytics',
          registrations: 'Registration',
          permissions: 'Permission',
          badges: 'Badge',
          'badge-templates': 'Badge',
          'attendee-types': 'AttendeeType',
          reports: 'Report',
          email: 'Email',
        }
        
        const subject = subjectMap[resource] || resource
        
        let conditions: any = {}
        if (scope === 'org') {
          conditions = { org_id: orgId }
        } else if (scope === 'own') {
          if (resource === 'users') {
            conditions = { id: userId }
          } else {
            conditions = { user_id: userId }
          }
        }
        
        const manageRule: AppRule = {
          action: 'manage' as Actions,
          subject: subject as Subjects,
        }
        
        if (Object.keys(conditions).length > 0) {
          manageRule.conditions = conditions
        }
        
        rules.push(manageRule)
        
        console.log(`[PermissionMapper] Auto-granted 'manage' permission for ${subject} (scope: ${scope})`)
      }
    })
  })

  return rules
}

/**
 * Creates CASL rules for SUPER_ADMIN role
 * @returns Full access rule
 */
export function createSuperAdminRules(): AppRule[] {
  return [
    {
      action: 'manage',
      subject: 'all',
    },
  ]
}

/**
 * Creates fallback rules for unauthenticated users
 * @returns Minimal access rules
 */
export function createFallbackRules(): AppRule[] {
  return [
    // Allow reading public content only
    {
      action: 'read',
      subject: 'Event',
      conditions: { status: 'published' },
    },
  ]
}
