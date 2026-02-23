import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Building2 } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  LoadingSpinner,
  UniversalModal,
  PageContainer,
  PageHeader,
  PageSection,
  OrganizationsPageSkeleton,
} from '@/shared/ui'
import { useUniversalModal } from '@/shared/ui/useUniversalModal'
import { AccessDenied } from '@/pages/AccessDenied'
import { useTranslation } from 'react-i18next'

import {
  useGetOrganizationsQuery,
  useGetMyOrganizationQuery,
  useGetOrganizationUsersQuery,
} from '../api/organizationsApi'
import { selectUserRoles } from '@/features/auth/model/sessionSlice'
import { useSelector } from 'react-redux'
import { CreateOrganizationModal } from './CreateOrganizationModal'
import { Can } from '@/shared/acl/guards/Can'
import type { Organization } from '../types'

interface OrganizationCardProps {
  organization: Organization
  isExpanded: boolean
  onToggle: () => void
  isSuperAdmin: boolean
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  isExpanded,
  onToggle,
  isSuperAdmin,
}) => {
  const { t } = useTranslation(['common'])
  const { data: usersData, isLoading: isLoadingUsers } =
    useGetOrganizationUsersQuery(organization.id, {
      skip: !isExpanded && isSuperAdmin, // Pour super admin: skip si pas expanded
      // Pour user normal: toujours charger (isExpanded = true, isSuperAdmin = false)
    })

  const shouldShowUsers = isSuperAdmin ? isExpanded : true
  const shouldShowToggle = isSuperAdmin

  // Hiérarchie des rôles pour le tri (du plus important au moins important)
  const roleHierarchy: Record<string, number> = {
    SUPER_ADMIN: 0,
    ADMIN: 1,
    MANAGER: 2,
    PARTNER: 3,
    VIEWER: 4,
    STAFF: 5,
  }

  // Fonction pour obtenir le niveau hiérarchique d'un rôle
  const getRoleLevel = (roleCode: string): number => {
    return roleHierarchy[roleCode] ?? 999 // Si rôle inconnu, mettre à la fin
  }

  // Trier les utilisateurs par hiérarchie de rôle
  const sortedUsers = usersData?.users
    ? [...usersData.users].sort((a, b) => {
        const levelA = getRoleLevel(a.role?.code || 'UNKNOWN')
        const levelB = getRoleLevel(b.role?.code || 'UNKNOWN')
        
        // Tri par niveau de rôle (0 = plus haut)
        if (levelA !== levelB) {
          return levelA - levelB
        }
        
        // Si même niveau, trier par nom
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase()
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase()
        return nameA.localeCompare(nameB)
      })
    : []

  return (
    <Card variant="default" padding="none" className="mb-4">
      <div
        className={`p-6 ${shouldShowToggle ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} transition-colors`}
        onClick={shouldShowToggle ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-heading-sm">{organization.name}</h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                {organization.slug} • {organization.timezone}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {organization.plan_code && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                {organization.plan_code}
              </span>
            )}
            {shouldShowToggle &&
              (isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ))}
          </div>
        </div>
      </div>

      {shouldShowUsers && (
        <div
          className={`${shouldShowToggle ? 'border-t border-gray-200 dark:border-gray-700' : ''} p-6 pt-4`}
        >
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div>
              <h4 className="text-body font-semibold text-gray-900 dark:text-white mb-4">
                {isSuperAdmin
                  ? `${t('common:organizations.users')} (${sortedUsers.length || 0})`
                  : t('common:organizations.team')}
              </h4>
              <div className="space-y-2">
                {sortedUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(
                            user.first_name?.[0] ||
                            user.email?.[0] ||
                            '?'
                          ).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name || 'N/A'} {user.last_name || ''}
                        </p>
                        <p className="text-caption">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role?.code === 'ADMIN'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : user.role?.code === 'MANAGER'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {user.role?.name || t('common:organizations.no_role')}
                      </span>
                      {!user.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          {t('common:organizations.inactive')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export const OrganizationsPage: React.FC = () => {
  const { t } = useTranslation(['common'])
  // Pour Super Admin : plusieurs dropdowns peuvent être ouverts
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const userRoles = useSelector(selectUserRoles)
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN')

  // Modal universel
  const { modalState, hideModal, showOrganizationCreated, showError } =
    useUniversalModal()

  // Pour SUPER_ADMIN : récupérer toutes les organisations
  const {
    data: organizationsData,
    isLoading: isLoadingOrgs,
    error: orgsError,
  } = useGetOrganizationsQuery(undefined, {
    skip: !isSuperAdmin,
  })

  // Pour ADMIN non-SUPER_ADMIN : récupérer son organisation
  const {
    data: myOrgData,
    isLoading: isLoadingMyOrg,
    error: myOrgError,
  } = useGetMyOrganizationQuery(undefined, {
    skip: isSuperAdmin,
  })

  const handleToggleOrg = (orgId: string) => {
    if (isSuperAdmin) {
      // Super Admin : peut ouvrir plusieurs dropdowns
      setExpandedOrgs((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(orgId)) {
          newSet.delete(orgId)
        } else {
          newSet.add(orgId)
        }
        return newSet
      })
    }
    // Admin simple : pas de dropdown, pas de toggle nécessaire
  }

  // Logique d'affichage selon le rôle
  let organizationsToDisplay = isSuperAdmin
    ? organizationsData?.organizations ||
      (Array.isArray(organizationsData) ? organizationsData : [])
    : myOrgData
      ? [myOrgData] // L'API retourne directement l'organisation, pas un array
      : []

  // Pour les users normaux: précharger les utilisateurs de leur org
  const firstOrgId = organizationsToDisplay[0]?.id
  const { isLoading: isLoadingInitialUsers } = useGetOrganizationUsersQuery(
    firstOrgId || '',
    {
      skip: isSuperAdmin || !firstOrgId, // Skip pour super admin ou si pas d'org
    }
  )

  const isLoading = isSuperAdmin 
    ? isLoadingOrgs 
    : (isLoadingMyOrg || isLoadingInitialUsers) // Attendre org + users pour user normal
  const error = isSuperAdmin ? orgsError : myOrgError

  // Gestion du succès de création d'organisation
  const handleOrganizationCreated = (name: string, slug: string) => {
    showOrganizationCreated(name, slug)
  }

  // Gestion des erreurs de création
  const handleCreateError = (error: any) => {
    const errorMessage =
      error?.data?.message ||
      error?.message ||
      t('common:organizations.create_error_default')
    showError(t('common:organizations.create_error_title'), errorMessage)
  }

  if (isLoading) {
    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <PageHeader
          icon={Building2}
          title={t('common:organizations.title')}
          description={t('common:organizations.description')}
        />
        <PageSection spacing="lg">
          <OrganizationsPageSkeleton />
        </PageSection>
      </PageContainer>
    )
  }

  if (error) {
    const isPermissionError =
      (error as any)?.status === 403 ||
      (error as any)?.data?.statusCode === 403 ||
      (error as any)?.originalStatus === 403

    if (isPermissionError) {
      return (
        <AccessDenied
          title={t('common:organizations.access_denied')}
          message={t('common:organizations.access_denied_message')}
        />
      )
    }

    return (
      <PageContainer maxWidth="7xl" padding="lg">
        <Card
          variant="default"
          padding="lg"
          className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
        >
          <CardContent>
            <div className="text-center">
              <p className="text-body font-semibold text-red-600 dark:text-red-400">
                {t('common:organizations.loading_error')}
              </p>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-2">
                {(error as any)?.data?.message ||
                  (error as any)?.message ||
                  t('common:organizations.unknown_error')}
              </p>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title={isSuperAdmin ? t('common:organizations.title_super_admin') : t('common:organizations.title_admin')}
        description={
          isSuperAdmin
            ? t('common:organizations.description_super_admin')
            : t('common:organizations.description_admin')
        }
        icon={Building2}
        {...(isSuperAdmin && {
          badge: {
            text: 'Super Admin',
            variant: 'purple' as const,
          },
        })}
        actions={
          isSuperAdmin ? (
            <Can do="manage" on="Organization">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                {t('common:organizations.new_organization')}
              </Button>
            </Can>
          ) : undefined
        }
      />

      <PageSection spacing="lg">
        {organizationsToDisplay.length === 0 ? (
          <Card variant="default" padding="lg">
            <CardContent>
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-body text-gray-600 dark:text-gray-400">
                  {isSuperAdmin
                    ? t('common:organizations.none_found')
                    : t('common:organizations.none_associated')}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {organizationsToDisplay.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                isExpanded={isSuperAdmin ? expandedOrgs.has(org.id) : true}
                onToggle={() => handleToggleOrg(org.id)}
                isSuperAdmin={isSuperAdmin}
              />
            ))}
          </div>
        )}
      </PageSection>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleOrganizationCreated}
        onError={handleCreateError}
      />

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
