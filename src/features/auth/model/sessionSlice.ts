import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { User, Organization } from '../api/authApi'
import type { AppRule } from '@/shared/acl/app-ability'

export interface SessionState {
  token: string | null
  user: User | null
  organization: Organization | null
  rules: AppRule[]
  isAuthenticated: boolean
}

const initialState: SessionState = {
  token: null,
  user: null,
  organization: null,
  rules: [],
  isAuthenticated: false,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{
      token: string
      user: User
      organization: Organization
    }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.organization = action.payload.organization
      state.isAuthenticated = true
    },
    
    setRules: (state, action: PayloadAction<AppRule[]>) => {
      state.rules = action.payload
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    clearSession: (state) => {
      state.token = null
      state.user = null
      state.organization = null
      state.rules = []
      state.isAuthenticated = false
    },
  },
})

export const { setSession, setRules, updateUser, clearSession } = sessionSlice.actions

// Selectors
export const selectSession = (state: RootState) => state.session
export const selectUser = (state: RootState) => state.session.user
export const selectOrganization = (state: RootState) => state.session.organization
export const selectIsAuthenticated = (state: RootState) => state.session.isAuthenticated
export const selectAbilityRules = (state: RootState) => state.session.rules
export const selectOrgId = (state: RootState) => state.session.organization?.id
export const selectUserId = (state: RootState) => state.session.user?.id
export const selectUserRoles = (state: RootState) => state.session.user?.roles || []
