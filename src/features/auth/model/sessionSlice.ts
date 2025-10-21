import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { User, Organization } from '../api/authApi'
import type { AppRule } from '@/shared/acl/app-ability'
import { extractUserFromToken } from '@/shared/lib/jwt-utils'
// Plus d'imports d'auth-storage car on ne persiste plus le token

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
      expiresInSec?: number // NEW
    }>) => {
      // Support both access_token and token fields for compatibility
      state.token = action.payload.access_token || action.payload.token || null
      
      // Extract user info from JWT token if available
      const token = action.payload.access_token || action.payload.token
      const tokenData = token ? extractUserFromToken(token) : null
      if (tokenData) {
        // Create user object from token data
        state.user = {
          id: tokenData.id,
          email: '', // We don't have email in token, will be empty for now
          firstName: '', // Will be extracted from backend later
          lastName: '', // Will be extracted from backend later
          roles: [tokenData.role],
          orgId: tokenData.orgId,
        }
        
        // Create organization object (SUPER_ADMIN n'a pas d'org)
        if (tokenData.orgId && tokenData.role !== 'SUPER_ADMIN') {
          state.organization = {
            id: tokenData.orgId,
            name: 'ACME Corporation', // Default name, should come from API later
            slug: 'acme',
          }
        } else {
          state.organization = null // SUPER_ADMIN n'appartient à aucune org
        }
      }
      
      // Override with provided user/org if available
      if (action.payload.user) {
        state.user = action.payload.user
      }
      if (action.payload.organization) {
        state.organization = action.payload.organization
      }
      
      state.isAuthenticated = true
      state.isBootstrapping = false // Bootstrap terminé avec succès
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
export const selectUser = (state: RootState) => state.session.user
export const selectOrganization = (state: RootState) => state.session.organization
export const selectIsAuthenticated = (state: RootState) => state.session.isAuthenticated
export const selectIsBootstrapping = (state: RootState) => state.session.isBootstrapping
export const selectAbilityRules = (state: RootState) => state.session.rules
export const selectOrgId = (state: RootState) => state.session.organization?.id
export const selectUserId = (state: RootState) => state.session.user?.id
export const selectUserRoles = (state: RootState) => state.session.user?.roles || []
