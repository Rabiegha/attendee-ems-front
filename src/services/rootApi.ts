import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { setSession, clearSession } from '@/features/auth/model/sessionSlice'

let refreshPromise: Promise<any> | null = null

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // Obligatoire pour envoyer les cookies httpOnly
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.token
    const { expiresAt } = (getState() as RootState).session
    if (token) {
      const timeLeft = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0
      console.log('[AUTH] Adding token to headers. Time left:', Math.floor(timeLeft / 1000), 'seconds')
      headers.set('authorization', `Bearer ${token}`)
    } else {
      console.log('[AUTH] No token available for request')
    }
    return headers
  },
})

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra)

  if (result.error && (result.error as any).status === 401) {
    const url = typeof args === 'string' ? args : args.url
    console.log('[AUTH] 401 error on:', url)
    
    if (url === '/auth/refresh') {
      console.log('[AUTH] Refresh failed, clearing session')
      api.dispatch(clearSession())
      return result
    }

    // Ne pas essayer de refresh si on n'a pas de token du tout
    const currentToken = (api.getState() as RootState).session.token
    const isAuthenticated = (api.getState() as RootState).session.isAuthenticated
    
    console.log('[AUTH] Current state:', { hasToken: !!currentToken, isAuthenticated })
    
    if (!currentToken || !isAuthenticated) {
      console.log('[AUTH] No token or not authenticated, clearing session')
      api.dispatch(clearSession())
      return result
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const res = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extra)
        if (!res.error && res.data) {
          const { access_token, expires_in } = res.data as any
          const state = api.getState() as RootState
          api.dispatch(setSession({
            token: access_token,
            ...(state.session.user && { user: state.session.user }),
            ...(state.session.organization && { organization: state.session.organization }),
            ...(typeof expires_in === 'number' && { expiresInSec: expires_in }),
          }))
        } else {
          api.dispatch(clearSession())
        }
        return res
      })().finally(() => { refreshPromise = null })
    }

    const refreshRes = await refreshPromise
    if (!refreshRes?.error) {
      result = await rawBaseQuery(args, api, extra)
    }
  }

  return result
}

export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: baseQueryWithReauth,
  // Tous les tags utilisés par les différentes features
  tagTypes: [
    'Attendees', 'Attendee',
    'Events', 'Event',
    'Users', 'User', 
    'Roles', 'Role',
    'Invitations', 'Invitation',
    'Auth', 'Policy', 'Signup',
    'Organizations'
  ],
  // Pas d'endpoints ici, ils seront injectés par chaque feature
  endpoints: () => ({}),
})