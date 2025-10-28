import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { forceAuthCleanup } from '@/shared/lib/auth-recovery'
import { Button } from '@/shared/ui/Button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/**
 * Page de récupération d'urgence en cas de boucle de redirection
 *
 * Cette page permet de nettoyer manuellement tout l'état de l'application
 * si l'utilisateur est bloqué dans une boucle infinie.
 *
 * Accessible via : /auth/recovery
 */
export const AuthRecoveryPage: React.FC = () => {
  const navigate = useNavigate()
  const [isClearing, setIsClearing] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const handleForceCleanup = () => {
    setIsClearing(true)

    // Compte à rebours avant le nettoyage
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          // Nettoyer tout
          forceAuthCleanup()
          // Recharger la page
          window.location.href = '/auth/login'
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Récupération d'urgence
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Utilisez cette page si vous êtes bloqué dans une boucle de
            connexion/déconnexion
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500 mb-2">
            ⚠️ Que fait cette action ?
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
            <li>Supprime toutes les données de session</li>
            <li>Nettoie le localStorage et sessionStorage</li>
            <li>Supprime les cookies côté client</li>
            <li>Recharge la page de connexion</li>
          </ul>
        </div>

        {!isClearing ? (
          <div className="space-y-4">
            <Button
              onClick={handleForceCleanup}
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Nettoyer et réinitialiser
            </Button>

            <Button
              onClick={() => navigate('/auth/login')}
              variant="ghost"
              className="w-full"
            >
              Retour au login
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {countdown}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Nettoyage en cours...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Cette page ne devrait être utilisée qu'en cas de problème
            technique. Si le problème persiste, contactez votre administrateur
            système.
          </p>
        </div>
      </div>
    </div>
  )
}
