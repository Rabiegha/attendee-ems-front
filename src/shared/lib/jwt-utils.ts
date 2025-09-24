/**
 * JWT Utilities for decoding token payload
 */

export interface JWTPayload {
  sub: string // user ID
  org_id: string
  role: string
  permissions: string[]
  iat: number
  exp: number
}

/**
 * Decode JWT token payload (client-side only for display purposes)
 * Note: This is NOT for validation, only for extracting user info
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Split the token to get the payload part
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode the base64 payload
    const payload = parts[1]
    if (!payload) {
      return null
    }
    
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}

/**
 * Extract user info from JWT token
 */
export function extractUserFromToken(token: string) {
  const payload = decodeJWT(token)
  if (!payload) return null

  return {
    id: payload.sub,
    orgId: payload.org_id,
    role: payload.role,
    permissions: payload.permissions,
  }
}