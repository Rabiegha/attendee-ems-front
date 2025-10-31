import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal, Button } from '@/shared/ui'

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any | null
  onDelete: (userId: string, data: any) => Promise<void>
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      // Désactive l'utilisateur au lieu de le supprimer (soft delete)
      await onDelete(user.id, { is_active: false })
      onClose()
    } catch (error) {
      console.error('Error deactivating user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) return null

  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.email

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Désactiver cet utilisateur">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-body text-gray-900 dark:text-white">
              Êtes-vous sûr de vouloir désactiver l'utilisateur <strong>{userName}</strong> ?
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• L'utilisateur ne pourra plus se connecter</li>
              <li>• Ses données seront conservées</li>
              <li>• Vous pourrez le réactiver plus tard si nécessaire</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Désactivation...' : 'Désactiver'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
