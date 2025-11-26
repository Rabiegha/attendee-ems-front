import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  onAuthStateMaybeChanged,
  bootstrapAuth,
} from '@/features/auth/authLifecycle'
import { selectSession } from '@/features/auth/model/sessionSlice'

interface AuthLifecycleProviderProps {
  children: React.ReactNode
}

export const AuthLifecycleProvider: React.FC<AuthLifecycleProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch()
  const { token, expiresAt } = useSelector(selectSession)
  const [hasBootstrapped, setHasBootstrapped] = useState(false)

  // Bootstrap auth au montage, mais SEULEMENT si on a un token actif
  useEffect(() => {
    if (hasBootstrapped) return
    
    // Vérifier si Redux Persist a un TOKEN valide en localStorage
    try {
      const persistedState = localStorage.getItem('persist:root')
      if (persistedState) {
        const parsedState = JSON.parse(persistedState)
        const sessionData = parsedState.session ? JSON.parse(parsedState.session) : null
        
        // Ne tenter le refresh QUE si on a un token (en mémoire OU dans persist)
        // Ceci évite le 401 au premier chargement de la page de login
        if (token || sessionData?.token) {
          // We only attempt a bootstrap if a token is persisted or in memory
          // bootstrapAuth will mark bootstrap completed when done.
          bootstrapAuth()
        } else {
          // No token — we must explicitly mark bootstrap completed so the UI stops showing the loader
          // and can show the login page.
          // dynamic import without top-level await so it parses correctly in dev
          import('@/features/auth/model/sessionSlice')
            .then((mod) => dispatch(mod.setBootstrapCompleted()))
            .catch(() => {})
        }
      } else if (token) {
        // Pas de persist mais token en mémoire = cas edge, bootstrap quand même
        bootstrapAuth()
      }
    } catch (error) {
      // En cas d'erreur de parsing, tenter seulement si on a un token en mémoire
      if (token) {
        bootstrapAuth()
        } else {
          // If parsing failed and we don't have a token, make sure we finish bootstrapping
          import('@/features/auth/model/sessionSlice')
            .then((mod) => dispatch(mod.setBootstrapCompleted()))
            .catch(() => {})
      }
    }
    
    setHasBootstrapped(true)
  }, [hasBootstrapped, token])

  // Reprogrammer le refresh proactif quand token/expiresAt change (seulement si authentifié)
  useEffect(() => {
    // Ne déclencher le lifecycle que si l'utilisateur est authentifié
    if (token && expiresAt) {
      onAuthStateMaybeChanged()
    }
  }, [token, expiresAt])

  return <>{children}</>
}
