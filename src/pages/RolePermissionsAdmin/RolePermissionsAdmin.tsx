import React, { useState, useMemo } from 'react'
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
  Search,
  X,
  Plus,
  Trash2,
  GripVertical,
  Edit,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Can } from '@/shared/acl/guards/Can'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
import { useToast } from '@/shared/hooks/useToast'
import {
  Button,
  PageContainer,
  PageHeader,
  PageSection,
  Card,
  CardContent,
  RolesPermissionsPageSkeleton,
  Modal,
} from '@/shared/ui'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useUpdateRolePermissionsMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRolesHierarchyMutation,
} from '@/features/roles/api/rolesApi'
import type { Permission, Role } from '@/features/roles/api/rolesApi'
import type { RootState } from '@/app/store'
import { RoleCreationModal } from '@/features/roles/components/RoleCreationModal'
import { RoleEditModal } from '@/features/roles/components/RoleEditModal'
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

// Composant pour un item de rôle draggable
interface SortableRoleItemProps {
  role: Role
  isSelected: boolean
  isOwnRole: boolean
  canModify: boolean
  permissionsCount: number
  onClick: () => void
  onDelete: () => void
}

const SortableRoleItem: React.FC<SortableRoleItemProps> = ({
  role,
  isSelected,
  isOwnRole,
  canModify,
  permissionsCount,
  onClick,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id, disabled: role.is_system_role || !canModify })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
      }`}
    >
      {/* Drag Handle - visible seulement si modifiable */}
      {canModify && !role.is_system_role && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      {/* Role Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white">
            {role.name}
          </p>
          {role.is_system_role && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
              Système
            </span>
          )}
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
          {permissionsCount} permissions • Niveau {role.level}
        </p>
      </div>

      {/* Delete Button */}
      {canModify && !role.is_system_role && !isOwnRole && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Supprimer ce rôle"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

const RolePermissionsAdminContent: React.FC = () => {
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
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()
  const [updateRolesHierarchy] = useUpdateRolesHierarchyMutation()

  // Récupérer l'utilisateur connecté depuis Redux
  const currentUser = useSelector((state: RootState) => state.session.user)
  const currentUserRoleCode = currentUser?.roles?.[0] || ''
  const currentUserId = currentUser?.id || ''

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null)
  const [sortedRoles, setSortedRoles] = useState<Role[]>([])
  
  const toast = useToast()

  // Configurer les sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !(prev[category] ?? false)
    }))
  }

  const isLoading = isLoadingRoles || isLoadingPermissions
  const error = rolesError || permissionsError

  // Définir la hiérarchie des rôles (du plus élevé au plus bas)
  // Filtrer les rôles : afficher tous les rôles de l'organisation
  const roles = rolesRaw.filter((role) => {
    // Garder seulement les rôles de cette organisation (exclure les rôles système sans org)
    return role.org_id !== null
  })

  // Trouver le niveau de l'utilisateur connecté
  const currentUserRole = roles.find(r => r.code === currentUserRoleCode)
  const currentUserLevel = currentUserRole?.level ?? 999 // Si pas trouvé, niveau très bas

  // Mettre à jour sortedRoles quand roles change
  React.useEffect(() => {
    const sorted = [...roles].sort((a, b) => a.level - b.level)
    setSortedRoles(sorted)
  }, [roles])

  // Gestion du drag & drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sortedRoles.findIndex((r) => r.id === active.id)
    const newIndex = sortedRoles.findIndex((r) => r.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Vérifier qu'on ne place pas un rôle au-dessus ou au même niveau que le sien
    // newIndex est la position dans le tableau, qui correspond au level
    if (newIndex <= currentUserLevel) {
      toast.error(`Vous ne pouvez pas placer un rôle au niveau ${newIndex} ou supérieur. Votre niveau est ${currentUserLevel}.`)
      return
    }

    // Réorganiser localement
    const newOrder = arrayMove(sortedRoles, oldIndex, newIndex)
    setSortedRoles(newOrder)

    // Mettre à jour les niveaux hiérarchiques
    const updates = newOrder.map((role, index) => ({
      roleId: role.id,
      level: index,
    }))

    try {
      await updateRolesHierarchy(updates).unwrap()
      toast.success('Hiérarchie mise à jour avec succès')
      refetchRoles()
    } catch (error: any) {
      // Revert en cas d'erreur
      const sorted = [...roles].sort((a, b) => a.level - b.level)
      setSortedRoles(sorted)
      toast.error(error?.data?.message || 'Erreur lors de la mise à jour de la hiérarchie')
    }
  }

  // Gestion de la création de rôle
  const handleCreateRole = async (data: {
    name: string
    description?: string
  }) => {
    await createRole(data).unwrap()
    refetchRoles()
  }

  // Gestion de la modification de rôle
  const handleUpdateRole = async (data: {
    name: string
    description?: string
  }) => {
    if (!selectedRoleId) return
    
    await updateRole({
      roleId: selectedRoleId,
      ...data
    }).unwrap()
    refetchRoles()
  }

  // Gestion de la suppression de rôle
  const handleDeleteRole = (roleId: string, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      await deleteRole(roleToDelete.id).unwrap()
      toast.success('Rôle supprimé avec succès')
      
      // Désélectionner si c'était le rôle sélectionné
      if (selectedRoleId === roleToDelete.id) {
        setSelectedRoleId(null)
      }
      
      setIsDeleteModalOpen(false)
      setRoleToDelete(null)
      refetchRoles()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erreur lors de la suppression du rôle')
    }
  }

  // Filtrer les permissions : enlever celles qui contiennent :any (SUPER_ADMIN only)
  const permissions = permissionsRaw.filter((permission) => {
    // Exclure toutes les permissions avec :any (scope SUPER_ADMIN)
    if (permission.code.includes(':any')) return false
    
    // Exclure les permissions de gestion globale des organisations (SUPER_ADMIN)
    if (permission.code.startsWith('organizations.create')) return false
    if (permission.code.startsWith('organizations.delete')) return false
    
    return true
  })

  const selectedRole = sortedRoles.find((r) => r.id === selectedRoleId)

  const handlePermissionToggle = async (
    permissionId: string,
    isChecked: boolean
  ) => {
    if (!selectedRole) return

    // Vérification hiérarchique : peut modifier uniquement les rôles de niveau supérieur
    const isOwnRole = currentUser?.roles?.includes(selectedRole.code || '')
    const canModifyHierarchy = selectedRole.level > currentUserLevel

    if (isOwnRole || selectedRole.is_system_role || !canModifyHierarchy) {
      const reason = isOwnRole 
        ? 'Vous ne pouvez pas modifier les permissions de votre propre rôle'
        : selectedRole.is_system_role
        ? 'Les rôles système ne peuvent pas être modifiés'
        : `Vous ne pouvez modifier que les rôles de niveau strictement supérieur au vôtre (niveau ${currentUserLevel})`
      console.error(reason)
      alert(reason)
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

  // Filtrer les permissions selon la recherche et la catégorie sélectionnée
  const filteredGroupedPermissions = useMemo(() => {
    let filtered = { ...groupedPermissions }

    // Filtrer par catégorie sélectionnée
    if (selectedCategory) {
      filtered = { [selectedCategory]: groupedPermissions[selectedCategory] || [] }
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = Object.entries(filtered).reduce((acc, [category, perms]) => {
        const matchingPerms = perms.filter(
          p =>
            p.name.toLowerCase().includes(query) ||
            p.code.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        )
        if (matchingPerms.length > 0) {
          acc[category] = matchingPerms
        }
        return acc
      }, {} as Record<string, Permission[]>)
    }

    return filtered
  }, [groupedPermissions, searchQuery, selectedCategory])

  // Protection par permissions - Seuls les ADMIN peuvent voir cette page
  return (
    <Can do="manage" on="Role" fallback={<Navigate to="/403" replace />}>
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader
          title="Gestion des Rôles et Permissions"
          description="Configurez les permissions pour chaque rôle de votre organisation."
          icon={Shield}
          actions={
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={() => setIsCreationModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Nouveau rôle
              </Button>
            </div>
          }
        />

        {/* Modal de création */}
        <RoleCreationModal
          isOpen={isCreationModalOpen}
          onClose={() => setIsCreationModalOpen(false)}
          onSubmit={handleCreateRole}
          existingLevels={sortedRoles.map(r => r.level)}
          isLoading={isCreating}
        />

        {/* Modal d'édition */}
        <RoleEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateRole}
          initialData={selectedRole ? {
            name: selectedRole.name,
            description: selectedRole.description
          } : undefined}
          isLoading={isUpdatingRole}
        />

        {/* Modal de confirmation de suppression */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setRoleToDelete(null)
          }}
          title="Confirmer la suppression"
          maxWidth="md"
          showCloseButton={true}
          closeOnBackdropClick={!isDeleting}
        >
          <div className="space-y-6">
            {/* Message d'avertissement */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                    Action irréversible
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Cette action ne peut pas être annulée. Le rôle sera définitivement supprimé.
                  </p>
                </div>
              </div>
            </div>

            {/* Message de confirmation */}
            <div>
              <p className="text-gray-900 dark:text-white">
                Êtes-vous sûr de vouloir supprimer le rôle{' '}
                <span className="font-semibold">"{roleToDelete?.name}"</span> ?
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setRoleToDelete(null)
                }}
                disabled={isDeleting}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDeleteRole}
                disabled={isDeleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </Modal>

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
          <PageSection spacing="lg">
            <RolesPermissionsPageSkeleton />
          </PageSection>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne gauche : Liste des rôles */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Rôles
                </h3>

                {sortedRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Aucun rôle trouvé
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortedRoles.map(r => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sortedRoles.map((role) => {
                          // Vérifier si le rôle peut être modifié
                          const isOwnRole = currentUser?.roles?.includes(role.code || '')
                          // On peut modifier seulement les rôles de niveau strictement supérieur au nôtre
                          // (niveau plus élevé = plus bas dans la hiérarchie)
                          const canModifyHierarchy = role.level > currentUserLevel
                          const canModify = !isOwnRole && canModifyHierarchy && !role.is_system_role

                          return (
                            <SortableRoleItem
                              key={role.id}
                              role={role}
                              isSelected={selectedRoleId === role.id}
                              isOwnRole={isOwnRole}
                              canModify={canModify}
                              permissionsCount={role.permissions?.length || 0}
                              onClick={() => setSelectedRoleId(role.id)}
                              onDelete={() => handleDeleteRole(role.id, role.name)}
                            />
                          )
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
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
                    const isSystemRole = selectedRole.is_system_role
                    const canModifyHierarchy = selectedRole.level > currentUserLevel
                    const canModify = !isOwnRole && !isSystemRole && canModifyHierarchy

                    if (!canModify) {
                      let reason = ''
                      if (isOwnRole) {
                        reason = 'Vous ne pouvez pas modifier les permissions de votre propre rôle pour des raisons de sécurité.'
                      } else if (isSystemRole) {
                        reason = 'Ce rôle système ne peut pas être modifié.'
                      } else if (!canModifyHierarchy) {
                        reason = `Vous ne pouvez modifier que les rôles de niveau strictement supérieur au vôtre (niveau ${currentUserLevel}). Ce rôle est de niveau ${selectedRole.level}.`
                      }

                      return (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                                {isOwnRole
                                  ? 'Votre propre rôle'
                                  : isSystemRole
                                    ? 'Rôle système'
                                    : 'Rôle protégé'}
                              </h4>
                              <p className="text-sm text-amber-800 dark:text-amber-300">
                                {reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  {/* En-tête avec nom, description et bouton d'édition */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedRole.name}
                      </h3>
                      {(() => {
                        const isOwnRole = currentUser?.roles?.includes(selectedRole.code || '')
                        const isSystemRole = selectedRole.is_system_role
                        const canModifyHierarchy = selectedRole.level > currentUserLevel
                        const canModify = !isOwnRole && !isSystemRole && canModifyHierarchy
                        
                        if (canModify) {
                          return (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditModalOpen(true)}
                              leftIcon={<Edit className="h-4 w-4" />}
                            >
                              Modifier
                            </Button>
                          )
                        }
                        return null
                      })()}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRole.description || 'Aucune description'}
                    </p>
                  </div>

                  {/* Barre de recherche et filtres */}
                  <div className="mb-6 space-y-4">
                    {/* Recherche */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une permission..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Filtres par catégorie */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Catégories :</span>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedCategory === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Toutes
                      </button>
                      {Object.keys(groupedPermissions).map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {categoryLabels[category] || category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Liste des permissions groupées par catégorie avec dropdowns */}
                  <div className="space-y-3">
                    {Object.entries(filteredGroupedPermissions).length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">
                          Aucune permission trouvée
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Essayez d'ajuster vos filtres ou votre recherche
                        </p>
                      </div>
                    ) : (
                      Object.entries(filteredGroupedPermissions).map(
                      ([category, categoryPermissions]) => {
                        // Vérifier si on peut modifier ce rôle
                        const isOwnRole =
                          currentUser?.roles?.includes(selectedRole.code || '')
                        const canModifyHierarchy = selectedRole.level > currentUserLevel
                        const canModifyRole =
                          !isOwnRole && !selectedRole.is_system_role && canModifyHierarchy
                        
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
                    )
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

export const RolePermissionsAdmin = () => (
  <ProtectedPage
    action="manage"
    subject="Role"
    deniedTitle="Accès aux rôles et permissions refusé"
    deniedMessage="Vous n'avez pas les permissions nécessaires pour gérer les rôles et permissions."
  >
    <RolePermissionsAdminContent />
  </ProtectedPage>
)
