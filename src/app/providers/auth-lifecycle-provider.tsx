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

  // Bootstrap auth au montage
  useEffect(() => {
    if (hasBootstrapped) return
    
    // TOUJOURS appeler bootstrapAuth - il gère lui-même le cas sans token
    bootstrapAuth()
    
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
