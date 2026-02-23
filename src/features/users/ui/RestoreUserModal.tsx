import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import type { User } from '../api/usersApi'

interface RestoreUserModalProps {
  user: User | null
  onClose: () => void
  onRestore: (userId: string, data: { is_active: boolean }) => Promise<void>
}

export function RestoreUserModal({ user, onClose, onRestore }: RestoreUserModalProps) {
  const { t } = useTranslation(['users', 'common'])

  if (!user) return null

  const handleConfirm = async () => {
    try {
      await onRestore(user.id, { is_active: true })
      onClose()
    } catch (error) {
      console.error('Erreur lors de la restauration:', error)
    }
  }

  return (
    <Modal isOpen={!!user} onClose={onClose} title={t('users:modal.restore_title')}>
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t('users:modal.restore_confirm', { name: `${user.first_name} ${user.last_name}` })}
        </p>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            {t('common:app.cancel')}
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            {t('users:modal.restore_button')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
