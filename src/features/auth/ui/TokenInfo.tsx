/**
 * 🔐 COMPOSANT DE VALIDATION DE TOKEN
 *
 * Valide le token d'invitation et affiche les informations de sécurité
 */

import React from 'react'
import { CheckCircle, AlertTriangle, Clock, User, Building } from 'lucide-react'
import type { InvitationTokenInfo } from '../types/signup.types'

interface TokenInfoProps {
  invitation: InvitationTokenInfo
  isLoading?: boolean
}

export const TokenInfo: React.FC<TokenInfoProps> = ({
  invitation,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  const isExpiringSoon =
    new Date(invitation.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 // 24h

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Invitation valide
          </h3>

          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                Invité par <strong>{invitation.invitedByName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>
                Organisation : <strong>{invitation.orgName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {invitation.role}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 ${isExpiringSoon ? 'text-orange-600' : ''}`}
            >
              <Clock className="h-4 w-4" />
              <span>
                Expire le{' '}
                {new Date(invitation.expiresAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {isExpiringSoon && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
