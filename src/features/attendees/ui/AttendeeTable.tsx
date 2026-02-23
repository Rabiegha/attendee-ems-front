import React, { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RotateCcw, Trash2, Users } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import type { AttendeeDPO } from '../dpo/attendee.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { ActionButtons, Card } from '@/shared/ui'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { BulkConfirmationModal } from '@/shared/ui/BulkConfirmationModal'
import { useToast } from '@/shared/hooks/useToast'
import {
  useBulkDeleteAttendeesMutation,
  useBulkExportAttendeesMutation,
  useBulkPermanentDeleteAttendeesMutation,
  useUpdateAttendeeMutation,
  useDeleteAttendeeMutation,
  useRestoreAttendeeMutation,
  usePermanentDeleteAttendeeMutation,
} from '../api/attendeesApi'
import { EditAttendeeModal } from './EditAttendeeModal'
import { DeleteAttendeeModal } from './DeleteAttendeeModal'
import { RestoreAttendeeModal } from './RestoreAttendeeModal'
import { PermanentDeleteAttendeeModal } from './PermanentDeleteAttendeeModal'
import { BulkActionsModal } from './BulkActionsModal'

interface AttendeeTableProps {
  attendees: AttendeeDPO[]
  isLoading: boolean
  isDeletedTab?: boolean
  tabsElement?: React.ReactNode
  onBulkDelete?: (
    selectedIds: Set<string>,
    selectedItems: AttendeeDPO[]
  ) => Promise<void>
  onBulkExport?: (
    selectedIds: Set<string>,
    selectedItems: AttendeeDPO[]
  ) => Promise<void>
  // Server-side pagination
  currentPage?: number
  pageSize?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  isLoading,
  isDeletedTab = false,
  tabsElement,
  onBulkDelete,
  onBulkExport,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { t } = useTranslation('attendees')

  // Bulk mutations
  const [bulkDeleteAttendees] = useBulkDeleteAttendeesMutation()
  const [bulkExportAttendees] = useBulkExportAttendeesMutation()
  const [bulkPermanentDeleteAttendees] =
    useBulkPermanentDeleteAttendeesMutation()

  // Individual mutations
  const [updateAttendee] = useUpdateAttendeeMutation()
  const [deleteAttendee] = useDeleteAttendeeMutation()
  const [restoreAttendee] = useRestoreAttendeeMutation()
  const [permanentDeleteAttendee] = usePermanentDeleteAttendeeMutation()

  // Bulk actions states
  const [bulkActionsModalOpen, setBulkActionsModalOpen] = useState(false)
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const [tableResetCounter, setTableResetCounter] = useState(0)

  // États pour les différentes confirmations bulk
  const [bulkConfirmation, setBulkConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'default' | 'danger' | 'warning' | 'success'
    action: () => Promise<void>
  } | null>(null)

  // Modal states
  const [editingAttendee, setEditingAttendee] = useState<AttendeeDPO | null>(
    null
  )
  const [deletingAttendee, setDeletingAttendee] = useState<AttendeeDPO | null>(
    null
  )
  const [restoringAttendee, setRestoringAttendee] =
    useState<AttendeeDPO | null>(null)
  const [permanentDeletingAttendee, setPermanentDeletingAttendee] =
    useState<AttendeeDPO | null>(null)

  // Fonction pour désélectionner tous les éléments
  const clearBulkSelection = useCallback(() => {
    setBulkSelectedIds(new Set())
    setTableResetCounter(prev => prev + 1)
  }, [])

  const handleRowClick = (attendee: AttendeeDPO) => {
    navigate(`/attendees/${attendee.id}`)
  }

  const handleEditAttendee = (attendee: AttendeeDPO) => {
    setEditingAttendee(attendee)
  }

  const handleDeleteAttendee = (attendee: AttendeeDPO) => {
    setDeletingAttendee(attendee)
  }

