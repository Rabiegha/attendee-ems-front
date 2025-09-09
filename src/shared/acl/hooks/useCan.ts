import { useAbility } from './useAbility'
import type { Actions, Subjects } from '../app-ability'

/**
 * Hook to check if the current user can perform an action on a subject
 * @param action - The action to check
 * @param subject - The subject to check against
 * @param data - Optional data for conditional checks
 * @returns Boolean indicating if the action is allowed
 */
export const useCan = (
  action: Actions,
  subject: Subjects,
  data?: Record<string, any>
): boolean => {
  const ability = useAbility()
  return ability.can(action, subject, data)
}

/**
 * Hook to check if the current user cannot perform an action on a subject
 * @param action - The action to check
 * @param subject - The subject to check against
 * @param data - Optional data for conditional checks
 * @returns Boolean indicating if the action is forbidden
 */
export const useCannot = (
  action: Actions,
  subject: Subjects,
  data?: Record<string, any>
): boolean => {
  const ability = useAbility()
  return ability.cannot(action, subject, data)
}
