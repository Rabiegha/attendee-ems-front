import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSelector } from 'react-redux'
import { Loader2, User, Mail, Shield, Building2, Plus } from 'lucide-react'
import {
  Button,
  Input,
  FormField,
  Modal,
  Select,
  SelectOption,
  CloseButton,
  UniversalModal,
} from '@/shared/ui'
import { useUniversalModal } from '@/shared/ui/useUniversalModal'
import { useToast } from '@/shared/hooks/useToast'
import { selectUser } from '@/features/auth/model/sessionSlice'
import { useCan } from '@/shared/acl/hooks/useCan'
import {
  useCreateUserWithGeneratedPasswordMutation,
  useGetRolesQuery,
  useGetOrganizationsQuery,
  type Role,
  type Organization,
} from '@/features/users/api/usersApi'
import { useCreateOrganizationMutation } from '@/features/organizations/api/organizationsApi'
import {
  createUserWithGeneratedPasswordSchema,
  mapCreateUserWithGeneratedPasswordFormToDto,
  type CreateUserWithGeneratedPasswordFormData,
  roleDescriptions,
} from '@/features/users/dpo/user.dpo'
import { UserCredentialsModal } from './UserCredentialsModal'

interface CreateUserEnhancedModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateUserEnhancedModal: React.FC<
  CreateUserEnhancedModalProps
