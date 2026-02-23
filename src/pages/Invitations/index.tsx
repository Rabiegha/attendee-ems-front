import React, { useState, useEffect } from 'react'
import { Mail, Users, Building, Send, CheckCircle, Plus } from 'lucide-react'
import { FormField } from '@/shared/ui/FormField'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { PageContainer, PageHeader, PageSection } from '@/shared/ui'
import { UniversalModal, useUniversalModal } from '@/shared/ui'
import { useToast } from '@/shared/hooks/useToast'
import { 
  useSendInvitationMutation, 
  useResendInvitationMutation 
} from '@/features/invitations/api/invitationsApi'
import { useGetRolesFilteredQuery } from '@/features/roles/api/rolesApi'
import { useGetOrganizationsQuery } from '@/features/users/api/usersApi'
import { useCreateOrganizationMutation } from '@/features/organizations/api/organizationsApi'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { ProtectedPage } from '@/shared/acl/guards/ProtectedPage'
import { useTranslation } from 'react-i18next'

interface InvitationFormData {
  email: string
  roleId: string
  orgId: string
  createNewOrg: boolean
  newOrgName: string
}

const InvitationsPageContent: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.session.user)
  const toast = useToast()
  const { t } = useTranslation('common')

  // Vérifier si l'utilisateur est SUPER_ADMIN
  const hasRoleSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const hasRoleSuperAdministrator = currentUser?.roles?.includes(
    'Super Administrator'
  )
  const hasPropSuperAdmin = currentUser?.isSuperAdmin

  const isSuperAdmin =
    hasRoleSuperAdmin || hasRoleSuperAdministrator || hasPropSuperAdmin

  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    roleId: '',
    orgId: '', // Initialement vide, sera mis à jour dans useEffect
    createNewOrg: false,
    newOrgName: '',
  })

  // NOUVEAU : État pour gérer le chargement dynamique des rôles
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  // Mettre à jour l'orgId selon le type d'utilisateur
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.orgId) {
      // Pour les utilisateurs normaux, pré-remplir avec leur organisation
      setFormData((prev) => ({
        ...prev,
        orgId: currentUser.orgId || '',
      }))
      setSelectedOrgId(currentUser.orgId || null)
    } else if (isSuperAdmin) {
      // Pour les SUPER_ADMIN, laisser vide pour permettre la sélection
      setFormData((prev) => ({
        ...prev,
        orgId: '',
      }))
      setSelectedOrgId(null)
    }
  }, [isSuperAdmin, currentUser?.orgId])

  // Modal universel
  const {
    modalState,
    hideModal,
    showError,
    showWarning,
    showConfirmation,
    showSuccess,
    showInvitationSent,
    showInvitationSentWithOrg,
  } = useUniversalModal()

  const [sendInvitation, { isLoading: isSending }] = useSendInvitationMutation()
  const [resendInvitation] = useResendInvitationMutation()
  const [createOrganization, { isLoading: isCreatingOrg }] =
    useCreateOrganizationMutation()

  // NOUVEAU : Chargement dynamique des rôles selon l'organisation sélectionnée
  const rolesQueryParams =
    isSuperAdmin && formData.createNewOrg
      ? { templatesOnly: true } // Nouvelle org → templates système uniquement
      : isSuperAdmin && selectedOrgId
        ? { orgId: selectedOrgId } // Org existante sélectionnée → rôles de cette org
        : !isSuperAdmin && currentUser?.orgId
          ? { orgId: currentUser.orgId } // Admin normal → rôles de son org
          : undefined // SUPER_ADMIN sans sélection → query skipped

  // Skip la query si SUPER_ADMIN n'a pas encore fait de choix
  const shouldSkipRolesQuery = isSuperAdmin
    ? !formData.createNewOrg && !selectedOrgId // Skip si pas d'org sélectionnée et pas de nouvelle org
    : false // Ne jamais skip pour les admins normaux

  const {
    data: rolesDataRaw,
    isLoading: isLoadingRoles,
    error: rolesError,
  } = useGetRolesFilteredQuery(
    rolesQueryParams ?? { templatesOnly: false },
    {
      skip: shouldSkipRolesQuery,
      refetchOnMountOrArgChange: true,
    }
  )

  // Filtrer les rôles selon la hiérarchie (pour non-SUPER_ADMIN uniquement)
  const currentUserRole = currentUser?.roles?.[0]
  const currentUserRoleData = rolesDataRaw?.find(
    (r: any) => r.code === currentUserRole
  )
  const currentUserRoleLevel = currentUserRoleData?.level ?? 99

  const roles = isSuperAdmin
    ? rolesDataRaw // SUPER_ADMIN voit tous les rôles chargés
    : rolesDataRaw?.filter(
        (role: any) => role.level >= currentUserRoleLevel
      ) || []

  const { data: organizations, isLoading: isLoadingOrganizations } =
    useGetOrganizationsQuery(undefined, {
      skip: !isSuperAdmin, // Ne charger que si l'utilisateur est SUPER_ADMIN
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des champs
    if (!formData.email || !formData.roleId) {
      showWarning(
        t('invitations.validation.required_fields_title'),
        t('invitations.validation.required_fields_message')
      )
      return
    }

    // Validation spécifique pour Super Admin
    if (isSuperAdmin) {
      if (formData.createNewOrg && !formData.newOrgName) {
        showWarning(
          t('invitations.validation.org_name_required_title'),
          t('invitations.validation.org_name_required_message')
        )
        return
      } else if (!formData.createNewOrg && !formData.orgId) {
        showWarning(
          t('invitations.validation.org_required_title'),
          t('invitations.validation.org_required_message')
        )
        return
      }
    }

    try {
      let finalOrgId = formData.orgId
      let createdOrgName: string | undefined
      let createdOrgSlug: string | undefined

      // Si on doit créer une nouvelle organisation
      if (isSuperAdmin && formData.createNewOrg && formData.newOrgName) {
        // Générer le slug simple à partir du nom
        const orgSlug = formData.newOrgName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()

        try {
          // Créer d'abord l'organisation
          const createdOrg = await createOrganization({
            name: formData.newOrgName,
            slug: orgSlug,
            timezone: 'Europe/Paris',
          }).unwrap()

          finalOrgId = createdOrg.id

          // Sauvegarder les infos pour les afficher avec l'invitation
          createdOrgName = createdOrg.name
          createdOrgSlug = createdOrg.slug

          // NE PAS afficher de modal séparée pour l'organisation
          // Elle sera affichée avec la modal d'invitation envoyée
        } catch (orgError: any) {
          console.error(
            "Erreur lors de la création de l'organisation:",
            orgError
          )

          // Gestion spécifique des erreurs d'organisation
          const orgErrorMessage =
            orgError?.data?.message ||
            orgError?.message ||
            t('invitations.errors.org_creation_error')

          if (
            orgErrorMessage.includes('existe déjà') ||
            orgErrorMessage.includes('already exists') ||
            orgErrorMessage.includes('unique constraint')
          ) {
            showWarning(
              t('invitations.errors.org_exists_title'),
              t('invitations.errors.org_exists_message', { name: formData.newOrgName })
            )
          } else {
            showError(t('invitations.errors.org_creation_title'), orgErrorMessage)
          }
          return // Arrêter ici si la création d'organisation échoue
        }
      }

      // Envoyer l'invitation avec l'organisation appropriée
      const invitationResult = await sendInvitation({
        email: formData.email,
        roleId: formData.roleId,
      }).unwrap()

      // Modal de succès combinée (avec info organisation si créée)
      if (createdOrgName && createdOrgSlug) {
        // Cas : Organisation créée + Invitation envoyée
        showInvitationSentWithOrg(
          formData.email,
          createdOrgName,
          createdOrgSlug
        )
      } else {
        // Cas : Invitation envoyée normalement
        showInvitationSent(formData.email)
      }

      // Reset form
      setFormData({
        email: '',
        roleId: '',
        orgId: currentUser?.orgId || '',
        createNewOrg: false,
        newOrgName: '',
      })
    } catch (error: any) {
      // RTK Query met les erreurs dans error.data
      const errorData = error?.data || error
      const errorStatus = error?.status || error?.originalStatus
      
      // Si 409 = invitation déjà en cours
      if (errorStatus === 409) {
        if (errorData?.hasPendingInvitation && errorData?.existingInvitation) {
          // Backend a retourné les données complètes
          const existingInv = errorData.existingInvitation
          const createdDate = new Date(existingInv.createdAt).toLocaleDateString('fr-FR')
          const expiresDate = new Date(existingInv.expiresAt).toLocaleDateString('fr-FR')

          showConfirmation(
            t('invitations.errors.already_pending_title'),
            t('invitations.errors.already_pending_message', { email: existingInv.email, date: createdDate, expiresDate }),
            async () => {
              // OUI - Renvoyer l'invitation
              hideModal()
              try {
                await resendInvitation(existingInv.id).unwrap()
                
                toast.success(
                  t('invitations.messages.resent'),
                  t('invitations.messages.resent_detail', { email: existingInv.email })
                )
                
                // Reset form
                setFormData({
                  email: '',
                  roleId: '',
                  orgId: currentUser?.orgId || '',
                  createNewOrg: false,
                  newOrgName: '',
                })
              } catch (resendError: any) {
                toast.error(t('invitations.errors.resend_error'), resendError?.message || t('invitations.errors.resend_failed'))
              }
            },
            () => {
              // NON - Fermer la modal
              hideModal()
            }
          )
        } else {
          // Fallback: backend n'a pas retourné les données complètes
          showConfirmation(
            t('invitations.errors.already_pending_title'),
            t('invitations.errors.already_pending_simple', { email: formData.email }),
            () => {
              // OUI - Recharger la page
              window.location.reload()
            },
            () => {
              // NON - Fermer
              hideModal()
            }
          )
        }
        return
      }

      // Gestion des autres erreurs d'invitation
      // IMPORTANT: Vérifier 'detail' avant 'error' car le backend renvoie le message détaillé dans 'detail'
      const errorMessage =
        error?.data?.detail ||        // Message détaillé du backend
        error?.data?.message ||
        error?.data?.error ||          // Titre générique ("Bad Request")
        error?.message ||
        t('invitations.errors.unexpected')

      // Vérifier si l'utilisateur est déjà membre
      if (
        errorMessage.includes('déjà membre') ||
        errorMessage.includes('already a member') ||
        errorMessage.includes('déjà un compte et est membre')
      ) {
        showError(
          t('invitations.errors.already_member_title'),
          errorMessage
        )
        return
      }

      // Vérifier si une invitation est déjà en attente
      if (
        errorMessage.includes('invitation est déjà en attente') ||
        errorMessage.includes('invitation already pending')
      ) {
        showError(
          t('invitations.errors.pending_title'),
          errorMessage
        )
        return
      }

      // Vérifier si c'est une erreur de compte existant
      if (
        errorMessage.includes('already exists') ||
        errorMessage.includes('déjà existe') ||
        errorMessage.includes('existe déjà') ||
        errorMessage.includes('User with this email already exists') ||
        errorMessage.includes('account already exists')
      ) {
        showError(
          t('invitations.errors.account_exists_title'),
          t('invitations.errors.account_exists_message', { email: formData.email })
        )
      } else if (
        errorMessage.includes('invalid email') ||
        errorMessage.includes('email invalide')
      ) {
        showError(
          t('invitations.errors.invalid_email_title'),
          t('invitations.errors.invalid_email_message')
        )
      } else if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('non autorisé')
      ) {
        showError(
          t('invitations.errors.access_denied_title'),
          t('invitations.errors.access_denied_message')
        )
      } else {
        showError(
          t('invitations.errors.send_error'),
          errorMessage
        )
      }
    }
  }

  const handleInputChange = (
    field: keyof InvitationFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Reset roleId quand l'organisation change (pour forcer re-sélection avec nouveaux rôles)
      ...(field === 'orgId' && { roleId: '' }),
      ...(field === 'createNewOrg' && { roleId: '' }),
    }))

    // Mettre à jour selectedOrgId pour charger les rôles correspondants
    if (field === 'orgId' && typeof value === 'string') {
      const newOrgId = value || null
      setSelectedOrgId(newOrgId)
    } else if (field === 'createNewOrg') {
      // Si on bascule vers "créer nouvelle org", on reset selectedOrgId
      if (value === true) {
        setSelectedOrgId(null)
      }
    }
  }

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

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={t('invitations.inviteUser')}
        description={t('invitations.page_description')}
        icon={Mail}
      />

      <PageSection spacing="lg">
        <div className="max-w-2xl mx-auto">
          <Card variant="default" padding="xl" className="shadow-xl my-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="section-title mb-0">{t('invitations.form.new_invitation')}</h2>
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  {t('invitations.form.fill_info')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-form">{/* space-y-8 */}
              {/* Email */}
              <FormField
                label={t('invitations.form.email.label')}
                required
                error={
                  !formData.email && formData.email !== ''
                    ? t('invitations.form.email.required')
                    : undefined
                }
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t('invitations.form.email.placeholder')}
                    required
                  />
                </div>
              </FormField>

              {/* Organisation EN PREMIER (pour Super Admin seulement) */}
              {isSuperAdmin && (
                <FormField
                  label={t('invitations.form.organization.label')}
                  required
                  hint={t('invitations.form.organization.hint')}
                >
                  <div className="space-y-4">
                    {/* Option: Organisation existante */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-org"
                        name="orgOption"
                        checked={!formData.createNewOrg}
                        onChange={() =>
                          handleInputChange('createNewOrg', false)
                        }
                        className="text-blue-600"
                      />
                      <label
                        htmlFor="existing-org"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {t('invitations.form.organization.existing')}
                      </label>
                    </div>

                    {!formData.createNewOrg && (
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select
                          value={formData.orgId}
                          onChange={(e) =>
                            handleInputChange('orgId', e.target.value)
                          }
                          className="pl-10"
                          required
                          disabled={isLoadingOrganizations}
                        >
                          <option value="">
                            {isLoadingOrganizations
                              ? t('app.loading')
                              : t('invitations.form.organization.placeholder')}
                          </option>
                          {organizations?.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {/* Option: Nouvelle organisation */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="new-org"
                        name="orgOption"
                        checked={formData.createNewOrg}
                        onChange={() => handleInputChange('createNewOrg', true)}
                        className="text-blue-600"
                      />
                      <label
                        htmlFor="new-org"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('invitations.form.organization.create_new')}
                      </label>
                    </div>

                    {formData.createNewOrg && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-700">
                        <FormField label={t('invitations.form.organization.name_label')} required>
                          <Input
                            value={formData.newOrgName}
                            onChange={(e) =>
                              handleInputChange('newOrgName', e.target.value)
                            }
                            placeholder={t('invitations.form.organization.name_placeholder')}
                            className="w-full"
                          />
                          {formData.newOrgName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {t('invitations.form.organization.slug_generated')}{' '}
                              <span className="font-mono text-blue-600 dark:text-blue-400">
                                {generateSlug(formData.newOrgName)}
                              </span>
                            </p>
                          )}
                        </FormField>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            {t('invitations.form.organization.auto_info_title')}
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>
                              • {t('invitations.form.organization.auto_info_slug')}
                            </li>
                            <li>
                              • {t('invitations.form.organization.auto_info_roles')}
                            </li>
                            <li>
                              • {t('invitations.form.organization.auto_info_timezone')}
                            </li>
                            <li>
                              • {t('invitations.form.organization.auto_info_assignment')}
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>
              )}

              {/* Rôle (APRÈS l'organisation pour SUPER_ADMIN) */}
              <FormField
                label={t('invitations.form.role.label')}
                required
                hint={
                  isSuperAdmin && !formData.createNewOrg && !selectedOrgId
                    ? t('invitations.form.role.select_org_first')
                    : t('invitations.form.role.description')
                }
              >
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.roleId}
                    onChange={(e) =>
                      handleInputChange('roleId', e.target.value)
                    }
                    className="pl-10"
                    disabled={
                      isLoadingRoles ||
                      (isSuperAdmin && !formData.createNewOrg && !selectedOrgId)
                    }
                    required
                  >
                    <option value="">
                      {isLoadingRoles
                        ? t('app.loading')
                        : isSuperAdmin &&
                            !formData.createNewOrg &&
                            !selectedOrgId
                          ? t('invitations.form.role.select_org_first')
                          : rolesError
                            ? t('invitations.form.role.load_error')
                            : t('invitations.form.role.placeholder')}
                    </option>
                    {roles?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                        {role.description ? ` - ${role.description}` : ''}
                      </option>
                    ))}
                    {!isLoadingRoles &&
                      !roles?.length &&
                      !rolesError &&
                      selectedOrgId && (
                        <option value="" disabled>
                          {t('invitations.form.role.no_roles')}
                        </option>
                      )}
                  </Select>
                </div>
                {formData.createNewOrg && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('invitations.form.role.default_roles')}
                  </p>
                )}
              </FormField>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSending || isCreatingOrg}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSending || isCreatingOrg ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      {isCreatingOrg
                        ? t('invitations.form.creating_org')
                        : t('invitations.form.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      {isSuperAdmin && formData.createNewOrg
                        ? t('invitations.form.submit_with_org')
                        : t('invitations.form.submit')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Section informative */}
          <PageSection spacing="xl">
            <div className="text-center mb-8">
              <h2 className="section-title mb-6">{t('invitations.how_it_works.title')}</h2>
              <p className="text-body text-gray-600 dark:text-gray-400">
                {t('invitations.how_it_works.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-heading-sm mb-3">{t('invitations.how_it_works.step1_title')}</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  {t('invitations.how_it_works.step1_description')}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-heading-sm mb-3">{t('invitations.how_it_works.step2_title')}</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  {t('invitations.how_it_works.step2_description')}
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-heading-sm mb-3">{t('invitations.how_it_works.step3_title')}</h3>
                <p className="text-body-sm text-gray-600 dark:text-gray-400">
                  {t('invitations.how_it_works.step3_description')}
                </p>
              </div>
            </div>

            {/* Informations importantes */}
            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('invitations.important.title')}
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>
                      • {t('invitations.important.check_email')}
                    </li>
                    <li>
                      • {t('invitations.important.expires')}
                    </li>
                    <li>• {t('invitations.important.can_resend')}</li>
                    <li>
                      • {t('invitations.important.permissions')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </PageSection>
        </div>
      </PageSection>

      {/* Modal universel */}
      {modalState.config && (
        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={hideModal}
          config={modalState.config}
        />
      )}
    </PageContainer>
  )
}

export const InvitationsPage = () => {
  const { t } = useTranslation('common')
  return (
    <ProtectedPage
      action="create"
      subject="Invitation"
      deniedTitle={t('invitations.access_denied_title')}
      deniedMessage={t('invitations.access_denied_message')}
    >
      <InvitationsPageContent />
    </ProtectedPage>
  )
}

export default InvitationsPage
