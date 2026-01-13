/**
 * PermissionsModal - Modal pour assigner des permissions à un rôle
 */

import React, { useState, useMemo } from 'react'
import { X, Check, Search } from 'lucide-react'
import type {
  RoleWithDetails,
  Permission,
} from '../api/rbacAdminApi'

interface PermissionsModalProps {
  role: RoleWithDetails
  allPermissions: Permission[]
  onSave: (permissionIds: string[]) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export function PermissionsModal({
  role,
  allPermissions,
  onSave,
  onClose,
  isLoading = false,
}: PermissionsModalProps) {
  // Permissions actuellement sélectionnées
  const currentPermissionIds = useMemo(
    () => new Set(role.rolePermissions?.map((rp) => rp.permission_id) ?? []),
    [role]
  )

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    currentPermissionIds
  )
  const [searchTerm, setSearchTerm] = useState('')

  // Grouper les permissions par catégorie (extraite du code avant le point)
  const permissionsByCategory = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    allPermissions.forEach((perm) => {
      // Extraire la catégorie du code (avant le premier point)
      const category = perm.code.split('.')[0] || 'other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(perm)
    })
    return groups
  }, [allPermissions])

  // Filtrer par recherche
  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return allPermissions

    const term = searchTerm.toLowerCase()
    return allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.scope.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
    )
  }, [allPermissions, searchTerm])

  const filteredCategories = useMemo(() => {
    const groups: Record<string, Permission[]> = {}
    filteredPermissions.forEach((perm) => {
      // Extraire la catégorie du code (avant le premier point)
      const category = perm.code.split('.')[0] || 'other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(perm)
    })
    return groups
  }, [filteredPermissions])

  const togglePermission = (permissionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  const toggleCategory = (category: string) => {
    const categoryPerms = permissionsByCategory[category] || []
    const allSelected = categoryPerms.every((p) => selectedIds.has(p.id))

    setSelectedIds((prev) => {
      const next = new Set(prev)
      categoryPerms.forEach((p) => {
        if (allSelected) {
          next.delete(p.id)
        } else {
          next.add(p.id)
        }
      })
      return next
    })
  }

  const handleSave = async () => {
    await onSave(Array.from(selectedIds))
  }

  const hasChanges =
    selectedIds.size !== currentPermissionIds.size ||
    Array.from(selectedIds).some((id) => !currentPermissionIds.has(id))

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Permissions pour {role.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedIds.size} / {allPermissions.length} permissions sélectionnées
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une permission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Permissions List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(([category, permissions]) => {
              const allSelected = permissions.every((p) =>
                selectedIds.has(p.id)
              )
              const someSelected = permissions.some((p) =>
                selectedIds.has(p.id)
              )

              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleCategory(category)}
                      className={`
                        flex items-center justify-center w-5 h-5 border-2 rounded transition-colors
                        ${
                          allSelected
                            ? 'bg-indigo-600 border-indigo-600'
                            : someSelected
                              ? 'bg-indigo-300 border-indigo-600'
                              : 'border-gray-300 dark:border-gray-600'
                        }
                      `}
                    >
                      {allSelected && <Check className="h-3 w-3 text-white" />}
                      {someSelected && !allSelected && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-sm" />
                      )}
                    </button>
                    <h3 className="font-semibold text-gray-900 dark:text-white uppercase text-sm tracking-wide">
                      {category}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {permissions.filter((p) => selectedIds.has(p.id)).length} / {permissions.length}
                    </span>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1 h-4 w-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {permission.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {permission.code}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                            scope: {permission.scope}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}

            {Object.keys(filteredCategories).length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>Aucune permission trouvée pour "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {hasChanges ? (
              <span className="text-amber-600 dark:text-amber-400">
                Modifications non enregistrées
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                ✓ Aucune modification
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
