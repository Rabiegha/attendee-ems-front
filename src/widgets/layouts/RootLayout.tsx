import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsBootstrapping } from '@/features/auth/model/sessionSlice'
import { Header } from '@/widgets/Header'
import { Sidebar } from '@/widgets/Sidebar'

export const RootLayout: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isBootstrapping = useSelector(selectIsBootstrapping)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('RootLayout auth check:', { isAuthenticated, isBootstrapping })
    // Ne rediriger que si le bootstrap est terminé ET que l'utilisateur n'est pas authentifié
    if (!isBootstrapping && !isAuthenticated) {
      console.log('RootLayout: User not authenticated after bootstrap, redirecting to login')
      navigate('/auth/login', { replace: true })
    }
  }, [isAuthenticated, isBootstrapping, navigate])

  // Show loading while bootstrapping or while not authenticated (after bootstrap)
  if (isBootstrapping || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isBootstrapping ? 'Vérification de la session...' : 'Redirection...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
