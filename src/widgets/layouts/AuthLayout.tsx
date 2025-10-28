import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectIsBootstrapping,
} from '@/features/auth/model/sessionSlice'

export const AuthLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isBootstrapping = useSelector(selectIsBootstrapping)

  useEffect(() => {
    // Si l'utilisateur est déjà authentifié et que le bootstrap est terminé,
    // le rediriger vers le dashboard au lieu de rester sur la page de login
    if (isAuthenticated && !isBootstrapping) {
      console.log(
        '[AUTHLAYOUT] User already authenticated, redirecting to dashboard'
      )
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isBootstrapping, navigate])

  // Afficher un loader pendant le bootstrap pour éviter le flash de la page de login
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Vérification...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        <Outlet />
      </div>
    </div>
  )
}
