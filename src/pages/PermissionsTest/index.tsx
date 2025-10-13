import React from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser, selectUserRoles } from '@/features/auth/model/sessionSlice'
import { Can } from '@/shared/acl/guards/Can'

export const PermissionsTestPage: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const roles = useSelector(selectUserRoles)

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Test des Permissions</h1>
        <p>Vous devez être connecté pour voir cette page.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Test des Permissions</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Informations Utilisateur</h2>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Nom:</strong> {(() => {
          const firstName = user?.firstName || user?.first_name
          const lastName = user?.lastName || user?.last_name
          if (firstName && lastName) {
            return `${firstName} ${lastName}`
          }
          return 'Non disponible'
        })()}</p>
        <p><strong>Rôles:</strong> {roles.join(', ')}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-2">Tests de Permissions</h2>
        
        <div className="border p-4 rounded">
          <h3 className="font-medium mb-2">Gestion des Événements</h3>
          <Can do="create" on="Event" fallback={<p className="text-red-500">❌ Pas d'autorisation pour créer des événements</p>}>
            <p className="text-green-500">✅ Peut créer des événements</p>
          </Can>
          
          <Can do="read" on="Event" fallback={<p className="text-red-500">❌ Pas d'autorisation pour lire les événements</p>}>
            <p className="text-green-500">✅ Peut lire les événements</p>
          </Can>
          
          <Can do="update" on="Event" fallback={<p className="text-red-500">❌ Pas d'autorisation pour modifier les événements</p>}>
            <p className="text-green-500">✅ Peut modifier les événements</p>
          </Can>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-medium mb-2">Gestion des Participants</h3>
          <Can do="create" on="Attendee" fallback={<p className="text-red-500">❌ Pas d'autorisation pour créer des participants</p>}>
            <p className="text-green-500">✅ Peut créer des participants</p>
          </Can>
          
          <Can do="checkin" on="Attendee" fallback={<p className="text-red-500">❌ Pas d'autorisation pour faire le check-in</p>}>
            <p className="text-green-500">✅ Peut faire le check-in des participants</p>
          </Can>
          
          <Can do="export" on="Attendee" fallback={<p className="text-red-500">❌ Pas d'autorisation pour exporter</p>}>
            <p className="text-green-500">✅ Peut exporter les données</p>
          </Can>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-medium mb-2">Administration</h3>
          <Can do="manage" on="Organization" fallback={<p className="text-red-500">❌ Pas d'autorisation admin organisation</p>}>
            <p className="text-green-500">✅ Administrateur de l'organisation</p>
          </Can>
          
          <Can do="read" on="Settings" fallback={<p className="text-red-500">❌ Pas d'accès aux paramètres</p>}>
            <p className="text-green-500">✅ Peut accéder aux paramètres</p>
          </Can>
        </div>
      </div>
    </div>
  )
}

export default PermissionsTestPage
