import React, { useState } from 'react';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Copy } from 'lucide-react';

interface UserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  temporaryPassword: string;
  firstName: string;
  lastName: string;
}

export const UserCredentialsModal: React.FC<UserCredentialsModalProps> = ({
  isOpen,
  onClose,
  email,
  temporaryPassword,
  firstName,
  lastName,
}) => {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Utilisateur créé avec succès"
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Compte créé pour {firstName} {lastName}
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                L'utilisateur peut maintenant se connecter avec ces identifiants
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email de connexion
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm">
                {email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(email, 'email')}
                className="px-3 py-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === 'email' && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Email copié !</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe temporaire
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm">
                {temporaryPassword}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(temporaryPassword, 'password')}
                className="px-3 py-2"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied === 'password' && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Mot de passe copié !</p>
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Important :</p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                <li>L'utilisateur <strong>doit changer</strong> ce mot de passe à la première connexion</li>
                <li>Ces identifiants sont <strong>temporaires</strong> et sécurisés</li>
                <li>Transmettez ces informations de manière sécurisée</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
};