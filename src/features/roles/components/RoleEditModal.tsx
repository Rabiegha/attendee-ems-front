import React, { useState, useEffect } from 'react'
import { Edit } from 'lucide-react'
import { Button, Modal } from '@/shared/ui'
import { useToast } from '@/shared/hooks/useToast'

interface RoleEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    description?: string
  }) => Promise<void>
  initialData?: {
    name: string
    description?: string
  } | undefined
  isLoading?: boolean
}

export const RoleEditModal: React.FC<RoleEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToast()

  // Initialiser les valeurs quand la modal s'ouvre
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name || '')
      setDescription(initialData.description || '')
    }
  }, [isOpen, initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const roleData: {
        name: string
        description?: string
      } = {
        name: name.trim(),
      }
      
      if (description.trim()) {
        roleData.description = description.trim()
      }
      
      await onSubmit(roleData)

      toast.success('Rôle modifié avec succès')
      onClose()
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Erreur lors de la modification du rôle'
      toast.error(errorMessage)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier le rôle"
      maxWidth="md"
      showCloseButton={true}
      closeOnBackdropClick={!isLoading}
    >
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom du rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du rôle <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setErrors({ ...errors, name: '' })
            }}
            placeholder="Ex: Gestionnaire, Superviseur"
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.name
                ? 'border-red-300 dark:border-red-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez les responsabilités de ce rôle..."
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optionnel : aide les autres admins à comprendre le rôle
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isLoading}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            {isLoading ? 'Modification...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
