import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Users, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { UniversalModal } from '@/shared/ui/UniversalModal'
import { useUniversalModal } from '@/shared/ui/useUniversalModal'
import { AccessDenied } from '@/pages/AccessDenied'

import { useGetOrganizationsQuery, useGetMyOrganizationQuery, useGetOrganizationUsersQuery } from '../api/organizationsApi'
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
  isSuperAdmin
}) => {
  const { data: usersData, isLoading: isLoadingUsers } = useGetOrganizationUsersQuery(
    organization.id,
    { skip: !isExpanded && isSuperAdmin } // Pour admin simple, toujours charger les users
  )

  // Pour admin simple, toujours afficher les utilisateurs
  const shouldShowUsers = isSuperAdmin ? isExpanded : true
  const shouldShowToggle = isSuperAdmin

  return (
    <Card className="mb-4">
      <div 
        className={`p-4 ${shouldShowToggle ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''} transition-colors`}
        onClick={shouldShowToggle ? onToggle : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {organization.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
            {shouldShowToggle && (
              isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )
            )}
          </div>
        </div>
      </div>

      {shouldShowUsers && (
        <div className={`${shouldShowToggle ? 'border-t border-gray-200 dark:border-gray-700' : ''} p-4`}>
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                {isSuperAdmin ? `Utilisateurs (${usersData?.users.length || 0})` : 'Équipe'}
              </h4>
              <div className="space-y-2">
                {usersData?.users.map((user: any) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name || 'N/A'} {user.last_name || ''}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role.code === 'ADMIN' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : user.role.code === 'MANAGER'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.role.name}
                      </span>
                      {!user.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          Inactif
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
  // Pour Super Admin : plusieurs dropdowns peuvent être ouverts
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  const userRoles = useSelector(selectUserRoles)
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN')
  
  // Modal universel
  const {
    modalState,
    hideModal,
    showOrganizationCreated,
    showError
  } = useUniversalModal()



  // Pour SUPER_ADMIN : récupérer toutes les organisations
  const { data: organizationsData, isLoading: isLoadingOrgs, error: orgsError } = useGetOrganizationsQuery(undefined, {
    skip: !isSuperAdmin
  })

  // Pour ADMIN non-SUPER_ADMIN : récupérer son organisation
  const { data: myOrgData, isLoading: isLoadingMyOrg, error: myOrgError } = useGetMyOrganizationQuery(undefined, {
    skip: isSuperAdmin
  })

  const handleToggleOrg = (orgId: string) => {
    if (isSuperAdmin) {
      // Super Admin : peut ouvrir plusieurs dropdowns
      setExpandedOrgs(prev => {
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
    ? organizationsData?.organizations || (Array.isArray(organizationsData) ? organizationsData : [])
    : myOrgData 
    ? [myOrgData] // L'API retourne directement l'organisation, pas un array
    : []

  const isLoading = isSuperAdmin ? isLoadingOrgs : isLoadingMyOrg
  const error = isSuperAdmin ? orgsError : myOrgError

  // Gestion du succès de création d'organisation
  const handleOrganizationCreated = (name: string, slug: string) => {
    showOrganizationCreated(name, slug)
  }

  // Gestion des erreurs de création
  const handleCreateError = (error: any) => {
    const errorMessage = error?.data?.message || 
                        error?.message || 
                        'Une erreur est survenue lors de la création de l\'organisation.'
    showError('Erreur de création', errorMessage)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    // Vérifier si c'est une erreur de permissions (403)
    const isPermissionError = (error as any)?.status === 403 || 
                              (error as any)?.data?.statusCode === 403 ||
                              (error as any)?.originalStatus === 403

    if (isPermissionError) {
      return (
        <AccessDenied
          title="Accès aux organisations refusé"
          message="Vous n'avez pas les permissions nécessaires pour consulter les informations d'organisation."
        />
      )
    }

    // Autre type d'erreur
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            Erreur lors du chargement des organisations
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {(error as any)?.data?.message || (error as any)?.message || 'Une erreur inconnue est survenue'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSuperAdmin ? 'Gestion des Organisations' : 'Mon Organisation'}
            </h1>
            {isSuperAdmin && (
              <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                Super Admin
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {isSuperAdmin 
              ? 'Gérez toutes les organisations et leurs utilisateurs. Cliquez sur une organisation pour voir/masquer ses utilisateurs.'
              : 'Informations sur votre organisation et votre équipe'
            }
          </p>
        </div>
        
{isSuperAdmin && (
          <Can do="manage" on="Organization">
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Organisation</span>
            </Button>
          </Can>
        )}
      </div>

      {organizationsToDisplay.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isSuperAdmin ? 'Aucune organisation trouvée' : 'Aucune organisation associée'}
          </p>
        </div>
      ) : (
        <div>
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

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleOrganizationCreated}
        onError={handleCreateError}
      />

      {/* Modal universel pour les confirmations */}
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