import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'

export type UsersTab = 'active' | 'deleted'

interface UsersFilters {
  page: number
  pageSize: number
  search?: string
  isActive?: boolean
}

interface UsersState {
  filters: UsersFilters
  activeTab: UsersTab
}

const initialState: UsersState = {
  filters: {
    page: 1,
    pageSize: 20,
    isActive: true, // Par défaut, afficher les utilisateurs actifs
  },
  activeTab: 'active',
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<UsersFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setActiveTab: (state, action: PayloadAction<UsersTab>) => {
      state.activeTab = action.payload
      // Changer le filtre isActive selon l'onglet
      state.filters.isActive = action.payload === 'active'
      state.filters.page = 1 // Reset la page lors du changement d'onglet
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
  },
})

export const { setFilters, setActiveTab, resetFilters } = usersSlice.actions

export const selectUsersFilters = (state: RootState) => state.users?.filters || initialState.filters
export const selectUsersActiveTab = (state: RootState) => state.users?.activeTab || initialState.activeTab

export default usersSlice.reducer
