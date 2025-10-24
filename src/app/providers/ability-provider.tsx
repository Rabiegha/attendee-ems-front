import React, { createContext, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectAbilityRules, selectUser, selectOrgId } from '@/features/auth/model/sessionSlice'
import { useGetPolicyQuery } from '@/features/auth/api/authApi'
import { setRules } from '@/features/auth/model/sessionSlice'
import { createAbilityFromRules } from '@/shared/acl/ability-factory'
import { rulesFor, fallbackRules } from '@/shared/acl/policies/rbac-presets'
import { mapBackendRolesToCASQL } from '@/shared/acl/role-mapping'
import type { AppAbility } from '@/shared/acl/app-ability'

export const AbilityContext = createContext<AppAbility | null>(null)

interface AbilityProviderProps {
  children: React.ReactNode
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const rules = useSelector(selectAbilityRules)
  const user = useSelector(selectUser)
  const orgId = useSelector(selectOrgId)

  // Vérifier si l'utilisateur est SUPER_ADMIN
  const isSuperAdmin = user?.roles?.[0] === 'SUPER_ADMIN' || user?.roles?.includes('SUPER_ADMIN')

  // 🔇 Logs de debug désactivés en production
  // console.log('[AbilityProvider] State:', { 
  //   hasUser: !!user, 
  //   orgId, 
  //   isSuperAdmin, 
  //   rulesCount: rules.length,
  //   userRoles: user?.roles 
  // })

  // Charger automatiquement les règles de politique si l'utilisateur est connecté (sauf SUPER_ADMIN)
  const shouldSkipPolicy = Boolean(
    !user ||           // Pas d'utilisateur connecté
    !orgId ||          // Pas d'organisation
    isSuperAdmin       // Super admin n'a pas besoin de règles de politique
  )
  
  // console.log('[AbilityProvider] Should skip policy?', shouldSkipPolicy)
  
  // ⚠️ POLLING DÉSACTIVÉ : Les permissions sont chargées une seule fois au login
  // et rafraîchies manuellement lors d'actions spécifiques (changement de rôle, etc.)
  // Polling toutes les 5s = requêtes inutiles et logs pollués
  const { data: policyData } = useGetPolicyQuery(undefined, {
    skip: shouldSkipPolicy,
    // pollingInterval: 5000, // ❌ DÉSACTIVÉ - causait des requêtes en boucle
  })

  // 🔇 Logs de debug désactivés
  // console.log('[AbilityProvider] Policy data:', { 
  //   hasData: !!policyData, 
  //   isLoading: isPolicyLoading, 
  //   error: policyError,
  //   rulesFromApi: policyData?.rules?.length 
  // })

  // Mettre à jour les règles dans le store quand elles sont chargées
  useEffect(() => {
    if (policyData?.rules) {
      dispatch(setRules(policyData.rules))
    }
  }, [policyData, dispatch])

  const ability = useMemo(() => {
    // If we have rules from the API, use them
    if (rules.length > 0) {
      const ability = createAbilityFromRules(rules)
      return ability
    }

    // If we have user info but no rules yet, use preset rules based on roles
    if (user && (orgId || isSuperAdmin)) {
      // Map backend roles to CASL roles 
      const backendRoles = user.roles || []
      const caslRoles = mapBackendRolesToCASQL(backendRoles)
      const eventIds = user.eventIds || []
      
      console.log('[RBAC] Backend roles:', backendRoles)
      console.log('[RBAC] Mapped CASL roles:', caslRoles)
      
      // Combine rules from all user roles (orgId optionnel pour SUPER_ADMIN)
      const combinedRules = caslRoles.flatMap(role => 
        rulesFor(role, { orgId: orgId || '', userId: user.id, eventIds })
      )
      
      console.log('[RBAC] Generated rules:', combinedRules)
      
      return createAbilityFromRules(combinedRules)
    }

    // Fallback: minimal rules for unauthenticated users
    if (user) {
      return createAbilityFromRules(fallbackRules(user.id))
    }

    // No permissions for anonymous users
    return createAbilityFromRules([])
  }, [rules, user, orgId])

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
