import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import type { User, Organization } from '../api/authApi'
import type { AppRule } from '@/shared/acl/app-ability'
import { extractUserFromToken } from '@/shared/lib/jwt-utils'
import { saveAuthToken, removeAuthToken, getAuthToken, isTokenExpired } from '@/shared/lib/auth-storage'

export interface SessionState {
  token: string | null
  user: User | null
  organization: Organization | null
  rules: AppRule[]
  isAuthenticated: boolean
}

// Fonction pour initialiser l'état depuis le localStorage
const initializeState = (): SessionState => {
  const savedToken = getAuthToken()
  
  if (savedToken && !isTokenExpired(savedToken)) {
    // Token valide trouvé, reconstituer l'état
    const tokenData = extractUserFromToken(savedToken)
    if (tokenData) {
      return {
        token: savedToken,
        user: {
          id: tokenData.id,
          email: '', // Will be filled by API call
          firstName: '',
          lastName: '',
          roles: [tokenData.role],
          orgId: tokenData.orgId,
        },
        organization: {
          id: tokenData.orgId,
          name: 'Loading...', // Will be filled by API call
          slug: '',
        },
        rules: [],
        isAuthenticated: true,
      }
    }
  }
  
  // Pas de token ou token expiré
  if (savedToken) {
    removeAuthToken() // Nettoyer le token expiré
  }
  
  return {
    token: null,
    user: null,
    organization: null,
    rules: [],
    isAuthenticated: false,
  }
}

const initialState: SessionState = initializeState()

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{
      access_token: string
      user?: User
      organization?: Organization
    }>) => {
      state.token = action.payload.access_token
      
      // Sauvegarder le token dans le localStorage
      saveAuthToken(action.payload.access_token)
      
      // Extract user info from JWT token
      const tokenData = extractUserFromToken(action.payload.access_token)
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
        
        // Create organization object (basic info, can be enhanced later)
        state.organization = {
          id: tokenData.orgId,
          name: 'ACME Corporation', // Default name, should come from API later
          slug: 'acme',
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
      // Supprimer le token du localStorage
      removeAuthToken()
      
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
