import { useState } from 'react'
import { Plus, Users, Mail, Calendar, UserCheck, UserX, User as UserIcon } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { CreateUserEnhancedModal } from '@/features/users/ui/CreateUserEnhancedModal'
import { useGetUsersQuery, useGetRolesQuery } from '@/features/users/api/usersApi'
import { Can } from '@/shared/acl/guards/Can'

export function UsersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({})
  const { data: rolesData, isLoading: isLoadingRoles, error: rolesError } = useGetRolesQuery()

  const handleRefresh = () => {
    refetch()
  }

  const handleDebugRoles = () => {
    console.log('🎭 Debug Rôles:')
    console.log('  - isLoadingRoles:', isLoadingRoles)
    console.log('  - rolesData:', rolesData)
    console.log('  - rolesError:', rolesError)
    if (rolesData) {
      console.log(`  - Nombre de rôles trouvés: ${rolesData.length}`)
      rolesData.forEach((role, index) => {
        console.log(`    ${index + 1}. ${role.name} (${role.code}) - ID: ${role.id}`)
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* 🎯 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Créez et gérez les comptes utilisateur de votre organisation
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            loading={isLoading}
          >
            Actualiser
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDebugRoles}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
          >
            🎭 Debug Rôles
          </Button>
          
          <Can do="create" on="User">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Créer un utilisateur
            </Button>
          </Can>
        </div>
      </div>

      {/* 📊 Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total utilisateurs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {usersData?.total || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Actifs
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {usersData?.users?.filter(u => u.is_active).length || 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                À activer
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {usersData?.users?.filter(u => (u as any).mustChangePassword).length || 0}
              </p>
            </div>
            <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactifs
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {usersData?.users?.filter(u => !u.is_active).length || 0}
              </p>
            </div>
            <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* 📋 Liste des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Liste des utilisateurs
          </h2>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              Chargement des utilisateurs...
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!usersData?.users || usersData.users.length === 0) && (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun utilisateur
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Commencez par créer votre premier utilisateur.
            </p>
            <Can do="create" on="User">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Créer un utilisateur
              </Button>
            </Can>
          </div>
        )}

        {/* Users table */}
        {!isLoading && usersData?.users && usersData.users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usersData.users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name && user.last_name ? 
                              `${user.first_name} ${user.last_name}` : 
                              user.email
                            }
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                        {user.role?.name || 'Non défini'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {(user as any).mustChangePassword ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
                            <Mail className="h-3 w-3 mr-1" />
                            Doit changer mdp
                          </span>
                        ) : user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactif
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Can do="update" on="User" data={user}>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🎯 Modal de création */}
      <CreateUserEnhancedModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}