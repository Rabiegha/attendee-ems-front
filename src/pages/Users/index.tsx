/**
 * UsersPage - Page de gestion des utilisateurs (Migration vers DataTable)
 *
 * Utilise DataTable (TanStack Table) au lieu de table HTML custom
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { ColumnDef } from '@tanstack/react-table'
import {
  Users,
  Mail,
  UserCheck,
  UserX,
  User as UserIcon,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  PageContainer,
  PageHeader,
  PageSection,
  ActionGroup,
  StatsGridSkeleton,
  Tabs,
  DataTable,
  createDateColumn,
  createActionsColumn,
  TableSelector,
  SearchInput,
  FilterBar,
  FilterButton,
  type TableSelectorOption,
  type FilterValues,
} from '@/shared/ui'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { createBulkActions } from '@/shared/ui/BulkActions'
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useBulkDeleteUsersMutation,
  usersApi,
  type User,
} from '@/features/users/api/usersApi'
import { useGetRolesFilteredQuery } from '@/features/roles/api/rolesApi'
import { Can } from '@/shared/acl/guards/Can'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
import { selectUser } from '@/features/auth/model/sessionSlice'
import { EditUserModal } from '@/features/users/ui/EditUserModal'
import { DeleteUserModal } from '@/features/users/ui/DeleteUserModal'
import { RestoreUserModal } from '@/features/users/ui/RestoreUserModal'
import { PermanentDeleteUserModal } from '@/features/users/ui/PermanentDeleteUserModal'
import {
  selectUsersFilters,
  selectUsersActiveTab,
  setActiveTab,
  setFilters,
  type UsersTab,
} from '@/features/users/model/usersSlice'
import { useToast } from '@/shared/hooks/useToast'

function UsersPageContent() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const currentUser = useSelector(selectUser)
  const toast = useToast()

  // Redux state
  const filters = useSelector(selectUsersFilters)
  const activeTab = useSelector(selectUsersActiveTab)

  // API queries
  const { data: usersData, isLoading } = useGetUsersQuery(filters)
  
  // Récupérer la liste des rôles avec l'orgId de l'utilisateur connecté
  const rolesParams = useMemo(() => {
    return currentUser?.orgId ? { orgId: currentUser.orgId } : {}
  }, [currentUser?.orgId])
  
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesFilteredQuery(rolesParams)
  
  // Queries for stats (active users count)
  const { data: activeUsersStats } = useGetUsersQuery({
    page: 1,
    limit: 1,
    isActive: true,
  })

  // Query for stats (deleted users count)
  const { data: deletedUsersStats } = useGetUsersQuery({
    page: 1,
    limit: 1,
    isActive: false,
  })

  // Mutations
  const [updateUser] = useUpdateUserMutation()
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation()

  // Optimistic updates: stocke temporairement les nouveaux roleId avant confirmation serveur
  const [optimisticRoleUpdates, setOptimisticRoleUpdates] = useState<Map<string, string>>(new Map())

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [restoringUser, setRestoringUser] = useState<User | null>(null)
  const [permanentDeletingUser, setPermanentDeletingUser] = useState<User | null>(null)

  // Filtres locaux (recherche + rôles)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilters, setRoleFilters] = useState<FilterValues>({})
  const lastSearchRef = useRef<string>('')

  // Tabs configuration
  const isDeletedTab = activeTab === 'deleted'

  // Envoyer la recherche au backend via debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ne pas appeler si la valeur n'a pas changé
      if (searchQuery !== lastSearchRef.current) {
        lastSearchRef.current = searchQuery
        dispatch(setFilters({ ...(searchQuery && { search: searchQuery }), page: 1 }))
      }
    }, 500) // Debounce de 500ms
    return () => clearTimeout(timer)
  }, [searchQuery, dispatch])

  // Filtrage local côté client uniquement pour les rôles (car non géré par le backend)
  const selectedRoleId = roleFilters.roles as string | undefined
  const filteredUsers = useMemo(() => {
    let users = usersData?.users || []

    // Filtre par rôle (single select)
    if (selectedRoleId && selectedRoleId !== 'all') {
      users = users.filter((user) => {
        // user.role is the correct property, not user.roles
        return user.role?.id === selectedRoleId
      })
    }

    return users
  }, [usersData?.users, selectedRoleId])

  // Configuration des filtres pour le popup
  const filterConfig = useMemo(() => ({
    roles: {
      label: 'Rôles',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les rôles' },
        ...roles.map((role) => ({
          value: role.id,
          label: role.name || role.code,
        })),
      ],
    },
  }), [roles])

  const handleResetFilters = () => {
    setSearchQuery('')
    setRoleFilters({})
    dispatch(setFilters({ page: 1 }))
  }

  const handleRefresh = () => {
    dispatch(usersApi.util.invalidateTags(['Users']))
  }

  const handleInviteUser = () => {
    navigate('/invitations')
  }

  const handleTabChange = (tabId: string) => {
    dispatch(setActiveTab(tabId as UsersTab))
  }

  // Actions pour utilisateurs actifs
  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
  }

  const handleSaveUser = async (userId: string, data: any) => {
    await updateUser({ id: userId, data }).unwrap()
    setEditingUser(null)
  }

  const handleConfirmDelete = async (userId: string, data: any) => {
    await updateUser({ id: userId, data }).unwrap()
    setDeletingUser(null)
  }

  // Actions pour utilisateurs supprimés
  const handleRestoreUser = (user: User) => {
    setRestoringUser(user)
  }

  const handlePermanentDelete = (user: User) => {
    setPermanentDeletingUser(user)
  }

  const handleConfirmRestore = async (userId: string, data: any) => {
    await updateUser({ id: userId, data }).unwrap()
    setRestoringUser(null)
  }

  const handleConfirmPermanentDelete = async (userIds: string[]) => {
    await bulkDeleteUsers(userIds).unwrap()
    setPermanentDeletingUser(null)
  }

  // Calculate stats from queries
  const stats = {
    total: (activeUsersStats?.total || 0) + (deletedUsersStats?.total || 0),
    active: activeUsersStats?.total || 0,
    pending: usersData?.users?.filter((u) => u.must_change_password).length || 0, // This requires current data
    inactive: deletedUsersStats?.total || 0,
  }

  // Tabs data
  const tabs = [
    {
      id: 'active',
      label: 'Utilisateurs actifs',
      count: stats.active,
    },
    {
      id: 'deleted',
      label: 'Utilisateurs supprimés',
      count: stats.inactive,
    },
  ]

  // Définition des colonnes
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      createSelectionColumn<User>(),
      // Colonne Utilisateur (avec avatar et email)
      {
        id: 'user',
        header: 'Utilisateur',
        accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''} ${row.email}`,
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const user = row.original
          return (
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
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
          )
        },
        enableSorting: true,
      },

      // Colonne Rôle (avec TableSelector si permission)
      {
        id: 'role',
        header: 'Rôle',
        accessorKey: 'role.name',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const user = row.original
          
          // Si les rôles sont en chargement, afficher un loader
          if (rolesLoading) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                Chargement...
              </span>
            )
          }
          
          // Si aucun rôle n'est disponible, afficher le rôle statique
          if (roles.length === 0) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                {user.role?.name || 'Non défini'}
              </span>
            )
          }
          
          // Trouver le niveau du rôle de l'utilisateur connecté
          const currentUserRoleCode = currentUser?.roles?.[0] // Premier rôle dans le JWT
          const currentUserRole = roles.find(r => r.code === currentUserRoleCode)
          const currentUserLevel = currentUserRole?.level ?? 999
          
          // Filtrer les rôles selon la hiérarchie
          // L'utilisateur connecté ne peut attribuer que des rôles de niveau supérieur ou égal au sien
          let availableRoles = roles.filter(role => role.level >= currentUserLevel)
          
          // Toujours inclure le rôle actuel de l'utilisateur pour l'affichage
          if (user.role?.id && !availableRoles.find(r => r.id === user.role.id)) {
            const targetUserRole = roles.find(r => r.id === user.role.id)
            if (targetUserRole) {
              availableRoles = [targetUserRole, ...availableRoles]
            }
          }
          
          const roleOptions: TableSelectorOption[] = availableRoles.map(role => ({
            value: role.id,
            label: role.name,
            description: role.description,
            color: 'blue' as const,
          }))

          // Utiliser la valeur optimiste si disponible, sinon la valeur serveur
          const optimisticRoleId = optimisticRoleUpdates.get(user.id)
          const displayedRoleId = optimisticRoleId || user.role?.id || ''
          
          // Si on a une valeur optimiste ET que le serveur a renvoyé la même valeur, on peut nettoyer
          if (optimisticRoleId && user.role?.id === optimisticRoleId) {
            // Nettoyer de manière asynchrone pour éviter les updates pendant le render
            Promise.resolve().then(() => {
              setOptimisticRoleUpdates(prev => {
                const next = new Map(prev)
                next.delete(user.id)
                return next
              })
            })
          }
          
          const displayedRole = roles.find(r => r.id === displayedRoleId)

          return (
            <Can
              do="assign"
              on="Role"
              fallback={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                  {displayedRole?.name || user.role?.name || 'Non défini'}
                </span>
              }
            >
              <TableSelector
                value={displayedRoleId}
                options={roleOptions}
                onChange={async (newRoleId) => {
                  if (user.id === currentUser?.id) {
                    throw new Error('Vous ne pouvez pas modifier votre propre rôle')
                  }
                  // Optimistic update: afficher immédiatement le nouveau rôle
                  setOptimisticRoleUpdates(prev => new Map(prev).set(user.id, newRoleId))
                  
                  try {
                    await updateUser({
                      id: user.id,
                      data: { role_id: newRoleId },
                    }).unwrap()
                    
                    // Trouver le nom du nouveau rôle pour le toast
                    const newRole = roles?.find(r => r.id === newRoleId)
                    toast.success(
                      'Rôle mis à jour',
                      `Le rôle de ${user.first_name} ${user.last_name} a été changé en ${newRole?.name || 'nouveau rôle'}`
                    )
                    // Le nettoyage se fera automatiquement quand le serveur renverra la bonne valeur
                  } catch (error) {
                    console.error('Error updating role:', error)
                    // Erreur: restaurer l'ancienne valeur immédiatement
                    setOptimisticRoleUpdates(prev => {
                      const next = new Map(prev)
                      next.delete(user.id)
                      return next
                    })
                    toast.error('Erreur', 'Impossible de mettre à jour le rôle')
                    throw error
                  }
                }}
                disabled={user.id === currentUser?.id}
              />
            </Can>
          )
        },
        enableSorting: true,
      },

      // Colonne Statut (badges conditionnels)
      {
        id: 'status',
        header: 'Statut',
        accessorFn: (row) => {
          if (row.must_change_password) return 'pending'
          if (row.is_active) return 'active'
          return 'inactive'
        },
        cell: ({ row }) => {
          const user = row.original
          
          if (user.must_change_password) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200">
                <Mail className="h-3 w-3 mr-1" />
                Doit changer mdp
              </span>
            )
          }
          
          if (user.is_active) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                Actif
              </span>
            )
          }
          
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
              <UserX className="h-3 w-3 mr-1" />
              Inactif
            </span>
          )
        },
        enableSorting: true,
      },

      // Colonne Date de création
      createDateColumn<User>('created_at', 'Créé le'),

      // Colonne Actions (conditionnelle selon l'onglet)
      createActionsColumn<User>((user) => {
        if (isDeletedTab) {
          // Actions pour utilisateurs supprimés
          return (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRestoreUser(user)
                }}
                title="Restaurer"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 flex-shrink-0 min-w-[32px] p-1.5"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePermanentDelete(user)
                }}
                title="Supprimer définitivement"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
              </Button>
            </>
          )
        }
        
        // Actions pour utilisateurs actifs
        return (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleEditUser(user)
              }}
              title="Modifier"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 min-w-[32px] p-1.5"
            >
              <Edit2 className="h-4 w-4 shrink-0" />
            </Button>
            {user.id !== currentUser?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteUser(user)
                }}
                title="Désactiver"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
              </Button>
            )}
          </>
        )
      }),
    ],
    [currentUser?.id, isDeletedTab, roles, rolesLoading, optimisticRoleUpdates, updateUser]
  )

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    if (!isDeletedTab) {
      // Désactiver (soft delete)
      actions.push(
        createBulkActions.delete(async (selectedIds) => {
          try {
            await bulkDeleteUsers(Array.from(selectedIds)).unwrap()
            toast.success(`${selectedIds.size} utilisateur(s) désactivé(s)`)
          } catch (error) {
            console.error('Erreur lors de la désactivation:', error)
            toast.error('Erreur lors de la désactivation')
            throw error
          }
        })
      )
    }

    return actions
  }, [isDeletedTab, bulkDeleteUsers, toast])

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      {/* En-tête de page */}
      <PageHeader
        title="Gestion des utilisateurs"
        description="Créez et gérez les comptes utilisateur de votre organisation"
        icon={Users}
        actions={
          <ActionGroup align="right" spacing="md">
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

      {/* Section liste des utilisateurs */}
      <PageSection spacing="lg">
        <FilterBar
          resultCount={usersData?.total || 0}
          resultLabel="utilisateur"
          onReset={handleResetFilters}
          showResetButton={searchQuery !== '' || (selectedRoleId !== undefined && selectedRoleId !== 'all')}
          onRefresh={handleRefresh}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <FilterButton
            filters={filterConfig}
            values={roleFilters}
            onChange={setRoleFilters}
          />
        </FilterBar>
      </PageSection>

      {/* Table des utilisateurs */}
      <PageSection spacing="lg">
        <Card variant="default" padding="none">
          <DataTable
            key={activeTab}
            columns={columns}
            data={filteredUsers}
            isLoading={isLoading}
            enableRowSelection
            bulkActions={bulkActions}
            getItemId={(user) => user.id}
            itemType="utilisateurs"
            emptyMessage={
              isDeletedTab
                ? 'Aucun utilisateur supprimé'
                : 'Aucun utilisateur trouvé'
            }
            tabsElement={
              <Tabs
                items={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            }
            // Server-side pagination
            enablePagination={true}
            pageSize={filters.pageSize || 20}
            currentPage={filters.page || 1}
            totalItems={usersData?.total || 0}
            onPageChange={(page: number) => {
              dispatch(setFilters({ page }))
            }}
            onPageSizeChange={(pageSize: number) => {
              dispatch(setFilters({ pageSize, page: 1 }))
            }}
          />
        </Card>
      </PageSection>

      {/* Modals */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <DeleteUserModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        user={deletingUser}
        onDelete={handleConfirmDelete}
      />

      <RestoreUserModal
        user={restoringUser}
        onClose={() => setRestoringUser(null)}
        onRestore={handleConfirmRestore}
      />

      <PermanentDeleteUserModal
        user={permanentDeletingUser}
        onClose={() => setPermanentDeletingUser(null)}
        onDelete={handleConfirmPermanentDelete}
      />
    </PageContainer>
  )
}

export const UsersPage = () => (
  <ProtectedPage
    action="read"
    subject="User"
    deniedTitle="Accès aux utilisateurs refusé"
    deniedMessage="Vous n'avez pas les permissions nécessaires pour consulter les utilisateurs."
  >
    <UsersPageContent />
  </ProtectedPage>
)
