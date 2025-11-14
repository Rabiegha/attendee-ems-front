import React, { useState } from 'react'
import {
  Shield,
  Users,
  AlertCircle,
  RefreshCw,
  Lock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Can } from '@/shared/acl/guards/Can'
import { useToast } from '@/shared/hooks/useToast'
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
} from '@/shared/ui'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '@/features/roles/api/rolesApi'
import type { Permission } from '@/features/roles/api/rolesApi'
import { canModifyUser } from '@/shared/lib/role-hierarchy'
import type { RootState } from '@/app/store'

export const RolePermissionsAdmin: React.FC = () => {
  const {
    data: rolesRaw = [],
    isLoading: isLoadingRoles,
    error: rolesError,
    refetch: refetchRoles,
  } = useGetRolesQuery()
  const {
    data: permissionsRaw = [],
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useGetPermissionsQuery()
  const [updateRolePermissions, { isLoading: isUpdating }] =
    useUpdateRolePermissionsMutation()

  // Récupérer l'utilisateur connecté depuis Redux
  const currentUser = useSelector((state: RootState) => state.session.user)
  const currentUserRoleCode = currentUser?.roles?.[0] || ''
  const currentUserId = currentUser?.id || ''

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  
  const toast = useToast()

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !(prev[category] ?? false)
    }))
  }

  const isLoading = isLoadingRoles || isLoadingPermissions
  const error = rolesError || permissionsError

  // Définir la hiérarchie des rôles (du plus élevé au plus bas)
  const roleHierarchy = ['admin', 'manager', 'user']
  
  const getUserRoleLevel = (roleCode: string): number => {
    const index = roleHierarchy.indexOf(roleCode.toLowerCase())
    return index === -1 ? roleHierarchy.length : index
  }

  // Filtrer les rôles : 
  // 1. Enlever les doublons 
  // 2. Ne garder que les rôles de l'organisation
  // 3. Ne garder que les rôles de niveau inférieur à l'utilisateur
  const roles = rolesRaw.filter((role) => {
    if (role.org_id === null) return false
    
    const currentUserLevel = getUserRoleLevel(currentUserRoleCode)
    const roleLevel = getUserRoleLevel(role.code || '')
    
    // Ne montrer que les rôles de niveau strictement inférieur
    return roleLevel > currentUserLevel
  })

  // Filtrer les permissions : enlever celles qui contiennent :any (SUPER_ADMIN only)
  const permissions = permissionsRaw.filter((permission) => {
    // Exclure toutes les permissions avec :any (scope SUPER_ADMIN)
    if (permission.code.includes(':any')) return false
    
    // Exclure les permissions de gestion globale des organisations (SUPER_ADMIN)
    if (permission.code.startsWith('organizations.create')) return false
    if (permission.code.startsWith('organizations.delete')) return false
    
    return true
  })

  const selectedRole = roles.find((r) => r.id === selectedRoleId)

  const handlePermissionToggle = async (
    permissionId: string,
    isChecked: boolean
  ) => {
    if (!selectedRole) return

    // Vérification côté client : ne peut pas modifier son propre rôle
    const isOwnRole = currentUser?.roles?.includes(selectedRole.code || '')
    if (isOwnRole) {
      console.error(
        'Vous ne pouvez pas modifier les permissions de votre propre rôle'
      )
      alert('Vous ne pouvez pas modifier les permissions de votre propre rôle')
      return
    }

    // Vérification hiérarchique : peut modifier uniquement les rôles de niveau inférieur
    const hierarchyCheck = canModifyUser(
      currentUserRoleCode,
      selectedRole.code || '',
      currentUserId,
      selectedRole.id
    )

    if (!hierarchyCheck.canModify) {
      console.error(hierarchyCheck.reason)
      alert(hierarchyCheck.reason || 'Vous ne pouvez pas modifier ce rôle')
      return
    }

    const currentPermissionIds =
      selectedRole.permissions?.map((p) => p.id) || []
    const newPermissionIds = isChecked
      ? [...currentPermissionIds, permissionId]
      : currentPermissionIds.filter((id) => id !== permissionId)

    try {
      await updateRolePermissions({
        roleId: selectedRole.id,
        permissionIds: newPermissionIds,
      }).unwrap()

      refetchRoles()
      toast.success('Permissions mises à jour avec succès')
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des permissions:', err)
      const errorMessage =
        err?.data?.message ||
        'Une erreur est survenue lors de la mise à jour des permissions'
      alert(errorMessage)
    }
  }

  const handleRefresh = () => {
    refetchRoles()
  }

  // Grouper les permissions par catégorie (basé sur le préfixe du code)
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const category = permission.code.split('.')[0] || 'other' // Ex: "users", "events", etc.
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const categoryLabels: Record<string, string> = {
    organizations: 'Organisations',
    users: 'Utilisateurs',
    events: 'Événements',
    attendees: 'Participants',
    roles: 'Rôles',
    invitations: 'Invitations',
    analytics: 'Analytics',
    reports: 'Rapports',
  }

  // Protection par permissions - Seuls les ADMIN peuvent voir cette page
  return (
    <Can do="manage" on="Role" fallback={<Navigate to="/403" replace />}>
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader
          title="Gestion des Rôles et Permissions"
          description="Configurez les permissions pour chaque rôle de votre organisation."
          icon={Shield}
          actions={
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
              leftIcon={
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              }
            >
              Actualiser
            </Button>
          }
        />

        {/* Statistiques globales */}
        <PageSection spacing="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">
                      Rôles configurés
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {roles.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">
                      Permissions disponibles
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {permissions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="lg">
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-body-sm text-gray-600 dark:text-gray-400">
                      Rôle sélectionné
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedRole?.name || 'Aucun'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        {/* Gestion des erreurs */}
        {error && (
          <PageSection spacing="lg">
            <Card
              variant="default"
              padding="lg"
              className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
            >
              <CardContent>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-700 dark:text-red-300">
                    Erreur lors du chargement des données
                  </p>
                </div>
              </CardContent>
            </Card>
          </PageSection>
        )}

        {/* État de chargement */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Chargement des rôles et permissions...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche : Liste des rôles */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rôles
                </h3>

                {roles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Aucun rôle trouvé
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roles.map((role) => {
                      // Vérifier si le rôle peut être modifié
                      const isOwnRole = currentUser?.roles?.includes(role.code || '')
                      const hierarchyCheck = canModifyUser(
                        currentUserRoleCode,
                        role.code || '',
                        currentUserId,
                        role.id
                      )
                      const canModify = !isOwnRole && hierarchyCheck.canModify

                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRoleId(role.id)}
                          disabled={!canModify}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedRoleId === role.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : canModify
                                ? 'border-transparent bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                : 'border-transparent bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {role.name}
                                </p>
                                {isOwnRole && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Votre rôle
                                  </span>
                                )}
                                {!canModify && !isOwnRole && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Protégé
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {role.permissions?.length || 0} permissions
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : Permissions du rôle sélectionné */}
            <div className="lg:col-span-2">
              {selectedRole ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  {/* Message d'avertissement si rôle protégé */}
                  {(() => {
                    const isOwnRole = currentUser?.roles?.includes(selectedRole.code || '')
                    const hierarchyCheck = canModifyUser(
                      currentUserRoleCode,
                      selectedRole.code || '',
                      currentUserId,
                      selectedRole.id
                    )
                    const canModify = !isOwnRole && hierarchyCheck.canModify

                    if (!canModify) {
                      return (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                                {isOwnRole
                                  ? 'Votre propre rôle'
                                  : 'Rôle protégé'}
                              </h4>
                              <p className="text-sm text-amber-800 dark:text-amber-300">
                                {isOwnRole
                                  ? 'Vous ne pouvez pas modifier les permissions de votre propre rôle pour des raisons de sécurité.'
                                  : hierarchyCheck.reason ||
                                    'Vous ne pouvez modifier que les rôles de niveau inférieur au vôtre.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedRole.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRole.description}
                    </p>
                  </div>

                  {/* Liste des permissions groupées par catégorie avec dropdowns */}
                  <div className="space-y-3">
                    {Object.entries(groupedPermissions).map(
                      ([category, categoryPermissions]) => {
                        // Vérifier si on peut modifier ce rôle
                        const isOwnRole =
                          currentUser?.roles?.includes(selectedRole.code || '')
                        const hierarchyCheck = canModifyUser(
                          currentUserRoleCode,
                          selectedRole.code || '',
                          currentUserId,
                          selectedRole.id
                        )
                        const canModifyRole =
                          !isOwnRole && hierarchyCheck.canModify
                        
                        const isExpanded = expandedCategories[category] ?? false
                        
                        // Compter les permissions actives dans cette catégorie
                        const activeCount = categoryPermissions.filter(permission =>
                          selectedRole.permissions?.some((p) => p.id === permission.id)
                        ).length

                        return (
                          <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {/* Header de catégorie cliquable */}
                            <button
                              onClick={() => toggleCategory(category)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                                  {categoryLabels[category] || category}
                                </h4>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                  {activeCount}/{categoryPermissions.length}
                                </span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                            
                            {/* Contenu de la catégorie */}
                            {isExpanded && (
                              <div className="p-4 space-y-2 bg-white dark:bg-gray-800">
                                {categoryPermissions.map((permission) => {
                                  const isChecked =
                                    selectedRole.permissions?.some(
                                      (p) => p.id === permission.id
                                    ) || false
                                  return (
                                    <label
                                      key={permission.id}
                                      className={`flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 ${
                                        canModifyRole
                                          ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600'
                                          : 'opacity-60 cursor-not-allowed'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) =>
                                          handlePermissionToggle(
                                            permission.id,
                                            e.target.checked
                                          )
                                        }
                                        disabled={isUpdating || !canModifyRole}
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {permission.name}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {permission.description}
                                        </p>
                                        <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1">
                                          {permission.code}
                                        </p>
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      }
                    )}
                  </div>
                </div>
              ) : (
                <Card variant="default" padding="lg" className="text-center">
                  <CardContent>
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-heading-sm mb-3">
                      Sélectionnez un rôle
                    </h3>
                    <p className="text-body text-gray-600 dark:text-gray-300">
                      Choisissez un rôle dans la liste de gauche pour voir et
                      modifier ses permissions.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </Can>
  )
}
