import React, { useState } from 'react'
import { Modal } from '../../../shared/ui/Modal'
import { Button } from '../../../shared/ui/Button'
import { CloseButton } from '../../../shared/ui/CloseButton'
import { Copy } from 'lucide-react'

interface UserCredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  temporaryPassword: string
  firstName: string
  lastName: string
  organizationName?: string // Nouveau : nom de l'organisation créée
  organizationSlug?: string // Nouveau : slug de l'organisation créée
}

export const UserCredentialsModal: React.FC<UserCredentialsModalProps> = ({
  isOpen,
  onClose,
  email,
  temporaryPassword,
  firstName,
  lastName,
  organizationName,
  organizationSlug,
}) => {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null)

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      contentPadding={false}
      maxWidth="md"
    >
      <div className="relative p-8">
        {/* Bouton fermeture */}
        <CloseButton onClick={onClose} />

        {/* En-tête avec icône de succès */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {organizationName
              ? 'Organisation et utilisateur créés'
              : 'Utilisateur créé'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {organizationName
              ? `L'organisation "${organizationName}" et l'utilisateur ${firstName} ${lastName} ont été créés avec succès`
              : `L'utilisateur ${firstName} ${lastName} a été créé avec succès`}
          </p>
        </div>

        <div className="space-y-6">
          {/* Info organisation si créée */}
          {organizationName && organizationSlug && (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-2 text-blue-600 dark:text-blue-400">
                    Organisation créée :
                  </p>
                  <ul className="text-xs space-y-1 opacity-90">
                    <li>
                      <strong>Nom :</strong> {organizationName}
                    </li>
                    <li>
                      <strong>Slug :</strong>{' '}
                      <span className="font-mono">{organizationSlug}</span>
                    </li>
                    <li className="text-gray-500 dark:text-gray-400 mt-2">
                      L'utilisateur a été automatiquement assigné à cette
                      organisation
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Informations d'identification */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Email de connexion
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl font-mono text-sm text-gray-700 dark:text-gray-300">
                  {email}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(email, 'email')}
                  className="px-4 py-3 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied === 'email' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">Email copié !</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Mot de passe temporaire
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl font-mono text-sm text-gray-700 dark:text-gray-300">
                  {temporaryPassword}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(temporaryPassword, 'password')}
                  className="px-4 py-3 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-xl"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied === 'password' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Mot de passe copié !
                </p>
              )}
            </div>
          </div>

          {/* Avertissement moderne */}
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-2 text-yellow-600 dark:text-yellow-400">Important :</p>
                <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
                  <li>
                    L'utilisateur <strong>doit changer</strong> ce mot de passe
                    à la première connexion
                  </li>
                  <li>
                    Ces identifiants sont <strong>temporaires</strong> et
                    sécurisés
                  </li>
                  <li>Transmettez ces informations de manière sécurisée</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-3 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-xl"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
