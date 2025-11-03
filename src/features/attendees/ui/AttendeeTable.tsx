import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Trash } from 'lucide-react'
import type { AttendeeDPO } from '../dpo/attendee.dpo'
import { formatDate } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/Button'
import { ActionButtons } from '@/shared/ui'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingState,
} from '@/shared/ui/Table'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
import {
  useBulkDeleteAttendeesMutation,
  useBulkExportAttendeesMutation,
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
  isDeletedTab?: boolean // Indique si on est dans l'onglet des supprimés
  onBulkDelete?: (
    selectedIds: Set<string>,
    selectedItems: AttendeeDPO[]
  ) => Promise<void>
  onBulkExport?: (
    selectedIds: Set<string>,
    selectedItems: AttendeeDPO[]
  ) => Promise<void>
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  isLoading,
  isDeletedTab = false,
  onBulkDelete,
  onBulkExport,
}) => {
  // const { t } = useTranslation('attendees')
  const navigate = useNavigate()

  // Bulk mutations
  const [bulkDeleteAttendees] = useBulkDeleteAttendeesMutation()
  const [bulkExportAttendees] = useBulkExportAttendeesMutation()

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
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggleItem,
    toggleAll,
    unselectAll,
    selectedCount,
    selectedItems,
  } = useMultiSelect({
    items: attendees,
    getItemId: (attendee) => attendee.id,
  })

  const handleRowClick = (attendee: AttendeeDPO, e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return
    }
    // Navigate to attendee detail page when clicking on row
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

  // Handlers pour les actions sur les attendees supprimés
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

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    // Default export action using API mutation
    actions.push(
      createBulkActions.export(async (selectedIds) => {
        try {
          const response = await bulkExportAttendees({
            ids: Array.from(selectedIds),
            format: 'csv',
          }).unwrap()

          // Download the file using the URL provided by the API
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

    // Default delete action using API mutation
    actions.push(
      createBulkActions.delete(async (selectedIds) => {
        try {
          await bulkDeleteAttendees(Array.from(selectedIds)).unwrap()
          unselectAll()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          throw error
        }
      })
    )

    // Add custom actions if provided
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
    bulkExportAttendees,
    unselectAll,
  ])

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <tr>
            <TableHead>
              <input type="checkbox" disabled className="h-4 w-4" />
            </TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Check-ins</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableLoadingState columns={7} rows={5} />
        </TableBody>
      </Table>
    )
  }

  if (attendees.length === 0) {
    return (
      <Table>
        <TableHeader>
          <tr>
            <TableHead>
              <input type="checkbox" disabled className="h-4 w-4" />
            </TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Check-ins</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableEmptyState message="Aucun participant trouvé" />
        </TableBody>
      </Table>
    )
  }

  return (
    <div>
      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        selectedItems={selectedItems}
        actions={bulkActions}
        onClearSelection={unselectAll}
        itemType="participants"
      />

      <Table>
        <TableHeader>
          <tr>
            <TableHead>
              <label className="flex items-center justify-center cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </label>
            </TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead>Check-ins</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {attendees.map((attendee) => (
            <TableRow
              key={attendee.id}
              selected={isSelected(attendee.id)}
              clickable
              onClick={(e) => handleRowClick(attendee, e)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <label className="flex items-center justify-center w-full h-full cursor-pointer p-2 -m-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={isSelected(attendee.id)}
                    onChange={() => toggleItem(attendee.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </label>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {attendee.displayName}
                    </div>
                    {attendee.jobTitle && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {attendee.jobTitle}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-900 dark:text-white">
                  {attendee.email}
                </div>
                {attendee.phone && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {attendee.phone}
                  </div>
                )}
              </TableCell>
              <TableCell>{attendee.company || '-'}</TableCell>
              <TableCell>
                {attendee.checkedInCount !== undefined && attendee.checkedInCount > 0 ? (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {attendee.checkedInCount} événement{attendee.checkedInCount > 1 ? 's' : ''}
                    </span>
                    {attendee.lastEventAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Dernier : {formatDate(attendee.lastEventAt)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Aucun</span>
                )}
              </TableCell>
              <TableCell className="text-gray-500 dark:text-gray-400">
                {formatDate(attendee.registrationDate)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {isDeletedTab ? (
                    // Actions pour les attendees supprimés
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestoreAttendee(attendee)
                        }}
                        title="Restaurer"
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePermanentDeleteAttendee(attendee)
                        }}
                        title="Supprimer définitivement"
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    // Actions pour les attendees actifs
                    <ActionButtons
                      onEdit={() => handleEditAttendee(attendee)}
                      onDelete={() => handleDeleteAttendee(attendee)}
                      size="sm"
                      iconOnly
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modals */}
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
