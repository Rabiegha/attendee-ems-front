import React from 'react'
import { useCan } from '@/shared/acl/hooks/useCan'
import { AccessDenied } from '@/pages/AccessDenied'
import type { Actions, Subjects } from '@/shared/acl/app-ability'

interface ProtectedPageProps {
  action: Actions
  subject: Subjects
  data?: Record<string, any>
  children: React.ReactNode
  deniedTitle?: string
  deniedMessage?: string
}

/**
 * Wrapper component pour protéger une page avec CASL
 * Affiche la page AccessDenied si l'utilisateur n'a pas les permissions
 * Les enfants ne sont PAS montés si l'utilisateur n'a pas la permission
 */
export const ProtectedPage: React.FC<ProtectedPageProps> = ({
  action,
  subject,
  data,
  children,
  deniedTitle,
  deniedMessage,
}) => {
  // Vérifier la permission AVANT de monter les enfants
  const hasPermission = useCan(action, subject, data)

  // Si pas de permission, afficher AccessDenied SANS monter les enfants
  if (!hasPermission) {
    return (
      <AccessDenied
        {...(deniedTitle && { title: deniedTitle })}
        {...(deniedMessage && { message: deniedMessage })}
      />
    )
  }

  // Seulement si permission, monter les enfants
  return <>{children}</>
}
