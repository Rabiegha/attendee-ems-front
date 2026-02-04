import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectIsAuthenticated,
  selectIsBootstrapping,
  clearSession,
} from '@/features/auth/model/sessionSlice'
import { Header } from '@/widgets/Header'
import { Sidebar } from '@/widgets/Sidebar'
import { PageTransition } from '@/shared/ui/PageTransition'
import { cn } from '@/shared/lib/utils'

export const RootLayout: React.FC = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isBootstrapping = useSelector(selectIsBootstrapping)
  const user = useSelector((state: any) => state.session.user)
  const token = useSelector((state: any) => state.session.token)
  
  // State pour gérer l'ouverture/fermeture de la sidebar avec persistance
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen')
    return saved !== null ? JSON.parse(saved) : true
  })

  // State pour le menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sauvegarder l'état de la sidebar dans le localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen))
  }, [isSidebarOpen])

  // Fermer le menu mobile quand on change de route
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Protection anti-boucle : compter les redirections
  const redirectCountRef = useRef(0)
  const lastRedirectTimeRef = useRef(0)

  useEffect(() => {
    // 🔇 Logs de debug désactivés
    // console.log('[ROOTLAYOUT] Auth state:', {
    //   isAuthenticated,
    //   isBootstrapping,
    //   hasUser: !!user,
    //   hasToken: !!token,
    //   path: location.pathname
    // })

    // Réinitialiser le compteur si plus de 2 secondes depuis la dernière redirection
    const now = Date.now()
    if (now - lastRedirectTimeRef.current > 2000) {
      redirectCountRef.current = 0
    }

    // PROTECTION ANTI-BOUCLE : Si plus de 5 redirections en 2 secondes
    if (redirectCountRef.current > 5) {
      console.error(
        '[ROOTLAYOUT] REDIRECT LOOP DETECTED! Force clearing session...'
      )
      // Forcer le nettoyage complet de la session
      dispatch(clearSession())
      // Nettoyer le localStorage au cas où il y aurait des données corrompues
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.error('Failed to clear storage:', e)
      }
      // Rediriger une dernière fois vers login
      navigate('/auth/login', { replace: true })
      // Bloquer les futures redirections pendant 3 secondes
      redirectCountRef.current = 0
      lastRedirectTimeRef.current = now + 3000
      return
    }

    // Ne rediriger que si le bootstrap est terminé ET que l'utilisateur n'est pas authentifié
    if (!isBootstrapping && !isAuthenticated) {
      // console.log('[ROOTLAYOUT] ❌ User not authenticated after bootstrap, redirecting to login')
      redirectCountRef.current++
      lastRedirectTimeRef.current = now
      navigate('/auth/login', { replace: true })
      return
    }

    // Vérification de sécurité : Si marqué comme authentifié mais pas de user/token
    // Cela ne devrait jamais arriver, mais protège contre un état incohérent
    // DÉSACTIVÉ temporairement car crée des boucles lors du chargement initial
    // if (!isBootstrapping && isAuthenticated && (!user || !token)) {
    //   console.error(
    //     '[ROOTLAYOUT] CRITICAL: Authenticated but no user/token! Forcing logout...'
    //   )
    //   redirectCountRef.current++
    //   lastRedirectTimeRef.current = now
    //   dispatch(clearSession())
    //   navigate('/auth/login', { replace: true })
    //   return
    // }

    if (!isBootstrapping && isAuthenticated && user && token) {
      // console.log('[ROOTLAYOUT] ✅ User authenticated and valid:', user.email)
    }
  }, [
    isAuthenticated,
    isBootstrapping,
    user,
    token,
    navigate,
    dispatch,
    location.pathname,
  ])

  // Show loading while bootstrapping
  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Vérification de la session...
          </p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting (not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
        <main 
          className={cn(
            'flex-1 min-w-0 transition-all duration-300',
            // Mobile: Full width with top padding for header
            'pt-[57px] sm:pt-[64px]',
            // Desktop: Account for sidebar and header
            'lg:pt-[69px]',
            isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
          )}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
