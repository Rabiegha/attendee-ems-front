import React from 'react'
import { cn } from '@/shared/lib/utils'

/* ============================================
   TABLE COMPONENTS - Design System
   Unified table structure for all pages
   ============================================ */

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }
)
Table.displayName = 'Table'

interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, children, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn(
        'bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  )
})
TableHeader.displayName = 'TableHeader'

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className, children, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn(
        'bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  )
})
TableBody.displayName = 'TableBody'

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  selected?: boolean
  clickable?: boolean
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    { className, children, selected = false, clickable = false, ...props },
    ref
  ) => {
    return (
      <tr
        ref={ref}
        className={cn(
          'transition-colors duration-150',
          'hover:bg-gray-50 dark:hover:bg-gray-700/50',
          selected && 'bg-blue-50 dark:bg-blue-900/20',
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    )
  }
)
TableRow.displayName = 'TableRow'

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
          className
        )}
        {...props}
      >
        {children}
      </th>
    )
  }
)
TableHead.displayName = 'TableHead'

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  }
)
TableCell.displayName = 'TableCell'

/* Empty state for tables */
interface TableEmptyStateProps {
  message?: string
  icon?: React.ReactNode
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  message = 'Aucune donnée disponible',
  icon,
}) => {
  return (
    <tr>
      <td colSpan={100} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          {icon && (
            <div className="text-gray-400 dark:text-gray-500">{icon}</div>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </td>
    </tr>
  )
}

/* Loading state for tables */
interface TableLoadingStateProps {
  columns?: number
  rows?: number
}

export const TableLoadingState: React.FC<TableLoadingStateProps> = ({
  columns = 4,
  rows = 5,
}) => {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i}>
          {[...Array(columns)].map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
