import React from 'react'
import { useTranslation } from 'react-i18next'
import { AccessDenied } from '@/pages/AccessDenied'

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation('auth')

  return (
    <AccessDenied
      title={t('access_denied.forbidden_title')}
      message={t('access_denied.forbidden_message')}
    />
  )
}
