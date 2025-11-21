import React, { useState, useRef, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '../Button'
import { FilterPopover } from './FilterPopover'
import type { FilterConfigs, FilterValues } from './types'

interface FilterButtonProps {
  filters: FilterConfigs
  values: FilterValues
  onChange: (values: FilterValues) => void
  className?: string
  label?: string
}

/**
 * FilterButton - Bouton qui ouvre un popup avec filtres avancés
 * Affiche un badge avec le nombre de filtres actifs
 * 
 * @example
 * <FilterButton
 *   filters={{
 *     status: {
 *       label: 'Statut',
 *       type: 'checkbox',
 *       options: [
 *         { value: 'draft', label: 'Brouillon' },
 *         { value: 'published', label: 'Publié' }
 *       ]
 *     }
 *   }}
 *   values={filterValues}
 *   onChange={setFilterValues}
 * />
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  filters,
  values,
  onChange,
  className,
  label = 'Filtres',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; maxHeight: number } | null>(null)

  // Calculer le nombre de filtres actifs
  const activeCount = Object.entries(values).reduce((count, [key, value]) => {
    if (!value) return count
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0)
    }
    if (typeof value === 'object' && value !== null) {
      // Date range ou autre objet
      return count + (Object.keys(value).length > 0 ? 1 : 0)
    }
    return count + 1
  }, 0)

  // Calculer la position du popover en tenant compte des bords de l'écran
  const calculatePosition = () => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const popoverWidth = 384 // w-96 = 384px
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const spacing = 8 // gap de 8px
    const minMargin = 16 // marge minimale avec les bords

    let left = rect.left + window.scrollX
    let top = rect.bottom + window.scrollY + spacing

    // Vérifier si le popover dépasse à droite
    if (left + popoverWidth > viewportWidth) {
      // Aligner à droite du viewport avec une petite marge
      left = viewportWidth - popoverWidth - minMargin
    }

    // Vérifier si le popover dépasse à gauche
    if (left < minMargin) {
      left = minMargin
    }

    // Calculer la hauteur maximale disponible
    const spaceBelow = viewportHeight - rect.bottom - spacing - minMargin
    const spaceAbove = rect.top - spacing - minMargin

    let maxHeight: number

    if (spaceBelow < 200 && spaceAbove > spaceBelow) {
      // Pas assez d'espace en bas mais plus d'espace en haut : ouvrir vers le haut
      top = rect.top + window.scrollY - Math.min(spaceAbove, 500) - spacing
      maxHeight = Math.min(spaceAbove, 500)
    } else {
      // Ouvrir vers le bas avec la hauteur disponible
      maxHeight = Math.min(spaceBelow, 500)
    }

    setPopoverPosition({ top, left, maxHeight })
  }

  // Calculer la position quand le popover s'ouvre
  const handleToggle = () => {
    if (!isOpen) {
      calculatePosition()
    }
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="default"
        onClick={handleToggle}
        className={cn(
          'relative h-10 flex-shrink-0',
          activeCount > 0 && 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20',
          className
        )}
        leftIcon={<Filter className="h-4 w-4" />}
      >
        {label}
        {activeCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {isOpen && popoverPosition && (
        <FilterPopover
          filters={filters}
          values={values}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
          position={popoverPosition}
        />
      )}
    </>
  )
}
