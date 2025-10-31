import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '@/features/events/api/eventsApi'
import { Button, Input, Select } from '@/shared/ui'
import {
  Save,
  Trash2,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import { TagInput } from '@/features/tags'
import { useUpdateEventTagsMutation } from '@/services/tags'

interface EventSettingsTabProps {
  event: EventDPO
}

export const EventSettingsTab: React.FC<EventSettingsTabProps> = ({
  event,
}) => {
  const navigate = useNavigate()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()
  const [updateEventTags] = useUpdateEventTagsMutation()

  // Si l'événement est supprimé, afficher un message
  if (event.isDeleted) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-800 p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
          Événement supprimé
        </h2>
        <p className="text-red-700 dark:text-red-400">
          Cet événement a été supprimé et ne peut plus être modifié.
          Les paramètres sont désactivés.
        </p>
      </div>
    )
  }

  // État du formulaire
  const [formData, setFormData] = useState({
    name: event.name,
    description: event.description,
    startDate: event.startDate.split('T')[0] + 'T' + event.startDate.split('T')[1]?.substring(0, 5) || '',
    endDate: event.endDate.split('T')[0] + 'T' + event.endDate.split('T')[1]?.substring(0, 5) || '',
    location: event.location,
    locationType: event.locationType,
    maxAttendees: event.maxAttendees && event.maxAttendees < 999999 ? event.maxAttendees : '',
    tags: event.tags || [],
  })

  // État pour la suppression (double confirmation)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showUpdateSuccessModal, setShowUpdateSuccessModal] = useState(false)
  const [deleteResult, setDeleteResult] = useState<{
    message: string
    type: 'hard' | 'soft'
  } | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      const maxAttendeesValue = formData.maxAttendees
        ? parseInt(formData.maxAttendees.toString())
        : 999999

      // Mettre à jour les informations de l'événement
      await updateEvent({
        id: event.id,
        data: {
          name: formData.name,
          description: formData.description,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          location: formData.location,
          maxAttendees: maxAttendeesValue,
        },
      }).unwrap()

      // Mettre à jour les tags séparément
      await updateEventTags({
        eventId: event.id,
        tags: formData.tags,
      }).unwrap()

      setShowUpdateSuccessModal(true)
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('❌ Erreur lors de la sauvegarde')
    }
  }

  const handleDeleteEvent = async () => {
    if (deleteStep !== 2) return

    try {
      const result = await deleteEvent(event.id).unwrap()
      setDeleteResult(result as any)
      setDeleteStep(0)
      setShowSuccessModal(true)
      
      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate('/events')
      }, 3000)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('❌ Erreur lors de la suppression')
      setDeleteStep(0)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Informations générales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Save className="h-5 w-5 mr-2" />
          Informations générales
        </h2>

        <div className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'événement *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Conférence Annuelle 2025"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Décrivez votre événement..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début *
              </label>
              <Input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin *
              </label>
              <Input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Lieu et Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lieu
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Paris, France"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type de lieu
              </label>
              <Select
                name="locationType"
                value={formData.locationType}
                onChange={handleInputChange}
              >
                <option value="physical">Physique</option>
                <option value="online">En ligne</option>
                <option value="hybrid">Hybride</option>
              </Select>
            </div>
          </div>

          {/* Capacité maximale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de places maximum
            </label>
            <Input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              placeholder="Laissez vide pour illimité"
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Laissez vide ou 0 pour un nombre de places illimité
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              placeholder="Ex: Technologie, Networking, Innovation"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Utilisez les tags pour catégoriser et filtrer vos événements
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveChanges}
              disabled={isUpdating}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </div>

      {/* Section 2: Gestion des partenaires */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Gestion des partenaires
        </h2>

        {event.partnerIds && event.partnerIds.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {event.partnerIds.length} partenaire(s) invité(s)
            </p>
            <div className="space-y-2">
              {event.partnerIds.map((partnerId) => (
                <div
                  key={partnerId}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Partenaire #{partnerId}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<UserMinus className="h-3 w-3" />}
                    onClick={() => {
                      if (
                        confirm('Retirer ce partenaire de l\'événement ?')
                      ) {
                        // TODO: Implémenter la logique de retrait
                        alert('Fonctionnalité à implémenter')
                      }
                    }}
                  >
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Aucun partenaire invité pour le moment
          </p>
        )}

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => alert('Modal d\'ajout de partenaires à implémenter')}
          >
            Ajouter des partenaires
          </Button>
        </div>
      </div>

      {/* Section 3: Zone de danger */}
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-800 p-6">
        <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Zone de danger
        </h2>

        <div className="space-y-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            La suppression d'un événement est une action définitive et irréversible.
          </p>

          {deleteStep === 0 && (
            <Button
              variant="outline"
              onClick={() => setDeleteStep(1)}
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              Supprimer l'événement
            </Button>
          )}

          {deleteStep === 1 && (
            <div className="space-y-3 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <p className="font-medium text-red-900 dark:text-red-300">
                Êtes-vous sûr de vouloir supprimer l'événement "{event.name}" ?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteStep(0)}
                  size="sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => setDeleteStep(2)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Oui, continuer
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 2 && (
            <div className="space-y-3 p-4 bg-red-200 dark:bg-red-900/30 rounded-lg border-2 border-red-400 dark:border-red-700">
              <p className="font-bold text-red-900 dark:text-red-300">
                DERNIÈRE CONFIRMATION
              </p>
              <p className="text-sm text-red-800 dark:text-red-300">
                Cette action est <strong>irréversible</strong>. L'événement sera
                définitivement supprimé de la base de données.
              </p>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">
                Confirmez-vous la suppression de "{event.name}" ?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteStep(0)}
                  size="sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  size="sm"
                  className="bg-red-700 hover:bg-red-800 text-white"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de succès de mise à jour */}
      {showUpdateSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              {/* Icône de succès animée */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Titre */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Modifications enregistrées !
              </h3>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Les paramètres de l'événement ont été mis à jour avec succès.
              </p>

              {/* Bouton de fermeture */}
              <Button
                onClick={() => setShowUpdateSuccessModal(false)}
                className="w-full"
              >
                Continuer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de succès de suppression */}
      {showSuccessModal && deleteResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="text-center">
              {/* Icône de succès animée */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg
                  className="h-10 w-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Titre */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Événement supprimé !
              </h3>

              {/* Message détaillé */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {deleteResult.message}
                </p>
                
                {deleteResult.type === 'hard' ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Suppression définitive
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Archivé (conservé dans l'historique)
                  </div>
                )}
              </div>

              {/* Message de redirection */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirection vers la liste des événements...
              </p>

              {/* Barre de progression */}
              <div className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 dark:bg-green-400 rounded-full animate-progress"
                  style={{
                    animation: 'progress 3s linear forwards'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
