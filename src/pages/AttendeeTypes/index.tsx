/**
 * AttendeeTypesPage - Page de gestion des types de participants
 */

import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { ColumnDef } from '@tanstack/react-table'
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import {
  Button,
  Card,
  PageContainer,
  PageHeader,
  PageSection,
  DataTable,
  createActionsColumn,
  SearchInput,
  FilterBar,
  Tabs,
} from '@/shared/ui'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { useToast } from '@/shared/hooks/useToast'
import { useFuzzySearch } from '@/shared/hooks/useFuzzySearch'
import { Can } from '@/shared/acl/guards/Can'
import {
  useGetAttendeeTypesQuery,
  useCreateAttendeeTypeMutation,
  useUpdateAttendeeTypeMutation,
  useDeleteAttendeeTypeMutation,
  type AttendeeType,
  type CreateAttendeeTypeDto,
  type UpdateAttendeeTypeDto,
} from '@/features/attendee-types/api/attendeeTypesApi'
import {
  CreateAttendeeTypeModal,
  EditAttendeeTypeModal,
  DeactivateAttendeeTypeModal,
  RestoreAttendeeTypeModal,
  DeleteAttendeeTypeModal,
} from '@/features/attendee-types/ui'

export function AttendeeTypesPage() {
  const currentUser = useSelector(selectUser)
  const currentOrg = useSelector(selectOrganization)
  const toast = useToast()

  // États locaux
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [editingType, setEditingType] = useState<AttendeeType | null>(null)
  const [deactivatingType, setDeactivatingType] = useState<AttendeeType | null>(null)
  const [restoringType, setRestoringType] = useState<AttendeeType | null>(null)
  const [deletingType, setDeletingType] = useState<AttendeeType | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // API queries and mutations
  const { data: attendeeTypes = [], isLoading } = useGetAttendeeTypesQuery(
    currentOrg?.id || '',
    { skip: !currentOrg?.id }
  )
  const [createType] = useCreateAttendeeTypeMutation()
  const [updateType] = useUpdateAttendeeTypeMutation()
  const [deleteType] = useDeleteAttendeeTypeMutation()

  // Filtrer par onglet actif
  const typesByTab = useMemo(() => {
    return attendeeTypes.filter((type) =>
      activeTab === 'active' ? type.is_active : !type.is_active
    )
  }, [attendeeTypes, activeTab])

  // Recherche floue
  const searchResults = useFuzzySearch(
    typesByTab,
    searchQuery,
    ['code', 'name']
  )

  // Stats pour les onglets
  const stats = useMemo(() => {
    return {
      active: attendeeTypes.filter((t) => t.is_active).length,
      deleted: attendeeTypes.filter((t) => !t.is_active).length,
    }
  }, [attendeeTypes])

  // Configuration des onglets
  const tabs = [
    {
      id: 'active',
      label: 'Types actifs',
      count: stats.active,
    },
    {
      id: 'deleted',
      label: 'Types désactivés',
      count: stats.deleted,
    },
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'active' | 'deleted')
  }

  // Handlers
  const handleCreate = async (data: CreateAttendeeTypeDto) => {
    if (!currentOrg?.id) return
    try {
      await createType({ orgId: currentOrg.id, data }).unwrap()
      toast.success('Type de participant créé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la création du type')
      throw error
    }
  }

  const handleUpdate = async (id: string, data: UpdateAttendeeTypeDto) => {
    if (!currentOrg?.id) return
    try {
      await updateType({ orgId: currentOrg.id, id, data }).unwrap()
      toast.success('Type de participant modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification du type')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!currentOrg?.id) return
    try {
      await deleteType({ orgId: currentOrg.id, id }).unwrap()
      toast.success('Type de participant supprimé définitivement')
    } catch (error) {
      toast.error('Erreur lors de la suppression du type')
      throw error
    }
  }

  // Colonnes du tableau pour les types actifs
  const activeColumns = useMemo<ColumnDef<AttendeeType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
          )
        },
      },
      {
        accessorKey: 'color_hex',
        header: 'Couleur',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-16 rounded border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: type.color_hex }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {type.color_hex}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'usage_count',
        header: 'Utilisation',
        cell: ({ row }) => {
          const count = row.original.usage_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {count} événement{count > 1 ? 's' : ''}
            </span>
          )
        },
      },
      {
        accessorKey: 'registration_count',
        header: 'Inscriptions',
        cell: ({ row }) => {
          const count = row.original.registration_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {count} participant{count > 1 ? 's' : ''}
            </span>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Statut',
        cell: ({ row }) => {
          const type = row.original
          return (
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                type.is_active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {type.is_active ? 'Actif' : 'Inactif'}
            </span>
          )
        },
      },
      createActionsColumn<AttendeeType>((type) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setEditingType(type)
            }}
            title="Modifier"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Edit2 className="h-4 w-4 shrink-0" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setDeactivatingType(type)
            }}
            title="Désactiver ce type"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    []
  )

  // Colonnes du tableau pour les types désactivés
  const deletedColumns = useMemo<ColumnDef<AttendeeType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="font-medium text-gray-900 dark:text-white">{type.name}</div>
          )
        },
      },
      {
        accessorKey: 'color_hex',
        header: 'Couleur',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-6 w-16 rounded border border-gray-200 dark:border-gray-600 opacity-50"
                style={{ backgroundColor: type.color_hex || '#4F46E5' }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {type.color_hex || '#4F46E5'}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'usage_count',
        header: 'Utilisation',
        cell: ({ row }) => {
          const count = row.original.usage_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400 opacity-50">
              {count} événement{count > 1 ? 's' : ''}
            </span>
          )
        },
      },
      {
        accessorKey: 'registration_count',
        header: 'Inscriptions',
        cell: ({ row }) => {
          const count = row.original.registration_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400 opacity-50">
              {count} participant{count > 1 ? 's' : ''}
            </span>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Statut',
        cell: ({ row }) => {
          const type = row.original
          return (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Inactif
            </span>
          )
        },
      },
      createActionsColumn<AttendeeType>((type) => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setRestoringType(type)
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
              setDeletingType(type)
            }}
            title="Supprimer définitivement"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    []
  )

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Types de participants"
        description="Gérez les différents types de participants pour votre organisation"
        icon={Tag}
      />

      {/* Section FilterBar */}
      <PageSection spacing="lg">
        <FilterBar
          resultCount={searchResults.length}
          resultLabel="type"
          onReset={() => setSearchQuery('')}
          showResetButton={searchQuery !== ''}
        >
          <SearchInput
            placeholder="Rechercher un type..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          <Can I="create" a="Organization">
            <Button onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau type
            </Button>
          </Can>
        </FilterBar>
      </PageSection>

      {/* Table des types */}
      <PageSection spacing="lg">
        <Card variant="default" padding="none">
          <DataTable
            columns={activeTab === 'active' ? activeColumns : deletedColumns}
            data={searchResults}
            isLoading={isLoading}
            emptyMessage={
              searchQuery
                ? 'Aucun type ne correspond à votre recherche'
                : activeTab === 'active'
                  ? 'Aucun type de participant actif'
                  : 'Aucun type désactivé'
            }
            tabsElement={
              <Tabs
                items={tabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
              />
            }
          />
        </Card>
      </PageSection>

      {/* Modals */}
      <CreateAttendeeTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <EditAttendeeTypeModal
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        type={editingType}
        onUpdate={handleUpdate}
      />

      <DeactivateAttendeeTypeModal
        isOpen={!!deactivatingType}
        onClose={() => setDeactivatingType(null)}
        type={deactivatingType}
        onDeactivate={handleUpdate}
      />

      <RestoreAttendeeTypeModal
        isOpen={!!restoringType}
        onClose={() => setRestoringType(null)}
        type={restoringType}
        onRestore={handleUpdate}
      />

      <DeleteAttendeeTypeModal
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        type={deletingType}
        onDelete={handleDelete}
      />
    </PageContainer>
  )
}
