/**
 * Gestion de la persistance du token d'authentification
 */

const TOKEN_KEY = 'ems_auth_token'

/**
 * Sauvegarde le token d'authentification dans le localStorage
 * @param token - Token JWT à sauvegarder
 */
export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (error) {
    console.warn('[Auth] Impossible de sauvegarder le token:', error)
  }
}

/**
 * Récupère le token d'authentification depuis le localStorage
 * @returns Token JWT ou null si absent
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.warn('[Auth] Impossible de lire le token:', error)
    return null
  }
}

/**
 * Supprime le token d'authentification du localStorage
 */
export function removeAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (error) {
    console.warn('[Auth] Impossible de supprimer le token:', error)
  }
}

/**
 * Vérifie si un token JWT est expiré
 * @param token - Token JWT à vérifier
 * @returns true si expiré, false sinon
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payloadPart = parts[1]
    if (!payloadPart) return true

    const payload = JSON.parse(atob(payloadPart))
    const exp = payload.exp

    if (!exp) return true

    return Date.now() >= exp * 1000
  } catch (error) {
    console.warn('[Auth] Token invalide:', error)
    return true
  }
}
