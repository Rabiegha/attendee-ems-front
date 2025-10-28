import { useContext } from 'react'
import { AbilityContext } from '../../../app/providers/ability-provider'
import type { AppAbility } from '../app-ability'

/**
 * Hook to access the current user's ability instance
 * @returns AppAbility instance
 */
export const useAbility = (): AppAbility => {
  const ability = useContext(AbilityContext)

  if (!ability) {
    throw new Error('useAbility must be used within an AbilityProvider')
  }

  return ability
}
