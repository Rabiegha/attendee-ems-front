import { useState } from 'react'
import {
  useGetEventAssignedUsersQuery,
  useAssignUsersToEventMutation,
  useUnassignUserFromEventMutation,
} from '@/features/events/api/eventsApi'
import { useGetUsersQuery } from '@/features/users/api/usersApi'
import {
  Card,
  CardContent,
  Button,
  SearchInput,
  Modal,
} from '@/shared/ui'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Users, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useFuzzySearch } from '@/shared/hooks/useFuzzySearch'
import { useToast } from '@/shared/hooks/useToast'

interface AssignedTeamProps {
  eventId: string
}

export function AssignedTeam({ eventId }: AssignedTeamProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const toast = useToast()

  // Récupérer les utilisateurs assignés
  const {
    data: assignedUsers = [],
    isLoading: loadingAssigned,
  } = useGetEventAssignedUsersQuery(eventId)

  // Récupérer tous les utilisateurs
  const { data: usersData } = useGetUsersQuery({ page: 1, pageSize: 1000 })
  const allUsers = usersData?.users || []

  // Mutations
  const [assignUsers, { isLoading: assigning }] = useAssignUsersToEventMutation()
  const [unassignUser, { isLoading: unassigning }] = useUnassignUserFromEventMutation()

  // Utilisateurs déjà assignés (IDs)
  const assignedUserIds = new Set(assignedUsers.map(a => a.user_id))

  // Utilisateurs disponibles (non assignés)
  const availableUsers = allUsers.filter(user => !assignedUserIds.has(user.id))

  // Recherche fuzzy
  const filteredUsers = useFuzzySearch(
    availableUsers,
    searchTerm,
    ['first_name', 'last_name', 'email']
  )

  // Gérer l'assignation
  const handleAssign = async (userId: string) => {
    try {
      await assignUsers({
        eventId,
        user_ids: [userId],
        reason: 'Assigned via event management interface',
      }).unwrap()
      toast.success('Utilisateur assigné avec succès')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erreur lors de l\'assignation')
    }
  }

  // Gérer le retrait
  const handleUnassign = async (userId: string) => {
    try {
      await unassignUser({ eventId, userId }).unwrap()
      toast.success('Utilisateur retiré de l\'équipe')
    } catch (error: any) {
      toast.error(error?.data?.message || 'Erreur lors du retrait')
    }
  }

  if (loadingAssigned) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Ajouter un membre</span>
        </Button>
      </div>

      <div>
        {assignedUsers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun utilisateur assigné
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Ajoutez des membres pour leur donner accès à cet événement
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedUsers.map((assignment) => {
              // Trouver les infos utilisateur
              const user = allUsers.find(u => u.id === assignment.user_id)
              
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                      {assignment.reason && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {assignment.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={unassigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                    onClick={() => handleUnassign(assignment.user_id)}
                    disabled={unassigning}
                  >
                    Retirer
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal: Ajouter un membre */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un membre à l'équipe"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sélectionnez les utilisateurs à assigner à cet événement
          </p>
          
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un utilisateur..."
          />

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Aucun utilisateur trouvé' : 'Tous les utilisateurs sont déjà assignés'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    leftIcon={assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    onClick={() => handleAssign(user.id)}
                    disabled={assigning}
                  >
                    Assigner
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
