import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/app/store'
import { setSession, clearSession } from '@/features/auth/model/sessionSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: 'include', // Obligatoire pour envoyer les cookies httpOnly
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).session.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extra) => {
  let result = await rawBaseQuery(args, api, extra)

  // Si on reçoit un 401, tenter un refresh (mais pas sur l'endpoint refresh lui-même)
  if (result.error && (result.error as any).status === 401) {
    const url = typeof args === 'string' ? args : args.url
    
    // Éviter une boucle infinie si /auth/refresh retourne 401
    if (url === '/auth/refresh') {
      console.log('Refresh endpoint returned 401, clearing session...')
      api.dispatch(clearSession())
      return result
    }
    
    console.log('Token expiré, tentative de refresh...')
    
    // Appeler /auth/refresh avec le cookie httpOnly
    const refreshRes = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' }, 
      api, 
      extra
    )
    
    if (!refreshRes.error && refreshRes.data) {
      // Refresh réussi, récupérer le nouveau token
      const { access_token } = refreshRes.data as any
      
      if (access_token) {
        const state = api.getState() as RootState

        // Mettre à jour le token dans le store en conservant user et organization si disponibles
        api.dispatch(setSession({
          token: access_token,
          ...(state.session.user && { user: state.session.user }),
          ...(state.session.organization && { organization: state.session.organization }),
        }))

        console.log('Token refreshed avec succès, rejouer la requête...')
        // Rejouer la requête initiale avec le nouveau token
        result = await rawBaseQuery(args, api, extra)
      } else {
        console.log('Refresh response invalid, no access_token')
        api.dispatch(clearSession())
      }
    } else {
      // Refresh failed, déconnecter l'utilisateur
      console.log('Refresh failed, déconnexion...', refreshRes.error)
      api.dispatch(clearSession())
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