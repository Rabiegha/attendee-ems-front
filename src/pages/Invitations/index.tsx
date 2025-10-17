import React, { useState, useEffect } from 'react'
import { Mail, Users, Building, Send, CheckCircle, Plus } from 'lucide-react'
import { FormField } from '@/shared/ui/FormField'
import { Button } from '@/shared/ui/Button'
import { Select } from '@/shared/ui/Select'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { UniversalModal, useUniversalModal } from '@/shared/ui'
import { useSendInvitationMutation } from '@/features/invitations/api/invitationsApi'
import { useGetRolesQuery } from '@/features/roles/api/rolesApi'
import { useGetOrganizationsQuery } from '@/features/users/api/usersApi'
import { useCreateOrganizationMutation } from '@/features/organizations/api/organizationsApi'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
// Anciens modals remplacés par UniversalModal

interface InvitationFormData {
  email: string
  roleId: string
  orgId: string
  createNewOrg: boolean
  newOrgName: string
}

export const InvitationsPage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.session.user)
  
  // Vérifier si l'utilisateur est SUPER_ADMIN
  const hasRoleSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN')
  const hasRoleSuperAdministrator = currentUser?.roles?.includes('Super Administrator')
  const hasPropSuperAdmin = currentUser?.isSuperAdmin
  
  const isSuperAdmin = hasRoleSuperAdmin || hasRoleSuperAdministrator || hasPropSuperAdmin
  
  const [formData, setFormData] = useState<InvitationFormData>({
    email: '',
    roleId: '',
    orgId: '', // Initialement vide, sera mis à jour dans useEffect
    createNewOrg: false,
    newOrgName: ''
  })

  // Mettre à jour l'orgId selon le type d'utilisateur
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.orgId) {
      // Pour les utilisateurs normaux, pré-remplir avec leur organisation
      setFormData(prev => ({
        ...prev,
        orgId: currentUser.orgId || ''
      }))
    } else if (isSuperAdmin) {
      // Pour les SUPER_ADMIN, laisser vide pour permettre la sélection
      setFormData(prev => ({
        ...prev,
        orgId: ''
      }))
    }
  }, [isSuperAdmin, currentUser?.orgId])

  // Modal universel
  const {
    modalState,
    hideModal,
    showError,
    showWarning,
    showOrganizationCreated,
    showInvitationSent,
  } = useUniversalModal()

  const [sendInvitation, { isLoading: isSending }] = useSendInvitationMutation()
  const [createOrganization, { isLoading: isCreatingOrg }] = useCreateOrganizationMutation()
  const { data: roles, isLoading: isLoadingRoles, error: rolesError } = useGetRolesQuery()
  const { data: organizations, isLoading: isLoadingOrganizations } = useGetOrganizationsQuery(undefined, {
    skip: !isSuperAdmin // Ne charger que si l'utilisateur est SUPER_ADMIN
  })

  // Les données sont chargées via RTK Query

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation des champs
    if (!formData.email || !formData.roleId) {
      showWarning(
        '⚠️ Champs requis',
        'Veuillez remplir tous les champs requis avant d\'envoyer l\'invitation.'
      )
      return
    }

    // Validation spécifique pour Super Admin
    if (isSuperAdmin) {
      if (formData.createNewOrg && !formData.newOrgName) {
        showWarning(
          '⚠️ Nom d\'organisation requis',
          'Veuillez saisir le nom de la nouvelle organisation.'
        )
        return
      } else if (!formData.createNewOrg && !formData.orgId) {
        showWarning(
          '⚠️ Organisation requise',
          'Veuillez sélectionner une organisation ou créer une nouvelle.'
        )
        return
      }
    }

    try {
      let finalOrgId = formData.orgId

      // Si on doit créer une nouvelle organisation
      if (isSuperAdmin && formData.createNewOrg && formData.newOrgName) {
        console.log('🏢 Création de la nouvelle organisation:', formData.newOrgName)
        
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
            timezone: 'Europe/Paris'
          }).unwrap()
          
          console.log('✅ Organisation créée:', createdOrg)
          finalOrgId = createdOrg.id
          
          // Afficher le modal de confirmation de création d'organisation
          showOrganizationCreated(
            createdOrg.name,
            createdOrg.slug,
            () => window.location.href = '/organizations'
          )
        } catch (orgError: any) {
          console.error('Erreur lors de la création de l\'organisation:', orgError)
          
          // Gestion spécifique des erreurs d'organisation
          const orgErrorMessage = orgError?.data?.message || orgError?.message || 'Erreur lors de la création de l\'organisation'
          
          if (orgErrorMessage.includes('existe déjà') || orgErrorMessage.includes('already exists') || orgErrorMessage.includes('unique constraint')) {
            showWarning(
              '🏢 Organisation existante',
              `Une organisation avec le nom "${formData.newOrgName}" existe déjà. Veuillez choisir un nom différent ou sélectionner l'organisation existante.`
            )
          } else {
            showError(
              '🏢 Erreur de création d\'organisation',
              orgErrorMessage
            )
          }
          return // Arrêter ici si la création d'organisation échoue
        }
      }

      // Envoyer l'invitation avec l'organisation appropriée
      await sendInvitation({
        email: formData.email,
        roleId: formData.roleId,
        orgId: finalOrgId
      }).unwrap()
      
      // Modal de succès
      showInvitationSent(formData.email)

      // Reset form
      setFormData({
        email: '',
        roleId: '',
        orgId: currentUser?.orgId || '',
        createNewOrg: false,
        newOrgName: ''
      })

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'invitation:', error)
      
      // Gestion spécifique des erreurs d'invitation (les erreurs d'organisation sont gérées séparément)
      const errorMessage = error?.data?.message || error?.message || 'Une erreur inattendue s\'est produite'
      
      if (errorMessage.includes('already exists') || errorMessage.includes('déjà')) {
        showWarning(
          '👤 Utilisateur existant',
          `Un utilisateur avec l'email ${formData.email} existe déjà.`
        )
      } else if (errorMessage.includes('invalid email') || errorMessage.includes('email invalide')) {
        showError(
          '📧 Email invalide',
          'L\'adresse email fournie n\'est pas valide. Veuillez vérifier le format.'
        )
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('non autorisé')) {
        showError(
          '🔒 Accès refusé',
          'Vous n\'avez pas les permissions nécessaires pour envoyer cette invitation.'
        )
      } else {
        showError(
          'Erreur lors de l\'envoi',
          errorMessage
        )
      }
    }
  }

  const handleInputChange = (field: keyof InvitationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Inviter un utilisateur
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Envoyez une invitation par email pour ajouter un nouveau membre à votre équipe.
            L'utilisateur recevra un lien sécurisé pour créer son compte.
          </p>
        </div>

        {/* Formulaire principal centré */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Send className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nouvelle invitation
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Remplissez les informations ci-dessous
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email */}
              <FormField
                label="Adresse email"
                required
                error={!formData.email && formData.email !== '' ? 'L\'email est requis' : undefined}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="utilisateur@exemple.com"
                    required
                  />
                </div>
              </FormField>

              {/* Rôle */}
              <FormField
                label="Rôle"
                required
                hint="Définit les permissions de l'utilisateur"
              >
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <Select
                    value={formData.roleId}
                    onChange={(e) => handleInputChange('roleId', e.target.value)}
                    className="pl-10"
                    disabled={isLoadingRoles}
                    required
                  >
                    <option value="">
                      {isLoadingRoles ? 'Chargement...' : rolesError ? 'Erreur de chargement' : 'Sélectionner un rôle'}
                    </option>
                    {roles?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                    {!isLoadingRoles && !roles?.length && !rolesError && (
                      <option value="" disabled>Aucun rôle disponible</option>
                    )}
                  </Select>
                </div>
              </FormField>

              {/* Organisation (pour Super Admin seulement) */}
              {isSuperAdmin && (
                <FormField
                  label="Organisation"
                  required
                  hint="Sélectionnez l'organisation pour cet utilisateur"
                >
                  <div className="space-y-4">
                    {/* Option: Organisation existante */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-org"
                        name="orgOption"
                        checked={!formData.createNewOrg}
                        onChange={() => handleInputChange('createNewOrg', false)}
                        className="text-blue-600"
                      />
                      <label htmlFor="existing-org" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assigner à une organisation existante
                      </label>
                    </div>

                    {!formData.createNewOrg && (
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select
                          value={formData.orgId}
                          onChange={(e) => handleInputChange('orgId', e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoadingOrganizations}
                        >
                          <option value="">
                            {isLoadingOrganizations ? 'Chargement...' : 'Sélectionner une organisation'}
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
                      <label htmlFor="new-org" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Créer une nouvelle organisation
                      </label>
                    </div>

                    {formData.createNewOrg && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                        <FormField
                          label="Nom de l'organisation"
                          required
                        >
                          <Input
                            value={formData.newOrgName}
                            onChange={(e) => handleInputChange('newOrgName', e.target.value)}
                            placeholder="Ex: ACME Corporation"
                            className="w-full"
                          />
                          {formData.newOrgName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Slug généré : <span className="font-mono text-blue-600 dark:text-blue-400">{generateSlug(formData.newOrgName)}</span>
                            </p>
                          )}
                        </FormField>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Informations automatiques
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Le slug sera généré automatiquement (ex: acme-corporation)</li>
                            <li>• Le fuseau horaire sera défini sur Europe/Paris</li>
                            <li>• L'utilisateur sera automatiquement assigné à cette organisation</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </FormField>
              )}

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isSending || isCreatingOrg}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {(isSending || isCreatingOrg) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      {isCreatingOrg ? 'Création de l\'organisation...' : 'Envoi en cours...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      {isSuperAdmin && formData.createNewOrg ? 'Créer l\'organisation et envoyer l\'invitation' : 'Envoyer l\'invitation'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Section informative */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Comment ça fonctionne
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Le processus d'invitation en 3 étapes simples
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  1. Email envoyé
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Un email d'invitation est automatiquement envoyé à l'adresse indiquée
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  2. Lien sécurisé
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  L'utilisateur reçoit un lien sécurisé pour compléter son inscription
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  3. Compte créé
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Il peut créer son mot de passe et accéder immédiatement à la plateforme
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
                    Points importants
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Vérifiez l'adresse email avant d'envoyer l'invitation</li>
                    <li>• Le lien d'invitation expire automatiquement dans 48 heures</li>
                    <li>• Vous pouvez renvoyer une invitation si nécessaire</li>
                    <li>• L'utilisateur recevra ses permissions selon le rôle assigné</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal universel */}
      {modalState.config && (
        <UniversalModal
          isOpen={modalState.isOpen}
          onClose={hideModal}
          config={modalState.config}
        />
      )}
    </div>
  )
}

export default InvitationsPage