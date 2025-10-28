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
  subjectInstance?: any
): boolean => {
  const ability = useAbility()

  try {
    if (subjectInstance) {
      // Create a subject instance with type
      const subject = { ...subjectInstance, __type: subjectType }
      return ability.can(action, subject)
    }
    return ability.can(action, subjectType)
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
  subjectInstance?: any
): boolean => {
  return !useCan(action, subjectType, subjectInstance)
}
