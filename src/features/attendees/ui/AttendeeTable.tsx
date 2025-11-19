import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Trash } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import type { AttendeeDPO } from '../dpo/attendee.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { ActionButtons } from '@/shared/ui'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
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

  // Multi-select logic
  const {
    selectedIds,
    unselectAll,
    selectedCount,
    selectedItems,
  } = useMultiSelect({
    items: attendees,
    getItemId: (attendee) => attendee.id,
  })

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
        header: 'Check-ins',
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
                  title="Restaurer"
                  className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 min-w-[32px] p-1.5"
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePermanentDeleteAttendee(row.original)}
                  title="Supprimer définitivement"
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                >
                  <Trash className="h-4 w-4 shrink-0" />
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
    [isDeletedTab]
  )

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    actions.push(
      createBulkActions.export(async (selectedIds) => {
        try {
          const response = await bulkExportAttendees({
            ids: Array.from(selectedIds),
            format: 'csv',
          }).unwrap()

          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = response.downloadUrl
          a.download = response.filename || 'attendees.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          unselectAll()
        } catch (error) {
          console.error("Erreur lors de l'export:", error)
          throw error
        }
      })
    )

    actions.push(
      createBulkActions.delete(async (selectedIds) => {
        try {
          if (isDeletedTab) {
            await bulkPermanentDeleteAttendees(Array.from(selectedIds)).unwrap()
          } else {
            await bulkDeleteAttendees(Array.from(selectedIds)).unwrap()
          }
          unselectAll()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          throw error
        }
      })
    )

    if (onBulkExport) {
      actions.push(createBulkActions.export(onBulkExport))
    }

    if (onBulkDelete) {
      actions.push(createBulkActions.delete(onBulkDelete))
    }

    return actions
  }, [
    onBulkDelete,
    onBulkExport,
    bulkDeleteAttendees,
    bulkPermanentDeleteAttendees,
    bulkExportAttendees,
    unselectAll,
    isDeletedTab,
  ])

  return (
    <div>
      <BulkActions
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        selectedItems={selectedItems}
        actions={bulkActions}
        onClearSelection={unselectAll}
        itemType="participants"
      />

      <DataTable
        columns={columns}
        data={attendees}
        isLoading={isLoading}
        enableRowSelection
        tabsElement={tabsElement}
        onRowSelectionChange={() => {
          // TanStack Table handles selection internally
        }}
        emptyMessage="Aucun participant trouvé"
        // Server-side pagination
        manualPagination={true}
        pageSize={pageSize || 50}
        currentPage={currentPage || 1}
        pageCount={totalPages || 1}
        totalItems={totalItems || 0}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange || (() => {})}
      />

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
    </div>
  )
}
