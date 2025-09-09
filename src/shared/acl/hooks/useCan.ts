import { useAbility } from './useAbility'
import type { Actions, Subjects } from '../app-ability'

/**
 * Hook to check if the current user can perform an action
 * @param action - The action to check
 * @param subject - The subject/resource to check against
 * @param data - Optional data/conditions for the check
 * @returns boolean indicating if the action is allowed
 */
export const useCan = (
  action: Actions,
  subject: Subjects,
  data?: Record<string, any>
): boolean => {
  const ability = useAbility()
  
  return ability.can(action, subject, data as any)
}

/**
 * Hook to check if the current user cannot perform an action
 * @param action - The action to check
 * @param subject - The subject/resource to check against
 * @param data - Optional data/conditions for the check
 * @returns boolean indicating if the action is not allowed
 */
export const useCannot = (
  action: Actions,
  subject: Subjects,
  data?: Record<string, any>
): boolean => {
  const ability = useAbility()
  
  return ability.cannot(action, subject, data as any)
}
