import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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
          bootstrapAuth()
        }
      } else if (token) {
        // Pas de persist mais token en mémoire = cas edge, bootstrap quand même
        bootstrapAuth()
      }
    } catch (error) {
      // En cas d'erreur de parsing, tenter seulement si on a un token en mémoire
      if (token) {
        bootstrapAuth()
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
