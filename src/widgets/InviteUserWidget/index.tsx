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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Gestion des utilisateurs
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <Users className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-1" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total utilisateurs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-1" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Actifs</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400 mr-1" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inactifs</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 transition-colors duration-200">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Création d'utilisateur</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
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
