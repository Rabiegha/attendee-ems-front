/**
 * AttendeeTypesPage - Page de gestion des types de participants
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
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
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { BulkConfirmationModal } from '@/shared/ui/BulkConfirmationModal'
import { BulkActionsModal } from './BulkActionsModal'
import { selectUser, selectOrganization } from '@/features/auth/model/sessionSlice'
import { useToast } from '@/shared/hooks/useToast'
import { Can } from '@/shared/acl/guards/Can'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
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
import { useTranslation } from 'react-i18next'

// Composant pour le sélecteur de couleur avec sauvegarde au blur
const ColorPicker = ({
  initialValue,
  onSave,
  title,
}: {
  initialValue: string
  onSave: (value: string) => Promise<void>
  title?: string
}) => {
  const [color, setColor] = useState(initialValue)

  const handleBlur = async () => {
    if (color !== initialValue) {
      await onSave(color)
    }
  }

  return (
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
      onBlur={handleBlur}
      className="h-8 w-12 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
      title={title}
    />
  )
}

export function AttendeeTypesPage() {
  const currentUser = useSelector(selectUser)
  const currentOrg = useSelector(selectOrganization)
  const toast = useToast()
  const { t } = useTranslation(['attendees', 'common'])

  // États locaux
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [pageSize, setPageSize] = useState(20)
  const [editingType, setEditingType] = useState<AttendeeType | null>(null)
  const [deactivatingType, setDeactivatingType] = useState<AttendeeType | null>(null)
  const [restoringType, setRestoringType] = useState<AttendeeType | null>(null)
  const [deletingType, setDeletingType] = useState<AttendeeType | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Bulk actions states
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const [tableResetCounter, setTableResetCounter] = useState(0)
  const [bulkConfirmation, setBulkConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'default' | 'success' | 'warning' | 'danger'
    action: () => Promise<void>
  } | null>(null)

  const clearBulkSelection = useCallback(() => {
    setBulkSelectedIds(new Set())
    setTableResetCounter((prev) => prev + 1)
  }, [])

  const handleRowSelectionChange = useCallback((selectedRows: typeof typesByTab) => {
    const ids = new Set(selectedRows.map((row) => row.id))
    // Only update if selection actually changed
    setBulkSelectedIds((prev) => {
      const prevArray = Array.from(prev).sort()
      const newArray = Array.from(ids).sort()
      if (JSON.stringify(prevArray) === JSON.stringify(newArray)) {
        return prev
      }
      return ids
    })
  }, [])

  // Debounced server-side search
  const lastSearchRef = useRef<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== lastSearchRef.current) {
        lastSearchRef.current = searchQuery
        setDebouncedSearch(searchQuery)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // API queries and mutations
  const { data: attendeeTypesResponse, isLoading, error, refetch } = useGetAttendeeTypesQuery(
    { orgId: currentOrg?.id || '', limit: 1000, ...(debouncedSearch && { search: debouncedSearch }) },
    { skip: !currentOrg?.id }
  )
  
  const attendeeTypes = attendeeTypesResponse?.data || []
  const [createType] = useCreateAttendeeTypeMutation()
  const [updateType] = useUpdateAttendeeTypeMutation()
  const [deleteType] = useDeleteAttendeeTypeMutation()

  // Filtrer par onglet actif
  const typesByTab = useMemo(() => {
    return attendeeTypes.filter((type) =>
      activeTab === 'active' ? type.is_active : !type.is_active
    )
  }, [attendeeTypes, activeTab])

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
      label: t('types.active_tab'),
      count: stats.active,
    },
    {
      id: 'deleted',
      label: t('types.inactive_tab'),
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
      toast.success(t('types.created'))
    } catch (error) {
      toast.error(t('types.error_create'))
      throw error
    }
  }

  const handleUpdate = async (id: string, data: UpdateAttendeeTypeDto) => {
    if (!currentOrg?.id) return
    try {
      await updateType({ orgId: currentOrg.id, id, data }).unwrap()
      toast.success(t('types.updated'))
    } catch (error) {
      toast.error(t('types.error_update'))
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!currentOrg?.id) return
    try {
      await deleteType({ orgId: currentOrg.id, id }).unwrap()
      toast.success(t('types.deleted'))
    } catch (error) {
      toast.error(t('types.error_delete'))
      throw error
    }
  }

  // Colonnes du tableau pour les types actifs
  const activeColumns = useMemo<ColumnDef<AttendeeType>[]>(
    () => [
      createSelectionColumn<AttendeeType>(),
      {
        accessorKey: 'name',
        header: t('types.name'),
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: type.color_hex || '#9ca3af',
                color: type.text_color_hex || '#ffffff',
              }}
            >
              {type.name}
            </div>
          )
        },
      },
      {
        accessorKey: 'color_hex',
        header: t('types.background_color'),
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="flex items-center gap-2">
              <ColorPicker
                initialValue={type.color_hex || '#9ca3af'}
                title={t('types.click_to_edit')}
                onSave={async (color) => {
                  try {
                    await updateType({
                      orgId: currentOrg?.id || '',
                      id: type.id,
                      data: { color_hex: color },
                    }).unwrap()
                    toast.success(t('types.color_updated'))
                  } catch (error) {
                    toast.error(t('types.error_update_color'))
                  }
                }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {type.color_hex}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'text_color_hex',
        header: t('types.text_color'),
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="flex items-center gap-2">
              <ColorPicker
                initialValue={type.text_color_hex || '#ffffff'}
                title={t('types.click_to_edit')}
                onSave={async (color) => {
                  try {
                    await updateType({
                      orgId: currentOrg?.id || '',
                      id: type.id,
                      data: { text_color_hex: color },
                    }).unwrap()
                    toast.success(t('types.color_updated'))
                  } catch (error) {
                    toast.error(t('types.error_update_color'))
                  }
                }}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {type.text_color_hex}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: 'usage_count',
        header: t('types.usage'),
        cell: ({ row }) => {
          const count = row.original.usage_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('types.event_count', { count })}
            </span>
          )
        },
      },
      {
        accessorKey: 'registration_count',
        header: t('types.registrations'),
        cell: ({ row }) => {
          const count = row.original.registration_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('types.participant_count', { count })}
            </span>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: t('types.status'),
        cell: ({ row }) => {
          const type = row.original
          
          if (type.is_active) {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                {t('common:status.active')}
              </span>
            )
          }
          
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
              {t('common:status.inactive')}
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
            title={t('types.edit')}
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
            title={t('types.deactivate')}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    [t]
  )

  // Colonnes du tableau pour les types désactivés
  const deletedColumns = useMemo<ColumnDef<AttendeeType>[]>(
    () => [
      createSelectionColumn<AttendeeType>(),
      {
        accessorKey: 'name',
        header: t('types.name'),
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const type = row.original
          return (
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium opacity-50"
              style={{
                backgroundColor: type.color_hex || '#9ca3af',
                color: type.text_color_hex || '#ffffff',
              }}
            >
              {type.name}
            </div>
          )
        },
      },
      {
        accessorKey: 'color_hex',
        header: t('types.color'),
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
        header: t('types.usage'),
        cell: ({ row }) => {
          const count = row.original.usage_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400 opacity-50">
              {t('types.event_count', { count })}
            </span>
          )
        },
      },
      {
        accessorKey: 'registration_count',
        header: t('types.registrations'),
        cell: ({ row }) => {
          const count = row.original.registration_count || 0
          return (
            <span className="text-sm text-gray-600 dark:text-gray-400 opacity-50">
              {t('types.participant_count', { count })}
            </span>
          )
        },
      },
      {
        accessorKey: 'is_active',
        header: t('types.status'),
        cell: ({ row }) => {
          const type = row.original
          return (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {t('common:status.inactive')}
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
            title={t('types.restore')}
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
            title={t('types.delete_permanently')}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 min-w-[32px] p-1.5"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
          </Button>
        </>
      )),
    ],
    [t]
  )

  // Handlers pour les actions groupées
  const handleBulkDeactivate = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('types.bulk_deactivate'),
      message: t('types.bulk_deactivate_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              updateType({ orgId: currentOrg?.id!, id, data: { is_active: false } }).unwrap()
            )
          )
          toast.success(t('types.bulk_deactivated', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la désactivation:', error)
          toast.error(t('types.error_deactivate'))
        }
      }
    })
  }

  const handleBulkActivate = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('types.bulk_activate'),
      message: t('types.bulk_activate_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              updateType({ orgId: currentOrg?.id!, id, data: { is_active: true } }).unwrap()
            )
          )
          toast.success(t('types.bulk_activated', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de l\'activation:', error)
          toast.error(t('types.error_activate'))
        }
      }
    })
  }

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('types.title')}
        description={t('types.description')}
        icon={Tag}
        actions={
          <Can do="update" on="Organization">
            <Button onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              {t('types.new_type')}
            </Button>
          </Can>
        }
      />

      {/* Section FilterBar */}
      <PageSection spacing="lg">
        <FilterBar
          resultCount={typesByTab.length}
          resultLabel={t('types.result_label')}
          onReset={() => setSearchQuery('')}
          showResetButton={searchQuery !== ''}
          onRefresh={refetch}
          showRefreshButton={true}
        >
          <SearchInput
            placeholder={t('types.search_placeholder')}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </FilterBar>
      </PageSection>

      {/* Table des types */}
      <PageSection spacing="lg">
        <Card variant="default" padding="none">
          {/* Barre d'actions groupées personnalisée */}
          {bulkSelectedIds.size > 0 && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t('types.selected_count', { count: bulkSelectedIds.size })}
                  </span>
                  <button
                    onClick={clearBulkSelection}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                  >
                    {t('common:app.deselect_all')}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setBulkActionsModalOpen(true)}
                    leftIcon={<Tag className="h-4 w-4" />}
                  >
                    {t('common:app.actions')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DataTable
            key={`${activeTab}-${tableResetCounter}`}
            columns={activeTab === 'active' ? activeColumns : deletedColumns}
            data={typesByTab}
            isLoading={isLoading}
            enableRowSelection
            bulkActions={[]}
            getItemId={(type) => type.id}
            itemType="types"
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onRowSelectionChange={handleRowSelectionChange}
            emptyMessage={
              searchQuery
                ? t('types.no_results')
                : activeTab === 'active'
                  ? t('types.no_active_types')
                  : t('types.no_inactive_types')
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
      <BulkActionsModal
        isOpen={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        selectedCount={bulkSelectedIds.size}
        isDeletedTab={activeTab === 'deleted'}
        onActivate={handleBulkActivate}
        onDeactivate={handleBulkDeactivate}
      />

      {bulkConfirmation && (
        <BulkConfirmationModal
          isOpen={bulkConfirmation.isOpen}
          onClose={() => setBulkConfirmation(null)}
          onBack={() => {
            setBulkConfirmation(null)
            setBulkActionsModalOpen(true)
          }}
          title={bulkConfirmation.title}
          message={bulkConfirmation.message}
          variant={bulkConfirmation.variant}
          onConfirm={async () => {
            await bulkConfirmation.action()
            setBulkConfirmation(null)
          }}
        />
      )}

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

const AttendeeTypesPageProtected = () => {
  const { t } = useTranslation(['attendees'])
  return (
    <ProtectedPage
      action="read"
      subject="AttendeeType"
      deniedTitle={t('types.access_denied_title')}
      deniedMessage={t('types.access_denied_message')}
    >
      <AttendeeTypesPage />
    </ProtectedPage>
  )
}

export default AttendeeTypesPageProtected
