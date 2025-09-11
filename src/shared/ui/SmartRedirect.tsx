import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '@/features/auth/model/sessionSlice'
import { useDefaultRoute } from '@/shared/hooks/useDefaultRoute'

/**
 * Composant qui redirige vers la route appropriée selon les permissions
 */
export const SmartRedirect: React.FC = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const defaultRoute = useDefaultRoute()
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(defaultRoute, { replace: true })
    } else {
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, defaultRoute, navigate])
  
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
