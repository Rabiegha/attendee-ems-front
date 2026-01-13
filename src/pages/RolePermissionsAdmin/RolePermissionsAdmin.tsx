/**
 * RolePermissionsAdmin - Page de gestion des rôles et permissions
 * REDIRIGE vers la nouvelle page RBAC Admin avec drag & drop
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

export const RolePermissionsAdmin: React.FC = () => {
  const currentOrg = useSelector((state: RootState) => state.session.organization)
  
  // Rediriger vers la nouvelle page RBAC Admin
  if (!currentOrg?.id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600">Organization non trouvée</p>
          <p className="text-sm text-gray-500 mt-2">
            Veuillez sélectionner une organisation
          </p>
        </div>
      </div>
    )
  }
  
  return <Navigate to={`/rbac/${currentOrg.id}`} replace />
}
