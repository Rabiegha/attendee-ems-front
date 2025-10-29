/**
 * UsersPage - Page de gestion des utilisateurs
 *
 * Utilise les composants du design system:
 * - PageContainer pour le layout de base
 * - PageHeader pour l'en-tête avec actions
 * - PageSection pour les sections de contenu
 * - Card pour les cartes de statistiques
 * - ActionGroup pour grouper les boutons
 */

import {
  Users,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  User as UserIcon,
  RefreshCw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  PageContainer,
  PageHeader,
  PageSection,
  ActionGroup,
  LoadingSpinner,
  ActionButtons,
} from '@/shared/ui'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import { Can } from '@/shared/acl/guards/Can'
import { RoleSelector } from '@/features/users/ui/RoleSelector'
import { selectUser } from '@/features/auth/model/sessionSlice'

export function UsersPage() {
  const navigate = useNavigate()
  const currentUser = useSelector(selectUser)
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({})
  
  // États pour les modals (à implémenter si nécessaire)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [deletingUser, setDeletingUser] = useState<any>(null)

  const handleRefresh = () => {
    refetch()
  }

  const handleInviteUser = () => {
    navigate('/invitations')
  }

  // Calcul des statistiques
  const stats = {
    total: usersData?.total || 0,
    active: usersData?.users?.filter((u) => u.is_active).length || 0,
    pending:
      usersData?.users?.filter((u) => (u as any).mustChangePassword).length ||
      0,
    inactive: usersData?.users?.filter((u) => !u.is_active).length || 0,
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      {/* En-tête de page avec nouveau composant PageHeader */}
      <PageHeader
        title="Gestion des utilisateurs"
        description="Créez et gérez les comptes utilisateur de votre organisation"
        icon={Users}
        actions={
          <ActionGroup align="right" spacing="md">
            <Button
              variant="outline"
              onClick={handleRefresh}
              loading={isLoading}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Actualiser
            </Button>

            <Can do="create" on="User">
              <Button
                variant="default"
                onClick={handleInviteUser}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Inviter utilisateur
              </Button>
            </Can>
          </ActionGroup>
        }
      />

      {/* Section des statistiques */}
      <PageSection spacing="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Statistique 1 */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Total utilisateurs
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          {/* Statistique 2 */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Actifs
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {stats.active}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          {/* Statistique 3 */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    À activer
                  </p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {stats.pending}
                  </p>
                </div>
                <Mail className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          {/* Statistique 4 */}
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm text-gray-600 dark:text-gray-400">
                    Inactifs
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {stats.inactive}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Section liste des utilisateurs */}
      <PageSection title="Liste des utilisateurs" spacing="lg">
        <Card variant="default" padding="none">
          {/* Loading state */}
          {isLoading && (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-4">
                Chargement des utilisateurs...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading &&
            (!usersData?.users || usersData.users.length === 0) && (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-heading-sm mb-2">Aucun utilisateur</h3>
                <p className="text-body text-gray-500 dark:text-gray-400 mb-6">
                  Commencez par créer votre premier utilisateur.
                </p>
                <Can do="create" on="User">
                  <Button
                    onClick={handleInviteUser}
                    leftIcon={<Mail className="h-4 w-4" />}
                  >
                    Inviter un utilisateur
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
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.email}
                            </div>
                            <div className="text-caption">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Can
                          do="assign"
                          on="Role"
                          fallback={
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                              {user.role?.name || 'Non défini'}
                            </span>
                          }
                        >
                          <RoleSelector
                            user={user}
                            currentUserId={currentUser?.id}
                          />
                        </Can>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-body-sm">
                          <Calendar className="h-4 w-4" />
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString(
                                'fr-FR'
                              )
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <ActionButtons
                          onEdit={() => setEditingUser(user)}
                          onDelete={() => setDeletingUser(user)}
                          canEdit={{ do: 'update', on: 'User', data: user }}
                          canDelete={{ do: 'delete', on: 'User', data: user }}
                          size="sm"
                          iconOnly
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </PageSection>
    </PageContainer>
  )
}
