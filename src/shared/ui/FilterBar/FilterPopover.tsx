import React, { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '../Button'
import type { FilterConfigs, FilterValues, FilterOption } from './types'

interface FilterPopoverProps {
  filters: FilterConfigs
  values: FilterValues
  onChange: (values: FilterValues) => void
  onClose: () => void
  position: { top: number; left: number; maxHeight: number }
}

/**
 * FilterPopover - Popup modal avec sections de filtres
 * Supporte checkbox (multi-sélection), radio (choix unique), date-range
 */
export const FilterPopover: React.FC<FilterPopoverProps> = ({
  filters,
  values,
  onChange,
  onClose,
  position,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [localValues, setLocalValues] = useState<FilterValues>(values)

  // Fermer au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Petit délai pour éviter que le clic d'ouverture ferme immédiatement
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleCheckboxChange = (filterKey: string, optionValue: string, checked: boolean) => {
    const currentValues = (localValues[filterKey] as string[]) || []
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue)

    setLocalValues((prev) => ({
      ...prev,
      [filterKey]: newValues.length > 0 ? newValues : undefined,
    }))
  }

  const handleRadioChange = (filterKey: string, optionValue: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [filterKey]: optionValue,
    }))
  }

  const handleReset = () => {
    setLocalValues({})
    onChange({})
    onClose()
  }

  const handleApply = () => {
    onChange(localValues)
    onClose()
  }

  const isChecked = (filterKey: string, optionValue: string): boolean => {
    const value = localValues[filterKey]
    if (Array.isArray(value)) {
      return value.includes(optionValue)
    }
    return value === optionValue
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40" />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="fixed z-50 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          maxHeight: `${position.maxHeight}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filtres avancés
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="overflow-y-auto flex-1 p-4 space-y-6">
          {Object.entries(filters).map(([filterKey, config]) => (
            <div key={filterKey} className="space-y-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                {config.label}
              </label>

              {/* Checkbox group */}
              {config.type === 'checkbox' && (
                <div className="space-y-2">
                  {config.options.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked(filterKey, option.value)}
                        onChange={(e) =>
                          handleCheckboxChange(filterKey, option.value, e.target.checked)
                        }
                        disabled={option.disabled}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* Radio group */}
              {config.type === 'radio' && (
                <div className="space-y-2">
                  {config.options.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <input
                        type="radio"
                        name={filterKey}
                        checked={isChecked(filterKey, option.value)}
                        onChange={() => handleRadioChange(filterKey, option.value)}
                        disabled={option.disabled}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button size="sm" onClick={handleApply}>
            Appliquer
          </Button>
        </div>
      </div>
    </>
  )
}
