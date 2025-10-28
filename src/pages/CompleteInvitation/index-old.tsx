import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  User,
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { FormField } from '@/shared/ui/FormField'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import {
  useCompleteInvitationMutation,
  useValidateInvitationTokenQuery,
} from '@/features/invitations/api/invitationsApi'
import {
  TokenErrorAlert,
  AccountCreatedAlert,
  InvitationAlert,
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
  const [errorType, setErrorType] = useState<
    'invalid' | 'expired' | 'already_used' | 'network_error'
  >('invalid')

  const [formData, setFormData] = useState<CompleteInvitationFormData>({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState<Partial<CompleteInvitationFormData>>({})

  // Validation du token (avec skip si pas de token)
  const {
    data: tokenValidation,
    isLoading: isValidatingToken,
    error: tokenError,
    isError: hasTokenError,
  } = useValidateInvitationTokenQuery(token || '', {
    skip: !token,
  })

  const [completeInvitation, { isLoading: isCompleting }] =
    useCompleteInvitationMutation()

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
      const errorMessage = (tokenError as any)?.data?.message || ''

      if (errorMessage.includes('expiré')) {
        setErrorType('expired')
      } else if (errorMessage.includes('déjà été utilisé')) {
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
      newErrors.password =
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
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
        },
      }).unwrap()

      setPageState('success')
    } catch (error: any) {
      console.error('Erreur lors de la complétion:', error)

      // Déterminer le type d'erreur et rester sur la page d'erreur
      if (error.status === 400) {
        const errorMessage = error.data?.message || ''
        if (errorMessage.includes('expiré')) {
          setErrorType('expired')
        } else if (errorMessage.includes('déjà été utilisé')) {
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

  const handleInputChange = (
    field: keyof CompleteInvitationFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const getPasswordStrength = (
    password: string
  ): { strength: number; label: string; color: string } => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Faible', color: 'bg-red-500' }
    if (strength <= 3)
      return { strength, label: 'Moyen', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength, label: 'Fort', color: 'bg-green-500' }
    return { strength, label: 'Très fort', color: 'bg-green-600' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Finaliser votre inscription
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complétez votre profil pour accéder à la plateforme
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom */}
            <FormField label="Prénom" required error={errors.firstName}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre prénom"
                  required
                />
              </div>
            </FormField>

            {/* Nom */}
            <FormField label="Nom" required error={errors.lastName}>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre nom"
                  required
                />
              </div>
            </FormField>

            {/* Mot de passe */}
            <FormField
              label="Mot de passe"
              required
              error={errors.password}
              hint="Au moins 8 caractères avec majuscule, minuscule et chiffre"
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre mot de passe"
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
                        style={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </FormField>

            {/* Confirmation mot de passe */}
            <FormField
              label="Confirmer le mot de passe"
              required
              error={errors.confirmPassword}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </div>
            </FormField>

            <Button type="submit" disabled={isCompleting} className="w-full">
              {isCompleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Créer mon compte
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>Ce lien expire dans 48 heures</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default CompleteInvitationPage
