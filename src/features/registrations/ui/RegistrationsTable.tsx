import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import {
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  QrCode,
  Award,
  RotateCcw,
} from 'lucide-react'
import type { RegistrationDPO } from '../dpo/registration.dpo'
import { Button, TableSelector, type TableSelectorOption, ActionButtons } from '@/shared/ui'
import { SearchInput } from '@/shared/ui'
import { FilterBar, FilterButton } from '@/shared/ui/FilterBar'
import type { FilterValues } from '@/shared/ui/FilterBar/types'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { Card } from '@/shared/ui/Card'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { formatDateTime } from '@/shared/lib/utils'
import {
  useUpdateRegistrationStatusMutation,
  useUpdateRegistrationMutation,
  useDeleteRegistrationMutation,
  useRestoreRegistrationMutation,
  usePermanentDeleteRegistrationMutation,
  useBulkDeleteRegistrationsMutation,
  useBulkExportRegistrationsMutation,
} from '../api/registrationsApi'
import { useToast } from '@/shared/hooks/useToast'
import { EditRegistrationModal } from './EditRegistrationModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { RestoreRegistrationModal } from './RestoreRegistrationModal'
import { PermanentDeleteRegistrationModal } from './PermanentDeleteRegistrationModal'
import { QrCodeModal } from './QrCodeModal'
import { BadgePreviewModal } from './BadgePreviewModal'
import { useMultiSelect } from '@/shared/hooks/useMultiSelect'
import { BulkActions, createBulkActions } from '@/shared/ui/BulkActions'
import {
  getRegistrationFullName,
  getRegistrationEmail,
  getRegistrationPhone,
  getRegistrationCompany,
} from '../utils/registration-helpers'

interface RegistrationsTableProps {
  registrations: RegistrationDPO[]
  isLoading: boolean
  eventId: string
  onExport?: () => void
  onRefresh?: () => void
  isDeletedTab: boolean
  tabsElement?: React.ReactNode
  meta?: {
    total: number
    statusCounts: {
      awaiting: number
      approved: number
      refused: number
    }
  }
  // Server-side pagination
  currentPage?: number
  pageSize?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

const STATUS_CONFIG = {
  awaiting: {
    label: 'En attente',
    icon: Clock,
    color:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle,
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  },
  refused: {
    label: 'Refusé',
    icon: XCircle,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  },
  cancelled: {
    label: 'Annulé',
    icon: Ban,
    color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  },
}

// Options pour le TableSelector
const STATUS_OPTIONS: TableSelectorOption<string>[] = [
  {
    value: 'awaiting',
    label: 'En attente',
    icon: Clock,
    color: 'yellow',
    description: 'En attente de validation',
  },
  {
    value: 'approved',
    label: 'Approuvé',
    icon: CheckCircle,
    color: 'green',
    description: 'Inscription approuvée',
  },
  {
    value: 'refused',
    label: 'Refusé',
    icon: XCircle,
    color: 'red',
    description: 'Inscription refusée',
  },
  {
    value: 'cancelled',
    label: 'Annulé',
    icon: Ban,
    color: 'gray',
    description: 'Inscription annulée',
  },
]

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  isLoading,
  eventId,
  onExport,
  onRefresh,
  isDeletedTab,
  tabsElement,
  meta,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState<FilterValues>({})
  const [editingRegistration, setEditingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [deletingRegistration, setDeletingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [restoringRegistration, setRestoringRegistration] =
    useState<RegistrationDPO | null>(null)
  const [permanentDeletingRegistration, setPermanentDeletingRegistration] =
    useState<RegistrationDPO | null>(null)
  const [qrCodeRegistration, setQrCodeRegistration] =
    useState<RegistrationDPO | null>(null)
  const [badgeDownloadRegistration, setBadgeDownloadRegistration] =
    useState<RegistrationDPO | null>(null)
  const toast = useToast()
  const navigate = useNavigate()

  // Configuration des filtres pour le popup
  const filterConfig = {
    status: {
      label: 'Statut',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'awaiting', label: 'En attente' },
        { value: 'approved', label: 'Approuvés' },
        { value: 'refused', label: 'Refusés' },
        { value: 'cancelled', label: 'Annulés' },
      ],
    },
    checkin: {
      label: 'Check-in',
      type: 'radio' as const,
      options: [
        { value: 'all', label: 'Tous les check-ins' },
        { value: 'checked', label: 'Enregistrés' },
        { value: 'not_checked', label: 'Non enregistrés' },
      ],
    },
  }

