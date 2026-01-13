/**
 * RolesManagement - Page principale de gestion des rôles et permissions
 * Fonctionnalités :
 * - Liste drag & drop des rôles
 * - Création/Édition/Suppression de rôles
 * - Attribution de permissions aux rôles avec scopes
 * - Réorganisation de la hiérarchie des rôles
 */

import React, { useState } from 'react'
import { Plus, Shield, AlertCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import {
  useGetRbacRolesQuery,
  useGetAllPermissionsQuery,
  useCreateRbacRoleMutation,
  useUpdateRbacRoleMutation,
  useDeleteRbacRoleMutation,
  useAssignPermissionsMutation,
  useReorderRolesMutation,
  useGetNextRankQuery,
  type RoleWithDetails,
} from '../api/rbacAdminApi'
import { RolesDragList } from '../components/RolesDragList'
import { PermissionsModal } from '../components/PermissionsModal'
import { RoleFormModal } from '../components/RoleFormModal'

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
  } = useGetRbacRolesQuery(orgId)

  const {
    data: allPermissions = [],
    isLoading: permissionsLoading,
  } = useGetAllPermissionsQuery()

  const { data: nextRankData } = useGetNextRankQuery(orgId)

  // Mutations
  const [createRole, { isLoading: creating }] = useCreateRbacRoleMutation()
  const [updateRole, { isLoading: updating }] = useUpdateRbacRoleMutation()
  const [deleteRole, { isLoading: deleting }] = useDeleteRbacRoleMutation()
  const [assignPermissions, { isLoading: assigningPerms }] =
    useAssignPermissionsMutation()
  const [reorderRoles, { isLoading: reordering }] = useReorderRolesMutation()

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
        `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`
      )
    ) {
      return
    }

    try {
      await deleteRole({ roleId: role.id, orgId }).unwrap()
    } catch (error: any) {
      console.error('Erreur suppression rôle:', error)
      if (error?.data?.message?.includes('locked')) {
        alert('Impossible de supprimer un rôle verrouillé')
      } else {
        alert(error?.data?.message || 'Erreur lors de la suppression du rôle')
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
                {roles.length}
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

        {/* Roles List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Hiérarchie des rôles
          </h2>

          {reordering && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
              Réorganisation en cours...
            </div>
          )}

          <RolesDragList
            roles={roles}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDeleteRole}
            onManagePermissions={handleManagePermissions}
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
