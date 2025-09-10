import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { selectUser, selectOrganization, clearSession } from '@/features/auth/model/sessionSlice'
import { Button } from '@/shared/ui/Button'
// import { Can } from '@/shared/acl/guards/Can'

export const Header: React.FC = () => {
  const { t } = useTranslation('common')
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)

  const handleLogout = () => {
    dispatch(clearSession())
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
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
            <span className="text-sm text-gray-500">
              {organization.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          
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