> = ({ isOpen, onClose }) => {
  const { t } = useTranslation(['users', 'common'])
  const currentUser = useSelector(selectUser)
  const { success } = useToast()
  const [createUser, { isLoading: isCreating }] =
    useCreateUserWithGeneratedPasswordMutation()
  const [createOrganization, { isLoading: isCreatingOrg }] =
    useCreateOrganizationMutation()
  const { data: rolesDataRaw, isLoading: isLoadingRoles } = useGetRolesQuery()

  // 🔒 Récupérer les organisations seulement si SUPER_ADMIN
  const isSuperAdmin = useCan('manage', 'all')
  const { data: organizationsData, isLoading: isLoadingOrgs } =
    useGetOrganizationsQuery(undefined, {
      skip: !isSuperAdmin, // Ne charger que si c'est un SUPER_ADMIN
    })

  // 🎯 Filtrer les rôles selon la hiérarchie
  // Un utilisateur peut créer des utilisateurs avec un rôle de niveau INFÉRIEUR OU ÉGAL au sien
  // Niveau plus bas = plus de pouvoir (SUPER_ADMIN = 0, ADMIN = 1, MANAGER = 2, etc.)
  // Si l'utilisateur a le code SUPER_ADMIN dans ses roles, il peut tout faire
  const currentUserRole = currentUser?.roles?.[0] // Premier rôle (généralement unique)
  const isSuperAdminByRole = currentUserRole === 'SUPER_ADMIN'

  // Trouver le niveau du rôle actuel de l'utilisateur
  const currentUserRoleData = rolesDataRaw?.find(
    (r: Role) => r.code === currentUserRole
  )
  const currentUserRoleLevel = currentUserRoleData?.level ?? 99 // Si pas trouvé, niveau très élevé = peu de permissions

  // Filtrer : un MANAGER (level 2) peut créer MANAGER (2), PARTNER (3), VIEWER (4), HOSTESS (5)
  // Mais pas SUPER_ADMIN (0) ou ADMIN (1)
  const rolesData = isSuperAdminByRole
    ? rolesDataRaw // SUPER_ADMIN voit tous les rôles
    : rolesDataRaw?.filter(
        (role: Role) => role.level >= currentUserRoleLevel // Niveau >= (plus élevé ou égal)
      ) || []

  // Modal universel
  const { modalState, hideModal, showError } = useUniversalModal()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<CreateUserWithGeneratedPasswordFormData>({
    resolver: zodResolver(createUserWithGeneratedPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      createNewOrg: false,
      // Si pas SUPER_ADMIN, l'orgId sera automatiquement celui de l'utilisateur connecté
      orgId: !isSuperAdmin ? currentUser?.orgId : undefined,
    },
  })

  const [showCredentials, setShowCredentials] = useState(false)
  const [userCredentials, setUserCredentials] = useState<{
    email: string
    temporaryPassword: string
    firstName: string
    lastName: string
    organizationName?: string // Nouvelle prop pour afficher l'org créée
    organizationSlug?: string
  } | null>(null)

  const selectedRoleId = watch('roleId')
  const createNewOrg = watch('createNewOrg')
  const newOrgName = watch('newOrgName')
  const selectedRole = rolesData?.find(
    (role: Role) => role.id === selectedRoleId
  )

  // Fonction pour générer et afficher le slug
  const generateSlug = (name: string) => {
    if (!name) return ''
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const onSubmit = async (data: CreateUserWithGeneratedPasswordFormData) => {
    try {
      const { dto, temporaryPassword, newOrgData } =
        mapCreateUserWithGeneratedPasswordFormToDto(data)
      let finalDto = dto
      let createdOrgName: string | undefined
      let createdOrgSlug: string | undefined

      // Si on doit créer une nouvelle organisation
      if (newOrgData) {
        // Générer le slug simple à partir du nom
        const orgSlug =
          newOrgData.slug ||
          newOrgData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()

        try {
          // Créer d'abord l'organisation
          const createdOrg = await createOrganization({
            name: newOrgData.name,
            slug: orgSlug,
            timezone: 'Europe/Paris',
          }).unwrap()

          // Sauvegarder les infos de l'organisation pour les afficher dans la modal des identifiants
          createdOrgName = createdOrg.name
          createdOrgSlug = createdOrg.slug

          // Mettre à jour le DTO utilisateur avec l'ID de la nouvelle organisation
          finalDto = {
            ...dto,
            org_id: createdOrg.id,
          }
        } catch (orgError: any) {
          console.error(
            "Erreur lors de la création de l'organisation:",
            orgError
          )

          // Gestion spécifique des erreurs d'organisation
          const orgErrorMessage =
            orgError?.data?.message ||
            orgError?.message ||
            "Erreur lors de la création de l'organisation"

          if (
            orgErrorMessage.includes('existe déjà') ||
            orgErrorMessage.includes('already exists') ||
            orgErrorMessage.includes('unique constraint')
          ) {
            showError(
              t('users:modal.org_existing_title'),
              t('users:modal.org_existing_message', { name: newOrgData.name })
            )
          } else {
            showError(t('users:modal.org_creation_error_title'), orgErrorMessage)
          }
          return // Arrêter ici si la création d'organisation échoue
        }
      }

      // Créer l'utilisateur
      await createUser(finalDto).unwrap()

      // Préparer les données pour la modal des identifiants (incluant l'org si créée)
      setUserCredentials({
        email: data.email,
        temporaryPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        ...(createdOrgName && { organizationName: createdOrgName }), // Inclure seulement si défini
        ...(createdOrgSlug && { organizationSlug: createdOrgSlug }),
      })

      setShowCredentials(true)
      reset()
      onClose()

      // Toast simple pour confirmer
      success(
        createdOrgName
          ? t('users:modal.toast_org_and_user_created')
          : t('users:modal.toast_user_created'),
        createdOrgName
          ? t('users:modal.toast_org_and_user_created_detail', { orgName: createdOrgName })
          : t('users:modal.toast_user_created_detail', { firstName: data.firstName, lastName: data.lastName })
      )
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error)

      let errorMessage = t('users:modal.create_error_default')
      let errorTitle = t('users:modal.create_error_title')

      // Gestion des erreurs d'utilisateur (les erreurs d'organisation sont gérées séparément)
      if (error?.data?.message?.includes('already exists')) {
        errorMessage = t('users:modal.create_error_email_exists_short')
      } else if (error?.data?.message?.includes('Invalid credentials')) {
        errorMessage = t('users:modal.create_error_insufficient_permissions')
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }

      showError(errorTitle, errorMessage)
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
        maxWidth="lg"
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
              {t('users:modal.create_enhanced_subtitle')}
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

            {/* 🏢 Organisation - Conditionnel selon le rôle */}
            {isSuperAdmin && (
              <div className="space-y-4">
                <FormField
                  label={t('users:form.org_label')}
                  error={errors.orgId?.message}
                  required
                >
                  <div className="space-y-3">
                    {/* Option: Organisation existante */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="createNewOrg"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="radio"
                            id="existing-org"
                            checked={!field.value}
                            onChange={() => field.onChange(false)}
                            className="text-blue-600"
                          />
                        )}
                      />
                      <label
                        htmlFor="existing-org"
                        className="text-sm font-medium"
                      >
                        {t('users:modal.assign_existing_org')}
                      </label>
                    </div>

                    {!createNewOrg && (
                      <Select
                        {...register('orgId')}
                        leftIcon={<Building2 className="h-5 w-5" />}
                        disabled={isLoadingOrgs}
                        placeholder={
                          isLoadingOrgs
                            ? t('users:modal.loading')
                            : t('users:modal.select_org')
                        }
                      >
                        {organizationsData?.map((org: Organization) => (
                          <SelectOption key={org.id} value={org.id}>
                            {org.name}
                          </SelectOption>
                        ))}
                      </Select>
                    )}

                    {/* Option: Nouvelle organisation */}
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="createNewOrg"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="radio"
                            id="new-org"
                            checked={field.value}
                            onChange={() => field.onChange(true)}
                            className="text-blue-600"
                          />
                        )}
                      />
                      <label
                        htmlFor="new-org"
                        className="text-sm font-medium flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('users:modal.create_new_org')}
                      </label>
                    </div>

                    {createNewOrg && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                        <FormField
                          label={t('users:form.org_name_label')}
                          error={errors.newOrgName?.message}
                          required
                        >
                          <Input
                            {...register('newOrgName')}
                            placeholder="Ex: ACME Corporation"
                          />
                          {newOrgName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t('users:modal.slug_generated')}{' '}
                              <span className="font-mono text-blue-600 dark:text-blue-400">
                                {generateSlug(newOrgName)}
                              </span>
                            </p>
                          )}
                        </FormField>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            {t('users:modal.auto_info_title')}
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>
                              • {t('users:modal.auto_info_slug')}
                            </li>
                            <li>
                              • {t('users:modal.auto_info_timezone')}
                            </li>
                            <li>
                              • {t('users:modal.auto_info_assignment')}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            )}

            {/* Info pour les non-SUPER_ADMIN */}
            {!isSuperAdmin && currentUser?.orgId && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  📍 {t('users:modal.auto_created_in_org')}
                </p>
              </div>
            )}

            {/* 🔐 Rôle */}
            <FormField label={t('users:form.role_label')} error={errors.roleId?.message} required>
              <Select
                {...register('roleId')}
                leftIcon={<Shield className="h-5 w-5" />}
                disabled={isLoadingRoles}
                placeholder={
                  isLoadingRoles
                    ? t('users:modal.loading_roles')
                    : t('users:modal.select_role')
                }
              >
                {rolesData?.map((role: Role) => (
                  <SelectOption key={role.id} value={role.id}>
                    {role.name}
                  </SelectOption>
                ))}
              </Select>
            </FormField>

            {/* Description du rôle sélectionné */}
            {selectedRole && roleDescriptions[selectedRole.code] && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {selectedRole.name}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      {roleDescriptions[selectedRole.code]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                {t('common:app.cancel')}
              </Button>

              <Button
                type="submit"
                disabled={!isValid || isCreating || isCreatingOrg}
                loading={isCreating || isCreatingOrg}
              >
                {isCreating || isCreatingOrg ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreatingOrg
                      ? t('users:modal.creating_org')
                      : t('users:modal.creating_user')}
                  </>
                ) : createNewOrg ? (
                  t('users:modal.create_org_and_user')
                ) : (
                  t('users:modal.create_button')
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal des identifiants */}
      {userCredentials && (
        <UserCredentialsModal
          isOpen={showCredentials}
          onClose={() => setShowCredentials(false)}
          email={userCredentials.email}
          temporaryPassword={userCredentials.temporaryPassword}
          firstName={userCredentials.firstName}
          lastName={userCredentials.lastName}
          {...(userCredentials.organizationName && {
            organizationName: userCredentials.organizationName,
          })}
          {...(userCredentials.organizationSlug && {
            organizationSlug: userCredentials.organizationSlug,
          })}
        />
      )}

      {/* Modal universel pour les confirmations */}
      {modalState.config && (
        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={hideModal}
          config={modalState.config}
        />
      )}
    </>
  )
}
