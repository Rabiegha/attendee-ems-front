/**
 * Configuration de développement
 * Permet de simuler des délais réseau pour tester les états de chargement
 */

export const devConfig = {
  /**
   * Active le délai artificiel sur toutes les requêtes API
   * ⚠️ À désactiver en production !
   */
  enableApiDelay: true,

  /**
   * Délai en millisecondes ajouté à chaque requête API
   * Exemples:
   * - 500ms : délai subtil
   * - 1000ms (1s) : délai perceptible
   * - 2000ms (2s) : délai long pour tester les skeletons
   */
  apiDelayMs: 1000,

  /**
   * Délai minimum aléatoire (pour simuler un réseau variable)
   */
  apiDelayMinMs: 800,

  /**
   * Délai maximum aléatoire
   */
  apiDelayMaxMs: 1500,

  /**
   * Utiliser un délai aléatoire au lieu d'un délai fixe
   */
  useRandomDelay: false,
}

/**
 * Obtient le délai à appliquer selon la configuration
 */
export const getApiDelay = (): number => {
  if (!devConfig.enableApiDelay) return 0

  if (devConfig.useRandomDelay) {
    return (
      Math.random() * (devConfig.apiDelayMaxMs - devConfig.apiDelayMinMs) +
      devConfig.apiDelayMinMs
    )
  }

  return devConfig.apiDelayMs
}
