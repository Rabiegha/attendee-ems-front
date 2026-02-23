import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '@/shared/ui'
import { Users, UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useFuzzySearch } from '@/shared/hooks/useFuzzySearch'
import { useToast } from '@/shared/hooks/useToast'

interface AssignedTeamProps {
  eventId: string
}

export function AssignedTeam({ eventId }: AssignedTeamProps) {
  const { t } = useTranslation('events')
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const toast = useToast()

  // Récupérer les utilisateurs assignés
  const {
    data: assignedUsers = [],
    isLoading: loadingAssigned,
  } = useGetEventAssignedUsersQuery(eventId)

  // Récupérer tous les utilisateurs
  const { data: usersData } = useGetUsersQuery({ page: 1, limit: 1000 })
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section: Équipe assignée */}
      <Card>
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-heading-md text-gray-900 dark:text-white font-semibold">
              Équipe assignée
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {assignedUsers.length} utilisateur(s) assigné(s) à cet événement
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Ajouter un membre
          </Button>
        </div>
        <CardContent className="p-6">
          {assignedUsers.length === 0 ? (
            <div className="text-center py-12">
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
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
        </CardContent>
      </Card>

      {/* Modal: Ajouter un membre */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-heading-md text-gray-900 dark:text-white font-semibold">
                Ajouter un membre à l'équipe
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Sélectionnez les utilisateurs à assigner à cet événement
              </p>
            </div>
            <div className="overflow-auto max-h-[60vh] p-6">
              <div className="mb-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Rechercher un utilisateur..."
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ? t('team.no_user_found') : t('team.all_assigned')}
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
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
