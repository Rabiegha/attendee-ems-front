import React from 'react'
import { Modal } from '@/shared/ui/Modal'
import { EventForm } from './EventForm'
import { useUpdateEventMutation } from '../api/eventsApi'
import { type CreateEventFormData } from '../lib/validation'
import type { EventDPO } from '../dpo/event.dpo'
import { useToast } from '@/shared/hooks/useToast'

interface EditEventModalProps {
  event: EventDPO | null
  isOpen: boolean
  onClose: () => void
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [updateEvent, { isLoading }] = useUpdateEventMutation()
  const toast = useToast()

  const handleSubmit = async (data: CreateEventFormData) => {
    if (!event) return
    
    try {
      // Construire l'objet de mise à jour avec seulement les champs modifiés
      const updateData: any = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
      }
      
      // Ajouter seulement les champs optionnels qui ont une valeur
      if (data.description && data.description.trim()) {
        updateData.description = data.description
      }
      
      if (data.location && data.location.trim()) {
        updateData.location = data.location
      }
      
      if (data.maxAttendees && data.maxAttendees > 0) {
        updateData.maxAttendees = data.maxAttendees
      }
      
      if (data.tags && data.tags.length > 0) {
        updateData.tags = data.tags
      }
      
      await updateEvent({
        id: event.id,
        data: updateData
      }).unwrap()
      
      toast.success(
        'Événement modifié !',
        `L'événement "${data.name}" a été mis à jour avec succès.`
      )
      onClose()
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      toast.error(
        'Erreur de modification',
        'Une erreur est survenue lors de la modification de l\'événement. Veuillez réessayer.'
      )
    }
  }

  // Préparer les données initiales du formulaire
  const initialData = event ? {
    name: event.name,
    description: event.description || undefined,
    startDate: event.startDate,
    endDate: event.endDate,
    location: event.location || undefined,
    maxAttendees: event.maxAttendees && event.maxAttendees < 100000 ? event.maxAttendees : undefined,
    tags: event.tags || undefined
  } : undefined

  if (!isOpen || !event) return null

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Modifier l'événement"
      maxWidth="4xl"
    >
      <div className="p-6">
        {initialData && (
          <EventForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            mode="edit"
          />
        )}
      </div>
    </Modal>
  )
}

export default EditEventModal