  const handleSaveAttendee = async (data: any) => {
    if (!editingAttendee) return

    await updateAttendee({
      id: editingAttendee.id,
      data,
    }).unwrap()

    setEditingAttendee(null)
  }

  const handleConfirmDelete = async (attendeeId: string) => {
    await deleteAttendee(attendeeId).unwrap()
    setDeletingAttendee(null)
  }

  const handleRestoreAttendee = (attendee: AttendeeDPO) => {
    setRestoringAttendee(attendee)
  }

  const handlePermanentDeleteAttendee = (attendee: AttendeeDPO) => {
    setPermanentDeletingAttendee(attendee)
  }

  const handleConfirmRestore = async (attendeeId: string) => {
    await restoreAttendee(attendeeId).unwrap()
    setRestoringAttendee(null)
  }

  const handleConfirmPermanentDelete = async (attendeeId: string) => {
    await permanentDeleteAttendee(attendeeId).unwrap()
    setPermanentDeletingAttendee(null)
  }

  // Define columns
  const columns = useMemo<ColumnDef<AttendeeDPO>[]>(
    () => [
      createSelectionColumn<AttendeeDPO>(),
      {
        id: 'participant',
        header: 'Participant',
        accessorFn: (row) => row.displayName,
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div 
            className="cursor-pointer"
            onClick={() => handleRowClick(row.original)}
          >
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.original.displayName}
            </div>
            {row.original.jobTitle && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {row.original.jobTitle}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        accessorKey: 'email',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div 
            className="cursor-pointer"
            onClick={() => handleRowClick(row.original)}
          >
            <div className="text-sm text-gray-900 dark:text-white">
              {row.original.email}
            </div>
            {row.original.phone && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {row.original.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'company',
        header: 'Entreprise',
        accessorKey: 'company',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <div 
            className="cursor-pointer"
            onClick={() => handleRowClick(row.original)}
          >
            {row.original.company || '-'}
          </div>
        ),
      },
      {
        id: 'checkins',
        header: t('table.checkins'),
        accessorKey: 'checkedInCount',
        cell: ({ row }) => (
          <div 
            className="cursor-pointer"
            onClick={() => handleRowClick(row.original)}
          >
            {row.original.checkedInCount !== undefined && row.original.checkedInCount > 0 ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {row.original.checkedInCount} événement{row.original.checkedInCount > 1 ? 's' : ''}
                </span>
                {row.original.lastEventAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Dernier : {formatDate(row.original.lastEventAt)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">Aucun</span>
            )}
          </div>
        ),
      },
      {
        id: 'registration',
        header: 'Inscription',
        accessorKey: 'registrationDate',
        cell: ({ row }) => (
          <div 
            className="cursor-pointer text-gray-500 dark:text-gray-400"
            onClick={() => handleRowClick(row.original)}
          >
            {formatDate(row.original.registrationDate)}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0" onClick={(e) => e.stopPropagation()}>
            {isDeletedTab ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRestoreAttendee(row.original)}
                  title={t('table.restore')}
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 min-w-[32px] p-1.5"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePermanentDeleteAttendee(row.original)}
                  title={t('table.permanent_delete')}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                </Button>
              </>
            ) : (
              <ActionButtons
                onEdit={() => handleEditAttendee(row.original)}
                onDelete={() => handleDeleteAttendee(row.original)}
                size="sm"
                iconOnly
              />
            )}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [isDeletedTab, t]
  )

  // Handlers pour les actions groupées
  const handleBulkExport = async () => {
    try {
      const response = await bulkExportAttendees({
        ids: Array.from(bulkSelectedIds),
        format: 'xlsx',
      }).unwrap()

      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = response.downloadUrl
      a.download = response.filename || 'participants.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success(`${bulkSelectedIds.size} participant(s) exporté(s)`)
    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      toast.error("Erreur lors de l'export")
    }
  }

  const handleBulkDelete = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('bulk.delete_title'),
      message: t('bulk.delete_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await bulkDeleteAttendees(Array.from(bulkSelectedIds)).unwrap()
          toast.success(`${bulkSelectedIds.size} participant(s) supprimé(s)`)
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          toast.error('Erreur lors de la suppression')
        }
      }
    })
  }

  const handleBulkRestore = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('bulk.restore_title'),
      message: t('bulk.restore_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          await Promise.all(
            Array.from(bulkSelectedIds).map((id) =>
              restoreAttendee(id).unwrap()
            )
          )
          toast.success(`${bulkSelectedIds.size} participant(s) restauré(s)`)
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la restauration:', error)
          toast.error('Erreur lors de la restauration')
        }
      }
    })
  }

  const handleBulkPermanentDelete = async () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('bulk.permanent_delete_title'),
      message: t('bulk.permanent_delete_message', { count: bulkSelectedIds.size }),
      variant: 'danger',
      action: async () => {
        try {
          await bulkPermanentDeleteAttendees(Array.from(bulkSelectedIds)).unwrap()
          toast.success(`${bulkSelectedIds.size} participant(s) supprimé(s) définitivement`)
          clearBulkSelection()
        } catch (error) {
          console.error('Erreur lors de la suppression définitive:', error)
          toast.error('Erreur lors de la suppression définitive')
        }
      }
    })
  }

  return (
    <>
      <Card variant="default" padding="none" className="min-w-full">
        {/* Barre d'actions groupées personnalisée */}
        {bulkSelectedIds.size > 0 && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {bulkSelectedIds.size} sélectionnée{bulkSelectedIds.size > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearBulkSelection}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
              >
                Tout désélectionner
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setBulkActionsModalOpen(true)}
                leftIcon={<Users className="h-4 w-4" />}
              >
                Actions
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        key={`${isDeletedTab ? 'deleted' : 'active'}-${tableResetCounter}`}
        columns={columns}
        data={attendees}
        isLoading={isLoading}
        enableRowSelection
        bulkActions={[]}
        getItemId={(attendee) => attendee.id}
        itemType="participants"
        tabsElement={tabsElement}
        onRowSelectionChange={(selectedRows) => {
          const ids = new Set(selectedRows.map((row) => row.id))
          setBulkSelectedIds(ids)
        }}
        emptyMessage="Aucun participant trouvé"
        // Server-side pagination
        enablePagination={true}
        pageSize={pageSize || 50}
        currentPage={currentPage || 1}
        totalItems={totalItems || 0}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange || (() => {})}
      />
    </Card>

      {/* Modals */}
      <BulkActionsModal
        isOpen={bulkActionsModalOpen}
        onClose={() => setBulkActionsModalOpen(false)}
        selectedCount={bulkSelectedIds.size}
        isDeletedTab={isDeletedTab}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onRestore={handleBulkRestore}
        onPermanentDelete={handleBulkPermanentDelete}
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

      {/* Modals individuels */}
      <EditAttendeeModal
        isOpen={!!editingAttendee}
        onClose={() => setEditingAttendee(null)}
        attendee={editingAttendee}
        onSave={handleSaveAttendee}
      />

      <DeleteAttendeeModal
        isOpen={!!deletingAttendee}
        onClose={() => setDeletingAttendee(null)}
        attendee={deletingAttendee}
        onDelete={handleConfirmDelete}
      />

      <RestoreAttendeeModal
        isOpen={!!restoringAttendee}
        onClose={() => setRestoringAttendee(null)}
        attendee={restoringAttendee}
        onRestore={handleConfirmRestore}
      />

      <PermanentDeleteAttendeeModal
        isOpen={!!permanentDeletingAttendee}
        onClose={() => setPermanentDeletingAttendee(null)}
        attendee={permanentDeletingAttendee}
        onPermanentDelete={handleConfirmPermanentDelete}
      />
    </>
  )
}
