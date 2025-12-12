import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { Alert } from '@/shared/ui/Alert'
import { AnimatedContainer } from '@/shared/ui/AnimatedContainer'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

const LockIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
)

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  })

  const password = watch('newPassword')

  // Valider le token au chargement
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token de réinitialisation manquant')
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/validate-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await response.json()
        setTokenValid(data.valid)
        setUserEmail(data.email || '')
      } catch (err: any) {
        setError('Ce lien de réinitialisation est invalide ou a expiré')
        setTokenValid(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la réinitialisation')
      }
      setSuccess(true)
    } catch (err: any) {
      setError(
        err.message || 'Une erreur est survenue lors de la réinitialisation'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Indicateurs de force du mot de passe
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' }
    if (score <= 4) return { score, label: 'Moyen', color: 'bg-yellow-500' }
    return { score, label: 'Fort', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  if (isValidating) {
    return (
      <>
        {/* Theme Toggle en haut à droite */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Header avec icône de chargement */}
        <AnimatedContainer animation="fade-in" delay={100}>
          <div className="text-center">
            <AnimatedContainer animation="scale-in" delay={200}>
              <div className="mx-auto h-16 w-16 flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Validation du lien
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Veuillez patienter...
              </p>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>
      </>
    )
  }

  if (!tokenValid) {
    return (
      <>
        {/* Theme Toggle en haut à droite */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Header avec icône */}
        <AnimatedContainer animation="fade-in" delay={100}>
          <div className="text-center">
            <AnimatedContainer animation="scale-in" delay={200}>
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Lien invalide ou expiré
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {error || 'Ce lien de réinitialisation n\'est plus valide'}
              </p>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>

        {/* Formulaire d'erreur */}
        <AnimatedContainer animation="slide-up" delay={400}>
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border-0 transition-colors duration-300">
            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => navigate('/auth/request-password-reset')}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Demander un nouveau lien
              </Button>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2"
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        </AnimatedContainer>
      </>
    )
  }

  if (success) {
    return (
      <>
        {/* Theme Toggle en haut à droite */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        {/* Header avec icône */}
        <AnimatedContainer animation="fade-in" delay={100}>
          <div className="text-center">
            <AnimatedContainer animation="scale-in" delay={200}>
              <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mot de passe réinitialisé !
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>

        {/* Formulaire de succès */}
        <AnimatedContainer animation="slide-up" delay={400}>
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border-0 transition-colors duration-300">
            <Button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Se connecter
            </Button>
          </div>
        </AnimatedContainer>
      </>
    )
  }

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
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="slide-up" delay={300}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Nouveau mot de passe
            </h2>
            {userEmail && (
              <p className="text-gray-600 dark:text-gray-300">
                Pour <span className="font-medium text-gray-900 dark:text-white">{userEmail}</span>
              </p>
            )}
          </AnimatedContainer>
        </div>
      </AnimatedContainer>

      {/* Formulaire de réinitialisation */}
      <AnimatedContainer animation="slide-up" delay={400}>
        <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border-0 transition-colors duration-300">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <AnimatedContainer animation="fade-in">
                <Alert variant="destructive">{error}</Alert>
              </AnimatedContainer>
            )}

            <AnimatedContainer animation="slide-right" delay={500}>
              <FormField
                label="Nouveau mot de passe"
                error={errors.newPassword?.message}
                required
              >
                <Input
                  {...register('newPassword')}
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<LockIcon />}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Force du mot de passe
                      </span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength.score <= 2 ? 'text-red-600 dark:text-red-400' :
                        passwordStrength.score <= 4 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </FormField>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-right" delay={600}>
              <FormField
                label="Confirmer le mot de passe"
                error={errors.confirmPassword?.message}
                required
              >
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<LockIcon />}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </FormField>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={700}>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-3 border-blue-600 dark:border-blue-400 rounded-r p-4">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong className="text-blue-900 dark:text-blue-100">Le mot de passe doit contenir :</strong>
                  <br />• Au moins 8 caractères
                  <br />• Une majuscule et une minuscule
                  <br />• Au moins un chiffre
                </p>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={800}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in" delay={900}>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  ← Retour à la connexion
                </button>
              </div>
            </AnimatedContainer>
          </form>
        </div>
      </AnimatedContainer>
    </>
  )
}
