/**
 * DataTable - Composant de table réutilisable basé sur TanStack Table
 * 
 * Features:
 * - Tri multi-colonnes
 * - Sélection multiple avec checkbox
 * - Pagination
 * - Filtres par colonne
 * - Column Ordering (drag & drop fluide)
 * - Column Visibility (masquer/afficher)
 * - Responsive avec scroll horizontal
 * - Dark mode
 * - Animations smooth
 * - TypeScript strict
 */

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ColumnOrderState,
  ColumnPinningState,
  Column,
} from '@tanstack/react-table'

// Déclaration pour étendre les types de TanStack Table avec notre fonction de tri personnalisée
declare module '@tanstack/react-table' {
  interface SortingFns {
    caseInsensitive: any
  }
}

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  Eye,
  EyeOff,
  Settings2,
  RotateCcw,
} from 'lucide-react'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { cn } from '@/shared/lib/utils'
import { BulkActions, type BulkAction } from '../BulkActions'

// Fonction de tri insensible à la casse pour les chaînes de caractères
const caseInsensitiveSort = (rowA: any, rowB: any, columnId: string) => {
  const a = rowA.getValue(columnId)
  const b = rowB.getValue(columnId)
  
  // Si les valeurs ne sont pas des chaînes, utiliser le tri par défaut
  if (typeof a !== 'string' || typeof b !== 'string') {
    return a === b ? 0 : a > b ? 1 : -1
  }
  
  // Tri insensible à la casse
  return a.toLowerCase().localeCompare(b.toLowerCase())
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Selection
  enableRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void
  // Bulk actions
  bulkActions?: BulkAction[]
  getItemId?: (item: TData) => string
  itemType?: string // 'inscriptions', 'utilisateurs', 'événements', etc.
  // Pagination
  pageSize?: number
  enablePagination?: boolean
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  // Column features
  enableColumnOrdering?: boolean
  enableColumnVisibility?: boolean
  // Tabs
  tabsElement?: React.ReactNode
  // Style
  className?: string
  // Loading
  isLoading?: boolean
  // Empty state
  emptyMessage?: string
  // Misc
  rowKey?: string
}

