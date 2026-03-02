import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EventDPO } from '@/features/events/dpo/event.dpo'
import { Plus, Users as UsersIcon, Trash2, Edit2, LayoutGrid, AlertTriangle } from 'lucide-react'
import { Button, Modal } from '@/shared/ui'
import { Skeleton } from '@/shared/ui/Skeleton'
import {
  useGetEventTablesQuery,
  useCreateEventTableMutation,
  useUpdateEventTableMutation,
  useDeleteEventTableMutation,
  useAssignRegistrationTableMutation,
  type EventTable,
  type CreateEventTableDto,
  type EventAttendeeType,
} from '@/features/events/api/eventsApi'
import { useToast } from '@/shared/hooks/useToast'

// ─── Table Form ─────────────────────────────────────────────────

interface TableFormProps {
  onSubmit: (data: CreateEventTableDto) => void
  onCancel: () => void
  initialData?: EventTable
  eventAttendeeTypes?: EventAttendeeType[]
}

const TableForm: React.FC<TableFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  eventAttendeeTypes = [],
}) => {
  const { t } = useTranslation(['events', 'common'])
  const [name, setName] = useState(initialData?.name || '')
  const [capacity, setCapacity] = useState<string>(
    initialData?.capacity ? String(initialData.capacity) : ''
  )
  const [isFallback, setIsFallback] = useState(initialData?.is_fallback || false)
  const [sortOrder, setSortOrder] = useState<string>(
    initialData?.sort_order !== undefined ? String(initialData.sort_order) : '0'
  )
  const [allowedAttendeeTypes, setAllowedAttendeeTypes] = useState<string[]>(
    initialData?.allowedAttendeeTypes || []
  )
  const [isRestricted, setIsRestricted] = useState(
    (initialData?.allowedAttendeeTypes?.length ?? 0) > 0
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: CreateEventTableDto = {
      name,
      is_fallback: isFallback,
      sort_order: parseInt(sortOrder, 10) || 0,
      allowedAttendeeTypes: isRestricted ? allowedAttendeeTypes : [],
    }
    if (capacity) data.capacity = parseInt(capacity, 10)
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('events:placement.name_label')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder={t('events:placement.name_placeholder')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('events:placement.capacity_label')}
          </label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder={t('events:placement.capacity_placeholder')}
          />
          <p className="text-xs text-gray-500 mt-1">{t('events:placement.capacity_hint')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('events:placement.sort_order_label')}
          </label>
          <input
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('events:placement.is_fallback')}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('events:placement.is_fallback_description')}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isFallback}
            onChange={(e) => setIsFallback(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Attendee type restriction */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('events:placement.restrict_types')}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('events:placement.restrict_types_description')}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isRestricted}
              onChange={(e) => setIsRestricted(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isRestricted && eventAttendeeTypes.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
            {eventAttendeeTypes.map((type) => {
              const isSelected = allowedAttendeeTypes.includes(type.id)
              return (
                <label
                  key={type.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAllowedAttendeeTypes([...allowedAttendeeTypes, type.id])
                      } else {
                        setAllowedAttendeeTypes(
                          allowedAttendeeTypes.filter((id) => id !== type.id)
                        )
                      }
                    }}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: type.color_hex || type.attendeeType.color_hex || '#E5E7EB',
                      color: type.text_color_hex || type.attendeeType.text_color_hex || '#1F2937',
                    }}
                  >
                    {type.attendeeType.name}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common:app.cancel')}
        </Button>
        <Button type="submit">
          {initialData ? t('common:app.update') : t('events:placement.create')}
        </Button>
      </div>
    </form>
  )
}

// ─── Table Card ─────────────────────────────────────────────────

