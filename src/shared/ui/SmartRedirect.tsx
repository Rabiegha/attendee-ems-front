import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { selectIsAuthenticated, clearSession } from '@/features/auth/model/sessionSlice'
import { useDefaultRoute } from '@/shared/hooks/useDefaultRoute'

/**
 * Composant qui redirige vers la route appropriée selon les permissions
 */
export const SmartRedirect: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const defaultRoute = useDefaultRoute()
  
  // Protection anti-boucle
  const redirectCountRef = useRef(0)
  const lastRedirectTimeRef = useRef(0)
  
  useEffect(() => {
    const now = Date.now()
    
    // Réinitialiser le compteur si plus de 2 secondes depuis la dernière redirection
    if (now - lastRedirectTimeRef.current > 2000) {
      redirectCountRef.current = 0
    }
    
    // PROTECTION : Si plus de 3 redirections en 2 secondes depuis SmartRedirect
    if (redirectCountRef.current > 3) {
      console.error('[SMARTREDIRECT] 🚨 REDIRECT LOOP DETECTED! Force logout...')
      dispatch(clearSession())
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.error('Failed to clear storage:', e)
      }
      navigate('/auth/login', { replace: true })
      redirectCountRef.current = 0
      lastRedirectTimeRef.current = now + 3000
      return
    }
    
    redirectCountRef.current++
    lastRedirectTimeRef.current = now
    
    if (isAuthenticated) {
      console.log('[SMARTREDIRECT] Authenticated, redirecting to:', defaultRoute)
      navigate(defaultRoute, { replace: true })
    } else {
      console.log('[SMARTREDIRECT] Not authenticated, redirecting to login')
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, defaultRoute, navigate, dispatch])
  
  // Affichage de loading pendant la redirection
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}
