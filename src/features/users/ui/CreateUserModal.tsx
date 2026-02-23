import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, User, Mail, Shield } from 'lucide-react'
import { Button, Input, FormField, Modal, CloseButton } from '@/shared/ui'
import { useToast } from '@/shared/ui/useToast'
import {
  useCreateUserWithGeneratedPasswordMutation,
  useGetRolesQuery,
} from '@/features/users/api/usersApi'
import {
  createUserWithGeneratedPasswordSchema,
  mapCreateUserWithGeneratedPasswordFormToDto,
  type CreateUserWithGeneratedPasswordFormData,
} from '@/features/users/dpo/user.dpo'
import { UserCredentialsModal } from './UserCredentialsModal'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { error: showError } = useToast()
  const { t } = useTranslation(['users', 'common'])
  const [createUser, { isLoading: isCreating }] =
    useCreateUserWithGeneratedPasswordMutation()
  const { isLoading: isLoadingRoles } = useGetRolesQuery()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateUserWithGeneratedPasswordFormData>({
    resolver: zodResolver(createUserWithGeneratedPasswordSchema),
    mode: 'onChange',
  })

  const [showCredentials, setShowCredentials] = useState(false)
  const [userCredentials, setUserCredentials] = useState<{
    email: string
    temporaryPassword: string
    firstName: string
    lastName: string
  } | null>(null)

  // const selectedRoleId = watch('roleId');

  const onSubmit = async (data: CreateUserWithGeneratedPasswordFormData) => {
    try {
      const { dto: createUserDto, temporaryPassword } =
        mapCreateUserWithGeneratedPasswordFormToDto(data)
      await createUser(createUserDto).unwrap()

      // Préparer les données pour la modal des identifiants
      setUserCredentials({
        email: data.email,
        temporaryPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      setShowCredentials(true)

      reset()
      onClose()
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error)

      // Gestion des erreurs spécifiques
      let errorMessage = t('users:modal.create_error_default')

      if (error?.data?.message?.includes('already exists')) {
        errorMessage = t('users:modal.create_error_email_exists')
      } else if (error?.data?.message?.includes('Invalid credentials')) {
        errorMessage = t('users:modal.create_error_insufficient_permissions')
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }

      showError(t('users:modal.create_error_title'), errorMessage)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        showCloseButton={false}
        contentPadding={false}
        maxWidth="md"
      >
        <div className="relative p-8">
          {/* Bouton fermeture moderne */}
          <CloseButton onClick={handleClose} />

          {/* Titre moderne */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('users:modal.create_title')}
            </h2>
            <p className="text-gray-400">
              {t('users:modal.create_subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 👤 Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t('users:form.first_name')}
                error={errors.firstName?.message}
                required
              >
                <Input
                  {...register('firstName')}
                  placeholder="Jean"
                  leftIcon={<User className="h-5 w-5" />}
                />
              </FormField>

              <FormField label={t('users:form.last_name')} error={errors.lastName?.message} required>
                <Input
                  {...register('lastName')}
                  placeholder="Dupont"
                  leftIcon={<User className="h-5 w-5" />}
                />
              </FormField>
            </div>

            {/* 📧 Email */}
            <FormField
              label={t('users:form.email')}
              error={errors.email?.message}
              required
            >
              <Input
                {...register('email')}
                type="email"
                placeholder="jean.dupont@example.com"
                leftIcon={<Mail className="h-5 w-5" />}
                autoComplete="email"
              />
            </FormField>

            {/* 📱 Téléphone (optionnel) */}
            <FormField
              label={t('users:form.phone')}
              error={errors.phone?.message}
            >
              <Input
                {...register('phone')}
                type="tel"
                placeholder="+33 6 12 34 56 78"
              />
            </FormField>

            {/* 🏢 Entreprise et poste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t('users:form.company')}
                error={errors.company?.message}
              >
                <Input
                  {...register('company')}
                  placeholder="ACME Corporation"
                />
              </FormField>

              <FormField
                label={t('users:form.job_title')}
                error={errors.job_title?.message}
              >
                <Input
                  {...register('job_title')}
                  placeholder="Responsable Marketing"
                />
              </FormField>
            </div>

            {/* 🌍 Pays */}
            <FormField label={t('users:form.country')} error={errors.country?.message}>
              <Input {...register('country')} placeholder="France" />
            </FormField>

            {/* 🔐 Rôle - Temporairement fixé pour les tests */}
            <FormField label={t('users:form.role')}>
              <Input
                value={t('users:modal.default_role_label')}
                leftIcon={<Shield className="h-5 w-5" />}
                disabled
                className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              />
            </FormField>

            {/* Info sur le rôle par défaut */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 transition-colors duration-200">
              <div className="flex items-start space-x-2">
                <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {t('users:modal.default_role_name')}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    {t('users:modal.default_role_description')}
                  </p>
                </div>
              </div>
            </div>

            {/* 💡 Info box - Workflow sécurisé */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {t('users:modal.secure_creation_title')}
                  </h4>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    {t('users:modal.secure_creation_description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isCreating}
              >
                {t('common:app.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isCreating || isLoadingRoles}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('users:modal.creating')}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    {t('users:modal.create_button')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal d'affichage des identifiants */}
      <>
        {userCredentials && (
          <UserCredentialsModal
            isOpen={showCredentials}
            onClose={() => {
              setShowCredentials(false)
              setUserCredentials(null)
              reset()
              onClose()
            }}
            email={userCredentials.email}
            temporaryPassword={userCredentials.temporaryPassword}
            firstName={userCredentials.firstName}
            lastName={userCredentials.lastName}
          />
        )}
      </>
    </>
  )
}
