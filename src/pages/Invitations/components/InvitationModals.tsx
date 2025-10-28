import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { CheckCircle, XCircle, AlertTriangle, Mail, Users } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  email,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Invitation envoyée !
      </h3>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-800 dark:text-green-200">
            Email envoyé à :
          </span>
        </div>
        <p className="text-green-700 dark:text-green-300 font-mono text-lg">
          {email}
        </p>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        L'utilisateur va recevoir un email avec un lien sécurisé pour créer son
        compte. Le lien expire dans 48 heures.
      </p>

      <Button onClick={onClose} className="w-full">
        Parfait !
      </Button>
    </div>
  </Modal>
)

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'error' | 'warning'
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
    <div className="text-center py-6">
      <div
        className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
          type === 'error'
            ? 'bg-red-100 dark:bg-red-900/30'
            : 'bg-orange-100 dark:bg-orange-900/30'
        }`}
      >
        {type === 'error' ? (
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      <div
        className={`rounded-xl p-4 mb-6 ${
          type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-orange-50 dark:bg-orange-900/20'
        }`}
      >
        <p
          className={`${
            type === 'error'
              ? 'text-red-700 dark:text-red-300'
              : 'text-orange-700 dark:text-orange-300'
          }`}
        >
          {message}
        </p>
      </div>

      <Button
        onClick={onClose}
        variant={type === 'error' ? 'destructive' : 'default'}
        className="w-full"
      >
        Compris
      </Button>
    </div>
  </Modal>
)

interface UserExistsModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const UserExistsModal: React.FC<UserExistsModalProps> = ({
  isOpen,
  onClose,
  email,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="md">
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6">
        <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ⚠️ Utilisateur déjà existant
      </h3>

      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="font-medium text-orange-800 dark:text-orange-200">
            Adresse email :
          </span>
        </div>
        <p className="text-orange-700 dark:text-orange-300 font-mono text-lg mb-3">
          {email}
        </p>
        <p className="text-orange-700 dark:text-orange-300">
          Un compte avec cette adresse email existe déjà dans le système.
        </p>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Veuillez utiliser une autre adresse email ou contacter l'administrateur
        si vous pensez qu'il s'agit d'une erreur.
      </p>

      <Button onClick={onClose} variant="outline" className="w-full">
        Choisir une autre adresse
      </Button>
    </div>
  </Modal>
)
