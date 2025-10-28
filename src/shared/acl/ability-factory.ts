import { createAppAbility } from './app-ability'
import type { AppAbility, AppRule } from './app-ability'

/**
 * Create an ability instance from rules
 */
export const createAbilityFromRules = (rules: AppRule[]): AppAbility => {
  return createAppAbility(rules)
}

/**
 * Update an existing ability with new rules
 */
export const updateAbility = (
  _ability: AppAbility,
  rules: AppRule[]
): AppAbility => {
  return createAppAbility(rules)
}

/**
 * Serializes ability rules for storage/transmission
 * @param ability - AppAbility instance
 * @returns Serialized rules
 */
export const serializeAbility = (ability: AppAbility): AppRule[] => {
  return ability.rules as AppRule[]
}
