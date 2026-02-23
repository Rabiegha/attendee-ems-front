/**
 * 🔐 PAGE DE SIGNUP SÉCURISÉE
 *
 * Workflow: Validation token → Affichage infos invitation → Complétion profil → Activation
 */

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import {
  useValidateTokenQuery,
  useCompleteSignupMutation,
} from '@/features/auth/api/signupApi'
import { setSession } from '@/features/auth/model/sessionSlice'
import { TokenInfo } from '@/features/auth/ui/TokenInfo'
import { SignupForm } from '@/features/auth/ui/SignupForm'
import { Button } from '@/shared/ui/Button'
import { useTranslation } from 'react-i18next'
import type { SignupFormData } from '@/features/auth/types/signup.types'

export const SignupPage: React.FC = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation('signup')

  // Validation du token
  const {
    data: validation,
    isLoading: isValidating,
    error: validationError,
  } = useValidateTokenQuery(token || '', {
    skip: !token,
  })

  // Mutation de complétion
  const [completeSignup, { isLoading: isCompleting }] =
    useCompleteSignupMutation()

  // Gestion de la soumission du formulaire
  const handleSignupSubmit = async (data: SignupFormData) => {
    if (!token) return

    try {
      const result = await completeSignup({
        token,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        ...(data.phone && { phone: data.phone }),
      }).unwrap()

      // Connecter automatiquement l'utilisateur
      dispatch(
        setSession({
          token: result.token,
          user: {
            ...result.user,
            roles: [result.user.role],
          },
          organization: {
            id: result.user.orgId,
            name: validation?.invitation?.orgName || '',
            slug: '',
          },
        })
      )

      // Redirection avec message de succès
      navigate('/dashboard?welcome=true', { replace: true })
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error)
      // TODO: Afficher un toast d'erreur
    }
  }

  // Token manquant
  if (!token) {
    return (
      <ErrorState
        type="INVALID_TOKEN"
        title={t('signup.errors.invalidToken.title')}
        message={t('signup.errors.invalidToken.message')}
        redirectTo="/login"
      />
    )
  }

  // Chargement de la validation
  if (isValidating) {
    return <LoadingState message={t('signup.loading.validating')} />
  }

  // Erreur de validation
  if (validationError || !validation?.valid) {
    const errorType = validation?.error?.type || 'INVALID_TOKEN'
    const errorMessages = {
      INVALID_TOKEN: {
        title: t('signup.errors.invalidToken.title'),
        message: t('signup.errors.invalidToken.message'),
      },
      TOKEN_EXPIRED: {
        title: t('signup.errors.tokenExpired.title'),
        message: t('signup.errors.tokenExpired.message'),
      },
      EMAIL_MISMATCH: {
        title: t('signup.errors.emailMismatch.title'),
        message: t('signup.errors.emailMismatch.message'),
      },
      USER_ALREADY_ACTIVE: {
        title: t('signup.errors.userAlreadyActive.title'),
        message: t('signup.errors.userAlreadyActive.message'),
      },
      INVITATION_USED: {
        title: t('signup.errors.invitationUsed.title'),
        message: t('signup.errors.invitationUsed.message'),
      },
    }

    const errorInfo =
      errorMessages[errorType as keyof typeof errorMessages] ||
      errorMessages.INVALID_TOKEN

    return (
      <ErrorState
        type={errorType}
        title={errorInfo.title}
        message={errorInfo.message}
        redirectTo={errorType === 'USER_ALREADY_ACTIVE' ? '/login' : '/'}
      />
    )
  }

  // Invitation valide - Afficher le formulaire
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {t('signup.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          {t('signup.subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg transition-colors duration-200">
          <TokenInfo invitation={validation.invitation!} isLoading={false} />

          <SignupForm
            invitation={validation.invitation!}
            onSubmit={handleSignupSubmit}
            isLoading={isCompleting}
          />
        </div>
      </div>
    </div>
  )
}

// Composant d'état de chargement
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg transition-colors duration-200">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      </div>
    </div>
  </div>
)

// Composant d'état d'erreur
interface ErrorStateProps {
  type: string
  title: string
  message: string
  redirectTo: string
}

const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  title,
  message,
  redirectTo,
}) => {
  const navigate = useNavigate()
  const { t } = useTranslation('signup')

  const getIcon = () => {
    switch (type) {
      case 'TOKEN_EXPIRED':
        return <AlertTriangle className="h-12 w-12 text-orange-500" />
      case 'USER_ALREADY_ACTIVE':
        return <CheckCircle className="h-12 w-12 text-blue-500" />
      default:
        return <XCircle className="h-12 w-12 text-red-500" />
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'USER_ALREADY_ACTIVE':
        return t('signup.actions.login')
      case 'TOKEN_EXPIRED':
        return t('signup.actions.requestNewInvitation')
      default:
        return t('signup.actions.backToHome')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">{getIcon()}</div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg transition-colors duration-200">
          <Button onClick={() => navigate(redirectTo)} className="w-full">
            {getButtonText()}
          </Button>

          {type !== 'USER_ALREADY_ACTIVE' && (
            <div className="mt-4 text-center">
              <a
                href="mailto:support@attendee-ems.com"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                {t('signup.actions.contactSupport')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
