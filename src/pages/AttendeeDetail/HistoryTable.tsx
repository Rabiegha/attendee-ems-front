import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Building2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { Card } from '@/shared/ui/Card'
import { formatDate } from '@/shared/lib/utils'

interface EventParticipation {
  id: string
  registrationDate: string
  status: string
  checkedIn: boolean
  checkedInAt?: string
  displayName: string
  snapshot?: {
    firstName?: string
    lastName?: string
  }
  event: {
    id: string
    name: string
    description?: string
    startDate: string
    status: string
    organizationName?: string
  }
}

interface HistoryTableProps {
  history: EventParticipation[]
  currentDisplayName: string
  isSuperAdmin: boolean
  isLoading: boolean
  // Pagination props
  currentPage?: number
  pageSize?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  currentDisplayName,
  isSuperAdmin,
  isLoading,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate()

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`)
  }

  const columns = useMemo<ColumnDef<EventParticipation>[]>(
    () => {
      const baseColumns: ColumnDef<EventParticipation>[] = [
        {
          id: 'event',
          header: 'Événement',
          accessorFn: (row) => row.event.name,
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                {row.original.event.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {row.original.event.description && row.original.event.description.length > 50
                  ? `${row.original.event.description.substring(0, 50)}...`
                  : row.original.event.description || 'Aucune description'}
              </div>
            </div>
          ),
        },
        {
          id: 'eventDate',
          header: 'Date',
          accessorKey: 'event.startDate',
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              {formatDate(row.original.event.startDate)}
            </div>
          ),
        },
        {
          id: 'registrationDate',
          header: "Date d'inscription",
          accessorKey: 'registrationDate',
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              {formatDate(row.original.registrationDate)}
            </div>
          ),
        },
      ]

      if (isSuperAdmin) {
        baseColumns.push({
          id: 'organization',
          header: 'Organisation',
          accessorFn: (row) => row.event.organizationName,
          cell: ({ row }) => (
            <div className="cursor-pointer flex items-center" onClick={() => handleEventClick(row.original.event.id)}>
              <Building2 className="h-4 w-4 mr-1 text-gray-400" />
              {row.original.event.organizationName || 'Organisation inconnue'}
            </div>
          ),
        })
      }

      baseColumns.push(
        {
          id: 'eventStatus',
          header: 'Statut événement',
          accessorKey: 'event.status',
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.original.event.status === 'completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : row.original.event.status === 'active'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : row.original.event.status === 'published'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {row.original.event.status}
              </span>
            </div>
          ),
        },
        {
          id: 'participationStatus',
          header: 'Statut participation',
          accessorKey: 'status',
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.original.status === 'confirmed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : row.original.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : row.original.status === 'checked_in'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}
              >
                {row.original.status}
              </span>
            </div>
          ),
        },
        {
          id: 'checkin',
          header: 'Check-in',
          accessorKey: 'checkedInAt',
          cell: ({ row }) => (
            <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
              {row.original.checkedIn && row.original.checkedInAt ? (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    ✓ Enregistré
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(row.original.checkedInAt)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400 dark:text-gray-500">Non enregistré</span>
              )}
            </div>
          ),
        },
        {
          id: 'usedName',
          header: 'Nom utilisé',
          accessorFn: (row) => row.displayName,
          cell: ({ row }) => {
            const snapshotName = row.original.snapshot
              ? `${row.original.snapshot.firstName || ''} ${row.original.snapshot.lastName || ''}`.trim()
              : null
            const displayedName = snapshotName || row.original.displayName

            return (
              <div className="cursor-pointer" onClick={() => handleEventClick(row.original.event.id)}>
                {snapshotName && snapshotName !== currentDisplayName ? (
                  <div className="space-y-1">
                    <div className="font-medium">{displayedName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      (Différent du nom actuel)
                    </div>
                  </div>
                ) : (
                  displayedName
                )}
              </div>
            )
          },
        }
      )

      return baseColumns
    },
    [isSuperAdmin, currentDisplayName]
  )

  return (
    <Card variant="transparent" padding="none">
      <DataTable
        columns={columns}
        data={history}
        isLoading={isLoading}
        enableRowSelection={false}
        enableColumnOrdering={true}
        enableColumnVisibility={true}
        emptyMessage="Aucune participation trouvée"
        // Server-side pagination
        enablePagination={true}
        totalItems={totalItems ?? 0}
        pageSize={pageSize ?? 10}
        {...(onPageChange && { onPageChange })}
        {...(onPageSizeChange && { onPageSizeChange })}
      />
    </Card>
  )
}
