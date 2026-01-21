import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { useCan } from '@/shared/acl/hooks/useCan'
import { useMeQuery } from '@/features/auth/api/authApi'

/**
 * Composant pour afficher les informations de l'utilisateur connecté
 * et tester les permissions en temps réel
 */
export const UserInfo: React.FC = () => {
  const user = useSelector(selectUser)
  const organization = useSelector(selectOrganization)
  
  // Récupérer les infos à jour depuis l'API
  const { data: userProfile } = useMeQuery(undefined, {
    skip: !user,
  })
  
  // Test des permissions principales
  const canManageUsers = useCan('manage', 'User')
  const canManageEvents = useCan('manage', 'Event')
  const canReadEvents = useCan('read', 'Event')
  const canReadAttendees = useCan('read', 'Attendee')
  const canManageOrg = useCan('manage', 'Organization')

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800">Aucun utilisateur connecté</p>
      </div>
    )
  }

  const roleLabel = userProfile?.role?.name || 'Non défini'

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        Informations utilisateur connecté
      </h3>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>ID:</strong> {user.id}
        </div>
        <div>
          <strong>Email:</strong> {user.email || 'Non disponible'}
        </div>
        <div>
          <strong>Nom:</strong> {(() => {
            const firstName = user.firstName || user.first_name
            const lastName = user.lastName || user.last_name
            if (firstName && lastName) {
              return `${firstName} ${lastName}`
            }
            return 'Non disponible'
          })()}
        </div>
        <div>
          <strong>Rôle:</strong> <span className="px-2 py-1 bg-blue-100 rounded text-blue-800">
            {roleLabel} ({primaryRole})
          </span>
        </div>
        <div>
          <strong>Organisation:</strong> {organization?.name || 'Chargement...'}
        </div>
        <div>
          <strong>Org ID:</strong> {user.orgId}
        </div>
      </div>

      <h4 className="text-md font-semibold text-blue-900 mt-4 mb-2">
        Permissions accordées
      </h4>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className={`flex items-center ${canManageOrg ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{canManageOrg ? '✅' : '❌'}</span>
          Gérer organisation
        </div>
        <div className={`flex items-center ${canManageUsers ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{canManageUsers ? '✅' : '❌'}</span>
          Gérer utilisateurs
        </div>
        <div className={`flex items-center ${canManageEvents ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{canManageEvents ? '✅' : '❌'}</span>
          Gérer événements
        </div>
        <div className={`flex items-center ${canReadEvents ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{canReadEvents ? '✅' : '❌'}</span>
          Voir événements
        </div>
        <div className={`flex items-center ${canReadAttendees ? 'text-green-600' : 'text-red-600'}`}>
          <span className="mr-2">{canReadAttendees ? '✅' : '❌'}</span>
          Voir participants
        </div>
      </div>
    </div>
  )
}