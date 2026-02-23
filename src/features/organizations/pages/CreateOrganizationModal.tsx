import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { CloseButton } from '@/shared/ui/CloseButton'
import { useCreateOrganizationMutation } from '../api/organizationsApi'
import { OrganizationForm } from '../components/OrganizationForm'
import { useTranslation } from 'react-i18next'
import type { CreateOrganizationRequest } from '../types'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (organizationName: string, slug: string) => void
  onError?: (error: any) => void
}

export const CreateOrganizationModal: React.FC<
  CreateOrganizationModalProps
> = ({ isOpen, onClose, onSuccess, onError }) => {
  const { t } = useTranslation('common')
  const [createOrganization, { isLoading }] = useCreateOrganizationMutation()

  const handleSubmit = async (data: CreateOrganizationRequest) => {
    try {
      const result = await createOrganization(data).unwrap()

      // Générer le slug depuis le nom si pas fourni par l'API
      const slug =
        result.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

      onSuccess?.(data.name, slug)
      onClose()
    } catch (err) {
      console.error("Erreur lors de la création de l'organisation:", err)

      // Passer l'erreur au parent pour affichage du modal
      onError?.(err)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      contentPadding={false}
      maxWidth="md"
    >
      <div className="relative p-8">
        {/* Bouton fermeture moderne en haut à droite */}
        <CloseButton onClick={onClose} />

        {/* Titre simple */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('organizations.modal_title')}
          </h2>
          <p className="text-gray-400">{t('organizations.modal_description')}</p>
        </div>

        {/* Formulaire */}
        <OrganizationForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={onClose}
        />
      </div>
    </Modal>
  )
}
