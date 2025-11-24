/**
 * TagFilterInput Component
 * 
 * Input autocomplete pour filtrer par tag
 * Affiche les suggestions en temps réel pendant la saisie
 */

import { useState, useEffect, useRef } from 'react'
import { Tag, X } from 'lucide-react'
import { useGetTagsQuery } from '../api/tagsApi'
import { useDebounce } from '@/shared/hooks/useDebounce'

interface TagFilterInputProps {
  value: string
  onChange: (tagName: string) => void
  placeholder?: string
}

export const TagFilterInput: React.FC<TagFilterInputProps> = ({
  value,
  onChange,
  placeholder = 'Filtrer par tag...',
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce pour éviter trop de requêtes API
  const debouncedSearch = useDebounce(inputValue, 300)

  // Récupérer les suggestions depuis l'API
  // Si showSuggestions est true, on charge les tags (avec ou sans filtre)
  // Sinon on skip la requête pour économiser les appels API
  const { data: suggestions = [], isLoading, error } = useGetTagsQuery(
    debouncedSearch.trim() || (showSuggestions ? '' : undefined),
    {
      skip: !showSuggestions,
    }
  )

  // Debug
  useEffect(() => {
    console.log('[TagFilterInput] Suggestions:', suggestions)
    console.log('[TagFilterInput] isLoading:', isLoading)
    console.log('[TagFilterInput] error:', error)
  }, [suggestions, isLoading, error])

  // Synchroniser l'input avec la valeur externe
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(true)
    setActiveSuggestionIndex(0)
  }

  const handleSelectTag = (tagName: string) => {
    setInputValue(tagName)
    onChange(tagName)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setActiveSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break

      case 'Enter':
        e.preventDefault()
        if (suggestions[activeSuggestionIndex]) {
          handleSelectTag(suggestions[activeSuggestionIndex].name)
        }
        break

      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        break
    }
  }

  const handleFocus = () => {
    setShowSuggestions(true)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="h-10 w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-500 dark:placeholder-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && !isLoading && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleSelectTag(tag.name)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                index === activeSuggestionIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {tag.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tag.usage_count} événement{tag.usage_count > 1 ? 's' : ''}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {showSuggestions && isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement des tags...
          </p>
        </div>
      )}

      {/* No results message */}
      {showSuggestions &&
        !isLoading &&
        inputValue.trim() &&
        suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun tag trouvé
            </p>
          </div>
        )}
    </div>
  )
}
