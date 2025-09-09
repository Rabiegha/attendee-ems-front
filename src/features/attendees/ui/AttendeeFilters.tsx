import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, X } from 'lucide-react'
import { 
  selectAttendeesSearchQuery,
  selectAttendeesSelectedStatus,
  selectAttendeesSelectedTags,
  setSearchQuery,
  setSelectedStatus,
  resetFilters
} from '../model/attendeesSlice'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'

const statusOptions = [
  { value: '', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'checked_in', label: 'Enregistré' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'no_show', label: 'Absent' },
]

export const AttendeeFilters: React.FC = () => {
  const { t } = useTranslation('attendees')
  const dispatch = useDispatch()
  
  const searchQuery = useSelector(selectAttendeesSearchQuery)
  const selectedStatus = useSelector(selectAttendeesSelectedStatus)
  const selectedTags = useSelector(selectAttendeesSelectedTags)

  const hasActiveFilters = searchQuery || selectedStatus || selectedTags.length > 0

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value))
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSelectedStatus(e.target.value || null))
  }

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('filters.search_placeholder')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <div className="w-48">
          <select
            value={selectedStatus || ''}
            onChange={handleStatusChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="text-gray-500 hover:text-gray-700"
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
