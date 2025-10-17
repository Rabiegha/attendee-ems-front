import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { CloseButton } from '@/shared/ui/CloseButton'
import { Copy, Users, Key, Globe, Clock } from 'lucide-react'

interface TestAccount {
  email: string
  password: string
  role: string
  organization: string
  orgSlug: string
  description: string
  sector: string
  timezone: string
}

const TEST_ACCOUNTS: TestAccount[] = [
  // === SUPER ADMIN - Accès global omniscient ===
  {
    email: 'john.doe@system.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Super Admin omniscient - Accès global à toutes organisations et fonctionnalités',
    sector: 'Administration',
    timezone: 'Europe/Paris'
  },
  // === ADMIN - Gestion complète de l'organisation ===
  {
    email: 'ckistler@choyou.fr',
    password: 'Admin123!',
    role: 'ADMIN',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Admin - Gestion complète de l\'organisation',
    sector: 'Administration',
    timezone: 'Europe/Paris'
  }
]

const ROLE_COLORS: Record<string, string> = {
  'SUPER_ADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  'MANAGER': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  'VIEWER': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  'PARTNER': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  'HOTESSE': 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300'
}

interface TestAccountsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TestAccountsModal: React.FC<TestAccountsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedOrg, setSelectedOrg] = useState<string>('all')

  const filteredAccounts = selectedOrg === 'all' 
    ? TEST_ACCOUNTS 
    : TEST_ACCOUNTS.filter(acc => acc.orgSlug === selectedOrg)

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${type} copié: ${text}`)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const copyCredentials = async (account: TestAccount) => {
    const credentials = `Email: ${account.email}\nMot de passe: ${account.password}`
    await copyToClipboard(credentials, 'Identifiants')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      contentPadding={false}
      maxWidth="4xl"
    >
      <div className="relative p-8">
        {/* Bouton fermeture moderne */}
        <CloseButton onClick={onClose} />

        {/* Titre moderne */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Comptes de test</h2>
          <p className="text-gray-400">Base de données réelle - Utilisez ces comptes pour tester</p>
        </div>

        <div className="space-y-6">
        {/* Filtres */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les organisations</option>
            </select>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredAccounts.map((account, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-900 dark:text-white">{account.email}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => copyToClipboard(account.email, 'Email')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    {(
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900 dark:text-white">{account.password}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyToClipboard(account.password, 'Mot de passe')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{account.sector}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{account.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[account.role] || 'bg-gray-100 text-gray-800'}`}>
                    {account.role}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => copyCredentials(account)}
                    className="flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copier</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </Modal>
  )
}

// Composant d'aide pour afficher un bouton "Comptes de test"
export const TestAccountsHelper: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // N'afficher qu'en développement
  if (import.meta.env.MODE !== 'development') {
    return null
  }

  return (
    <div className="w-full">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl p-4 shadow-lg">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Mode Développement</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Comptes réels en base • 3 organisations • 6 niveaux de rôles
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Voir les comptes de test
          </Button>
        </div>
      </div>

      <TestAccountsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}