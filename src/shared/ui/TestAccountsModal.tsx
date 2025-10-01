import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Select, SelectOption } from '@/shared/ui/Select';
import { Copy, Users, Key, Globe, Clock, Eye, EyeOff } from 'lucide-react';

interface TestAccount {
  email: string;
  password: string;
  role: string;
  organization: string;
  orgSlug: string;
  description: string;
  sector: string;
  timezone: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
  // ACME CORP
  {
    email: 'admin@acme.test',
    password: 'Admin#12345',
    role: 'org_admin',
    organization: 'Acme Corp',
    orgSlug: 'acme-corp',
    description: 'Compte admin original',
    sector: 'Généraliste',
    timezone: 'UTC'
  },
  {
    email: 'super.admin@ems.test',
    password: 'SuperAdmin#2024',
    role: 'org_admin',
    organization: 'Acme Corp',
    orgSlug: 'acme-corp',
    description: 'Super administrateur',
    sector: 'Généraliste',
    timezone: 'UTC'
  },

  // TECHSTART INNOVATE
  {
    email: 'admin@techstart.test',
    password: 'TechAdmin#2024',
    role: 'org_admin',
    organization: 'TechStart Innovate',
    orgSlug: 'techstart-innovate',
    description: 'Administrateur startup',
    sector: 'Startup Tech',
    timezone: 'Europe/Paris'
  },
  {
    email: 'manager@techstart.test',
    password: 'TechManager#2024',
    role: 'org_manager',
    organization: 'TechStart Innovate',
    orgSlug: 'techstart-innovate',
    description: 'Manager événements startup',
    sector: 'Startup Tech',
    timezone: 'Europe/Paris'
  },
  {
    email: 'dev@techstart.test',
    password: 'DevEvent#2024',
    role: 'event_manager',
    organization: 'TechStart Innovate',
    orgSlug: 'techstart-innovate',
    description: 'Développeur organisateur événements tech',
    sector: 'Startup Tech',
    timezone: 'Europe/Paris'
  },

  // GLOBAL EVENTS CORP
  {
    email: 'admin@globalevents.test',
    password: 'GlobalAdmin#2024',
    role: 'org_admin',
    organization: 'Global Events Corp',
    orgSlug: 'global-events-corp',
    description: 'Administrateur événements internationaux',
    sector: 'Événementiel',
    timezone: 'America/New_York'
  },
  {
    email: 'coordinator@globalevents.test',
    password: 'EventCoord#2024',
    role: 'event_manager',
    organization: 'Global Events Corp',
    orgSlug: 'global-events-corp',
    description: 'Coordinateur événements internationaux',
    sector: 'Événementiel',
    timezone: 'America/New_York'
  },
  {
    email: 'checkin@globalevents.test',
    password: 'CheckIn#2024',
    role: 'checkin_staff',
    organization: 'Global Events Corp',
    orgSlug: 'global-events-corp',
    description: 'Personnel accueil événements',
    sector: 'Événementiel',
    timezone: 'America/New_York'
  },

  // UNIVERSITÉ PARIS DIGITAL
  {
    email: 'admin@univ-paris.test',
    password: 'UnivAdmin#2024',
    role: 'org_admin',
    organization: 'Université Paris Digital',
    orgSlug: 'universite-paris-digital',
    description: 'Administrateur université',
    sector: 'Éducation',
    timezone: 'Europe/Paris'
  },
  {
    email: 'prof@univ-paris.test',
    password: 'ProfEvent#2024',
    role: 'event_manager',
    organization: 'Université Paris Digital',
    orgSlug: 'universite-paris-digital',
    description: 'Professeur organisateur conférences',
    sector: 'Éducation',
    timezone: 'Europe/Paris'
  },
  {
    email: 'etudiant@univ-paris.test',
    password: 'Student#2024',
    role: 'readonly',
    organization: 'Université Paris Digital',
    orgSlug: 'universite-paris-digital',
    description: 'Étudiant accès lecture seule',
    sector: 'Éducation',
    timezone: 'Europe/Paris'
  },

  // MEDCONF INTERNATIONAL
  {
    email: 'admin@medconf.test',
    password: 'MedAdmin#2024',
    role: 'org_admin',
    organization: 'MedConf International',
    orgSlug: 'medconf-international',
    description: 'Administrateur conférences médicales',
    sector: 'Médical',
    timezone: 'Europe/London'
  },
  {
    email: 'doctor@medconf.test',
    password: 'DocEvent#2024',
    role: 'event_manager',
    organization: 'MedConf International',
    orgSlug: 'medconf-international',
    description: 'Médecin organisateur conférences',
    sector: 'Médical',
    timezone: 'Europe/London'
  },
  {
    email: 'nurse@medconf.test',
    password: 'NurseStaff#2024',
    role: 'checkin_staff',
    organization: 'MedConf International',
    orgSlug: 'medconf-international',
    description: 'Infirmière personnel événements',
    sector: 'Médical',
    timezone: 'Europe/London'
  },

