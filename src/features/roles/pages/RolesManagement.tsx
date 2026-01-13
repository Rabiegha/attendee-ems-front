/**
 * RolesManagement - Page principale de gestion des rôles et permissions
 * Fonctionnalités :
 * - Liste drag & drop des rôles
 * - Création/Édition/Suppression de rôles
 * - Attribution de permissions aux rôles avec scopes
 * - Réorganisation de la hiérarchie des rôles
 */

import React, { useState } from 'react'
import { Plus, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import {
  useGetRbacRolesQuery,
  useGetAllPermissionsQuery,
  useCreateRbacRoleMutation,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,
  useRestoreRbacRoleMutation,
  usePermanentlyDeleteRbacRoleMutation,
  useAssignPermissionsMutation,
  useReorderRolesMutation,
  useGetNextRankQuery,
  type RoleWithDetails,
} from '../api/rbacAdminApi'
import { RolesDragList } from '../components/RolesDragList'
import { PermissionsModal } from '../components/PermissionsModal'
import { RoleFormModal } from '../components/RoleFormModal'

type TabType = 'active' | 'inactive'

export function RolesManagement() {
  const { orgId } = useParams<{ orgId: string }>()

  if (!orgId) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Organization ID manquant dans l'URL</p>
      </div>
    )
  }

  // State
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [selectedRole, setSelectedRole] = useState<RoleWithDetails | null>(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showRoleFormModal, setShowRoleFormModal] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<RoleWithDetails | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<RoleWithDetails | null>(null)

  // Queries
  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useGetRbacRolesQuery({ orgId, includeInactive: true })

  const {
    data: allPermissions = [],
    isLoading: permissionsLoading,
  } = useGetAllPermissionsQuery()

  const { data: nextRankData } = useGetNextRankQuery(orgId)

  // Mutations
  const [createRole, { isLoading: creating }] = useCreateRbacRoleMutation()
  const [updateRole, { isLoading: updating }] = useUpdateRbacRoleMutation()
  const [deleteRole, { isLoading: deleting }] = useDeleteRbacRoleMutation()
  const [restoreRole, { isLoading: restoring }] = useRestoreRbacRoleMutation()
  const [permanentlyDeleteRole, { isLoading: permanentlyDeleting }] = usePermanentlyDeleteRbacRoleMutation()
  const [assignPermissions, { isLoading: assigningPerms }] =
    useAssignPermissionsMutation()
  const [reorderRoles, { isLoading: reordering }] = useReorderRolesMutation()

  // Filter roles by active tab
  const displayedRoles = roles.filter((role) =>
    activeTab === 'active' ? role.is_active : !role.is_active
  )

  // Handlers
  const handleCreateRole = async (data: {
    code: string
    name: string
    level?: number
    rank?: number
  }) => {
    try {
      await createRole({
        orgId,
        ...data,
      }).unwrap()
      setShowRoleFormModal(false)
    } catch (error: any) {
      console.error('Erreur création rôle:', error)
      alert(error?.data?.message || 'Erreur lors de la création du rôle')
    }
  }

  const handleUpdateRole = async (data: {
    name?: string
    level?: number
    rank?: number
  }) => {
    if (!roleToEdit) return

    try {
      await updateRole({
        roleId: roleToEdit.id,
        data,
      }).unwrap()
      setShowRoleFormModal(false)
      setRoleToEdit(null)
    } catch (error: any) {
      console.error('Erreur mise à jour rôle:', error)
      alert(error?.data?.message || 'Erreur lors de la mise à jour du rôle')
    }
  }

  const handleDeleteRole = async (role: RoleWithDetails) => {
    if (
      !window.confirm(
        `Désactiver le rôle "${role.name}" ? Il pourra être réactivé depuis l'onglet Désactivés.`
      )
    ) {
      return
    }

    try {
      await deleteRole({ roleId: role.id, orgId }).unwrap()
    } catch (error: any) {
      console.error('Erreur désactivation rôle:', error)
      alert(error?.data?.message || 'Erreur lors de la désactivation du rôle')
    }
  }

  const handleRestoreRole = async (role: RoleWithDetails) => {
    try {
      await restoreRole({ roleId: role.id, orgId }).unwrap()
    } catch (error: any) {
      console.error('Erreur réactivation rôle:', error)
      alert(error?.data?.message || 'Erreur lors de la réactivation du rôle')
    }
  }

  const handlePermanentlyDeleteRole = async (role: RoleWithDetails) => {
    if (
      !window.confirm(
        `⚠️ ATTENTION : Supprimer DÉFINITIVEMENT le rôle "${role.name}" ?\n\nCette action est IRRÉVERSIBLE !`
      )
    ) {
      return
    }

    try {
      await permanentlyDeleteRole({ roleId: role.id, orgId }).unwrap()
    } catch (error: any) {
      console.error('Erreur suppression définitive rôle:', error)
      if (error?.data?.message?.includes('assigned')) {
        alert('Impossible de supprimer définitivement un rôle assigné à des utilisateurs')
      } else {
        alert(error?.data?.message || 'Erreur lors de la suppression définitive du rôle')
      }
    }
  }

  const handleManagePermissions = (role: RoleWithDetails) => {
    setSelectedRole(role)
    setShowPermissionsModal(true)
  }

  const handleSavePermissions = async (permissionIds: string[]) => {
    if (!selectedRole) return

    try {
      await assignPermissions({
        roleId: selectedRole.id,
        permissionIds,
      }).unwrap()
      setShowPermissionsModal(false)
      setSelectedRole(null)
    } catch (error: any) {
      console.error('Erreur assignation permissions:', error)
      alert(
        error?.data?.message ||
          "Erreur lors de l'assignation des permissions"
      )
    }
  }

  const handleReorder = async (orderedRoleIds: string[]) => {
    try {
      // Transformer orderedRoleIds en roleOrder avec ranks
      const roleOrder = orderedRoleIds.map((roleId, index) => ({
        roleId,
        rank: index + 1,
      }))
      await reorderRoles({ orgId, roleOrder }).unwrap()
    } catch (error: any) {
      console.error('Erreur réorganisation:', error)
      if (error?.data?.message?.includes('Locked roles')) {
        alert(
          'Les rôles verrouillés doivent rester au-dessus des rôles non-verrouillés'
        )
      } else {
        alert(
          error?.data?.message || 'Erreur lors de la réorganisation des rôles'
        )
      }
    }
  }

  const handleEdit = (role: RoleWithDetails) => {
    setRoleToEdit(role)
    setShowRoleFormModal(true)
  }

  // Loading
  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Chargement des rôles...
          </p>
        </div>
      </div>
    )
  }

  // Error
  if (rolesError) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Erreur lors du chargement des rôles</p>
        <p className="text-sm text-gray-500 mt-2">
          {(rolesError as any)?.data?.message || 'Erreur inconnue'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="h-8 w-8 text-indigo-600" />
                Gestion des Rôles & Permissions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérer les rôles et leurs permissions pour cette organisation
              </p>
            </div>
            <button
              onClick={() => {
                setRoleToEdit(null)
                setShowRoleFormModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              Nouveau rôle
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total des rôles
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {roles.filter(r => r.is_active).length} actifs / {roles.length}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Permissions disponibles
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {allPermissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            Actifs ({roles.filter(r => r.is_active).length})
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'inactive'
                ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <XCircle className="h-5 w-5" />
            Désactivés ({roles.filter(r => !r.is_active).length})
          </button>
        </div>

        {/* Roles List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {activeTab === 'active' ? 'Hiérarchie des rôles' : 'Rôles désactivés'}
          </h2>

          {reordering && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              Réorganisation en cours...
            </div>
          )}

          <RolesDragList
            roles={displayedRoles}
            onReorder={activeTab === 'active' ? handleReorder : undefined}
            onEdit={activeTab === 'active' ? handleEdit : undefined}
            onDelete={activeTab === 'active' ? handleDeleteRole : undefined}
            onManagePermissions={activeTab === 'active' ? handleManagePermissions : undefined}
            onRestore={activeTab === 'inactive' ? handleRestoreRole : undefined}
            onPermanentlyDelete={activeTab === 'inactive' ? handlePermanentlyDeleteRole : undefined}
          />
        </div>
      </div>

      {/* Modals */}
      {showPermissionsModal && selectedRole && (
        <PermissionsModal
          role={selectedRole}
          allPermissions={allPermissions}
          onSave={handleSavePermissions}
          onClose={() => {
            setShowPermissionsModal(false)
            setSelectedRole(null)
          }}
          isLoading={assigningPerms}
        />
      )}

      {showRoleFormModal && (
        <RoleFormModal
          role={roleToEdit ?? undefined}
          orgId={orgId}
          onSave={roleToEdit ? handleUpdateRole : handleCreateRole}
          onClose={() => {
            setShowRoleFormModal(false)
            setRoleToEdit(null)
          }}
          isLoading={roleToEdit ? updating : creating}
          nextRank={nextRankData?.nextRank ?? undefined}
        />
      )}
    </div>
  )
}