const TableCard: React.FC<{
  table: EventTable
  eventId: string
  onEdit: (t: EventTable) => void
  onDelete: (id: string) => void
  onUnassign: (registrationId: string) => void
  eventAttendeeTypes: EventAttendeeType[]
}> = ({ table, onEdit, onDelete, onUnassign, eventAttendeeTypes }) => {
  const { t } = useTranslation(['events', 'common'])
  const isFull = table.capacity !== null && table.assignedCount >= table.capacity
  const occupancy = table.capacity
    ? Math.round((table.assignedCount / table.capacity) * 100)
    : 0

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${
      table.is_fallback
        ? 'border-amber-300 dark:border-amber-600'
        : 'border-gray-200 dark:border-gray-700'
    } overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {table.name}
            </h3>
            {table.is_fallback && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {t('events:placement.fallback')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(table)}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
              title={t('common:app.edit')}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(table.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title={t('common:app.delete')}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <UsersIcon className="h-3 w-3" />
          <span>
            {table.assignedCount}
            {table.capacity !== null ? ` / ${table.capacity}` : ''}
          </span>
          {isFull && (
            <span className="text-red-500 font-medium flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" />
              {t('events:placement.full')}
            </span>
          )}
        </div>
        {table.capacity !== null && (
          <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull
                  ? 'bg-red-500'
                  : occupancy > 75
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(occupancy, 100)}%` }}
            />
          </div>
        )}

        {/* Attendee type badges */}
        {table.allowedAttendeeTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {table.allowedAttendeeTypes.map((typeId) => {
              const type = eventAttendeeTypes?.find((t) => t.id === typeId)
              if (!type) return null
              return (
                <span
                  key={typeId}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: type.color_hex || type.attendeeType.color_hex || '#E5E7EB',
                    color: type.text_color_hex || type.attendeeType.text_color_hex || '#1F2937',
                  }}
                >
                  {type.attendeeType.name}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Participants list */}
      <div className="flex-1 p-3 space-y-1 max-h-64 overflow-y-auto">
        {table.assignedRegistrations.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 italic text-center py-2">
            {t('events:placement.no_participants')}
          </p>
        ) : (
          table.assignedRegistrations.map((reg) => (
            <div
              key={reg.id}
              className="flex items-center justify-between group px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    reg.checked_in_at ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                  {reg.attendee.first_name} {reg.attendee.last_name}
                </span>
              </div>
              <button
                onClick={() => onUnassign(reg.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                title={t('events:placement.unassign')}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main Tab Component ─────────────────────────────────────────

interface EventPlacementTabProps {
  event: EventDPO
  eventAttendeeTypes?: EventAttendeeType[]
  isLoadingAttendeeTypes?: boolean
}

export const EventPlacementTab: React.FC<EventPlacementTabProps> = ({
  event,
  eventAttendeeTypes = [],
  isLoadingAttendeeTypes = false,
}) => {
  const { t } = useTranslation(['events', 'common'])
  const { data: tables = [], isLoading, error } = useGetEventTablesQuery(event.id)
  const [createTable] = useCreateEventTableMutation()
  const [updateTable] = useUpdateEventTableMutation()
  const [deleteTable] = useDeleteEventTableMutation()
  const [assignTable] = useAssignRegistrationTableMutation()

  const toast = useToast()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<EventTable | null>(null)

  const handleCreate = async (data: CreateEventTableDto) => {
    try {
      await createTable({ eventId: event.id, data }).unwrap()
      setIsCreateModalOpen(false)
      toast.success(t('events:placement.create_success'))
    } catch (err: any) {
      console.error(err)
      toast.error(err?.data?.message || t('events:placement.create_error'))
    }
  }

  const handleUpdate = async (data: CreateEventTableDto) => {
    if (!editingTable) return
    try {
      await updateTable({
        eventId: event.id,
        tableId: editingTable.id,
        data,
      }).unwrap()
      setEditingTable(null)
      toast.success(t('events:placement.update_success'))
    } catch (err: any) {
      console.error(err)
      toast.error(err?.data?.message || t('events:placement.update_error'))
    }
  }

  const handleDelete = async (tableId: string) => {
    if (confirm(t('events:placement.delete_confirm'))) {
      try {
        await deleteTable({ eventId: event.id, tableId }).unwrap()
        toast.success(t('events:placement.delete_success'))
      } catch (err: any) {
        console.error(err)
        toast.error(err?.data?.message || t('events:placement.delete_error'))
      }
    }
  }

  const handleUnassign = async (registrationId: string) => {
    try {
      await assignTable({
        eventId: event.id,
        registrationId,
        tableId: null,
      }).unwrap()
      toast.success(t('events:placement.unassign_success'))
    } catch (err: any) {
      console.error(err)
      toast.error(err?.data?.message || t('events:placement.unassign_error'))
    }
  }

  // Stats summary
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)
  const totalAssigned = tables.reduce((sum, t) => sum + t.assignedCount, 0)

  if (error) {
    return (
      <div className="text-red-500">{t('events:placement.loading_error')}</div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>
            {t('events:placement.tables_count', { count: tables.length })}
          </span>
          {totalCapacity > 0 && (
            <span>
              {t('events:placement.occupancy', {
                assigned: totalAssigned,
                capacity: totalCapacity,
              })}
            </span>
          )}
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          {t('events:placement.create_button')}
        </Button>
      </div>

      {/* Grid */}
      {isLoading || isLoadingAttendeeTypes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-1.5 w-full" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <LayoutGrid className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <h3 className="text-gray-500 dark:text-gray-400">
            {t('events:placement.no_tables')}
          </h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">
            {t('events:placement.no_tables_description')}
          </p>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 mx-auto"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            {t('events:placement.create_first')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              eventId={event.id}
              onEdit={setEditingTable}
              onDelete={handleDelete}
              onUnassign={handleUnassign}
              eventAttendeeTypes={eventAttendeeTypes}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('events:placement.create_modal_title')}
        maxWidth="xl"
      >
        <TableForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          eventAttendeeTypes={eventAttendeeTypes}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingTable}
        onClose={() => setEditingTable(null)}
        title={t('events:placement.edit_modal_title')}
        maxWidth="xl"
      >
        {editingTable && (
          <TableForm
            onSubmit={handleUpdate}
            onCancel={() => setEditingTable(null)}
            initialData={editingTable}
            eventAttendeeTypes={eventAttendeeTypes}
          />
        )}
      </Modal>
    </div>
  )
}
