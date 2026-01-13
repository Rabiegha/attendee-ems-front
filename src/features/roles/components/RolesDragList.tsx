/**
 * RolesDragList - Liste drag & drop pour réorganiser la hiérarchie des rôles
 * Utilise @dnd-kit pour le drag-and-drop
 */

import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Trash2 } from 'lucide-react'
import type { RoleWithDetails } from '../api/rbacAdminApi'

interface RolesDragListProps {
  roles: RoleWithDetails[]
  onReorder: (orderedRoleIds: string[]) => void
  onEdit?: (role: RoleWithDetails) => void
  onDelete?: (role: RoleWithDetails) => void
  onManagePermissions?: (role: RoleWithDetails) => void
}

interface SortableRoleItemProps {
  role: RoleWithDetails
  onEdit?: ((role: RoleWithDetails) => void) | undefined
  onDelete?: ((role: RoleWithDetails) => void) | undefined
  onManagePermissions?: ((role: RoleWithDetails) => void) | undefined
}

function SortableRoleItem({
  role,
  onEdit,
  onDelete,
  onManagePermissions,
}: SortableRoleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const permissionsCount = role.rolePermissions?.length || 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 
        ${isDragging ? 'opacity-50 shadow-2xl z-50' : 'shadow-sm'}
        hover:shadow-md transition-shadow
      `}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Role Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {role.name}
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {role.code}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Niveau: {role.level}</span>
            <span>Rang: {role.rank}</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {permissionsCount} permission{permissionsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onManagePermissions && (
            <button
              onClick={() => onManagePermissions(role)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
              title="Gérer les permissions"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(role)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Éditer"
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(role)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function RolesDragList({
  roles,
  onReorder,
  onEdit,
  onDelete,
  onManagePermissions,
}: RolesDragListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = roles.findIndex((r) => r.id === active.id)
    const newIndex = roles.findIndex((r) => r.id === over.id)

    const newOrder = arrayMove(roles, oldIndex, newIndex)
    onReorder(newOrder.map((r) => r.id))
  }

  return (
    <div className="space-y-3">
      {/* Légende */}
      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 px-2">
        <GripVertical className="h-4 w-4" />
        <span>Glisser-déposer pour réorganiser la hiérarchie</span>
      </div>

      {/* Liste drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={roles.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          {roles.map((role) => (
            <SortableRoleItem
              key={role.id}
              role={role}
              onEdit={onEdit}
              onDelete={onDelete}
              onManagePermissions={onManagePermissions}
            />
          ))}
        </SortableContext>
      </DndContext>

      {roles.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Aucun rôle trouvé dans cette organisation</p>
        </div>
      )}
    </div>
  )
}
