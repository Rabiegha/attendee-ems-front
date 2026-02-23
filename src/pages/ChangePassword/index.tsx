import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { useChangePasswordMutation } from '@/features/users/api/usersApi'
import { useToast } from '@/shared/ui/useToast'
import { useTranslation } from 'react-i18next'

// 📝 Schéma de validation
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
      ),
    confirmPassword: z.string().min(1, 'Confirmez votre nouveau mot de passe'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const { success, error: showError } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const newPassword = watch('newPassword')

  const { t } = useTranslation('auth')

  // Validation de complexité en temps réel
  const passwordValidation = {
    length: newPassword?.length >= 8,
    uppercase: /[A-Z]/.test(newPassword || ''),
    lowercase: /[a-z]/.test(newPassword || ''),
    number: /\d/.test(newPassword || ''),
    special: /[@$!%*?&]/.test(newPassword || ''),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap()

      setIsSuccess(true)
      success(
        t('change_password.success_toast'),
        t('change_password.success_toast_message')
      )

      // Redirection après 2 secondes
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error: any) {
      if (error?.status === 401) {
        showError(
          t('change_password.error_incorrect'),
          t('change_password.error_incorrect_message')
        )
      } else {
        showError(
          t('change_password.error_generic'),
          t('change_password.error_generic_message')
        )
      }
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center transition-colors duration-200">
            <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('change_password.success_title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('change_password.success_message')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('change_password.success_redirect')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg transition-colors duration-200">
          {/* 🎯 Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('change_password.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('change_password.subtitle')}
            </p>
          </div>

          {/* 📋 Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Mot de passe actuel */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                {t('change_password.current_password')}
              </label>
              <div className="relative">
                <Input
                  {...register('currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder={t('change_password.current_placeholder')}
                  error={!!errors.currentPassword?.message}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                {t('change_password.new_password')}
              </label>
              <div className="relative">
                <Input
                  {...register('newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder={t('change_password.new_placeholder')}
                  error={!!errors.newPassword?.message}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Indicateur de complexité */}
              {newPassword && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {t('change_password.requirements_title')}
                  </p>
                  <div className="space-y-1">
                    {Object.entries({
                      [t('change_password.req_length')]: passwordValidation.length,
                      [t('change_password.req_uppercase')]: passwordValidation.uppercase,
                      [t('change_password.req_lowercase')]: passwordValidation.lowercase,
                      [t('change_password.req_number')]: passwordValidation.number,
                      [t('change_password.req_special')]:
                        passwordValidation.special,
                    }).map(([rule, valid]) => (
                      <div key={rule} className="flex items-center gap-2">
                        {valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        )}
                        <span
                          className={`text-sm ${
                            valid
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {rule}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation nouveau mot de passe */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                {t('change_password.confirm_password')}
              </label>
              <div className="relative">
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('change_password.confirm_placeholder')}
                  error={!!errors.confirmPassword?.message}
                  leftIcon={<Lock className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading
                ? t('change_password.submitting')
                : t('change_password.submit')}
            </Button>
          </form>

          {/* 💡 Info de sécurité */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-200">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t('change_password.security_tip')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
