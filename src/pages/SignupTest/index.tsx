/**
 * 🧪 PAGE DE TEST POUR LE SIGNUP
 * 
 * Cette page permet de tester les différents cas du signup :
 * - Token valide → Formulaire de complétion
 * - Token expiré → Erreur appropriée
 * - Token invalide → Erreur appropriée
 * - Token utilisé → Erreur appropriée
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export const SignupTestPage: React.FC = () => {
  const testCases = [
    {
      name: 'Token Valide',
      token: 'valid-token-123',
      description: 'Doit afficher le formulaire de complétion'
    },
    {
      name: 'Token Expiré', 
      token: 'expired-token',
      description: 'Doit afficher une erreur d\'expiration'
    },
    {
      name: 'Token Invalide',
      token: 'invalid-token', 
      description: 'Doit afficher une erreur de token invalide'
    },
    {
      name: 'Token Utilisé',
      token: 'used-token',
      description: 'Doit afficher une erreur d\'invitation déjà utilisée'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Test de la Page Signup
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Testez les différents scénarios de signup sécurisé
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {testCases.map((testCase) => (
                <div 
                  key={testCase.token}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {testCase.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {testCase.description}
                      </p>
                      <code className="text-xs text-gray-500 font-mono">
                        Token: {testCase.token}
                      </code>
                    </div>
                    <Link to={`/signup/${testCase.token}`}>
                      <Button variant="outline">
                        Tester
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                📋 Instructions de Test
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Token Valide</strong> : Complétez le formulaire avec des données de test</li>
                <li>• <strong>Tokens d'Erreur</strong> : Vérifiez que les messages d'erreur s'affichent correctement</li>
                <li>• <strong>Validation</strong> : Testez les validations du formulaire (mot de passe, champs requis)</li>
                <li>• <strong>Navigation</strong> : Vérifiez les redirections après succès/erreur</li>
              </ul>
            </div>

            <div className="mt-6 flex justify-center">
              <Link to="/dashboard">
                <Button>
                  Retour au Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}