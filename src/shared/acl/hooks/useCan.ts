import { useAbility } from './useAbility'
import type { Actions, Subjects } from '../app-ability'

/**
 * Hook to check if the current user can perform an action
 * @param action - The action to check
 * @param subjectType - The subject type to check against
 * @param subjectInstance - Optional subject instance for conditional checks
 * @returns Boolean indicating if the action is allowed
 */
export const useCan = (
  action: Actions,
  subjectType: Subjects,
  subjectInstance?: Record<string, any>
): boolean => {
  const ability = useAbility()
  
  try {
    // For simple action/subject checks without instance data
    if (!subjectInstance) {
      return ability.can(action, subjectType)
    }
    
    // For subject instances, we need to use a different approach
    // Check if ability has rules that match our conditions
    const rules = ability.rules.filter(rule => 
      rule.action === action && rule.subject === subjectType
    )
    
    if (rules.length === 0) {
      return false
    }
    
    // For now, return true if we have matching rules
    // In a real implementation, you'd check conditions against subjectInstance
    return rules.some(rule => !rule.inverted)
  } catch (error) {
    console.error('Error in useCan:', error)
    return false
  }
}

/**
 * Hook to check if the current user cannot perform an action
 * @param action - The action to check
 * @param subjectType - The subject to check against
 * @param subjectInstance - Optional subject instance for conditional checks
 * @returns Boolean indicating if the action is forbidden
 */
export const useCannot = (
  action: Actions,
  subjectType: Subjects,
  subjectInstance?: Record<string, any>
): boolean => {
  return !useCan(action, subjectType, subjectInstance)
}
