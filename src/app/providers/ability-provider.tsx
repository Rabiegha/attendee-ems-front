import React, { createContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectAbilityRules, selectUser, selectOrgId } from '@/features/auth/model/sessionSlice'
import { buildAbilityFromRules } from '@/shared/acl/ability-factory'
import { rulesFor, fallbackRules } from '@/shared/acl/policies/rbac-presets'
import type { AppAbility } from '@/shared/acl/app-ability'
import type { UserRole } from '@/shared/acl/policies/rbac-presets'

export const AbilityContext = createContext<AppAbility | null>(null)

interface AbilityProviderProps {
  children: React.ReactNode
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ children }) => {
  const rules = useSelector(selectAbilityRules)
  const user = useSelector(selectUser)
  const orgId = useSelector(selectOrgId)

  const ability = useMemo(() => {
    // If we have rules from the API, use them
    if (rules.length > 0) {
      return buildAbilityFromRules(rules)
    }

    // If we have user info but no rules yet, use preset rules based on roles
    if (user && orgId) {
      const userRoles = user.roles as UserRole[]
      const eventIds = user.eventIds || []
      
      // Combine rules from all user roles
      const combinedRules = userRoles.flatMap(role => 
        rulesFor(role, { orgId, userId: user.id, eventIds })
      )
      
      return buildAbilityFromRules(combinedRules)
    }

    // Fallback: minimal rules for unauthenticated users
    if (user) {
      return buildAbilityFromRules(fallbackRules(user.id))
    }

    // No permissions for anonymous users
    return buildAbilityFromRules([])
  }, [rules, user, orgId])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
