import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { FormField } from '@/shared/ui/FormField'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { 
  useCompleteInvitationMutation, 
  useValidateInvitationTokenQuery 
} from '@/features/invitations/api/invitationsApi'
import { 
  TokenErrorAlert, 
  AccountCreatedAlert 
} from './components/InvitationAlerts'

interface CompleteInvitationFormData {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
}

type PageState = 'loading' | 'form' | 'success' | 'error'

export const CompleteInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  
  const [pageState, setPageState] = useState<PageState>('loading')
  const [errorType, setErrorType] = useState<'invalid' | 'expired' | 'already_used' | 'network_error'>('invalid')
  
  const [formData, setFormData] = useState<CompleteInvitationFormData>({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Partial<CompleteInvitationFormData>>({})
  
  // Fonction pour calculer la force du mot de passe
  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Faible', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'Moyen', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength, label: 'Fort', color: 'bg-green-500' }
    return { strength, label: 'Très fort', color: 'bg-green-600' }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  
  // Validation du token (avec skip si pas de token)
  const { 
    data: tokenValidation, 
    isLoading: isValidatingToken, 
    error: tokenError,
    isError: hasTokenError 
  } = useValidateInvitationTokenQuery(token || '', {
    skip: !token
  })
  
  const [completeInvitation, { isLoading: isCompleting }] = useCompleteInvitationMutation()

  // Redirection immédiate si pas de token dans l'URL
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
  }, [token, navigate])

  // Gestion des états de validation du token
  useEffect(() => {
    if (!token) return

    if (isValidatingToken) {
      setPageState('loading')
    } else if (hasTokenError) {
      // Déterminer le type d'erreur en fonction de la réponse
      const errorStatus = (tokenError as any)?.status
      const errorMessage = (tokenError as any)?.data?.message || (tokenError as any)?.message || ''
      
      console.log('🔍 Debug erreur token:', { 
        errorStatus, 
        errorMessage, 
        tokenErrorData: (tokenError as any)?.data,
        fullError: tokenError 
      })
      
      // Essayer plusieurs endroits pour trouver le message
      const allPossibleMessages = [
        errorMessage,
        (tokenError as any)?.data?.message,
        (tokenError as any)?.error,
        JSON.stringify(tokenError)
      ].join(' ').toLowerCase()
      
      if (allPossibleMessages.includes('expiré')) {
        setErrorType('expired')
      } else if (allPossibleMessages.includes('déjà été utilisé') || allPossibleMessages.includes('déjà utilisé')) {
        setErrorType('already_used')
      } else if (errorStatus >= 500) {
        setErrorType('network_error')
      } else {
        setErrorType('invalid')
      }
      
      setPageState('error')
    } else if (tokenValidation?.valid) {
      setPageState('form')
    }
  }, [token, isValidatingToken, hasTokenError, tokenError, tokenValidation])

  const handleReturnToLogin = () => {
    navigate('/login')
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CompleteInvitationFormData> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) {
      return
    }

    try {
      await completeInvitation({
        token,
        userData: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          password: formData.password,
        }
      }).unwrap()

      setPageState('success')

    } catch (error: any) {
      console.error('Erreur lors de la complétion:', error)
      
      // Déterminer le type d'erreur et rester sur la page d'erreur
      if (error.status === 400) {
        const errorMessage = error.data?.message || ''
        console.log('🔍 Debug erreur complétion:', { errorMessage, fullError: error })
        
        if (errorMessage.includes('Le token d\'invitation a expiré') || errorMessage.includes('expiré')) {
          setErrorType('expired')
        } else if (errorMessage.includes('Ce lien d\'invitation a déjà été utilisé') || errorMessage.includes('déjà été utilisé')) {
          setErrorType('already_used')
        } else {
          setErrorType('invalid')
        }
      } else {
        setErrorType('network_error')
      }
      
      setPageState('error')
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const handleInputChange = (field: keyof CompleteInvitationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Rendu conditionnel selon l'état de la page
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Vérification de votre invitation...</p>
        </Card>
      </div>
    )
  }

  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <TokenErrorAlert 
            errorType={errorType}
            onReturnToLogin={handleReturnToLogin}
          />
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AccountCreatedAlert 
            email={tokenValidation?.email || ''}
            onGoToLogin={handleGoToLogin}
          />
        </div>
      </div>
    )
  }

  // Rendu du formulaire (pageState === 'form')
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complétez votre inscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créez votre mot de passe pour finaliser votre compte
          </p>
          
          {/* Information sur l'organisation et le rôle */}
          {tokenValidation && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>{tokenValidation.organization}</strong> · {tokenValidation.role}
              </p>
            </div>
          )}
        </div>

        {/* Formulaire */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (lecture seule) */}
            <FormField
              label="Adresse email"
              hint="Cette adresse email est associée à votre invitation"
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="email"
                  value={tokenValidation?.email || ''}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
              </div>
            </FormField>

            <FormField
              label="Prénom"
              required
              error={errors.firstName}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Entrez votre prénom"
                  required
                />
              </div>
            </FormField>

            <FormField
              label="Nom"
              required
              error={errors.lastName}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Entrez votre nom"
                  required
                />
              </div>
            </FormField>

            <FormField
              label="Mot de passe"
              required
              error={errors.password}
              hint="Au moins 8 caractères avec une majuscule, une minuscule et un chiffre"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Créez un mot de passe sécurisé"
                  required
                />
              </div>
              
              {/* Indicateur de force du mot de passe */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </FormField>

            <FormField
              label="Confirmer le mot de passe"
              required
              error={errors.confirmPassword}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 z-10" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>
            </FormField>

            <Button
              type="submit"
              disabled={isCompleting}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Créer mon compte
                </>
              )}
            </Button>

            <div className="pt-4 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
                <span className="ml-2">
                  En créant votre compte, vous acceptez nos conditions d'utilisation
                </span>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CompleteInvitationPage