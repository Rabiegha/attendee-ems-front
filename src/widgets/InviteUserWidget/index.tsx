import React, { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Can } from '@/shared/acl/guards/Can'
import { InviteUserModal } from '@/features/invitations/ui/InviteUserModal'
import { useGetInvitationsQuery } from '@/features/invitations/api/invitationsApi'
import { UserPlus, Users, Clock, CheckCircle } from 'lucide-react'

export const InviteUserWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Récupérer les statistiques des invitations
  const { data: invitationsData } = useGetInvitationsQuery({ limit: 100 })

  const stats = {
    total: invitationsData?.total || 0,
    pending: invitationsData?.pending || 0,
    accepted: invitationsData?.invitations?.filter((inv: any) => inv.status === 'accepted').length || 0,
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
                Invitez de nouveaux utilisateurs dans votre organisation
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques des invitations */}
        {stats.total > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-400 mr-1" />
                <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              </div>
              <p className="text-xs text-gray-500">Total invitations</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400 mr-1" />
                <span className="text-2xl font-bold text-orange-600">{stats.pending}</span>
              </div>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-1" />
                <span className="text-2xl font-bold text-green-600">{stats.accepted}</span>
              </div>
              <p className="text-xs text-gray-500">Acceptées</p>
            </div>
          </div>
        )}

        {/* Bouton d'invitation */}
        <div className="space-y-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Inviter un utilisateur</span>
          </Button>

          {stats.total > 0 && (
            <Button
              variant="outline"
              onClick={() => {/* TODO: Naviguer vers la page de gestion des invitations */}}
              className="w-full"
            >
              Gérer les invitations ({stats.pending} en attente)
            </Button>
          )}
        </div>

        {/* Modal d'invitation */}
        <InviteUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </Can>
  )
}
