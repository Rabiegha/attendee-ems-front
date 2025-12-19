import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { setSession, clearSession } from '@/features/auth/model/sessionSlice'
import { addToast } from '@/shared/ui/toast-slice'
import i18n from '@/shared/lib/i18n'

let refreshPromise: Promise<any> | null = null

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '', // Empty string = relative URLs (go through reverse proxy)
  credentials: 'include', // Obligatoire pour envoyer les cookies httpOnly
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.token
    if (token) {
      // 🔇 Log désactivé pour éviter la pollution des logs
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra)

  if (result.error && (result.error as any).status === 401) {
    const url = typeof args === 'string' ? args : args.url
    // console.log('[AUTH] 401 error on:', url)

    // Si le refresh lui-même échoue, c'est terminé
    if (url === '/auth/refresh') {
      // console.log('[AUTH] Refresh failed, clearing session')
      
      const errorData = result.error?.data as any
      const errorMessage = errorData?.detail || errorData?.message
      if (
        errorMessage === 'User not found or inactive' ||
        errorMessage === 'Account deactivated' ||
        errorMessage === 'User not found'
      ) {
        api.dispatch(
          addToast({
            type: 'error',
            title: i18n.t('session_terminated', { ns: 'auth' }),
            message: i18n.t('account_deactivated_logout', { ns: 'auth' }),
            duration: 10000,
          })
        )
      }

      api.dispatch(clearSession())
      return result
    }

    // ✅ TOUJOURS tenter le refresh sur un 401
    // Le refresh token est dans le cookie HttpOnly, pas dans Redux
    // Donc même sans access token, on peut tenter le refresh
    // console.log('[AUTH] Attempting token refresh...')

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const res = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST' },
          api,
          extra
        )
        if (!res.error && res.data) {
          const { access_token, expires_in } = res.data as any
          const state = api.getState() as RootState
          // console.log('[AUTH] Token refreshed successfully')
          api.dispatch(
            setSession({
              token: access_token,
              ...(state.session.user && { user: state.session.user }),
              ...(state.session.organization && {
                organization: state.session.organization,
              }),
              ...(typeof expires_in === 'number' && {
                expiresInSec: expires_in,
              }),
            })
          )
        } else {
          // console.log('[AUTH] Refresh failed, clearing session')
          
          const errorData = res.error?.data as any
          const errorMessage = errorData?.detail || errorData?.message
          if (
            errorMessage === 'User not found or inactive' ||
            errorMessage === 'Account deactivated' ||
            errorMessage === 'User not found'
          ) {
            api.dispatch(
              addToast({
                type: 'error',
                title: i18n.t('session_terminated', { ns: 'auth' }),
                message: i18n.t('account_deactivated_logout', { ns: 'auth' }),
                duration: 10000,
              })
            )
          }

          api.dispatch(clearSession())
        }
        return res
      })().finally(() => {
        refreshPromise = null
      })
    }

    const refreshRes = await refreshPromise
    if (!refreshRes?.error) {
      // Retry la requête originale avec le nouveau token
      result = await rawBaseQuery(args, api, extra)
    }
  }

  return result
}

export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: baseQueryWithReauth,
  // Configuration globale pour refetch automatique
  refetchOnMountOrArgChange: 30, // Refetch si données > 30 secondes
  refetchOnFocus: true, // Refetch quand la fenêtre reprend le focus
  refetchOnReconnect: true, // Refetch après reconnexion réseau
  // Tous les tags utilisés par les différentes features
  tagTypes: [
    'Attendees',
    'Attendee',
    'AttendeeTypes',
    'Events',
    'Event',
    'EventBadgeRules',
    'Users',
    'User',
    'Roles',
    'Role',
    'Permissions',
    'Permission',
    'Invitations',
    'Invitation',
    'Auth',
    'Policy',
    'Signup',
    'Organizations',
    'Tags',
    'Badges',
    'Badge',
  ],
  // Pas d'endpoints ici, ils seront injectés par chaque feature
  endpoints: () => ({}),
})
