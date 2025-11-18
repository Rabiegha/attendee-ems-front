import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Filter, X } from 'lucide-react'
import {
  selectAttendeesSearchQuery,
  selectAttendeesSelectedStatus,
  selectAttendeesSelectedTags,
  setSearchQuery,
  setSelectedStatus,
  resetFilters,
} from '../model/attendeesSlice'
import { Button } from '@/shared/ui/Button'
import { SearchInput } from '@/shared/ui/SearchInput'

const statusOptions = [
  { value: '', label: 'Tous' },
  { value: 'true', label: 'Actifs' },
  { value: 'false', label: 'Inactifs' },
]

export const AttendeeFilters: React.FC = () => {
  const { t } = useTranslation('attendees')
  const dispatch = useDispatch()

  const searchQuery = useSelector(selectAttendeesSearchQuery)
  const selectedStatus = useSelector(selectAttendeesSelectedStatus)
  const selectedTags = useSelector(selectAttendeesSelectedTags)

  const hasActiveFilters =
    searchQuery || selectedStatus || selectedTags.length > 0

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchInput
            placeholder={t('filters.search_placeholder')}
            value={searchQuery}
            onChange={(value) => dispatch(setSearchQuery(value))}
          />
        </div>

        <div className="w-48">
          <select
            value={selectedStatus || ''}
            onChange={(e) => dispatch(setSelectedStatus(e.target.value || null))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors duration-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
