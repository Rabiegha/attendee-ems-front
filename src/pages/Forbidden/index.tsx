import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { ShieldX } from 'lucide-react'

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldX className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">403</h1>
        <p className="mt-2 text-lg text-gray-600">{t('errors.forbidden')}</p>
        <p className="mt-1 text-sm text-gray-500">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate(-1)}>
            {t('app.back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
