import { Trash2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { User } from '../api/usersApi'

interface PermanentDeleteUserModalProps {
  user: User | null
  onClose: () => void
  onDelete: (userIds: string[]) => Promise<void>
}

export function PermanentDeleteUserModal({
  user,
  onClose,
  onDelete,
}: PermanentDeleteUserModalProps) {
  if (!user) return null

  const handleConfirm = async () => {
    try {
      await onDelete([user.id])
      onClose()
    } catch (error) {
      console.error('Erreur lors de la suppression définitive:', error)
    }
  }

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Supprimer définitivement">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-900/50">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 dark:text-red-400" />
          <div className="text-sm text-red-800 dark:text-red-200">
            <p className="font-semibold mb-1">Action irréversible</p>
            <p>
              Cette action supprimera définitivement toutes les données de cet utilisateur.
              Cette opération ne peut pas être annulée.
            </p>
          </div>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Êtes-vous sûr de vouloir supprimer définitivement{' '}
          <span className="font-semibold">
            {user.first_name} {user.last_name}
          </span>{' '}
          ?
        </p>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            <Trash2 className="w-4 h-4" />
            Supprimer définitivement
          </Button>
        </div>
      </div>
    </Modal>
  )
}
