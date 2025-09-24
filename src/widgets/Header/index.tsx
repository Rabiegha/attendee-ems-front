import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { selectUser, selectOrganization, clearSession } from '@/features/auth/model/sessionSlice'
import { authApi } from '@/features/auth/api/authApi'
import { eventsApi } from '@/features/events/api/eventsApi'
import { attendeesApi } from '@/features/attendees/api/attendeesApi'
import { getRoleLabel } from '@/shared/acl/role-mapping'
import { Button } from '@/shared/ui/Button'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
// import { Can } from '@/shared/acl/guards/Can'

export const Header: React.FC = () => {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)

  const handleLogout = () => {
    // 1. Nettoyer la session utilisateur
    dispatch(clearSession())
    
    // 2. Vider TOUS les caches RTK Query pour éviter les données persistantes
    dispatch(authApi.util.resetApiState())
    dispatch(eventsApi.util.resetApiState())
    dispatch(attendeesApi.util.resetApiState())
    
    // 3. Optionnel: appeler l'endpoint logout (pour invalider le token côté serveur)
    // Note: On ne fait pas de mutation ici car ça pourrait créer des erreurs si l'API est down
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="EMS Logo" 
              className="h-8 w-auto hover:opacity-80 transition-opacity cursor-pointer"
            />
          </Link>
          {organization && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {organization.name}
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