  // Optimistic updates: stocke temporairement les nouveaux status avant confirmation serveur
  const [optimisticStatusUpdates, setOptimisticStatusUpdates] = useState<Map<string, string>>(new Map())

  const [updateStatus] = useUpdateRegistrationStatusMutation()
  const [updateRegistration, { isLoading: isUpdating }] =
    useUpdateRegistrationMutation()
  const [deleteRegistration] = useDeleteRegistrationMutation()
  const [restoreRegistration] = useRestoreRegistrationMutation()
  const [permanentDeleteRegistration] = usePermanentDeleteRegistrationMutation()
  const [bulkDeleteRegistrations] = useBulkDeleteRegistrationsMutation()
  const [bulkExportRegistrations] = useBulkExportRegistrationsMutation()

  const handleRowClick = (registration: RegistrationDPO) => {
    navigate(`/attendees/${registration.attendeeId}`)
  }

  const handleStatusChange = async (
    registrationId: string,
    newStatus: string
  ) => {
    // Optimistic update: afficher immédiatement le nouveau statut
    setOptimisticStatusUpdates(prev => new Map(prev).set(registrationId, newStatus))
    
    try {
      await updateStatus({ id: registrationId, status: newStatus }).unwrap()
      toast.success(
        'Statut mis à jour',
        `L'inscription a été ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG].label.toLowerCase()}`
      )
      // Le nettoyage se fera automatiquement quand le serveur renverra la bonne valeur
    } catch (error) {
      console.error('Error updating status:', error)
      // Erreur: restaurer l'ancienne valeur
      setOptimisticStatusUpdates(prev => {
        const next = new Map(prev)
        next.delete(registrationId)
        return next
      })
      toast.error('Erreur', 'Impossible de mettre à jour le statut')
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingRegistration) return

    try {
      await updateRegistration({
        id: editingRegistration.id,
        eventId,
        data,
      }).unwrap()
      toast.success(
        'Inscription mise à jour',
        'Les informations ont été modifiées avec succès'
      )
      setEditingRegistration(null)
    } catch (error) {
      console.error('Error updating registration:', error)
      toast.error('Erreur', "Impossible de mettre à jour l'inscription")
    }
  }

  const handleDelete = async () => {
    if (!deletingRegistration) return

    try {
      await deleteRegistration({
        id: deletingRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription supprimée',
        "L'inscription a été déplacée dans les éléments supprimés"
      )
      setDeletingRegistration(null)
    } catch (error) {
      console.error('Error deleting registration:', error)
      toast.error('Erreur', "Impossible de supprimer l'inscription")
    }
  }

  const handleRestore = async () => {
    if (!restoringRegistration) return

    try {
      await restoreRegistration({
        id: restoringRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription restaurée',
        "L'inscription a été restaurée avec succès"
      )
      setRestoringRegistration(null)
    } catch (error) {
      console.error('Error restoring registration:', error)
      toast.error('Erreur', "Impossible de restaurer l'inscription")
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentDeletingRegistration) return

    try {
      await permanentDeleteRegistration({
        id: permanentDeletingRegistration.id,
        eventId,
      }).unwrap()
      toast.success(
        'Inscription supprimée définitivement',
        "L'inscription a été supprimée définitivement"
      )
      setPermanentDeletingRegistration(null)
    } catch (error) {
      console.error('Error permanently deleting registration:', error)
      toast.error('Erreur', "Impossible de supprimer définitivement l'inscription")
    }
  }

  // Extraction des valeurs de filtres
  const statusFilter = (filterValues.status as string) || 'all'
  const checkinFilter = (filterValues.checkin as string) || 'all'

  // Filtrage
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      !searchQuery ||
      reg.attendee?.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reg.attendee?.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      reg.attendee?.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter

    const matchesCheckin =
      checkinFilter === 'all' ||
      (checkinFilter === 'checked' && reg.checkedInAt) ||
      (checkinFilter === 'not_checked' && !reg.checkedInAt)

    return matchesSearch && matchesStatus && matchesCheckin
  })