// Composant pour les en-têtes draggables
function DraggableTableHeader({
  header,
  children,
  canSort,
  onSortClick,
  getPinningStyles,
}: {
  header: any
  children: React.ReactNode
  canSort: boolean
  onSortClick?: ((event: unknown) => void) | undefined
  getPinningStyles: (column: any) => React.CSSProperties
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: header.column.id,
  })

  const pinningStyles = getPinningStyles(header.column)

  const style: React.CSSProperties = {
    ...pinningStyles,
    transform: CSS.Transform.toString(transform),
    // Désactiver transition pendant drag pour éviter glitches
    transition: isDragging ? 'none' : (transition || undefined),
    opacity: isDragging ? 0.5 : (pinningStyles.opacity || 1),
    zIndex: isDragging ? 50 : (pinningStyles.zIndex || 'auto'),
    // GPU acceleration
    willChange: isDragging ? 'transform' : 'auto',
  }

  return (
    <th
      ref={setNodeRef}
      style={style}
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
        'bg-gray-50 dark:bg-gray-700', // Background pour le sticky
        // Transitions seulement au repos
        !isDragging && 'transition-colors duration-150',
        isDragging && 'shadow-xl cursor-grabbing',
        canSort && !isDragging && 'cursor-pointer select-none',
        !isDragging && canSort && 'hover:bg-gray-100 dark:hover:bg-gray-600'
      )}
      onClick={canSort && onSortClick ? (e) => onSortClick(e) : undefined}
    >
      <div className="flex items-center gap-2 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'flex-shrink-0 cursor-grab active:cursor-grabbing touch-none',
            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
            'transition-colors p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500',
            isDragging && 'cursor-grabbing'
          )}
          onClick={(e) => e.stopPropagation()}
          title="Glisser pour réorganiser"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">{children}</div>
      </div>
    </th>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enableRowSelection = false,
  onRowSelectionChange,
  bulkActions,
  getItemId,
  itemType = 'éléments',
  pageSize = 10,
  enablePagination = true,
  enableColumnOrdering = true,
  enableColumnVisibility = true,
  tabsElement,
  className,
  isLoading = false,
  emptyMessage = 'Aucune donnée disponible',
}: DataTableProps<TData, TValue>) {
  // Generate a stable key for localStorage based on column IDs
  const storageKey = React.useMemo(() => {
    const columnIds = columns
      .map((c) => (typeof c.id === 'string' ? c.id : (c as any).accessorKey || ''))
      .sort()
      .join(',')
    return `datatable-order-${columnIds.slice(0, 50)}` // Limit length
  }, [columns])

  // Initialize columnOrder from localStorage or default
  const getInitialColumnOrder = React.useCallback((): ColumnOrderState => {
    const defaultOrder = columns.map((c) => 
      typeof c.id === 'string' ? c.id : (c as any).accessorKey || ''
    )
    
    if (!enableColumnOrdering) return defaultOrder
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsedOrder = JSON.parse(stored) as string[]
        // Validate that stored order matches current columns
        const isValid = 
          parsedOrder.length === defaultOrder.length &&
          parsedOrder.every((id) => defaultOrder.includes(id))
        
        return isValid ? parsedOrder : defaultOrder
      }
    } catch (e) {
      console.warn('Failed to load column order from localStorage:', e)
    }
    
    return defaultOrder
  }, [columns, storageKey, enableColumnOrdering])

  // States
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(getInitialColumnOrder)
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ['select'], // Pin la colonne select à gauche par défaut
    right: [],
  })
  const [showColumnSettings, setShowColumnSettings] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState<number | null>(null)

  // Helper pour les styles de pinning (sticky positioning)
  const getCommonPinningStyles = (column: Column<TData>): React.CSSProperties => {
    const isPinned = column.getIsPinned()
    const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
    const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')

    return {
      boxShadow: isLastLeftPinnedColumn
        ? '-4px 0 4px -4px rgba(0, 0, 0, 0.1) inset'
        : isFirstRightPinnedColumn
        ? '4px 0 4px -4px rgba(0, 0, 0, 0.1) inset'
        : undefined,
      left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
      right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
      opacity: isPinned ? 0.97 : 1,
      position: isPinned ? 'sticky' : 'relative',
      width: column.getSize(),
      zIndex: isPinned ? 1 : 0,
    }
  }

  // DnD sensors optimisés
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Évite activation accidentelle
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Inject handleRowClick into selection column
  const enhancedColumns = React.useMemo(() => {
    return columns.map(col => {
      if (col.id === 'select' && enableRowSelection) {
        return {
          ...col,
          cell: ({ row, table: innerTable }: any) => {
            const rowIndex = innerTable.getRowModel().rows.findIndex((r: any) => r.id === row.id)
            
            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation()
              
              // Shift+Click for range selection
              if (e.shiftKey && lastSelectedIndex !== null) {
                const start = Math.min(lastSelectedIndex, rowIndex)
                const end = Math.max(lastSelectedIndex, rowIndex)
                
                const newSelection: RowSelectionState = {}
                
                // Copy existing selection
                Object.assign(newSelection, rowSelection)
                
                // Add range
                for (let i = start; i <= end; i++) {
                  const targetRow = innerTable.getRowModel().rows[i]
                  if (targetRow) {
                    newSelection[targetRow.id] = true
                  }
                }
                
                setRowSelection(newSelection)
                setLastSelectedIndex(rowIndex)
              } else {
                // Normal toggle
                row.toggleSelected()
                setLastSelectedIndex(rowIndex)
              }
            }
            
            return (
              <div 
                className="flex items-center justify-center w-full cursor-pointer"
                onClick={handleClick}
                title="Maj+Clic pour sélectionner une plage"
              >
                <Checkbox
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  indeterminate={row.getIsSomeSelected()}
                  onChange={(e) => {
                    e.stopPropagation()
                  }}
                  aria-label="Sélectionner la ligne"
                />
              </div>
            )
          }
        }
      }
      return col
    })
  }, [columns, enableRowSelection, lastSelectedIndex, rowSelection])

  // Table instance
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    enableRowSelection,
    sortingFns: {
      caseInsensitive: caseInsensitiveSort,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
      columnPinning,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Handle column reordering
  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setColumnOrder((currentOrder) => {
        const activeIndex = currentOrder.indexOf(active.id as string)
        const overIndex = currentOrder.indexOf(over.id as string)
        
        // Validation des index pour éviter bugs
        if (activeIndex === -1 || overIndex === -1) {
          return currentOrder
        }
        
        const newOrder = arrayMove(currentOrder, activeIndex, overIndex)
        
        // Save to localStorage
        try {
          localStorage.setItem(storageKey, JSON.stringify(newOrder))
        } catch (e) {
          console.warn('Failed to save column order to localStorage:', e)
        }
        
        return newOrder
      })
    }
    
    setActiveId(null)
  }

  const handleDragCancel = () => {
    setActiveId(null)
  }

  // Calculer les items sélectionnés pour BulkActions
  const selectedItems = React.useMemo(
    () => table.getFilteredSelectedRowModel().rows.map((row) => row.original),
    [table, rowSelection]
  )

  const selectedIds = React.useMemo(() => {
    if (!getItemId) return new Set<string>()
    return new Set(selectedItems.map(getItemId))
  }, [selectedItems, getItemId])

  const handleClearSelection = React.useCallback(() => {
    table.resetRowSelection()
  }, [table])

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(selectedItems)
    }
  }, [rowSelection, onRowSelectionChange, selectedItems])

  // Get visible columns for ordering (exclude pinned columns)
  const columnIds = React.useMemo(
    () => columnOrder.filter(id => {
      const leftPinned = columnPinning.left || []
      const rightPinned = columnPinning.right || []
      return !leftPinned.includes(id) && !rightPinned.includes(id)
    }),
    [columnOrder, columnPinning]
  )

  // Update column order if columns prop changes (only on mount or column structure change)
  const prevColumnsRef = React.useRef<ColumnDef<TData, TValue>[]>()
  React.useEffect(() => {
    // Only reset if this is initial mount or columns structure actually changed
    if (!prevColumnsRef.current) {
      prevColumnsRef.current = columns
      return
    }
    
    const prevIds = prevColumnsRef.current.map((c) => 
      typeof c.id === 'string' ? c.id : (c as any).accessorKey || ''
    )
    const newIds = columns.map((c) => 
      typeof c.id === 'string' ? c.id : (c as any).accessorKey || ''
    )
    
    // Only reset if column IDs actually changed (not just reordered)
    const structureChanged = 
      prevIds.length !== newIds.length ||
      !prevIds.every((id) => newIds.includes(id))
    
    if (structureChanged) {
      const newOrder = getInitialColumnOrder()
      setColumnOrder(newOrder)
      prevColumnsRef.current = columns
    }
  }, [columns, getInitialColumnOrder])

  // Toggle all columns visibility
  const handleToggleAllColumns = () => {
    const allVisible = table.getAllLeafColumns().every((col) => col.getIsVisible())
    table.getAllLeafColumns().forEach((col) => {
      if (col.getCanHide()) {
        col.toggleVisibility(!allVisible)
      }
    })
  }

  // Reset table to default state
  const handleResetTable = () => {
    // Reset column order
    const defaultOrder = columns.map((c) => 
      typeof c.id === 'string' ? c.id : (c as any).accessorKey || ''
    )
    setColumnOrder(defaultOrder)
    localStorage.removeItem(storageKey)
    
    // Reset column visibility to all visible
    setColumnVisibility({})
  }

  // Count visible columns
  const visibleColumnsCount = table.getAllLeafColumns().filter((col) => col.getIsVisible()).length

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {columns.map((_, index) => (
                    <th key={index} className="px-6 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Toolbar - Column Visibility & Reset */}
      {(enableColumnVisibility || enableColumnOrdering || tabsElement) && (
        <div className={cn(
          "flex items-center gap-2 mb-4",
          tabsElement ? "justify-between px-6 pt-4" : "justify-end bg-transparent"
        )}>
          {/* Tabs on the left */}
          {tabsElement && <div className="flex-1">{tabsElement}</div>}
          
          {/* Buttons on the right */}
          <div className="flex items-center gap-2">
            {/* Reset Button */}
            {(enableColumnOrdering || enableColumnVisibility) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetTable}
                leftIcon={<RotateCcw className="h-4 w-4" />}
                title="Réinitialiser l'ordre et la visibilité des colonnes"
              >
                Réinitialiser
              </Button>
            )}

            {/* Column Visibility Dropdown */}
            {enableColumnVisibility && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColumnSettings(!showColumnSettings)}
                  leftIcon={<Settings2 className="h-4 w-4" />}
                >
                  Colonnes ({visibleColumnsCount})
                </Button>

              {showColumnSettings && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowColumnSettings(false)}
                  />

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 min-w-[320px] w-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-visible animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
              <div className="flex items-center justify-between gap-4">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Affichage des colonnes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleAllColumns}
                  className="text-sm h-9 px-4 whitespace-nowrap"
                >
                  {visibleColumnsCount === table.getAllLeafColumns().length
                    ? 'Tout masquer'
                    : 'Tout afficher'}
                </Button>
              </div>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto">
              {table.getAllLeafColumns().map((column) => {
                const canHide = column.getCanHide()
                const isVisible = column.getIsVisible()

                return (
                  <label
                    key={column.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md transition-colors whitespace-nowrap',
                      canHide
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Checkbox
                      checked={isVisible}
                      onChange={(e) => column.toggleVisibility(e.target.checked)}
                      disabled={!canHide}
                    />
                    <span className="text-base text-gray-700 dark:text-gray-300 flex items-center gap-3 flex-1">
                      {isVisible ? (
                        <Eye className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span>
                        {typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
                </>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {bulkActions && bulkActions.length > 0 && enableRowSelection && (
        <BulkActions
          selectedCount={selectedItems.length}
          selectedIds={selectedIds}
          selectedItems={selectedItems}
          actions={bulkActions}
          onClearSelection={handleClearSelection}
          itemType={itemType}
        />
      )}

      {/* Table avec zone scrollable */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          {/* Zone scrollable avec hauteur max */}
          <div className="overflow-auto max-h-[calc(100vh-450px)]">
            <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              {/* Header sticky */}
              <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {enableColumnOrdering ? (
                      <>
                        {headerGroup.headers.map((header) => {
                          const isPinned = header.column.getIsPinned()
                          const sortHandler = header.column.getToggleSortingHandler()
                          
                          // Si la colonne est pinnée, utiliser un th simple
                          if (isPinned) {
                            return (
                              <th
                                key={header.id}
                                className={cn(
                                  'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                                  header.column.getCanSort() &&
                                    'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
                                  'bg-gray-50 dark:bg-gray-700'
                                )}
                                onClick={header.column.getCanSort() && sortHandler ? (e) => sortHandler(e) : undefined}
                                style={getCommonPinningStyles(header.column)}
                              >
                                <div className="flex items-center gap-2">
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                  {header.column.getCanSort() && (
                                    <span className="ml-auto flex-shrink-0">
                                      {{
                                        asc: <ChevronUp className="h-4 w-4" />,
                                        desc: <ChevronDown className="h-4 w-4" />,
                                      }[header.column.getIsSorted() as string] ?? (
                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </th>
                            )
                          }
                          
                          // Sinon, wrapper dans SortableContext et utiliser DraggableTableHeader
                          return null // Sera rendu dans le SortableContext ci-dessous
                        })}
                        
                        {/* Colonnes draggables dans SortableContext */}
                        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                          {headerGroup.headers
                            .filter(header => !header.column.getIsPinned())
                            .map((header) => {
                              const sortHandler = header.column.getToggleSortingHandler()
                              return (
                                <DraggableTableHeader
                                  key={header.id}
                                  header={header}
                                  canSort={header.column.getCanSort()}
                                  getPinningStyles={getCommonPinningStyles}
                                  {...(sortHandler && { onSortClick: sortHandler })}
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                  {header.column.getCanSort() && (
                                    <span className="ml-auto flex-shrink-0">
                                      {{
                                        asc: <ChevronUp className="h-4 w-4" />,
                                        desc: <ChevronDown className="h-4 w-4" />,
                                      }[header.column.getIsSorted() as string] ?? (
                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                      )}
                                    </span>
                                  )}
                                </DraggableTableHeader>
                              )
                            })}
                        </SortableContext>
                      </>
                    ) : (
                      headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className={cn(
                            'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                            header.column.getCanSort() &&
                              'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors',
                            'bg-gray-50 dark:bg-gray-700' // Background pour le sticky
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          style={{
                            ...getCommonPinningStyles(header.column),
                            width: header.getSize() !== 150 ? header.getSize() : undefined,
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center gap-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() && (
                                <span className="ml-auto">
                                  {{
                                    asc: <ChevronUp className="h-4 w-4" />,
                                    desc: <ChevronDown className="h-4 w-4" />,
                                  }[header.column.getIsSorted() as string] ?? (
                                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                  )}
                                </span>
                              )}
                            </div>
                          )}
                        </th>
                      ))
                    )}
                  </tr>
                ))}
              </thead>

              {/* Body */}
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150',
                        row.getIsSelected() && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          style={getCommonPinningStyles(cell.column)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drag Overlay - Aperçu pendant le drag */}
        <DragOverlay
          dropAnimation={{
            duration: 200,
            easing: 'ease-out',
            keyframes: ({ transform }) => [
              { transform: CSS.Transform.toString(transform.initial), opacity: 1 },
              { transform: CSS.Transform.toString(transform.final), opacity: 0 },
            ],
          }}
          style={{
            cursor: 'grabbing',
          }}
          // Décalage pour ne pas cacher le texte avec le curseur
          modifiers={[
            ({ transform }) => ({
              ...transform,
              x: transform.x + 15, // Décalage horizontal
              y: transform.y + 15, // Décalage vertical
            }),
          ]}
        >
          {activeId ? (
            <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-lg shadow-2xl border-2 border-blue-500 dark:border-blue-400 cursor-grabbing">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase select-none">
                {(() => {
                  const column = table.getAllLeafColumns().find((col) => col.id === activeId)
                  if (!column) return activeId
                  const header = column.columnDef.header
                  return typeof header === 'string' ? header : activeId
                })()}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
          {/* Page info and page size selector */}
          <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
            {enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <div className="flex items-center gap-3">
                <span>
                  {table.getFilteredSelectedRowModel().rows.length} sur{' '}
                  {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s)
                </span>
              </div>
            ) : (
              <>
                <span>
                  Affichage de {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} à {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} sur {table.getFilteredRowModel().rows.length} résultats
                </span>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap">Par page :</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-none text-center"
                  >
                    {[10, 20, 30, 50, 100, 200, 500].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Page numbers and navigation */}
          {table.getPageCount() > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="flex-shrink-0"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const currentPage = table.getState().pagination.pageIndex + 1
                  const totalPages = table.getPageCount()
                  const pages: (number | string)[] = []
                  
                  if (totalPages <= 7) {
                    // Show all pages if 7 or less
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else {
                    // Always show first page
                    pages.push(1)
                    
                    if (currentPage > 3) pages.push('...')
                    
                    // Show pages around current
                    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                      pages.push(i)
                    }
                    
                    if (currentPage < totalPages - 2) pages.push('...')
                    
                    // Always show last page
                    pages.push(totalPages)
                  }
                  
                  return pages.map((page, idx) =>
                    typeof page === 'number' ? (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => table.setPageIndex(page - 1)}
                        className="min-w-[2.5rem] flex-shrink-0"
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
                    )
                  )
                })()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="flex-shrink-0"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}