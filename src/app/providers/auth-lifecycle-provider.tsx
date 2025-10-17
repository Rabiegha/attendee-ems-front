import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { onAuthStateMaybeChanged, bootstrapAuth } from '@/features/auth/authLifecycle'
import { selectSession } from '@/features/auth/model/sessionSlice'

interface AuthLifecycleProviderProps {
  children: React.ReactNode
}

export const AuthLifecycleProvider: React.FC<AuthLifecycleProviderProps> = ({ children }) => {
  const { token, expiresAt } = useSelector(selectSession)

  // Bootstrap auth au montage pour restaurer la session depuis le refresh token
  useEffect(() => { 
    bootstrapAuth() 
  }, [])

  // Reprogrammer le refresh proactif quand token/expiresAt change (seulement si authentifié)
  useEffect(() => { 
    // Ne déclencher le lifecycle que si l'utilisateur est authentifié
    if (token && expiresAt) {
      onAuthStateMaybeChanged() 
    }
  }, [token, expiresAt])

  return <>{children}</>
}
