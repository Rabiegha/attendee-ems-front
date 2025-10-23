/**
 * Utilitaires de récupération en cas d'état d'authentification corrompu
 * 
 * Ces fonctions sont utilisées pour nettoyer complètement l'état de l'application
 * en cas de boucle de redirection ou d'état incohérent.
 */

/**
 * Nettoie complètement tous les états d'authentification
 * - Redux store (via clearSession)
 * - localStorage
 * - sessionStorage
 * - Cookies (si possible côté client)
 */
export function forceAuthCleanup(): void {
  console.warn('[AUTH RECOVERY] 🧹 Force cleaning all auth state...')
  
  // 1. Nettoyer localStorage
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keysToRemove.push(key)
    }
    keysToRemove.forEach(key => {
      console.log(`[AUTH RECOVERY] Removing localStorage key: ${key}`)
      localStorage.removeItem(key)
    })
  } catch (e) {
    console.error('[AUTH RECOVERY] Failed to clear localStorage:', e)
  }
  
  // 2. Nettoyer sessionStorage
  try {
    sessionStorage.clear()
    console.log('[AUTH RECOVERY] sessionStorage cleared')
  } catch (e) {
    console.error('[AUTH RECOVERY] Failed to clear sessionStorage:', e)
  }
  
  // 3. Tenter de nettoyer les cookies côté client (limité, les HttpOnly ne sont pas accessibles)
  try {
    document.cookie.split(";").forEach(c => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    console.log('[AUTH RECOVERY] Client-side cookies cleared')
  } catch (e) {
    console.error('[AUTH RECOVERY] Failed to clear cookies:', e)
  }
  
  console.warn('[AUTH RECOVERY] ✅ Cleanup complete. Reloading page...')
}

/**
 * Détecte si l'application est dans une boucle de redirection
 * en analysant l'historique de navigation
 */
export function detectRedirectLoop(): boolean {
  const LOOP_DETECTION_KEY = '__ems_redirect_log'
  const MAX_REDIRECTS = 10
  const TIME_WINDOW = 5000 // 5 secondes
  
  try {
    const now = Date.now()
    const logStr = sessionStorage.getItem(LOOP_DETECTION_KEY)
    const log: number[] = logStr ? JSON.parse(logStr) : []
    
    // Ajouter le timestamp actuel
    log.push(now)
    
    // Garder seulement les redirections dans la fenêtre de temps
    const recentRedirects = log.filter(t => now - t < TIME_WINDOW)
    
    // Sauvegarder le log mis à jour
    sessionStorage.setItem(LOOP_DETECTION_KEY, JSON.stringify(recentRedirects))
    
    // Détecter la boucle
    if (recentRedirects.length > MAX_REDIRECTS) {
      console.error(`[AUTH RECOVERY] 🚨 Redirect loop detected: ${recentRedirects.length} redirects in ${TIME_WINDOW}ms`)
      return true
    }
    
    return false
  } catch (e) {
    console.error('[AUTH RECOVERY] Failed to detect redirect loop:', e)
    return false
  }
}

/**
 * Nettoie le log de détection de boucle
 */
export function clearRedirectLog(): void {
  try {
    sessionStorage.removeItem('__ems_redirect_log')
  } catch (e) {
    console.error('[AUTH RECOVERY] Failed to clear redirect log:', e)
  }
}
