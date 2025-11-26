import { store } from '@/app/store'
import { authApi } from '@/features/auth/api/authApi'
import { setSession, clearSession } from '@/features/auth/model/sessionSlice'

let proactiveTimer: ReturnType<typeof setTimeout> | null = null
let bootstrapPromise: Promise<void> | null = null
const bc = new BroadcastChannel('auth')

bc.onmessage = (e) => {
  if (e.data?.type === 'ACCESS_UPDATED') {
    const { token, expiresInSec } = e.data
    if (token) {
      store.dispatch(setSession({ token, expiresInSec }))
    } else {
      store.dispatch(clearSession())
    }
  }
}

function broadcastToken(token: string | null, expiresInSec?: number) {
  bc.postMessage({ type: 'ACCESS_UPDATED', token, expiresInSec })
}

function clearProactiveTimer() {
  if (proactiveTimer) clearTimeout(proactiveTimer)
  proactiveTimer = null
}

function scheduleProactiveRefresh() {
  clearProactiveTimer()
  const { expiresAt, token, isAuthenticated } = store.getState().session

  // Ne pas programmer de refresh si l'utilisateur n'est pas authentifié ou n'a pas de token
  if (!isAuthenticated || !token || !expiresAt) return

  const now = Date.now()
  const msLeft = expiresAt - now

  // Si le token est déjà expiré ou expire dans moins de 10 secondes, ne pas programmer de refresh
  // Le 401 interceptor s'en chargera
  if (msLeft <= 10000) {
    // console.log('[AUTH] Token expires too soon, skipping proactive refresh')
    return
  }

  const jitter = Math.floor(Math.random() * 15000) // 0–15s
  const when = Math.max(5000, msLeft - 60000 - jitter) // ~1min avant

  proactiveTimer = setTimeout(async () => {
    // Vérifier à nouveau que l'utilisateur est toujours authentifié avant le refresh
    const currentState = store.getState().session
    if (!currentState.isAuthenticated || !currentState.token) {
      return
    }

    // utilise l'endpoint refresh depuis authApi
    try {
      const res: any = await store
        .dispatch(
          authApi.endpoints.refresh.initiate(undefined, { track: false })
        )
        .unwrap()
      if (res?.access_token) {
        store.dispatch(
          setSession({ token: res.access_token, expiresInSec: res.expires_in })
        )
        broadcastToken(res.access_token, res.expires_in)
        scheduleProactiveRefresh() // reprogrammer avec le nouveau expires_in
      }
    } catch {
      // si ça échoue, le 401-intercept fera filet de secours
    }
  }, when)
}

export async function bootstrapAuth() {
  // Si un bootstrap est déjà en cours, retourner la même promesse
  if (bootstrapPromise) {
    // console.log('[AUTH] Bootstrap already in progress, waiting...')
    return bootstrapPromise
  }

  // Créer une nouvelle promesse de bootstrap
  bootstrapPromise = (async () => {
    // Toujours tenter le refresh - le cookie HttpOnly n'est pas accessible via document.cookie
    // Le backend répondra 401 si le cookie n'existe pas ou est invalide
    try {
      // console.log('[AUTH] Attempting to restore session from refresh token...')
      // Force le refresh sans utiliser le cache - ajout de forceRefetch pour éviter le cache RTK
      const res: any = await store
        .dispatch(
          authApi.endpoints.refresh.initiate(undefined, { 
            track: false,
            forceRefetch: true, // Force un vrai appel réseau sans cache
          })
        )
        .unwrap()

      if (res?.access_token) {
        // console.log('[AUTH] Session restored successfully')
        store.dispatch(
          setSession({ token: res.access_token, expiresInSec: res.expires_in })
        )
        broadcastToken(res.access_token, res.expires_in)
        scheduleProactiveRefresh()
      } else {
        // Pas de token reçu, s'assurer que la session est vide
        // console.log('[AUTH] No access token received, clearing session')
        store.dispatch(clearSession())
      }
    } catch (error: any) {
      // 401 au bootstrap = comportement normal (pas de refresh token ou expiré)
      // On ne log que si ce n'est pas un 401
      if (error?.status !== 401) {
        console.warn('[AUTH] Bootstrap refresh failed:', error?.status || error?.message)
      }
      // CRITIQUE : Nettoyer la session en cas d'échec du refresh
      // Cela garantit que l'utilisateur ne reste pas dans un état "fantôme"
      store.dispatch(clearSession())
    }
    // Mark bootstrap as completed in every case so UI won't get stuck
    // (previously missing — when no token is present we never left bootstrapping state)
    try {
      const { setBootstrapCompleted } = await import('@/features/auth/model/sessionSlice')
      store.dispatch(setBootstrapCompleted())
    } catch (e) {
      // best-effort, ignore failures
    }
  })()

  // Nettoyer la promesse une fois terminée
  bootstrapPromise.finally(() => {
    bootstrapPromise = null
  })

  return bootstrapPromise
}

export function onAuthStateMaybeChanged() {
  // à appeler dès que token/expiresAt change (voir App.tsx)
  scheduleProactiveRefresh()
}

export async function performLogout() {
  // Arrêter le timer proactif IMMÉDIATEMENT
  clearProactiveTimer()

  // Nettoyer la session AVANT d'appeler logout
  store.dispatch(clearSession())

  // Diffuser la déconnexion aux autres onglets
  broadcastToken(null)

  // Appeler le logout backend (révoque le refresh token)
  try {
    await store
      .dispatch(authApi.endpoints.logout.initiate())
      .unwrap()
      .catch(() => {})
  } catch {
    // Ignorer les erreurs de logout
  }

  // Invalider tous les caches RTK Query
  store.dispatch(authApi.util.resetApiState())
}
