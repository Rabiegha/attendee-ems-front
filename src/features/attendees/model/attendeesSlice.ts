import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { AttendeesListParams } from '../api/attendeesApi'

export interface AttendeesUIState {
  // Filters and search
  filters: AttendeesListParams
  searchQuery: string
  selectedTags: string[]
  selectedStatus: string | null

  // View state
  viewMode: 'table' | 'cards'
  activeTab: 'active' | 'deleted'
  selectedAttendeeIds: string[]

  // UI state
  isFiltersOpen: boolean
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isExportModalOpen: boolean
  isBulkActionsOpen: boolean
}

const initialState: AttendeesUIState = {
  filters: {
    page: 1,
    pageSize: 50,
    sortBy: 'last_name',
    sortDir: 'asc',
  },
  searchQuery: '',
  selectedTags: [],
  selectedStatus: null,
  viewMode: 'table',
  activeTab: 'active',
  selectedAttendeeIds: [],
  isFiltersOpen: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isExportModalOpen: false,
  isBulkActionsOpen: false,
}

export const attendeesSlice = createSlice({
  name: 'attendees',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<AttendeesListParams>>
    ) => {
      state.filters = { ...state.filters, ...action.payload }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
      state.filters.search = action.payload
      state.filters.page = 1
    },

    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload
      state.filters.tags = action.payload
      state.filters.page = 1
    },

    setSelectedStatus: (state, action: PayloadAction<string | null>) => {
      state.selectedStatus = action.payload
      if (action.payload) {
        // Map status to isActive for attendees API
        state.filters.isActive = action.payload === 'true'
      } else {
        delete state.filters.isActive
      }
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

    setViewMode: (state, action: PayloadAction<'table' | 'cards'>) => {
      state.viewMode = action.payload
    },

    setActiveTab: (state, action: PayloadAction<'active' | 'deleted'>) => {
      state.activeTab = action.payload
      // Update filters based on selected tab
      if (action.payload === 'active') {
        state.filters.isActive = true
      } else {
        state.filters.isActive = false
      }
      state.filters.page = 1
    },

    setSelectedAttendeeIds: (state, action: PayloadAction<string[]>) => {
      state.selectedAttendeeIds = action.payload
    },

    toggleAttendeeSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const index = state.selectedAttendeeIds.indexOf(id)
      if (index >= 0) {
        state.selectedAttendeeIds.splice(index, 1)
      } else {
        state.selectedAttendeeIds.push(id)
      }
    },

    selectAllAttendees: (state, action: PayloadAction<string[]>) => {
      state.selectedAttendeeIds = action.payload
    },

    clearSelection: (state) => {
      state.selectedAttendeeIds = []
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

    openEditModal: (state) => {
      state.isEditModalOpen = true
    },

    closeEditModal: (state) => {
      state.isEditModalOpen = false
    },

    openExportModal: (state) => {
      state.isExportModalOpen = true
    },

    closeExportModal: (state) => {
      state.isExportModalOpen = false
    },

    toggleBulkActions: (state) => {
      state.isBulkActionsOpen = !state.isBulkActionsOpen
    },

    resetFilters: (state) => {
      state.filters = initialState.filters
      state.searchQuery = ''
      state.selectedTags = []
      state.selectedStatus = null
    },
  },
})

export const {
  setFilters,
  setSearchQuery,
  setSelectedTags,
  setSelectedStatus,
  toggleTag,
  setViewMode,
  setActiveTab,
  setSelectedAttendeeIds,
  toggleAttendeeSelection,
  selectAllAttendees,
  clearSelection,
  toggleFilters,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openExportModal,
  closeExportModal,
  toggleBulkActions,
  resetFilters,
} = attendeesSlice.actions

// Selectors
export const selectAttendeesUI = (state: RootState) => state.attendees
export const selectAttendeesFilters = (state: RootState) =>
  state.attendees.filters
export const selectAttendeesSearchQuery = (state: RootState) =>
  state.attendees.searchQuery
export const selectAttendeesSelectedTags = (state: RootState) =>
  state.attendees.selectedTags
export const selectAttendeesSelectedStatus = (state: RootState) =>
  state.attendees.selectedStatus
export const selectAttendeesViewMode = (state: RootState) =>
  state.attendees.viewMode
export const selectAttendeesActiveTab = (state: RootState) =>
  state.attendees.activeTab
export const selectSelectedAttendeeIds = (state: RootState) =>
  state.attendees.selectedAttendeeIds
export const selectIsAttendeesFiltersOpen = (state: RootState) =>
  state.attendees.isFiltersOpen
export const selectIsCreateAttendeeModalOpen = (state: RootState) =>
  state.attendees.isCreateModalOpen
export const selectIsEditAttendeeModalOpen = (state: RootState) =>
  state.attendees.isEditModalOpen
export const selectIsExportModalOpen = (state: RootState) =>
  state.attendees.isExportModalOpen
export const selectIsBulkActionsOpen = (state: RootState) =>
  state.attendees.isBulkActionsOpen
