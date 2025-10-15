import React from 'react'
import { AlertTriangle, XCircle, CheckCircle, Mail } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

interface InvitationAlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  onClose?: () => void
  showCloseButton?: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'
  }>
}

export const InvitationAlert: React.FC<InvitationAlertProps> = ({
  type,
  title,
  message,
  onClose,
  showCloseButton = true,
  actions = []
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />
      case 'info':
        return <Mail className="w-6 h-6 text-blue-500" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800/20'
    }
  }

  return (
    <Card className={`p-6 border-l-4 ${getBorderColor()} shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-300`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {message}
          </p>
          
          {actions.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                  size="sm"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  )
}

// Composant spécialisé pour les erreurs de token
export const TokenErrorAlert: React.FC<{
  errorType: 'invalid' | 'expired' | 'already_used' | 'network_error'
  onReturnToLogin: () => void
}> = ({ errorType, onReturnToLogin }) => {
  const getErrorContent = () => {
    switch (errorType) {
      case 'expired':
        return {
          title: 'Lien d\'invitation expiré',
          message: 'Ce lien d\'invitation a expiré. Les liens d\'invitation sont valables 48 heures. Contactez l\'administrateur pour recevoir une nouvelle invitation.',
        }
      case 'already_used':
        return {
          title: 'Compte déjà créé',
          message: 'Ce lien a déjà été utilisé pour créer un compte. Si vous avez oublié votre mot de passe, utilisez la fonction "Mot de passe oublié" sur la page de connexion.',
        }
      case 'network_error':
        return {
          title: 'Problème de connexion',
          message: 'Impossible de vérifier le lien d\'invitation. Vérifiez votre connexion internet et réessayez.',
        }
      default:
        return {
          title: 'Lien d\'invitation invalide',
          message: 'Ce lien d\'invitation n\'est pas valide ou a été corrompu. Vérifiez que vous avez copié l\'URL complète depuis l\'email d\'invitation.',
        }
    }
  }

  const { title, message } = getErrorContent()

  return (
    <InvitationAlert
      type="error"
      title={title}
      message={message}
      showCloseButton={false}
      actions={[
        {
          label: 'Retour à la connexion',
          onClick: onReturnToLogin,
          variant: 'default'
        }
      ]}
    />
  )
}

// Composant pour le succès de création de compte
export const AccountCreatedAlert: React.FC<{
  email: string
  onGoToLogin: () => void
}> = ({ email, onGoToLogin }) => {
  return (
    <InvitationAlert
      type="success"
      title="Compte créé avec succès"
      message={`Votre compte pour ${email} a été créé. Vous pouvez maintenant vous connecter avec vos identifiants.`}
      showCloseButton={false}
      actions={[
        {
          label: 'Se connecter',
          onClick: onGoToLogin,
          variant: 'default'
        }
      ]}
    />
  )
}