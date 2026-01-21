import React from 'react'
import { AccessDenied } from '@/pages/AccessDenied'

export const ForbiddenPage: React.FC = () => {
  return (
    <AccessDenied
      title="403 - Accès interdit"
      message="Vous n'avez pas les permissions nécessaires pour accéder à cette page."
    />
  )
}
