import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation, useLazyMeQuery } from '@/features/auth/api/authApi'
import { setSession, updateUser } from '@/features/auth/model/sessionSlice'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { Alert } from '@/shared/ui/Alert'
import { AnimatedContainer } from '@/shared/ui/AnimatedContainer'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { TestAccountsHelper } from '@/shared/ui/TestAccountsModal'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// Icônes pour les champs
const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

export const LoginPage: React.FC = () => {
  const { t } = useTranslation('auth')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [getProfile] = useLazyMeQuery()
  
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validation au blur (quand on quitte le champ)
    reValidateMode: 'onBlur', // Re-validation aussi au blur
  })

  const watchedFields = watch()
  const prevFieldsRef = useRef({ email: '', password: '' })

  // Effacer les erreurs seulement quand l'utilisateur modifie réellement les champs
  useEffect(() => {
    const currentEmail = watchedFields.email || ''
    const currentPassword = watchedFields.password || ''
    
    // Vérifier si les valeurs ont réellement changé (pas juste initialisées)
    const emailChanged = currentEmail !== prevFieldsRef.current.email
    const passwordChanged = currentPassword !== prevFieldsRef.current.password
    
    // Nettoyer l'erreur seulement si l'utilisateur modifie après une erreur
    if (lastError && (emailChanged || passwordChanged)) {
      setLastError(null)
    }
    
    // Mettre à jour les valeurs de référence
    prevFieldsRef.current = { email: currentEmail, password: currentPassword }
  }, [watchedFields.email, watchedFields.password, lastError])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLastError(null)
      
      // 1. Se connecter et obtenir le token
      const loginResult = await login(data).unwrap()
      
      // Animation de succès
      setShowSuccess(true)
      
      dispatch(setSession({
        access_token: loginResult.access_token,
        ...(loginResult.user && { user: loginResult.user }),
        ...(loginResult.organization && { organization: loginResult.organization })
      }))
      
      // 2. Récupérer les données complètes de l'utilisateur
      try {
        const profileResult = await getProfile()
        console.log('Profile result:', profileResult)
        if (profileResult.data) {
          const profile = profileResult.data
          console.log('Profile data:', profile)
          const userUpdate = {
            ...(profile.first_name && { firstName: profile.first_name }),
            ...(profile.last_name && { lastName: profile.last_name }),
            email: profile.email,
            // Correctement extraire le rôle selon la nouvelle structure
            roles: [typeof profile.role === 'string' ? profile.role : profile.role.code],
            orgId: profile.org_id,
          }
          console.log('Updating user with:', userUpdate)
          dispatch(updateUser(userUpdate))
        }
      } catch (profileError) {
        console.error('Failed to fetch user profile:', profileError)
        // On continue même si on ne peut pas récupérer le profil
      }
      
      // Attendre un peu pour l'animation puis rediriger
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1000)
      
    } catch (err: any) {
      setLoginAttempts(prev => prev + 1)
      
      // RTK Query structure: err.status contient le code HTTP
      const status = err?.status || err?.originalStatus
      
      // Messages d'erreur personnalisés basés sur le statut
      if (status === 401) {
        setLastError(t('login.invalid_credentials'))
      } else if (status === 429) {
        setLastError(t('login.too_many_attempts'))
      } else if (status >= 500) {
        setLastError(t('login.server_error'))
      } else if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
        setLastError(t('login.network_error'))
      } else {
        setLastError(t('login.invalid_credentials'))
      }
    }
  }

  // Animation de shake en cas d'erreur
  const containerClasses = lastError && loginAttempts > 0 
    ? 'animate-shake' 
    : ''

  return (
    <>
      {/* Theme Toggle en haut à droite */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header avec logo et titre */}
      <AnimatedContainer animation="fade-in" delay={100}>
        <div className="text-center">
          <AnimatedContainer animation="scale-in" delay={200}>
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </AnimatedContainer>
          
          <AnimatedContainer animation="slide-up" delay={300}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('login.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('login.subtitle', 'Accédez à votre espace de gestion d\'événements')}
            </p>
          </AnimatedContainer>
        </div>
      </AnimatedContainer>

      {/* Formulaire de connexion */}
      <AnimatedContainer animation="slide-up" delay={400}>
        <div className={`bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border-0 transition-colors duration-300 ${containerClasses}`}>
          {/* Message de succès */}
          {showSuccess && (
            <AnimatedContainer animation="scale-in" className="mb-6">
              <Alert 
                variant="success" 
                title={t('login.success_title', 'Connexion réussie')}
                description={t('login.success_message', 'Redirection en cours...')}
              />
            </AnimatedContainer>
          )}

          {/* Message d'erreur */}
          {lastError && (
            <AnimatedContainer animation="slide-up" className="mb-6">
              <Alert 
                variant="destructive" 
                title={t('login.error_title', 'Erreur de connexion')}
                description={lastError}
                onClose={() => setLastError(null)}
              />
            </AnimatedContainer>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AnimatedContainer animation="slide-right" delay={500}>
              <FormField
                label={t('login.email')}
                error={touchedFields.email ? errors.email?.message : undefined}
                required
              >
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="nom@exemple.com"
                  leftIcon={<MailIcon />}
                  error={!!errors.email && !!touchedFields.email}
                  success={!errors.email && !!touchedFields.email}
                  disabled={isLoading}
                />
              </FormField>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-right" delay={600}>
              <FormField
                label={t('login.password')}
                error={touchedFields.password ? errors.password?.message : undefined}
                required
              >
                <Input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  leftIcon={<LockIcon />}
                  showPasswordToggle
                  error={!!errors.password && !!touchedFields.password}
                  success={!errors.password && !!touchedFields.password && watchedFields.password?.length >= 6}
                  disabled={isLoading}
                />
              </FormField>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={700}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                loading={isLoading}
                loadingText={t('login.logging_in', 'Connexion en cours...')}
                disabled={!isValid || showSuccess}
              >
                {showSuccess ? (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('login.success_short', 'Connecté !')}
                  </>
                ) : (
                  t('login.submit')
                )}
              </Button>
            </AnimatedContainer>

            {/* Informations supplémentaires */}
            <AnimatedContainer animation="fade-in" delay={800}>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {t('login.help', 'Besoin d\'aide ?')}{' '}
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    onClick={() => {/* TODO: Ouvrir modal d'aide */}}
                  >
                    {t('login.contact_admin', 'Contactez votre administrateur')}
                  </button>
                </p>
              </div>
            </AnimatedContainer>
          </form>
        </div>
      </AnimatedContainer>
      
      {/* Panneau de démo en développement */}
      {import.meta.env.DEV && (
        <AnimatedContainer animation="fade-in" delay={900}>
          <TestAccountsHelper />
        </AnimatedContainer>
      )}
    </>
  )
}
