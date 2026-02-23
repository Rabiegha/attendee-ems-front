/**
 * DataTable Column Helpers
 * 
 * Helpers pour créer des colonnes réutilisables avec TanStack Table
 */

import { ColumnDef } from '@tanstack/react-table'
import i18next from 'i18next'
import { Checkbox } from '../Checkbox'

/**
 * Colonne de sélection (checkbox)
 */
export function createSelectionColumn<TData>(options?: {
  onRowClick?: (rowIndex: number, event: React.MouseEvent) => void
}): ColumnDef<TData> {
  return {
    id: 'select',
    size: 48, // w-12
    header: ({ table }) => (
      <div 
        className="flex items-center justify-center w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label={i18next.t('common:table.select_all')}
        />
      </div>
    ),
    cell: ({ row, table }) => {
      const rowIndex = table.getRowModel().rows.findIndex(r => r.id === row.id)
      
      return (
        <div 
          className="flex items-center justify-center w-full"
          onClick={(e) => {
            e.stopPropagation()
            if (options?.onRowClick) {
              options.onRowClick(rowIndex, e)
            } else {
              row.toggleSelected()
            }
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={(e) => {
              // Le onChange du checkbox est déjà géré par le onClick du parent
              e.stopPropagation()
            }}
            aria-label={i18next.t('common:table.select_row')}
            title="Maj+Clic pour sélectionner une plage"
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Colonne d'actions
 */
export function createActionsColumn<TData>(
  renderActions: (row: TData) => React.ReactNode
): ColumnDef<TData> {
  return {
    id: 'actions',
    size: 128, // w-32
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-0 flex-wrap">
        {renderActions(row.original)}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

/**
 * Colonne de texte simple
 */
export function createTextColumn<TData>(
  accessorKey: string,
  header: string,
  options?: {
    enableSorting?: boolean
    cell?: (value: any) => React.ReactNode
  }
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    enableSorting: options?.enableSorting ?? true,
    cell: options?.cell
      ? ({ getValue }) => options.cell!(getValue())
      : ({ getValue }) => getValue(),
  }
}

/**
 * Colonne de badge/statut
 */
export function createBadgeColumn<TData>(
  accessorKey: string,
  header: string,
  badgeRenderer: (value: any) => React.ReactNode
): ColumnDef<TData> {
  return {
    accessorKey,
    header,
    cell: ({ getValue }) => badgeRenderer(getValue()),
    enableSorting: true,
  }
}

/**
 * Colonne de date
 */
export function createDateColumn<TData>(
  accessorKey: string,
  header: string,
  formatDate?: (date: Date | string) => string
): ColumnDef<TData> {
  const defaultFormat = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return {
    accessorKey,
    header,
    cell: ({ getValue }) => {
      const value = getValue()
      if (!value) return '-'
      return (formatDate || defaultFormat)(value as Date | string)
    },
    enableSorting: true,
  }
}
