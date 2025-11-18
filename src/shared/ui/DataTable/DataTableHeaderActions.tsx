/**
 * DataTableHeaderActions - Boutons Reset et Colonnes extraits pour utilisation avec Tabs
 */
import React from 'react'
import { Settings2, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { cn } from '@/shared/lib/utils'
import type { Table } from '@tanstack/react-table'

interface DataTableHeaderActionsProps<TData> {
  table: Table<TData>
  enableColumnVisibility?: boolean
  enableColumnOrdering?: boolean
  onReset: () => void
}

export function DataTableHeaderActions<TData>({
  table,
  enableColumnVisibility = false,
  enableColumnOrdering = false,
  onReset,
}: DataTableHeaderActionsProps<TData>) {
  const [showColumnSettings, setShowColumnSettings] = React.useState(false)

  const visibleColumnsCount = table.getAllLeafColumns().filter((col) => col.getIsVisible()).length

  const handleToggleAllColumns = () => {
    const allVisible = table.getAllLeafColumns().every((column) => column.getIsVisible())
    table.getAllLeafColumns().forEach((column) => {
      if (column.getCanHide()) {
        column.toggleVisibility(!allVisible)
      }
    })
  }

  if (!enableColumnVisibility && !enableColumnOrdering) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        leftIcon={<RotateCcw className="h-4 w-4" />}
        title="Réinitialiser l'ordre et la visibilité des colonnes"
      >
        Réinitialiser
      </Button>

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
                      {table.getAllLeafColumns().every((column) => column.getIsVisible())
                        ? 'Tout masquer'
                        : 'Tout afficher'}
                    </Button>
                  </div>
                </div>

                <div className="p-4">
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
  )
}