  // SPORTS & WELLNESS HUB
  {
    email: 'admin@sportshub.test',
    password: 'SportAdmin#2024',
    role: 'org_admin',
    organization: 'Sports & Wellness Hub',
    orgSlug: 'sports-wellness-hub',
    description: 'Administrateur centre sportif',
    sector: 'Sport',
    timezone: 'Australia/Sydney'
  },
  {
    email: 'coach@sportshub.test',
    password: 'CoachEvent#2024',
    role: 'event_manager',
    organization: 'Sports & Wellness Hub',
    orgSlug: 'sports-wellness-hub',
    description: 'Coach organisateur événements sportifs',
    sector: 'Sport',
    timezone: 'Australia/Sydney'
  },
  {
    email: 'partner@sportshub.test',
    password: 'Partner#2024',
    role: 'partner',
    organization: 'Sports & Wellness Hub',
    orgSlug: 'sports-wellness-hub',
    description: 'Partenaire commercial',
    sector: 'Sport',
    timezone: 'Australia/Sydney'
  }
];

const ROLE_COLORS: Record<string, string> = {
  'org_admin': 'bg-red-100 text-red-800',
  'org_manager': 'bg-orange-100 text-orange-800',
  'event_manager': 'bg-blue-100 text-blue-800',
  'checkin_staff': 'bg-green-100 text-green-800',
  'partner': 'bg-purple-100 text-purple-800',
  'readonly': 'bg-gray-100 text-gray-800'
};

const SECTOR_ICONS: Record<string, string> = {
  'Généraliste': '🏢',
  'Startup Tech': '💻',
  'Événementiel': '🌍',
  'Éducation': '🎓',
  'Médical': '🏥',
  'Sport': '🏃‍♂️'
};

interface TestAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestAccountsModal: React.FC<TestAccountsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  const organizations = Array.from(new Set(TEST_ACCOUNTS.map(acc => acc.orgSlug)));
  const filteredAccounts = selectedOrg === 'all' 
    ? TEST_ACCOUNTS 
    : TEST_ACCOUNTS.filter(acc => acc.orgSlug === selectedOrg);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: Add toast notification
      console.log(`${type} copié: ${text}`);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const copyCredentials = async (account: TestAccount) => {
    const credentials = `Email: ${account.email}\nMot de passe: ${account.password}`;
    await copyToClipboard(credentials, 'Identifiants');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=" Comptes de test disponibles"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Filtres */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
            >
              <SelectOption value="all">Toutes les organisations</SelectOption>
              {organizations.map(orgSlug => {
                const org = TEST_ACCOUNTS.find(acc => acc.orgSlug === orgSlug);
                return (
                  <SelectOption key={orgSlug} value={orgSlug}>
                    {SECTOR_ICONS[org!.sector]} {org!.organization}
                  </SelectOption>
                );
              })}
            </Select>
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{filteredAccounts.length}</div>
              <div className="text-sm text-blue-700">Comptes disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredAccounts.map(acc => acc.orgSlug)).size}
              </div>
              <div className="text-sm text-blue-700">Organisations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {new Set(filteredAccounts.map(acc => acc.role)).size}
              </div>
              <div className="text-sm text-blue-700">Rôles différents</div>
            </div>
          </div>
        </div>

        {/* Liste des comptes */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredAccounts.map((account, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
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
                      <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                        <Key className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                      <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{account.sector}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 Instructions d'utilisation</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Utilisez ces comptes pour tester les différents niveaux de permissions</li>
            <li>• Chaque organisation est complètement isolée des autres</li>
            <li>• Les rôles sont hiérarchiques : org_admin {`>`} org_manager {`>`} event_manager {`>`} etc.</li>
            <li>• Le compte "readonly" ne permet que la consultation</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

// Composant d'aide pour afficher un bouton "Comptes de test" en développement
export const TestAccountsHelper: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // N'afficher qu'en développement
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="w-full">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl p-4 shadow-lg transition-colors duration-200">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2"> Mode Développement</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Testez l'application avec différents comptes et permissions
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all"
          >
            <Users className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
            Voir les comptes de test
          </Button>
        </div>
      </div>

      <TestAccountsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};