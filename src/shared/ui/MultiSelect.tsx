import React, { useState, useRef, useEffect } from 'react'
import { X, Search, Users, Check } from 'lucide-react'

export interface MultiSelectOption {
  id: string
  label: string
  subLabel?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Sélectionner des éléments...',
  disabled = false,
  maxSelections,
  searchPlaceholder = 'Rechercher...',
  emptyMessage = 'Aucun élément trouvé',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtrer les options selon la recherche
  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.subLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Options sélectionnées pour affichage
  const selectedOptions = value
    .map((id) => options.find((opt) => opt.id === id))
    .filter(Boolean) as MultiSelectOption[]

  const handleOptionToggle = (optionId: string) => {
    if (value.includes(optionId)) {
      // Désélectionner
      onChange(value.filter((id) => id !== optionId))
    } else {
      // Sélectionner (vérifier la limite)
      if (!maxSelections || value.length < maxSelections) {
        onChange([...value, optionId])
      }
    }
  }

  const handleRemoveSelection = (optionId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onChange(value.filter((id) => id !== optionId))
  }

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const isAtMaxSelections = maxSelections && value.length >= maxSelections

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input principal */}
      <div
        className={`
          min-h-[42px] w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 
          bg-white dark:bg-gray-700 cursor-pointer transition-colors duration-200
          hover:border-gray-400 dark:hover:border-gray-500 
          focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        `}
        onClick={handleToggleDropdown}
      >
        <div className="flex flex-wrap gap-1">
          {/* Sélections actuelles */}
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded transition-colors duration-200"
            >
              {option.label}
              <button
                onClick={(e) => handleRemoveSelection(option.id, e)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors duration-150"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* Placeholder ou compteur */}
          {selectedOptions.length === 0 && (
            <span className="text-gray-500 dark:text-gray-400 text-sm py-1">
              {placeholder}
            </span>
          )}
        </div>

        {/* Indicateur d'état */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Users
            className={`h-4 w-4 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden transition-colors duration-200">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Liste des options */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.id)
                const canSelect = !isAtMaxSelections || isSelected

                return (
                  <div
                    key={option.id}
                    className={`
                      p-3 cursor-pointer flex items-center justify-between 
                      hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150
                      ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''}
                    `}
                    onClick={() => canSelect && handleOptionToggle(option.id)}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                      {option.subLabel && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.subLabel}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Info limite */}
          {maxSelections && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
              {value.length} / {maxSelections} sélectionné
              {value.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
