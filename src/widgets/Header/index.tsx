import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { selectUser, selectOrganization, selectIsAuthenticated } from '@/features/auth/model/sessionSlice'
import { useMeQuery } from '@/features/auth/api/authApi'
import { performLogout } from '@/features/auth/authLifecycle'
import { getRoleLabel } from '@/shared/acl/role-mapping'
import { Button } from '@/shared/ui/Button'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
// import { Can } from '@/shared/acl/guards/Can'

export const Header: React.FC = () => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  
  // Récupérer les informations utilisateur complètes avec l'organisation
  const { data: userProfile } = useMeQuery(undefined, {
    skip: !isAuthenticated || !user // Skip si pas authentifié OU pas d'utilisateur
  })
  
  // Utiliser l'organisation du profil utilisateur si disponible, sinon celle du store
  const displayOrganization = userProfile?.organization || organization

  const handleLogout = async () => {
    console.log('[HEADER] Logout initiated')
    // Utiliser la fonction centralisée de logout qui :
    // 1. Arrête le timer proactif
    // 2. Nettoie la session Redux
    // 3. Diffuse la déconnexion aux autres onglets
    // 4. Appelle le logout backend (révoque le refresh token)
    // 5. Vide le cache RTK Query
    await performLogout()
    
    // Rediriger vers la page de login
    console.log('[HEADER] Logout complete, redirecting to login')
    navigate('/auth/login', { replace: true })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="EMS Logo" 
              className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          {displayOrganization && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {displayOrganization.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div className="text-sm">
                <div className="text-gray-700 dark:text-gray-200 font-medium">
                  {/* Support both firstName/lastName and first_name/last_name formats */}
                  {(() => {
                    const firstName = user.firstName || user.first_name
                    const lastName = user.lastName || user.last_name
                    if (firstName && lastName) {
                      return `${firstName} ${lastName}`
                    }
                    return user.email || 'Utilisateur'
                  })()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {/* Display the proper role label */}
                  {user.roles?.[0] ? getRoleLabel(user.roles[0]) : 'Utilisateur'}
                </div>
              </div>
            </div>
          )}
          
          <ThemeToggle size="sm" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('navigation.logout')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
