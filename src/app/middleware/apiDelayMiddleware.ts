/**
 * Middleware de délai API pour le développement
 * Ajoute un délai artificiel à toutes les requêtes API pour tester les états de chargement
 */

import { Middleware } from '@reduxjs/toolkit'
import { getApiDelay } from '../config/devConfig'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Middleware qui intercepte toutes les requêtes API et ajoute un délai
 * Fonctionne uniquement en mode développement
 */
export const apiDelayMiddleware: Middleware = () => (next) => async (action: any) => {
  // Vérifier si c'est une action RTK Query
  const isApiAction =
    action.type?.startsWith('api/') ||
    action.meta?.baseQueryMeta ||
    action.type?.includes('Query')

  // Si c'est une requête API et qu'on est en dev, ajouter le délai
  if (isApiAction && import.meta.env.MODE === 'development') {
    const delayMs = getApiDelay()
    if (delayMs > 0) {
      console.log(`🐌 [Dev] Délai API appliqué: ${delayMs}ms`, action.type)
      await delay(delayMs)
    }
  }

  return next(action)
}
