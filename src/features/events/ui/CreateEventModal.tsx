import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { EventForm } from './EventForm'
import { useCreateEventMutation } from '../api/eventsApi'
import { type CreateEventFormData } from '../lib/validation'
import { useToast } from '@/shared/hooks/useToast'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose
}) => {
  const [createEvent, { isLoading }] = useCreateEventMutation()
  const toast = useToast()

  const handleSubmit = async (data: CreateEventFormData) => {
    try {
      // Construire l'objet avec seulement les champs nécessaires et les optionnels remplis
      const eventData: any = {
        name: data.name,
        startDate: data.startDate, // Garder comme string ISO
        endDate: data.endDate,     // Garder comme string ISO
        status: 'published' // Toujours publier directement
      }
      
      // Ajouter seulement les champs optionnels qui ont une valeur
      if (data.description && data.description.trim()) {
        eventData.description = data.description
      }
      
      if (data.location && data.location.trim()) {
        eventData.location = data.location
      }
      
      if (data.maxAttendees && data.maxAttendees > 0) {
        eventData.maxAttendees = data.maxAttendees
      }
      
      if (data.tags && data.tags.length > 0) {
        eventData.tags = data.tags
      }
      
      await createEvent(eventData).unwrap()
      toast.success(
        'Événement créé !',
        `L'événement "${data.name}" a été créé avec succès.`
      )
      onClose()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error(
        'Erreur de création',
        'Une erreur est survenue lors de la création de l\'événement. Veuillez réessayer.'
      )
    }
  }

  if (!isOpen) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Créer un nouvel événement"
      maxWidth="4xl"
    >
      <div className="p-6">
        <EventForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          mode="create"
        />
      </div>
    </Modal>
  )
}

export default CreateEventModal
