import { store } from '@/app/store'
import { rootApi } from '@/services/rootApi'
import { setSession, clearSession, setBootstrapCompleted } from '@/features/auth/model/sessionSlice'

let proactiveTimer: ReturnType<typeof setTimeout> | null = null
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
  
  // Si le token est déjà expiré, ne pas programmer de refresh
  if (msLeft <= 0) return
  
  const jitter = Math.floor(Math.random() * 15000) // 0–15s
  const when = Math.max(5000, msLeft - 60000 - jitter) // ~1min avant

  proactiveTimer = setTimeout(async () => {
    // Vérifier à nouveau que l'utilisateur est toujours authentifié avant le refresh
    const currentState = store.getState().session
    if (!currentState.isAuthenticated || !currentState.token) {
      return
    }
    
    // utilise un endpoint refresh injecté (voir authApi)
    try {
      const res: any = await store.dispatch((rootApi as any).endpoints.refresh.initiate()).unwrap()
      if (res?.access_token) {
        store.dispatch(setSession({ token: res.access_token, expiresInSec: res.expires_in }))
        broadcastToken(res.access_token, res.expires_in)
        scheduleProactiveRefresh() // reprogrammer avec le nouveau expires_in
      }
    } catch {
      // si ça échoue, le 401-intercept fera filet de secours
    }
  }, when)
}

export async function bootstrapAuth() {
  // Toujours tenter le refresh - le cookie HttpOnly n'est pas accessible via document.cookie
  // Le backend répondra 401 si le cookie n'existe pas ou est invalide
  try {
    console.log('[AUTH] Attempting to restore session from refresh token...')
    const res: any = await store.dispatch((rootApi as any).endpoints.refresh.initiate()).unwrap()
    if (res?.access_token) {
      console.log('[AUTH] Session restored successfully')
      store.dispatch(setSession({ token: res.access_token, expiresInSec: res.expires_in }))
      broadcastToken(res.access_token, res.expires_in)
      scheduleProactiveRefresh()
    } else {
      // Pas de token reçu, marquer le bootstrap comme terminé
      store.dispatch(setBootstrapCompleted())
    }
  } catch (error) {
    console.log('[AUTH] Bootstrap refresh failed (normal if no refresh token or expired):', error)
    // Marquer le bootstrap comme terminé même en cas d'échec
    store.dispatch(setBootstrapCompleted())
  }
}

export function onAuthStateMaybeChanged() {
  // à appeler dès que token/expiresAt change (voir App.tsx)
  scheduleProactiveRefresh()
}

export async function performLogout() {
  try {
    await store.dispatch((rootApi as any).endpoints.logout.initiate()).unwrap().catch(()=>{})
  } catch {}
  
  store.dispatch(clearSession())
  clearProactiveTimer()
  
  // Diffuser la déconnexion aux autres onglets
  broadcastToken(null)
}
