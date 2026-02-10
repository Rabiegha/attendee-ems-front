import React, { createContext, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectAbilityRules,
  selectUser,
  selectOrgId,
  selectToken,
} from '@/features/auth/model/sessionSlice'
import { useGetPolicyQuery } from '@/features/auth/api/authApi'
import { setRules } from '@/features/auth/model/sessionSlice'
import { createAbilityFromRules } from '@/shared/acl/ability-factory'
import { rulesFor } from '@/shared/acl/policies/rbac-presets'
import { mapBackendRolesToCASQL } from '@/shared/acl/role-mapping'
import {
  mapPermissionsToCASlRules,
  createSuperAdminRules,
  createFallbackRules,
} from '@/shared/acl/permission-mapper'
import { decodeJWT } from '@/shared/lib/jwt-utils'
import type { AppAbility } from '@/shared/acl/app-ability'

export const AbilityContext = createContext<AppAbility | null>(null)

interface AbilityProviderProps {
  children: React.ReactNode
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch()
  const rules = useSelector(selectAbilityRules)
  const user = useSelector(selectUser)
  const orgId = useSelector(selectOrgId)
  const token = useSelector(selectToken)

  // Vérifier si l'utilisateur est SUPER_ADMIN
  const isSuperAdmin =
    user?.roles?.[0] === 'SUPER_ADMIN' || user?.roles?.includes('SUPER_ADMIN')

  // Charger automatiquement les règles de politique si l'utilisateur est connecté (sauf SUPER_ADMIN)
  const shouldSkipPolicy = Boolean(
    !user || // Pas d'utilisateur connecté
      (!orgId && !user.isPlatform) || // Pas d'org ET pas platform user
      isSuperAdmin // Super admin n'a pas besoin de règles de politique
  )

  // POLLING DÉSACTIVÉ : Les permissions sont chargées une seule fois au login
  // et rafraîchies manuellement lors d'actions spécifiques (changement de rôle, etc.)
  const { data: policyData } = useGetPolicyQuery(undefined, {
    skip: shouldSkipPolicy,
  })

  // Mettre à jour les règles dans le store quand elles sont chargées
  useEffect(() => {
    if (policyData?.rules && policyData.rules.length > 0) {
      dispatch(setRules(policyData.rules))
    }
  }, [policyData, dispatch])

  const ability = useMemo(() => {
    // PRIORITY 1: Use API rules if available (most up-to-date from backend)
    if (rules.length > 0) {
      return createAbilityFromRules(rules)
    }

    // PRIORITY 2: Use JWT permissions directly (new scope-based system)
    if (user && token && (orgId || isSuperAdmin)) {
      // SUPER_ADMIN gets full access
      if (isSuperAdmin) {
        return createAbilityFromRules(createSuperAdminRules())
      }

      // Extract permissions from JWT
      const payload = decodeJWT(token)

      if (payload?.permissions && payload.permissions.length > 0) {
        // Map JWT permissions to CASL rules using new mapper
        const caslRules = mapPermissionsToCASlRules(
          payload.permissions,
          user.id,
          orgId || ''
        )
        return createAbilityFromRules(caslRules)
      }
    }

    // PRIORITY 3: Use legacy preset rules based on roles (fallback)
    if (user && (orgId || isSuperAdmin)) {
      // Map backend roles to CASL roles
      const backendRoles = user.roles || []
      const caslRoles = mapBackendRolesToCASQL(backendRoles)
      const eventIds = user.eventIds || []

      // Combine rules from all user roles (orgId optionnel pour SUPER_ADMIN)
      const combinedRules = caslRoles.flatMap((role) =>
        rulesFor(role, { orgId: orgId || '', userId: user.id, eventIds })
      )

      return createAbilityFromRules(combinedRules)
    }

    // PRIORITY 4: Fallback rules for authenticated users without proper setup
    if (user) {
      return createAbilityFromRules(createFallbackRules())
    }

    // PRIORITY 5: No permissions for anonymous users
    return createAbilityFromRules([])
  }, [rules, user, orgId, token, isSuperAdmin])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
