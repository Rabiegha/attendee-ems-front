import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  onAuthStateMaybeChanged,
  // bootstrapAuth, // Optionnel: le bootstrap est géré via Redux Persist + refresh 401
} from '@/features/auth/authLifecycle'
import { selectSession, setBootstrapCompleted } from '@/features/auth/model/sessionSlice'

interface AuthLifecycleProviderProps {
  children: React.ReactNode
}

export const AuthLifecycleProvider: React.FC<AuthLifecycleProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch()
  const { token, expiresAt } = useSelector(selectSession)
  const [hasBootstrapped, setHasBootstrapped] = useState(false)

  // Bootstrap auth au montage - DÉSACTIVÉ
  // Le refresh automatique se fait via les intercepteurs 401 dans rootApi.ts
  // Redux-persist réhydrate la session existante
  useEffect(() => {
    if (hasBootstrapped) return
    
    console.log('[AUTH-LIFECYCLE] Using Redux persist for session restoration')
    // bootstrapAuth() causait un clearSession() avant que Redux persist ne réhydrate
    // Le refresh se fera automatiquement sur la première requête 401
    // Marquer explicitement la fin du bootstrap pour éviter les loaders infinis
    dispatch(setBootstrapCompleted())
    
    setHasBootstrapped(true)
  }, [hasBootstrapped])

  // Reprogrammer le refresh proactif quand token/expiresAt change (seulement si authentifié)
  useEffect(() => {
    // Ne déclencher le lifecycle que si l'utilisateur est authentifié
    if (token && expiresAt) {
      onAuthStateMaybeChanged()
    }
  }, [token, expiresAt])

  return <>{children}</>
}
