import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectAttendeesSearchQuery,
  setSearchQuery,
  resetFilters,
} from '../model/attendeesSlice'
import { attendeesApi } from '../api/attendeesApi'
import { FilterBar } from '@/shared/ui/FilterBar'
import { SearchInput } from '@/shared/ui/SearchInput'

interface AttendeeFiltersProps {
  resultCount: number
}

export const AttendeeFilters: React.FC<AttendeeFiltersProps> = ({ resultCount }) => {
  const { t } = useTranslation('attendees')
  const dispatch = useDispatch()

  const searchQuery = useSelector(selectAttendeesSearchQuery)

  const handleResetFilters = () => {
    dispatch(resetFilters())
  }

  const handleRefresh = () => {
    dispatch(attendeesApi.util.invalidateTags(['Attendees']))
  }

  return (
    <FilterBar
      resultCount={resultCount}
      resultLabel="participant"
      onReset={handleResetFilters}
      showResetButton={searchQuery !== ''}
      onRefresh={handleRefresh}
      showRefreshButton={true}
    >
      <SearchInput
        placeholder={t('filters.search_placeholder')}
        value={searchQuery}
        onChange={(value) => dispatch(setSearchQuery(value))}
      />
    </FilterBar>
  )
}
