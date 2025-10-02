import React, { useState, useEffect } from 'react'
import { Shield, Users, AlertCircle, RefreshCw } from 'lucide-react'
import { Can } from '@/shared/acl/guards/Can'
import { Button } from '@/shared/ui/Button'
import { RoleCard } from '../../features/roles/components/RoleCard'
import { rolePermissionsApi } from '../../features/roles/api/rolePermissionsApi'
import type { Role, Permission } from '../../features/roles/types'

export const RolePermissionsAdmin: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Charger les données initiales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [rolesData, permissionsData] = await Promise.all([
        rolePermissionsApi.getRoles(),
        rolePermissionsApi.getPermissions()
      ])
      
      setRoles(rolesData)
      setPermissions(permissionsData)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error('Failed to load roles and permissions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionChange = async (roleId: string, permissionId: string, _granted: boolean) => {
    try {
      setIsUpdating(true)
      
      // Appel API pour toggle la permission
      const response = await rolePermissionsApi.toggleRolePermission(roleId, permissionId)
      
      if (response.success) {
        // Mise à jour optimiste de l'état local
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === roleId ? response.role : role
          )
        )
        setLastUpdated(new Date())
        
        // TODO: Add success toast notification
        console.log(response.message)
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des permissions')
      console.error('Failed to update permission:', err)
      // TODO: Add error toast notification
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  // Protection par permissions - Seuls les ADMIN peuvent voir cette page
  return (
    <Can do="manage" on="Role" fallback={<UnauthorizedAccess />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête de la page */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Gestion des Rôles et Permissions
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Configurez les permissions pour chaque rôle de votre organisation.
                  Les modifications sont appliquées en temps réel.
                </p>
              </div>
              
              <Button
                variant="secondary"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </Button>
            </div>
            
            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rôles configurés</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Permissions disponibles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{permissions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dernière mise à jour</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Jamais'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gestion des erreurs */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}

          {/* État de chargement */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Chargement des rôles et permissions...</p>
              </div>
            </div>
          ) : (
            /* Liste des rôles */
            <div className="space-y-6">
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun rôle configuré
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Aucun rôle n'a été trouvé pour cette organisation.
                  </p>
                </div>
              ) : (
                roles.map(role => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    permissions={permissions}
                    onPermissionChange={handlePermissionChange}
                    isUpdating={isUpdating}
                  />
                ))
              )}
            </div>
          )}

          {/* Footer avec informations */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 Informations importantes
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Les modifications sont sauvegardées <strong>automatiquement</strong> en temps réel</li>
                <li>• Les permissions sont appliquées <strong>immédiatement</strong> pour tous les utilisateurs</li>
                <li>• Seuls les <strong>administrateurs</strong> peuvent modifier les permissions des rôles</li>
                <li>• Le rôle <strong>SUPER_ADMIN</strong> a automatiquement toutes les permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Can>
  )
}

// Composant affiché quand l'utilisateur n'a pas les permissions
const UnauthorizedAccess: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Accès non autorisé
      </h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        Seuls les administrateurs peuvent gérer les rôles et permissions.
      </p>
      <Button
        variant="secondary"
        onClick={() => window.history.back()}
      >
        Retour
      </Button>
    </div>
  </div>
)