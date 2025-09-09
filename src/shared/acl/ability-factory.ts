import { createMongoAbility } from '@casl/ability'
import type { AppAbility, AppRule } from './app-ability'

/**
 * Creates an AppAbility instance from an array of rules
 * @param rules - Array of CASL rules
 * @returns AppAbility instance
 */
export const buildAbilityFromRules = (rules: AppRule[]): AppAbility => {
  return createMongoAbility<AppAbility>(rules)
}

/**
 * Serializes ability rules for storage/transmission
 * @param ability - AppAbility instance
 * @returns Serialized rules
 */
export const serializeAbility = (ability: AppAbility): AppRule[] => {
  return ability.rules as AppRule[]
}

/**
 * Updates an existing ability with new rules
 * @param ability - Existing AppAbility instance
 * @param newRules - New rules to apply
 * @returns Updated AppAbility instance
 */
export const updateAbility = (ability: AppAbility, newRules: AppRule[]): AppAbility => {
  ability.update(newRules)
  return ability
}