  // Multi-select functionality
  const {
    selectedIds,
    selectedItems,
    selectedCount,
    unselectAll,
  } = useMultiSelect({
    items: filteredRegistrations,
    getItemId: (registration) => registration.id,
  })

  // Columns definition
  const columns = useMemo<ColumnDef<RegistrationDPO>[]>(
    () => [
      createSelectionColumn<RegistrationDPO>(),
      {
        id: 'participant',
        header: 'Participant',
        accessorFn: (row) => getRegistrationFullName(row),
        cell: ({ row }) => (
          <div className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {getRegistrationFullName(row.original)}
            </div>
            {getRegistrationCompany(row.original) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                <Building2 className="h-3 w-3 mr-1" />
                {getRegistrationCompany(row.original)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contact',
        accessorFn: (row) => getRegistrationEmail(row),
        cell: ({ row }) => (
          <div className="cursor-pointer space-y-1" onClick={() => handleRowClick(row.original)}>
            <div className="text-sm text-gray-900 dark:text-white flex items-center">
              <Mail className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500" />
              {getRegistrationEmail(row.original)}
            </div>
            {getRegistrationPhone(row.original) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {getRegistrationPhone(row.original)}
              </div>
            )}
            {row.original.comment && (
              <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                💬 {row.original.comment}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Statut',
        accessorKey: 'status',
        cell: ({ row }) => {
          // Utiliser la valeur optimiste si disponible, sinon la valeur serveur
          const optimisticStatus = optimisticStatusUpdates.get(row.original.id)
          const displayedStatus = optimisticStatus || row.original.status
          
          // Si on a une valeur optimiste ET que le serveur a renvoyé la même valeur, on peut nettoyer
          if (optimisticStatus && row.original.status === optimisticStatus) {
            // Nettoyer de manière asynchrone pour éviter les updates pendant le render
            Promise.resolve().then(() => {
              setOptimisticStatusUpdates(prev => {
                const next = new Map(prev)
                next.delete(row.original.id)
                return next
              })
            })
          }
          
          if (isDeletedTab) {
            // Affichage simple pour les inscriptions supprimées
            const StatusIcon = STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].icon
            return (
              <div className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].color}`}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {STATUS_CONFIG[displayedStatus as keyof typeof STATUS_CONFIG].label}
                </span>
              </div>
            )
          }

          // StatusSelector pour les inscriptions actives
          return (
            <TableSelector
              value={displayedStatus}
              options={STATUS_OPTIONS}
              onChange={async (newStatus) => {
                try {
                  await handleStatusChange(row.original.id, newStatus)
                } catch (error) {
                  // L'erreur est déjà gérée dans handleStatusChange
                  throw error
                }
              }}
              disabled={isUpdating}
              loadingText="Mise à jour..."
            />
          )
        },
      },
      {
        id: 'checkin',
        header: 'Check-in',
        accessorKey: 'checkedInAt',
        cell: ({ row }) => (
          <div className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
            {row.original.checkedInAt ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(row.original.checkedInAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-gray-400 dark:text-gray-600" />
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Pas encore
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'date',
        header: "Date d'inscription",
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <div className="cursor-pointer text-sm text-gray-500 dark:text-gray-400" onClick={() => handleRowClick(row.original)}>
            {formatDateTime(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: 'qrcode',
        header: 'QR Code',
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setQrCodeRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Voir QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'badge',
        header: 'Badge',
        cell: ({ row }) => (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setBadgeDownloadRegistration(row.original)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="Télécharger le badge"
            >
              <Award className="h-5 w-5" />
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) =>
          isDeletedTab ? (
            <ActionButtons
              size="sm"
              iconOnly
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRestoringRegistration(row.original)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[32px] p-1.5"
                title="Restaurer"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPermanentDeletingRegistration(row.original)}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                title="Supprimer définitivement"
              >
                <XCircle className="h-4 w-4 shrink-0" />
              </Button>
            </ActionButtons>
          ) : (
            <ActionButtons
              onEdit={() => setEditingRegistration(row.original)}
              onDelete={() => setDeletingRegistration(row.original)}
              size="sm"
              iconOnly
            >
              {row.original.status === 'awaiting' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(row.original.id, 'approved')}
                    disabled={isUpdating}
                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 min-w-[32px] p-1.5"
                    title="Approuver"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(row.original.id, 'refused')}
                    disabled={isUpdating}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                    title="Refuser"
                  >
                    <XCircle className="h-4 w-4 shrink-0" />
                  </Button>
                </>
              )}
            </ActionButtons>
          ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [isUpdating, isDeletedTab, optimisticStatusUpdates, updateStatus]
  )

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = []

    actions.push(
      createBulkActions.export(async (selectedIds) => {
        try {
          const response = await bulkExportRegistrations({
            ids: Array.from(selectedIds),
            format: 'excel',
          }).unwrap()

          const a = document.createElement('a')
          a.style.display = 'none'
          a.href = response.downloadUrl
          a.download = response.filename || 'inscriptions.xlsx'
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
          await bulkDeleteRegistrations({
            ids: Array.from(selectedIds),
            eventId,
          }).unwrap()
          unselectAll()
        } catch (error) {
          console.error('Erreur lors de la suppression:', error)
          throw error
        }
      })
    )

    return actions
  }, [bulkDeleteRegistrations, bulkExportRegistrations, unselectAll, eventId])

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <FilterBar
        onReset={() => {
          setSearchQuery('')
          setFilterValues({})
        }}
        showResetButton={searchQuery !== '' || Object.keys(filterValues).length > 0}
        onRefresh={onRefresh}
        showRefreshButton={!!onRefresh}
      >
        <SearchInput
          placeholder="Rechercher par nom, prénom ou email..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <FilterButton
          filters={filterConfig}
          values={filterValues}
          onChange={setFilterValues}
        />

        {onExport && (
          <Button
            variant="outline"
            onClick={onExport}
            className="h-10 flex-shrink-0"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
        )}
      </FilterBar>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {meta?.total || registrations.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            En attente
          </div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {meta?.statusCounts.awaiting ||
              registrations.filter((r) => r.status === 'awaiting').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Approuvés
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {meta?.statusCounts.approved ||
              registrations.filter((r) => r.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Refusés
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {meta?.statusCounts.refused ||
              registrations.filter((r) => r.status === 'refused').length}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedCount}
        selectedIds={selectedIds}
        selectedItems={selectedItems}
        actions={bulkActions}
        onClearSelection={unselectAll}
        itemType="inscriptions"
      />

      {/* DataTable */}
      <Card variant="default" padding="none">
        <DataTable
          columns={columns}
          data={filteredRegistrations}
          isLoading={isLoading}
          enableRowSelection
          tabsElement={tabsElement}
          onRowSelectionChange={() => {
            // TanStack Table handles selection
          }}
          emptyMessage={
            isDeletedTab
              ? 'Aucune inscription supprimée'
              : 'Aucune inscription trouvée'
          }
          // Server-side pagination
          manualPagination={true}
          pageSize={pageSize || 50}
          currentPage={currentPage || 1}
          pageCount={totalPages || 1}
          totalItems={meta?.total || 0}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange || (() => {})}
        />
      </Card>

      {/* Modals */}
      {editingRegistration && (
        <EditRegistrationModal
          isOpen={!!editingRegistration}
          onClose={() => setEditingRegistration(null)}
          registration={editingRegistration}
          onSave={handleUpdate}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deletingRegistration}
        onClose={() => setDeletingRegistration(null)}
        onConfirm={handleDelete}
        attendeeName={deletingRegistration ? getRegistrationFullName(deletingRegistration) : ''}
      />

      <RestoreRegistrationModal
        isOpen={!!restoringRegistration}
        onClose={() => setRestoringRegistration(null)}
        registration={restoringRegistration}
        onRestore={handleRestore}
      />

      <PermanentDeleteRegistrationModal
        isOpen={!!permanentDeletingRegistration}
        onClose={() => setPermanentDeletingRegistration(null)}
        registration={permanentDeletingRegistration}
        onPermanentDelete={handlePermanentDelete}
      />

      {qrCodeRegistration && (
        <QrCodeModal
          isOpen={!!qrCodeRegistration}
          onClose={() => setQrCodeRegistration(null)}
          registration={qrCodeRegistration}
        />
      )}

      {badgeDownloadRegistration && (
        <BadgePreviewModal
          isOpen={!!badgeDownloadRegistration}
          onClose={() => setBadgeDownloadRegistration(null)}
          registration={badgeDownloadRegistration}
          eventId={eventId}
        />
      )}
    </div>
  )
}
