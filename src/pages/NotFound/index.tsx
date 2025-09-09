import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { FileQuestion } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">{t('errors.not_found')}</p>
        <p className="mt-1 text-sm text-gray-500">
          La page que vous recherchez n'existe pas.
        </p>
        <div className="mt-6 space-x-3">
          <Button onClick={() => navigate(-1)} variant="outline">
            {t('app.back')}
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Tableau de bord
          </Button>
        </div>
      </div>
    </div>
  )
}
