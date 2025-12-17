/**
 * TableSelector - Composant générique pour sélectionner une option dans un tableau
 *
 * Fonctionnalités:
 * - Affiche un badge cliquable avec un dropdown
 * - Position intelligente (top/bottom selon l'espace disponible)
 * - Support du portal pour éviter les problèmes de z-index/overflow
 * - Mise à jour optimiste avec rollback en cas d'erreur
 * - Totalement générique et réutilisable
 *
 * @example
 * ```tsx
 * <TableSelector
 *   value="approved"
 *   options={[
 *     { value: 'approved', label: 'Approuvé', color: 'green', icon: CheckCircle },
 *     { value: 'refused', label: 'Refusé', color: 'red', icon: XCircle }
 *   ]}
 *   onChange={async (newValue) => {
 *     await updateStatus(id, newValue)
 *   }}
 *   disabled={false}
 * />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface TableSelectorOption<T = string> {
  value: T
  label: string
  description?: string
  icon?: LucideIcon
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'orange'
  hexColor?: string
  textHexColor?: string
}

interface TableSelectorProps<T = string> {
  /** Valeur actuelle */
  value: T
  /** Liste des options disponibles */
  options: TableSelectorOption<T>[]
  /** Callback appelé lors du changement (peut être async) */
  onChange: (value: T) => Promise<void> | void
  /** Désactiver le sélecteur */
  disabled?: boolean
  /** Message de chargement */
  loadingText?: string
  /** Taille du badge */
  size?: 'sm' | 'md'
  /** Classe CSS supplémentaire */
  className?: string
}

const COLOR_CLASSES = {
  gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
}

const HOVER_CLASSES = {
  gray: 'hover:bg-gray-200 dark:hover:bg-gray-600',
  red: 'hover:bg-red-200 dark:hover:bg-red-900/50',
  yellow: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50',
  green: 'hover:bg-green-200 dark:hover:bg-green-900/50',
  blue: 'hover:bg-blue-200 dark:hover:bg-blue-900/40',
  indigo: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/50',
  purple: 'hover:bg-purple-200 dark:hover:bg-purple-900/50',
  pink: 'hover:bg-pink-200 dark:hover:bg-pink-900/50',
  orange: 'hover:bg-orange-200 dark:hover:bg-orange-900/50',
}

export function TableSelector<T = string>({
  value,
  options,
  onChange,
  disabled = false,
  loadingText = 'Chargement...',
  size = 'sm',
  className,
}: TableSelectorProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Trouver l'option actuellement sélectionnée
  const currentOption = options.find((opt) => opt.value === value)
  
  if (!currentOption) {
    console.warn(`TableSelector: valeur "${value}" non trouvée dans les options`)
  }

  const CurrentIcon = currentOption?.icon
  const currentColor = currentOption?.color || 'gray'
  const currentHexColor = currentOption?.hexColor
  const currentTextHexColor = currentOption?.textHexColor || 'white'

  // Gérer le changement de statut
  const handleChange = async (newValue: T) => {
    if (newValue === value || isUpdating) return

    setIsOpen(false)
    setIsUpdating(true)

    try {
      await onChange(newValue)
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err)
      // L'erreur est gérée par le parent (toast, etc.)
    } finally {
      setIsUpdating(false)
    }
  }

  // Gérer le z-index de la cellule parent
  useEffect(() => {
    if (buttonRef.current) {
      const cell = buttonRef.current.closest('td')
      if (cell) {
        if (isOpen) {
          cell.style.position = 'relative'
          cell.style.zIndex = '50'
        } else {
          cell.style.position = ''
          cell.style.zIndex = ''
        }
      }
    }
  }, [isOpen])

  // Calculer la position du dropdown
  const handleToggle = () => {
    if (disabled || isUpdating) return

    if (!isOpen && buttonRef.current) {
      const button = buttonRef.current
      const rect = button.getBoundingClientRect()
      const dropdownHeight = Math.min(options.length * 48 + 8, 256) // max-h-64
      const dropdownWidth = 208 // w-52 = 13rem = 208px

      // Calculer l'espace disponible
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const shouldShowAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight

      // Position fixe pour le portal
      setDropdownStyle({
        position: 'fixed',
        left: `${rect.left}px`,
        top: shouldShowAbove ? 'auto' : `${rect.bottom + 4}px`,
        bottom: shouldShowAbove ? `${window.innerHeight - rect.top + 4}px` : 'auto',
        width: `${Math.max(dropdownWidth, rect.width)}px`,
        zIndex: 9999,
      })
    }

    setIsOpen(!isOpen)
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2.5 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm'

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled || isUpdating}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium transition-all',
          sizeClasses,
          !currentHexColor && COLOR_CLASSES[currentColor],
          !currentHexColor && !disabled && !isUpdating && HOVER_CLASSES[currentColor],
          !disabled && !isUpdating && 'cursor-pointer',
          (disabled || isUpdating) && 'opacity-50 cursor-not-allowed',
          isUpdating && 'animate-pulse'
        )}
        style={currentHexColor ? { backgroundColor: currentHexColor, color: currentTextHexColor } : undefined}
      >
        {CurrentIcon && <CurrentIcon className="h-3 w-3 shrink-0" />}
        <span className="truncate">
          {isUpdating ? loadingText : currentOption?.label || 'Non défini'}
        </span>
        {!disabled && !isUpdating && (
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {isOpen &&
        !disabled &&
        !isUpdating &&
        createPortal(
          <>
            {/* Overlay pour fermer le dropdown */}
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menu dropdown */}
            <div
              style={dropdownStyle}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl"
            >
              <div className="py-1 max-h-64 overflow-y-auto">
                {options.map((option) => {
                  const OptionIcon = option.icon
                  const isSelected = option.value === value

                  return (
                    <button
                      key={String(option.value)}
                      onClick={() => handleChange(option.value)}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2',
                        isSelected &&
                          'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {OptionIcon && (
                          <OptionIcon className="h-4 w-4 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  )
}
