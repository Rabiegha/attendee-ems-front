import React from 'react'
import { Can } from '@/shared/acl/guards/Can'
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
 */
export const ProtectedPage: React.FC<ProtectedPageProps> = ({
  action,
  subject,
  data,
  children,
  deniedTitle,
  deniedMessage,
}) => {
  return (
    <Can
      do={action}
      on={subject}
      {...(data && { data })}
      fallback={
        <AccessDenied
          {...(deniedTitle && { title: deniedTitle })}
          {...(deniedMessage && { message: deniedMessage })}
        />
      }
    >
      {children}
    </Can>
  )
}
