import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import {
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Download,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { DataTable } from '@/shared/ui/DataTable/DataTable'
import { createSelectionColumn } from '@/shared/ui/DataTable/columns'
import { SearchInput, Button, ActionButtons } from '@/shared/ui'
import { FilterBar, FilterButton } from '@/shared/ui/FilterBar'
import type { FilterValues } from '@/shared/ui/FilterBar/types'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/hooks/useToast'
import {
  useDeletePartnerScanMutation,
  useRestorePartnerScanMutation,
  usePermanentDeletePartnerScanMutation,
  useBulkDeletePartnerScansMutation,
  useBulkRestorePartnerScansMutation,
  useBulkPermanentDeletePartnerScansMutation,
} from '../api/partnerScansApi'
import type { PartnerScanDTO } from '../api/partnerScansApi'

// ─── Props ──────────────────────────────────────────────────────────────────
interface PartnerScansTableProps {
  scans: PartnerScanDTO[]
  isLoading: boolean
  showEventColumn?: boolean
  isDeletedTab: boolean
  // Server-side pagination
  totalItems?: number | undefined
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Server-side search
  onSearchChange?: (search: string) => void
  searchValue?: string
  // Tabs
  tabsElement?: React.ReactNode
  // Export
  onExport?: () => void
  // Refresh
  onRefresh?: () => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const getFullName = (scan: PartnerScanDTO) => {
  const d = scan.attendee_data
  return `${d?.first_name || ''} ${d?.last_name || ''}`.trim() || '—'
}

const getInitials = (scan: PartnerScanDTO) => {
  const name = getFullName(scan)
  if (name === '—') return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// ─── Component ──────────────────────────────────────────────────────────────
export const PartnerScansTable: React.FC<PartnerScansTableProps> = ({
  scans,
  isLoading,
  showEventColumn = false,
  isDeletedTab,
  totalItems,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  searchValue: searchValueProp,
  tabsElement,
  onExport,
  onRefresh,
}) => {
  const { t, i18n } = useTranslation(['common', 'events'])
  const navigate = useNavigate()
  const locale = i18n.language === 'fr' ? fr : enUS
  const toast = useToast()
  const [searchValue, setSearchValue] = useState('')

  // Sync local search state from parent controlled value
  useEffect(() => {
    if (searchValueProp !== undefined && searchValueProp !== searchValue) {
      setSearchValue(searchValueProp)
    }
  }, [searchValueProp])
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [deleteScan, { isLoading: isDeletingScan }] = useDeletePartnerScanMutation()
  const [restoreScan, { isLoading: isRestoringScan }] = useRestorePartnerScanMutation()
  const [permanentDeleteScan, { isLoading: isPermanentDeletingScan }] = usePermanentDeletePartnerScanMutation()
  const [bulkDelete] = useBulkDeletePartnerScansMutation()
  const [bulkRestore] = useBulkRestorePartnerScansMutation()
  const [bulkPermanentDelete] = useBulkPermanentDeletePartnerScansMutation()

  // ── Modal state ───────────────────────────────────────────────────────────
  const [deletingContact, setDeletingContact] = useState<PartnerScanDTO | null>(null)
  const [restoringContact, setRestoringContact] = useState<PartnerScanDTO | null>(null)
  const [permanentDeletingContact, setPermanentDeletingContact] = useState<PartnerScanDTO | null>(null)

  // ── Bulk selection ────────────────────────────────────────────────────────
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set())
  const [tableResetCounter, setTableResetCounter] = useState(0)
  const [bulkConfirmation, setBulkConfirmation] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'warning' | 'danger' | 'success'
    action: () => Promise<void>
  } | null>(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      onSearchChange?.(value)
    },
    [onSearchChange]
  )

  const handleDelete = async () => {
    if (!deletingContact) return
    try {
      await deleteScan(deletingContact.id).unwrap()
      toast.success(t('common:partner_scans.toast_deleted'))
      setDeletingContact(null)
    } catch {
      toast.error(t('common:partner_scans.toast_delete_error'))
    }
  }

  const handleRestore = async () => {
    if (!restoringContact) return
    try {
      await restoreScan(restoringContact.id).unwrap()
      toast.success(t('common:partner_scans.toast_restored'))
      setRestoringContact(null)
    } catch {
      toast.error(t('common:partner_scans.toast_restore_error'))
    }
  }

  const handlePermanentDelete = async () => {
    if (!permanentDeletingContact) return
    try {
      await permanentDeleteScan(permanentDeletingContact.id).unwrap()
      toast.success(t('common:partner_scans.toast_permanent_deleted'))
      setPermanentDeletingContact(null)
    } catch {
      toast.error(t('common:partner_scans.toast_permanent_error'))
    }
  }

  // ── Bulk handlers ─────────────────────────────────────────────────────────
  const clearBulkSelection = useCallback(() => {
    setBulkSelectedIds(new Set())
    setTableResetCounter(prev => prev + 1)
  }, [])

  const handleBulkDelete = () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('common:partner_scans.bulk_delete_title'),
      message: t('common:partner_scans.bulk_delete_message', { count: bulkSelectedIds.size }),
      variant: 'warning',
      action: async () => {
        try {
          await bulkDelete(Array.from(bulkSelectedIds)).unwrap()
          toast.success(t('common:partner_scans.toast_bulk_deleted', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch {
          toast.error(t('common:partner_scans.toast_delete_error'))
        }
      },
    })
  }

  const handleBulkRestore = () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('common:partner_scans.bulk_restore_title'),
      message: t('common:partner_scans.bulk_restore_message', { count: bulkSelectedIds.size }),
      variant: 'success',
      action: async () => {
        try {
          await bulkRestore(Array.from(bulkSelectedIds)).unwrap()
          toast.success(t('common:partner_scans.toast_bulk_restored', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch {
          toast.error(t('common:partner_scans.toast_restore_error'))
        }
      },
    })
  }

  const handleBulkPermanentDelete = () => {
    setBulkConfirmation({
      isOpen: true,
      title: t('common:partner_scans.bulk_permanent_title'),
      message: t('common:partner_scans.bulk_permanent_message', { count: bulkSelectedIds.size }),
      variant: 'danger',
      action: async () => {
        try {
          await bulkPermanentDelete(Array.from(bulkSelectedIds)).unwrap()
          toast.success(t('common:partner_scans.toast_bulk_permanent_deleted', { count: bulkSelectedIds.size }))
          clearBulkSelection()
        } catch {
          toast.error(t('common:partner_scans.toast_permanent_error'))
        }
      },
    })
  }

  const formatScanDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale })
    } catch {
      return dateStr
    }
  }

  const colHeader = (label: string) => () => (
    <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
  )

  const handleRowClick = (scan: PartnerScanDTO) => {
    if (!isDeletedTab) {
      navigate(`/my-contacts/${scan.id}`)
    }
  }

  // ── Filter config ──────────────────────────────────────────────────────────
  const filterConfig = {
    company: {
      label: t('common:partner_scans.filter_company'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('common:partner_scans.filter_company_all') },
        { value: 'with', label: t('common:partner_scans.filter_company_with') },
        { value: 'without', label: t('common:partner_scans.filter_company_without') },
      ],
    },
    note: {
      label: t('common:partner_scans.filter_note'),
      type: 'radio' as const,
      options: [
        { value: 'all', label: t('common:partner_scans.filter_note_all') },
        { value: 'with', label: t('common:partner_scans.filter_note_with') },
        { value: 'without', label: t('common:partner_scans.filter_note_without') },
      ],
    },
  }

  // ── Client-side filtering ─────────────────────────────────────────────────
  const companyFilter = (filterValues.company as string) || 'all'
  const noteFilter = (filterValues.note as string) || 'all'

  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      const matchesCompany =
        companyFilter === 'all' ||
        (companyFilter === 'with' && scan.attendee_data?.company) ||
        (companyFilter === 'without' && !scan.attendee_data?.company)

      const matchesNote =
        noteFilter === 'all' ||
        (noteFilter === 'with' && scan.comment) ||
        (noteFilter === 'without' && !scan.comment)

      return matchesCompany && matchesNote
    })
  }, [scans, companyFilter, noteFilter])

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<PartnerScanDTO>[]>(() => {
    const cols: ColumnDef<PartnerScanDTO>[] = [
      createSelectionColumn<PartnerScanDTO>(),
      // Contact (avatar + name + email + phone)
      {
        id: 'contact',
        header: colHeader(t('common:partner_scans.col_contact')),
        accessorFn: (row) => getFullName(row),
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const scan = row.original
          return (
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleRowClick(scan)}
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {getInitials(scan)}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {getFullName(scan)}
                </div>
                {scan.attendee_data?.email && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{scan.attendee_data.email}</span>
                  </div>
                )}
                {scan.attendee_data?.phone && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                    <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{scan.attendee_data.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )
        },
      },
      // Company + Job title
      {
        id: 'company',
        header: colHeader(t('common:partner_scans.col_company')),
        accessorFn: (row) => row.attendee_data?.company || '',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => {
          const scan = row.original
          return (
            <div className="cursor-pointer min-w-0" onClick={() => handleRowClick(scan)}>
              <div className="text-sm text-gray-900 dark:text-white flex items-center">
                <Building2 className="h-3 w-3 mr-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="truncate">{scan.attendee_data?.company || '—'}</span>
              </div>
              {scan.attendee_data?.job_title && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {scan.attendee_data.job_title}
                </div>
              )}
            </div>
          )
        },
      },
      // Note / Comment
      {
        id: 'comment',
        header: colHeader(t('common:partner_scans.col_note')),
        accessorFn: (row) => row.comment || '',
        cell: ({ row }) => {
          const scan = row.original
          if (!scan.comment) {
            return <span className="text-gray-300 dark:text-gray-600">—</span>
          }
          return (
            <div className="flex items-start gap-1 max-w-[200px]">
              <MessageSquare className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {scan.comment}
              </span>
            </div>
          )
        },
      },
      // Scan date
      {
        id: 'scanned_at',
        header: colHeader(t('common:partner_scans.col_scan_date')),
        accessorKey: 'scanned_at',
        cell: ({ row }) => (
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatScanDate(row.original.scanned_at)}
          </span>
        ),
      },
      // Actions column
      {
        id: 'actions',
        header: colHeader(t('common:partner_scans.col_actions')),
        cell: ({ row }) =>
          isDeletedTab ? (
            <ActionButtons size="sm" iconOnly>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setRestoringContact(row.original)
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 min-w-[32px] p-1.5"
                title={t('common:partner_scans.restore')}
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setPermanentDeletingContact(row.original)
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 min-w-[32px] p-1.5"
                title={t('common:partner_scans.permanent_delete')}
              >
                <Trash2 className="h-4 w-4 shrink-0" />
              </Button>
            </ActionButtons>
          ) : (
            <ActionButtons
              onDelete={() => setDeletingContact(row.original)}
              size="sm"
              iconOnly
            />
          ),
        enableSorting: false,
        enableHiding: false,
      },
    ]

    // Insert event column if cross-event mode (before "Note")
    if (showEventColumn) {
      cols.splice(2, 0, {
        id: 'event',
        header: colHeader(t('common:partner_scans.col_event')),
        accessorFn: (row) => row.event?.name || '',
        sortingFn: 'caseInsensitive',
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            <Calendar className="h-3 w-3" />
            {row.original.event?.name || '—'}
          </span>
        ),
      })
    }

    return cols
  }, [showEventColumn, locale, isDeletedTab, t])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres — identique à RegistrationsTable */}
      <FilterBar
        resultCount={totalItems || 0}
        resultLabel={t('common:partner_scans.result_label')}
        onReset={() => {
          handleSearchChange('')
          setFilterValues({})
        }}
        showResetButton={searchValue !== '' || Object.keys(filterValues).length > 0}
        {...(onRefresh && { onRefresh })}
        showRefreshButton={!!onRefresh}
      >
        <SearchInput
          placeholder={t('common:partner_scans.search_placeholder')}
          value={searchValue}
          onChange={handleSearchChange}
        />

        <FilterButton
          filters={filterConfig}
          values={filterValues}
          onChange={setFilterValues}
        />
      </FilterBar>

      {/* DataTable dans un Card — identique à RegistrationsTable */}
      <Card variant="default" padding="none" className="min-w-full">
        {/* Barre d'actions groupées */}
        {bulkSelectedIds.size > 0 && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('common:partner_scans.selected_count', { count: bulkSelectedIds.size })}
                </span>
                <button
                  onClick={clearBulkSelection}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  {t('common:partner_scans.deselect_all')}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {!isDeletedTab && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    {t('common:partner_scans.delete')}
                  </Button>
                )}
                {isDeletedTab && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBulkRestore}
                      leftIcon={<RotateCcw className="h-4 w-4" />}
                    >
                      {t('common:partner_scans.restore')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkPermanentDelete}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      {t('common:partner_scans.permanent_delete')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <DataTable
          key={`${isDeletedTab ? 'deleted' : 'active'}-${tableResetCounter}`}
          columns={columns}
          data={filteredScans}
          isLoading={isLoading}
          enableRowSelection
          bulkActions={[]}
          getItemId={(scan) => scan.id}
          onRowSelectionChange={(selectedRows) => {
            setBulkSelectedIds(new Set(selectedRows.map((r) => r.id)))
          }}
          enablePagination={true}
          pageSize={pageSize}
          currentPage={currentPage}
          totalItems={totalItems || 0}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onPageSizeChange || (() => {})}
          emptyMessage={
            isDeletedTab
              ? t('common:partner_scans.empty_deleted')
              : t('common:partner_scans.empty_active')
          }
          tabsElement={tabsElement}
        />
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Soft delete confirmation */}
      <Modal
        isOpen={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        maxWidth="md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common:partner_scans.confirm_delete_title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common:partner_scans.confirm_delete_message', { name: deletingContact ? getFullName(deletingContact) : '' })}
            <br />
            <span className="text-sm">{t('common:partner_scans.confirm_delete_hint')}</span>
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => setDeletingContact(null)} disabled={isDeletingScan}>
              {t('common:partner_scans.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} loading={isDeletingScan}>
              {t('common:partner_scans.delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore confirmation */}
      <Modal
        isOpen={!!restoringContact}
        onClose={() => setRestoringContact(null)}
        maxWidth="md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/10 mb-4">
            <RotateCcw className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common:partner_scans.confirm_restore_title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common:partner_scans.confirm_restore_message', { name: restoringContact ? getFullName(restoringContact) : '' })}
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => setRestoringContact(null)} disabled={isRestoringScan}>
              {t('common:partner_scans.cancel')}
            </Button>
            <Button variant="default" onClick={handleRestore} loading={isRestoringScan}>
              {t('common:partner_scans.restore')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permanent delete confirmation */}
      <Modal
        isOpen={!!permanentDeletingContact}
        onClose={() => setPermanentDeletingContact(null)}
        maxWidth="md"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('common:partner_scans.confirm_permanent_title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common:partner_scans.confirm_permanent_message', { name: permanentDeletingContact ? getFullName(permanentDeletingContact) : '' })}
            <br />
            <span className="text-sm text-red-500">
              {t('common:partner_scans.confirm_permanent_hint')}
            </span>
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => setPermanentDeletingContact(null)} disabled={isPermanentDeletingScan}>
              {t('common:partner_scans.cancel')}
            </Button>
            <Button variant="destructive" onClick={handlePermanentDelete} loading={isPermanentDeletingScan}>
              {t('common:partner_scans.permanent_delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk action confirmation */}
      {bulkConfirmation && (
        <Modal
          isOpen={bulkConfirmation.isOpen}
          onClose={() => setBulkConfirmation(null)}
          maxWidth="md"
          showCloseButton={false}
        >
          <div className="text-center">
            <div
              className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
                bulkConfirmation.variant === 'danger'
                  ? 'bg-red-500/10'
                  : 'bg-blue-500/10'
              }`}
            >
              {bulkConfirmation.variant === 'danger' ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <RotateCcw className="h-8 w-8 text-blue-500" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {bulkConfirmation.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {bulkConfirmation.message}
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setBulkConfirmation(null)} disabled={bulkActionLoading}>
                {t('common:partner_scans.cancel')}
              </Button>
              <Button
                variant={bulkConfirmation.variant === 'danger' ? 'destructive' : 'default'}
                loading={bulkActionLoading}
                onClick={async () => {
                  setBulkActionLoading(true)
                  try {
                    await bulkConfirmation.action()
                  } finally {
                    setBulkActionLoading(false)
                  }
                  setBulkConfirmation(null)
                }}
              >
                {t('common:partner_scans.confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
