import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { ShieldAlert, Home, Mail } from 'lucide-react'
import { ROUTES } from '@/app/config/constants'

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          {/* Icône */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 dark:bg-red-400/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <div className="mb-3">
            <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              403
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('errors.forbidden')}
            </h1>
          </div>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>

          {/* Informations supplémentaires */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Besoin d'accès ?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Contactez votre administrateur pour demander les permissions
                  nécessaires.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              variant="default"
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              className="w-full"
            >
              {t('app.back')}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le
          support.
        </p>
      </div>
    </div>
  )
}
