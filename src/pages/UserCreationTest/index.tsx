import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  Mail, 
  Key, 
  CheckCircle, 
  ArrowRight, 
  Users,
  Shield,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/shared/ui/Button'

export function UserCreationTestPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: 'Admin crée le compte',
      description: 'L\'administrateur saisit les informations de base',
      icon: UserPlus,
      color: 'blue',
      details: [
        'Prénom, nom, email',
        'Rôle dans l\'organisation',
        'Téléphone (optionnel)',
      ]
    },
    {
      id: 2,
      title: 'Système génère le mot de passe',
      description: 'Mot de passe temporaire sécurisé généré automatiquement',
      icon: Key,
      color: 'green',
      details: [
        '12 caractères minimum',
        'Majuscules, minuscules, chiffres, symboles',
        'Crypté en base de données',
      ]
    },
    {
      id: 3,
      title: 'Email d\'identifiants envoyé',
      description: 'L\'utilisateur reçoit ses identifiants par email sécurisé',
      icon: Mail,
      color: 'purple',
      details: [
        'Email + mot de passe temporaire',
        'Instructions de première connexion',
        'Lien direct vers la plateforme',
      ]
    },
    {
      id: 4,
      title: 'Première connexion obligatoire',
      description: 'L\'utilisateur doit changer son mot de passe',
      icon: Shield,
      color: 'orange',
      details: [
        'Connexion avec identifiants reçus',
        'Redirection forcée vers changement mdp',
        'Validation des critères de sécurité',
      ]
    },
    {
      id: 5,
      title: 'Accès complet au système',
      description: 'L\'utilisateur peut maintenant utiliser la plateforme',
      icon: CheckCircle,
      color: 'emerald',
      details: [
        'Mot de passe personnel défini',
        'Accès selon permissions du rôle',
        'Compte entièrement activé',
      ]
    },
  ]

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed'
    if (stepId === currentStep) return 'current'
    return 'upcoming'
  }

  const getColorClasses = (color: string, status: string) => {
    const base = {
      blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
      green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
      purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
      orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20',
      emerald: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20',
    }
    
    if (status === 'completed') {
      return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20'
    }
    if (status === 'current') {
      return base[color as keyof typeof base] + ' ring-2 ring-blue-500 dark:ring-blue-400'
    }
    return 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* 🎯 Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workflow de Création d'Utilisateur
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Nouveau système sécurisé avec génération de mot de passe temporaire
          </p>
        </div>

        {/* 📊 Avantages du nouveau système */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            Avantages du nouveau workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Plus sécurisé</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Obligation de changer le mot de passe à la première connexion
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Plus rapide</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pas de token complexe, compte immédiatement utilisable
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">UX améliorée</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Email clair avec identifiants, instructions simples
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Traçabilité</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Logs complets des créations et changements de mot de passe
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🔄 Étapes du workflow */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const IconComponent = step.icon
            
            return (
              <div
                key={step.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 ${
                  status === 'current' ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg' : 'shadow'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône de l'étape */}
                  <div className={`
                    flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-200
                    ${getColorClasses(step.color, status)}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <IconComponent className="h-6 w-6" />
                    )}
                  </div>

                  {/* Contenu de l'étape */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Étape {step.id}: {step.title}
                      </h3>
                      {status === 'current' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                          En cours
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                          Terminé
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-gray-500 rounded-full flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Flèche vers l'étape suivante */}
                  {index < steps.length - 1 && (
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 🎮 Contrôles de simulation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Simulation du processus
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              variant="outline"
            >
              Étape précédente
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              Étape suivante
            </Button>
            <Button
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              Recommencer
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <AlertCircle className="h-4 w-4" />
            Étape {currentStep} sur {steps.length}
          </div>
        </div>

        {/*  Actions de test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tester le système
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/users">
              <Button className="w-full justify-center">
                <Users className="h-5 w-5 mr-2" />
                Gestion des utilisateurs
              </Button>
            </Link>
            <Link to="/change-password">
              <Button variant="outline" className="w-full justify-center">
                <Key className="h-5 w-5 mr-2" />
                Test changement mdp
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full justify-center">
                Retour au dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}