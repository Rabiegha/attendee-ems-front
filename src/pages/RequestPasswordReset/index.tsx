import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { Alert } from '@/shared/ui/Alert'
import { AnimatedContainer } from '@/shared/ui/AnimatedContainer'
import { ThemeToggle } from '@/shared/ui/ThemeToggle'
import { useTranslation } from 'react-i18next'
const requestPasswordResetSchema = z.object({
  email: z.string().email('Adresse email invalide'),
})

type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>

const MailIcon = () => (
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
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

export const RequestPasswordResetPage: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { t } = useTranslation('auth')

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: 'onChange',
  })

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSuccess(true)
    } catch (err: any) {
      // Toujours afficher le même message pour éviter l'énumération d'emails
      setSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={300}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('request_reset.success_title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t('request_reset.success_message')}
              </p>
            </AnimatedContainer>
          </div>
        </AnimatedContainer>

        {/* Formulaire */}
        <AnimatedContainer animation="slide-up" delay={400}>
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-2xl border-0 transition-colors duration-300">
            <Alert variant="info" className="mb-6">
              <p className="text-sm">
                <strong>{t('request_reset.check_inbox')}</strong>
                <br />
                {t('request_reset.link_valid')} <strong>{t('request_reset.link_duration')}</strong>.
              </p>
            </Alert>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full"
              >
                {t('request_reset.back_to_login_short')}
              </Button>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                {t('request_reset.resend')}
              </button>
            </div>
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </AnimatedContainer>

          <AnimatedContainer animation="slide-up" delay={300}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('request_reset.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {t('request_reset.subtitle')}
            </p>
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
                label={t('request_reset.email_label')}
                error={errors.email?.message}
                required
              >
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="vous@exemple.com"
                  leftIcon={<MailIcon />}
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </FormField>
            </AnimatedContainer>

            <AnimatedContainer animation="slide-up" delay={600}>
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                disabled={!isValid || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? t('request_reset.submitting') : t('request_reset.submit')}
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="fade-in" delay={700}>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {t('request_reset.back_to_login')}
                </button>
              </div>
            </AnimatedContainer>
          </form>
        </div>
      </AnimatedContainer>
    </>
  )
}
