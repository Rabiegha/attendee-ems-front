import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { EventsListParams } from '../api/eventsApi'

export interface EventsUIState {
  // Filters and search
  filters: EventsListParams
  searchQuery: string
  selectedTags: string[]

  // View state
  viewMode: 'grid' | 'list'
  selectedEventId: string | null

  // UI state
  isFiltersOpen: boolean
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
}

const initialState: EventsUIState = {
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'startDate',
    sortOrder: 'asc',
  },
  searchQuery: '',
  selectedTags: [],
  viewMode: 'grid',
  selectedEventId: null,
  isFiltersOpen: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,
}

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<EventsListParams>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.filters.search = action.payload
      state.filters.page = 1 // Reset to first page when searching
    },

    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload
      state.filters.tags = action.payload
      state.filters.page = 1
    },

    toggleTag: (state, action: PayloadAction<string>) => {
      const tag = action.payload
      const index = state.selectedTags.indexOf(tag)
      if (index >= 0) {
        state.selectedTags.splice(index, 1)
      } else {
        state.selectedTags.push(tag)
      }
      state.filters.tags = state.selectedTags
      state.filters.page = 1
    },

    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload
    },

    setSelectedEventId: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload
    },

    toggleFilters: (state) => {
      state.isFiltersOpen = !state.isFiltersOpen
    },

    openCreateModal: (state) => {
      state.isCreateModalOpen = true
    },

    closeCreateModal: (state) => {
      state.isCreateModalOpen = false
    },

    openEditModal: (state, action: PayloadAction<string>) => {
      state.isEditModalOpen = true
      state.selectedEventId = action.payload
    },

    closeEditModal: (state) => {
      state.isEditModalOpen = false
      state.selectedEventId = null
    },

    resetFilters: (state) => {
      state.filters = initialState.filters
      state.searchQuery = ''
      state.selectedTags = []
    },
  },
})

export const {
  setFilters,
  setSearchQuery,
  setSelectedTags,
  toggleTag,
  setViewMode,
  setSelectedEventId,
  toggleFilters,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  resetFilters,
} = eventsSlice.actions

// Selectors
export const selectEventsUI = (state: RootState) => state.events
export const selectEventsFilters = (state: RootState) => state.events.filters
export const selectEventsSearchQuery = (state: RootState) =>
  state.events.searchQuery
export const selectEventsSelectedTags = (state: RootState) =>
  state.events.selectedTags
export const selectEventsViewMode = (state: RootState) => state.events.viewMode
export const selectSelectedEventId = (state: RootState) =>
  state.events.selectedEventId
export const selectIsFiltersOpen = (state: RootState) =>
  state.events.isFiltersOpen
export const selectIsCreateModalOpen = (state: RootState) =>
  state.events.isCreateModalOpen
export const selectIsEditModalOpen = (state: RootState) =>
  state.events.isEditModalOpen
