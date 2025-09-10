import React from 'react'
import { X } from 'lucide-react'
import { EventForm } from './EventForm'
import { useCreateEventMutation } from '../api/eventsApi'
import { type CreateEventFormData } from '../lib/validation'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose
}) => {
  const [createEvent, { isLoading }] = useCreateEventMutation()

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
      console.log('Événement créé avec succès !')
      onClose()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      // TODO: Ajouter une notification d'erreur
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">
            Créer un nouvel événement
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <EventForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </div>
    </div>
  )
}

export default CreateEventModal
