import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Users, Shield, Info } from 'lucide-react'
import { PermissionCheckbox } from './PermissionCheckbox'
import type { Role, Permission } from '../types'
import { PERMISSION_CATEGORIES } from '../types'

interface RoleCardProps {
  role: Role
  permissions: Permission[]
  onPermissionChange: (
    roleId: string,
    permissionId: string,
    granted: boolean
  ) => Promise<void>
  isUpdating?: boolean
}

// Grouper les permissions par catégorie
const groupPermissionsByCategory = (permissions: Permission[]) => {
  return permissions.reduce(
    (acc, permission) => {
      const category = permission.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>
  )
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  permissions,
  onPermissionChange,
  isUpdating = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [loadingPermissions, setLoadingPermissions] = useState<Set<string>>(
    new Set()
  )

  // Grouper toutes les permissions par catégorie
  const groupedPermissions = groupPermissionsByCategory(permissions)
  const categoryNames = Object.keys(groupedPermissions)

  // Statistiques
  const grantedCount = role.permissions.length
  const totalCount = permissions.length
  const progressPercentage =
    totalCount > 0 ? (grantedCount / totalCount) * 100 : 0

  const handlePermissionChange = async (
    permissionId: string,
    granted: boolean
  ) => {
    setLoadingPermissions((prev) => new Set(prev).add(permissionId))

    try {
      await onPermissionChange(role.id, permissionId, granted)
    } catch (error) {
      console.error('Failed to update permission:', error)
      // TODO: Add toast notification
    } finally {
      setLoadingPermissions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(permissionId)
        return newSet
      })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
      {/* En-tête du rôle */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {role.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${role.color}`}
                >
                  {role.code}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {role.description}
            </p>

            {/* Barre de progression des permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Permissions accordées
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {grantedCount} / {totalCount}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {progressPercentage.toFixed(0)}% des permissions
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isUpdating}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Contenu expansible - Permissions */}
      {isExpanded && (
        <div className="p-6">
          <div className="space-y-6">
            {categoryNames.map((categoryKey) => {
              const categoryPermissions = groupedPermissions[categoryKey]

              if (!categoryPermissions) {
                return null
              }

              const categoryGrantedCount = categoryPermissions.filter((p) =>
                role.permissions.includes(p.id)
              ).length

              return (
                <div key={categoryKey} className="space-y-3">
                  {/* En-tête de catégorie */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {PERMISSION_CATEGORIES[
                          categoryKey as keyof typeof PERMISSION_CATEGORIES
                        ] || categoryKey}
                      </span>
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {categoryGrantedCount} / {categoryPermissions.length}
                    </span>
                  </div>

                  {/* Liste des permissions de cette catégorie */}
                  <div className="grid gap-2">
                    {categoryPermissions.map((permission) => (
                      <PermissionCheckbox
                        key={permission.id}
                        permission={permission}
                        role={role}
                        isGranted={role.permissions.includes(permission.id)}
                        onChange={handlePermissionChange}
                        isLoading={loadingPermissions.has(permission.id)}
                        disabled={isUpdating}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer avec informations */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Info className="h-4 w-4" />
              <span>
                Les modifications sont sauvegardées automatiquement en temps
                réel
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
