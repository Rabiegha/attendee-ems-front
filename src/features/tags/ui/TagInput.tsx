import React, { useState, useEffect, useRef } from 'react'
import { X, Tag as TagIcon, Plus } from 'lucide-react'
import { useGetTagsQuery } from '../api/tagsApi'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxTags?: number
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Rechercher ou créer un tag...',
  disabled = false,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedSearch = useDebounce(inputValue, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Toujours charger les tags, même sans recherche (pour afficher tout au clic)
  const { data: suggestions = [], isLoading } = useGetTagsQuery(
    debouncedSearch.trim().length > 0 ? debouncedSearch.trim() : ''
  )

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim()
    if (!trimmedTag) return
    
    // Éviter les doublons
    if (value.includes(trimmedTag)) {
      setInputValue('')
      setIsOpen(false)
      return
    }

    // Vérifier la limite
    if (value.length >= maxTags) return

    onChange([...value, trimmedTag])
    setInputValue('')
    setIsOpen(false)
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        handleAddTag(inputValue)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Filtrer les suggestions pour ne pas afficher les tags déjà sélectionnés
  const filteredSuggestions = suggestions.filter(
    (tag) => !value.includes(tag.name)
  )

  // Afficher les suggestions si le dropdown est ouvert (même sans texte)
  const showSuggestions = isOpen

  return (
    <div className="space-y-3">
      {/* Tags sélectionnés */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input avec autocomplete */}
      {value.length < maxTags && (
        <div ref={wrapperRef} className="relative w-full">
          <div className="flex gap-2 w-full">
            <div className="flex-1">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                leftIcon={<TagIcon className="h-4 w-4" />}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddTag(inputValue)}
              disabled={!inputValue.trim() || disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Dropdown des suggestions */}
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Recherche...
                </div>
              ) : filteredSuggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    {inputValue.trim() ? 'Résultats' : 'Tags disponibles'}
                  </div>
                  {filteredSuggestions.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag.name)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 dark:text-gray-100">
                          {tag.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tag.usage_count} événement
                        {tag.usage_count > 1 ? 's' : ''}
                      </span>
                    </button>
                  ))}
                </>
              ) : !inputValue.trim() ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Aucun tag disponible. Tapez pour en créer un nouveau.
                </div>
              ) : null}

              {/* Option pour créer un nouveau tag */}
              {inputValue.trim() &&
                !filteredSuggestions.some(
                  (tag) =>
                    tag.name.toLowerCase() === inputValue.trim().toLowerCase()
                ) && (
                  <>
                    {filteredSuggestions.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-700" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddTag(inputValue)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3 text-blue-500" />
                      <span className="text-gray-900 dark:text-gray-100">
                        Créer{' '}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          "{inputValue.trim()}"
                        </span>
                      </span>
                    </button>
                  </>
                )}
            </div>
          )}
        </div>
      )}

      {value.length >= maxTags && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Limite de {maxTags} tags atteinte
        </p>
      )}
    </div>
  )
}
