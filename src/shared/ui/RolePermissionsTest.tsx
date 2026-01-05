import React from 'react'
import { useSelector } from 'react-redux'
import { selectUser } from '@/features/auth/model/sessionSlice'
import { useCan } from '@/shared/acl/hooks/useCan'
import { Can } from '@/shared/acl/guards/Can'
import { getRoleLabel } from '@/shared/acl/role-mapping'

/**
 * Composant de test pour visualiser les différences de permissions selon les rôles
 */
export const RolePermissionsTest: React.FC = () => {
  const user = useSelector(selectUser)

  if (!user) return null

  const role = user.roles?.[0] || 'unknown'
  const roleLabel = getRoleLabel(role)

  // Tests de permissions
  const permissions = [
    { action: 'read', subject: 'Organization', label: 'Voir organisation' },
    { action: 'manage', subject: 'Organization', label: 'Gérer organisation' },
    { action: 'read', subject: 'Event', label: 'Voir événements' },
    { action: 'manage', subject: 'Event', label: 'Gérer événements' },
    { action: 'create', subject: 'Event', label: 'Créer événements' },
    { action: 'read', subject: 'Attendee', label: 'Voir participants' },
    { action: 'manage', subject: 'Attendee', label: 'Gérer participants' },
    { action: 'read', subject: 'User', label: 'Voir utilisateurs' },
    { action: 'manage', subject: 'User', label: 'Gérer utilisateurs' },
    { action: 'invite', subject: 'User', label: 'Inviter utilisateurs' },
    { action: 'create', subject: 'User', label: 'Créer utilisateurs' },
    { action: 'read', subject: 'Report', label: 'Voir rapports' },
    { action: 'export', subject: 'Report', label: 'Exporter rapports' },
    { action: 'read', subject: 'Settings', label: 'Voir paramètres' },
    { action: 'manage', subject: 'Settings', label: 'Gérer paramètres' },
  ] as const

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🔐 Test des Permissions par Rôle
      </h3>
      
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm">
          <strong>Rôle actuel:</strong> <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-200">
            {roleLabel} ({role})
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
        {permissions.map((perm, index) => (
          <PermissionTest
            key={index}
            action={perm.action}
            subject={perm.subject}
            label={perm.label}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          🧪 Tests de composants protégés
        </h4>
        <div className="flex flex-wrap gap-2">
          <Can do="create" on="Event">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Bouton "Créer Événement" visible
            </span>
          </Can>
          <Can do="manage" on="User">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Page "Utilisateurs" accessible
            </span>
          </Can>
          <Can do="manage" on="Settings">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Menu "Paramètres" visible
            </span>
          </Can>
        </div>
      </div>
    </div>
  )
}

interface PermissionTestProps {
  action: string
  subject: string
  label: string
}

const PermissionTest: React.FC<PermissionTestProps> = ({ action, subject, label }) => {
  const canDo = useCan(action as any, subject as any)
  
  return (
    <div className={`flex items-center justify-between p-2 rounded ${
      canDo 
        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
    }`}>
      <span className="text-xs">{label}</span>
      <span className="text-lg">{canDo ? '✅' : '❌'}</span>
    </div>
  )
}