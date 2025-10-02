import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Copy, Users, Key, Globe, Clock, Eye, EyeOff } from 'lucide-react'

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
    email: 'superadmin@acme.com',
    password: 'password123',
    role: 'SUPER_ADMIN',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Super Admin omniscient - Accès global à toutes organisations et fonctionnalités',
    sector: 'Administration',
    timezone: 'Europe/Paris'
  },
  // === ACME CORPORATION - Organisation principale ===
  {
    email: 'admin@acme.com',
    password: 'password123',
    role: 'ADMIN',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Admin ACME - Gestion complète organisation, équipe, invitations',
    sector: 'Corporate',
    timezone: 'Europe/Paris'
  },
  {
    email: 'manager@acme.com',
    password: 'password123',
    role: 'MANAGER',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Manager ACME - Gestion événements sans invitation utilisateurs',
    sector: 'Corporate',
    timezone: 'Europe/Paris'
  },
  {
    email: 'viewer@acme.com',
    password: 'password123',
    role: 'VIEWER',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Viewer ACME - Lecture seule sur tous événements de l\'organisation',
    sector: 'Corporate',
    timezone: 'Europe/Paris'
  },
  {
    email: 'partner@acme.com',
    password: 'password123',
    role: 'PARTNER',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Partner ACME - Lecture seule uniquement sur événements assignés',
    sector: 'Corporate',
    timezone: 'Europe/Paris'
  },
  {
    email: 'hotesse@acme.com',
    password: 'password123',
    role: 'HOTESSE',
    organization: 'ACME Corporation',
    orgSlug: 'acme-corp',
    description: 'Hôtesse ACME - Scanner QR codes et check-in participants',
    sector: 'Corporate',
    timezone: 'Europe/Paris'
  },
  // === TECH SOLUTIONS INC - Organisation tech ===
  {
    email: 'admin@techsolutions.com',
    password: 'password123',
    role: 'ADMIN',
    organization: 'Tech Solutions Inc',
    orgSlug: 'tech-solutions',
    description: 'Admin Tech Solutions - Gestion complète organisation tech',
    sector: 'Tech',
    timezone: 'Europe/London'
  },
  {
    email: 'manager@techsolutions.com',
    password: 'password123',
    role: 'MANAGER',
    organization: 'Tech Solutions Inc',
    orgSlug: 'tech-solutions',
    description: 'Manager Tech Solutions - Gestion événements tech',
    sector: 'Tech',
    timezone: 'Europe/London'
  },
  {
    email: 'viewer@techsolutions.com',
    password: 'password123',
    role: 'VIEWER',
    organization: 'Tech Solutions Inc',
    orgSlug: 'tech-solutions',
    description: 'Viewer Tech Solutions - Lecture seule événements tech',
    sector: 'Tech',
    timezone: 'Europe/London'
  },
  // === EVENT MASTERS LTD - Organisation événementielle ===
  {
    email: 'admin@eventmasters.com',
    password: 'password123',
    role: 'ADMIN',
    organization: 'Event Masters Ltd',
    orgSlug: 'event-masters',
    description: 'Admin Event Masters - Gestion complète organisation événementielle',
    sector: 'Events',
    timezone: 'America/New_York'
  },
  {
    email: 'manager@eventmasters.com',
    password: 'password123',
    role: 'MANAGER',
    organization: 'Event Masters Ltd',
    orgSlug: 'event-masters',
    description: 'Manager Event Masters - Gestion événements professionnels',
    sector: 'Events',
    timezone: 'America/New_York'
  },
  {
    email: 'hotesse1@eventmasters.com',
    password: 'password123',
    role: 'HOTESSE',
    organization: 'Event Masters Ltd',
    orgSlug: 'event-masters',
    description: 'Hôtesse 1 Event Masters - Scanner QR codes événements',
    sector: 'Events',
    timezone: 'America/New_York'
  },
  {
    email: 'hotesse2@eventmasters.com',
    password: 'password123',
    role: 'HOTESSE',
    organization: 'Event Masters Ltd',
    orgSlug: 'event-masters',
    description: 'Hôtesse 2 Event Masters - Scanner QR codes événements',
    sector: 'Events',
    timezone: 'America/New_York'
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

const SECTOR_ICONS: Record<string, string> = {
  'Administration': '👑',
  'Corporate': '🏢',
  'Tech': '💻',
  'Events': '🎪'
}

interface TestAccountsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TestAccountsModal: React.FC<TestAccountsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [showPasswords, setShowPasswords] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<string>('all')

  const organizations = Array.from(new Set(TEST_ACCOUNTS.map(acc => acc.orgSlug)))
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
      title="Comptes de test - Base de données réelle"
      maxWidth="4xl"
    >
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
              {organizations.map(orgSlug => {
                const org = TEST_ACCOUNTS.find(acc => acc.orgSlug === orgSlug)
                return (
                  <option key={orgSlug} value={orgSlug}>
                    {SECTOR_ICONS[org!.sector]} {org!.organization}
                  </option>
                )
              })}
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center space-x-2"
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPasswords ? 'Masquer' : 'Afficher'} les mots de passe</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredAccounts.length}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Comptes disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {new Set(filteredAccounts.map(acc => acc.orgSlug)).size}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Organisations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {new Set(filteredAccounts.map(acc => acc.role)).size}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Rôles différents</div>
            </div>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredAccounts.map((account, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg">{SECTOR_ICONS[account.sector]}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{account.organization}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{account.description}</p>
                    </div>
                  </div>

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

                    {showPasswords && (
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

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 Instructions d'utilisation</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• <strong>Mot de passe universel :</strong> password123</li>
            <li>• <strong>3 organisations</strong> avec différents secteurs d'activité</li>
            <li>• <strong>6 niveaux de rôles :</strong> SUPER_ADMIN → ADMIN → MANAGER → VIEWER → PARTNER → HOTESSE</li>
            <li>• <strong>Isolation complète :</strong> chaque organisation est séparée</li>
            <li>• <strong>Données réelles :</strong> connectées à la base de données PostgreSQL</li>
            <li>• <strong>Test RBAC :</strong> permissions granulaires selon le rôle et l'organisation</li>
          </ul>
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