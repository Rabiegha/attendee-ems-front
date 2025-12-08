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
    return bootstrapPromise
  }

  // TOUJOURS marquer le bootstrap comme terminé IMMÉDIATEMENT
  // Cela évite le chargement infini si quelque chose plante
  try {
    const { setBootstrapCompleted } = await import('@/features/auth/model/sessionSlice')
    store.dispatch(setBootstrapCompleted())
  } catch (e) {
    console.error('[BOOTSTRAP] Failed to set bootstrap completed:', e)
  }
  
  // Créer une nouvelle promesse de bootstrap
  bootstrapPromise = (async () => {
    // Toujours tenter le refresh - le cookie HttpOnly n'est pas accessible via document.cookie
    // Le backend répondra 401 si le cookie n'existe pas ou est invalide
    try {
      const res: any = await Promise.race([
        store.dispatch(
          authApi.endpoints.refresh.initiate(undefined, { track: false } as any)
        ).unwrap(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bootstrap timeout')), 3000)
        )
      ])
      
      if (res?.access_token) {
        store.dispatch(
          setSession({ token: res.access_token, expiresInSec: res.expires_in })
        )
        broadcastToken(res.access_token, res.expires_in)
        scheduleProactiveRefresh()
      } else {
        store.dispatch(clearSession())
      }
    } catch (error: any) {
      // Pas de refresh token = redirection vers login (comportement normal)
      store.dispatch(clearSession())
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
