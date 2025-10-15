import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { useCreateOrganizationMutation } from '../api/organizationsApi'
import { useToast } from '@/shared/ui/useToast'
import { OrganizationForm } from '../components/OrganizationForm'
import type { CreateOrganizationRequest } from '../types'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createOrganization, { isLoading }] = useCreateOrganizationMutation()
  const { success, error } = useToast()

  const handleSubmit = async (data: CreateOrganizationRequest) => {
    try {
      await createOrganization(data).unwrap()

      success(
        'Organisation créée',
        `L'organisation "${data.name}" a été créée avec succès.`
      )

      onClose()
    } catch (err) {
      console.error('Erreur lors de la création de l\'organisation:', err)
      
      // Gestion d'erreur améliorée
      const errorMessage = (err as any)?.data?.message || 
                          (err as any)?.message || 
                          'Une erreur est survenue lors de la création de l\'organisation.'
      
      error('Erreur', errorMessage)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une organisation"
      size="md"
    >
      <OrganizationForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onCancel={onClose}
      />
    </Modal>
  )
}