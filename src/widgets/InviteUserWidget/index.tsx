import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Can } from '@/shared/acl/guards/Can'
import { CreateUserModal } from '@/features/users/ui/CreateUserModal'
import { useGetUsersQuery, type User } from '@/features/users/api/usersApi'
import { UserPlus, Users, CheckCircle, XCircle } from 'lucide-react'

export const InviteUserWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Récupérer les statistiques des utilisateurs
  const { data: usersData } = useGetUsersQuery({ limit: 100 })

  const stats = {
    total: usersData?.total || 0,
    active: usersData?.users?.filter((user: User) => user.is_active).length || 0,
    inactive: usersData?.users?.filter((user: User) => !user.is_active).length || 0,
  }

  return (
    <Can do="invite" on="User">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gestion des utilisateurs
              </h3>
              <p className="text-sm text-gray-500">
                Créez de nouveaux utilisateurs dans votre organisation
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques des utilisateurs */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-400 mr-1" />
                <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <p className="text-xs text-gray-500">Total utilisateurs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-1" />
                <span className="text-2xl font-bold text-green-600">{stats.active}</span>
              </div>
              <p className="text-xs text-gray-500">Actifs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400 mr-1" />
                <span className="text-2xl font-bold text-red-600">{stats.inactive}</span>
              </div>
              <p className="text-xs text-gray-500">Inactifs</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Création d'utilisateur</h4>
          <p className="text-sm text-blue-700">
            Créez directement des comptes utilisateur avec email et mot de passe. 
            Les utilisateurs peuvent se connecter immédiatement.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un utilisateur
          </Button>
        </div>

        {/* Modal */}
        <CreateUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </Can>
  )
}
