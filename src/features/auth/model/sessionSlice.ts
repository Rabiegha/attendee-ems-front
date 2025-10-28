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
  isBootstrapping: boolean // true pendant le bootstrap initial
  expiresAt?: number | null // timestamp ms
}

// État initial : pas de persistance, token uniquement en mémoire
const initialState: SessionState = {
  token: null,
  user: null,
  organization: null,
  rules: [],
  isAuthenticated: false,
  isBootstrapping: true, // true au démarrage
  expiresAt: null,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{
      access_token?: string
      token?: string
      user?: User
      organization?: Organization
      expiresInSec?: number
    }>) => {
      // Sauvegarder le token
      state.token = action.payload.access_token || action.payload.token || null
      
      // TOUJOURS utiliser les données du payload si présentes
      if (action.payload.user) {
        state.user = action.payload.user
      }
      
      if (action.payload.organization !== undefined) {
        // Accepter null explicitement (SUPER_ADMIN peut avoir organization = null ou un objet)
        state.organization = action.payload.organization
      }
      
      state.isAuthenticated = true
      state.isBootstrapping = false
      state.expiresAt = action.payload.expiresInSec
        ? Date.now() + action.payload.expiresInSec * 1000
        : state.expiresAt ?? null
    },
    
    setRules: (state, action: PayloadAction<AppRule[]>) => {
      state.rules = action.payload
    },
    
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    
    setBootstrapCompleted: (state) => {
      // Marquer le bootstrap comme terminé (même si pas authentifié)
      state.isBootstrapping = false
    },
    
    clearSession: (state) => {
      // Clear all session data (token reste uniquement en mémoire)
      state.token = null
      state.user = null
      state.organization = null
      state.rules = []
      state.isAuthenticated = false
      state.isBootstrapping = false // Bootstrap terminé
      state.expiresAt = null
    },
  },
})

export const { setSession, setRules, updateUser, clearSession, setBootstrapCompleted } = sessionSlice.actions

// Selectors
export const selectSession = (state: RootState) => state.session
export const selectToken = (state: RootState) => state.session.token
export const selectUser = (state: RootState) => state.session.user
export const selectOrganization = (state: RootState) => state.session.organization
export const selectIsAuthenticated = (state: RootState) => state.session.isAuthenticated
export const selectIsBootstrapping = (state: RootState) => state.session.isBootstrapping
export const selectAbilityRules = (state: RootState) => state.session.rules
export const selectOrgId = (state: RootState) => state.session.organization?.id
export const selectUserId = (state: RootState) => state.session.user?.id
export const selectUserRoles = (state: RootState) => state.session.user?.roles || []
