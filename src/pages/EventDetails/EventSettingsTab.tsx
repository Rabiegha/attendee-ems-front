import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '@/features/events/api/eventsApi'
import { Button, Input, Select, SelectOption, FormField, Textarea } from '@/shared/ui'
import {
  Save,
  Trash2,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Mail,
  MapPin,
  CreditCard,
} from 'lucide-react'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import { TagInput } from '@/features/tags'
import { useUpdateEventTagsMutation } from '@/services/tags'
import { useGetBadgeTemplatesQuery } from '@/services/api/badge-templates.api'

// Récupérer la clé API Google Maps
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

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
  
  // Récupérer les templates de badges disponibles
  const { data: badgeTemplatesData } = useGetBadgeTemplatesQuery({ 
    page: 1, 
    limit: 100 
  })

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
    websiteUrl: event.websiteUrl || '',
    capacity: event.capacity || undefined,
    registration_auto_approve: event.registrationAutoApprove ?? false,
    require_email_verification: event.requireEmailVerification ?? false,
    confirmation_email_enabled: event.confirmationEmailEnabled ?? false,
    approval_email_enabled: event.approvalEmailEnabled ?? false,
    reminder_email_enabled: event.reminderEmailEnabled ?? false,
    badgeTemplateId: event.badgeTemplateId || '',
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

      // Préparer les données à envoyer
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: formData.location,
        maxAttendees: maxAttendeesValue,
      }

      // Ajouter websiteUrl seulement s'il est défini
      if (formData.websiteUrl) {
        updateData.websiteUrl = formData.websiteUrl
      }

      // Ajouter les options d'inscription et de notification
      // Si capacity est undefined, on envoie null pour supprimer la limite
      updateData.capacity = formData.capacity !== undefined ? formData.capacity : null
      updateData.registrationAutoApprove = formData.registration_auto_approve
      updateData.requireEmailVerification = formData.require_email_verification
      updateData.confirmationEmailEnabled = formData.confirmation_email_enabled
      updateData.approvalEmailEnabled = formData.approval_email_enabled
      updateData.reminderEmailEnabled = formData.reminder_email_enabled
      
      // Ajouter le template de badge
      if (formData.badgeTemplateId) {
        updateData.badgeTemplateId = formData.badgeTemplateId
      }

      // Mettre à jour les informations de l'événement
      await updateEvent({
        id: event.id,
        data: updateData,
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
      {/* STEP 1: Informations de base */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Informations de base
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Informations essentielles de votre événement
          </p>
        </div>

        <div className="space-y-6">
          {/* Nom de l'événement */}
          <FormField label="Nom de l'événement" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Conférence annuelle 2024"
              required
            />
          </FormField>

          {/* Description */}
          <FormField 
            label="Description"
            hint="Optionnel - Décrivez brièvement votre événement"
          >
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre événement..."
              rows={4}
            />
          </FormField>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Date et heure de début" required>
              <Input
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </FormField>

            <FormField label="Date et heure de fin" required>
              <Input
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </FormField>
          </div>

          {/* URL du site / Page de présentation */}
          <FormField 
            label="URL du site / Page de présentation"
            hint="Optionnel - Lien vers la page de présentation de l'événement"
          >
            <Input
              name="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/mon-evenement"
            />
          </FormField>

          {/* Tags */}
          <FormField label="Tags">
            <TagInput
              value={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              placeholder="Ex: Technologie, Networking, Innovation"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Utilisez les tags pour catégoriser et filtrer vos événements
            </p>
          </FormField>
        </div>
      </div>

      {/* STEP 2: Lieu et participants */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Lieu et participants
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Définissez le lieu et les paramètres de participation
          </p>
        </div>

        <div className="space-y-6">
          {/* Type de lieu */}
          <FormField label="Type de lieu">
            <Select
              value={formData.locationType}
              onChange={(e) => setFormData((prev) => ({ ...prev, locationType: e.target.value as 'physical' | 'online' | 'hybrid' }))}
            >
              <SelectOption value="physical">Physique</SelectOption>
              <SelectOption value="online">En ligne</SelectOption>
              <SelectOption value="hybrid">Hybride</SelectOption>
            </Select>
          </FormField>

          {/* Adresse (si physique ou hybride) */}
          {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Localisation de l'événement
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {GOOGLE_MAPS_API_KEY 
                      ? 'Adresse enregistrée (modifiable depuis la création)'
                      : 'Saisissez l\'adresse complète de l\'événement'
                    }
                  </p>
                </div>
              </div>

              <FormField label="Adresse complète">
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: 123 Rue de la Paix, 75001 Paris, France"
                />
              </FormField>
            </div>
          )}

          {/* Partenaires autorisés */}
          <div className="space-y-3">
            <FormField label="Partenaires autorisés">
              {event.partnerIds && event.partnerIds.length > 0 ? (
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
                          if (confirm('Retirer ce partenaire de l\'événement ?')) {
                            alert('Fonctionnalité à implémenter')
                          }
                        }}
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun partenaire invité pour le moment
                </p>
              )}
            </FormField>
            
            <Button
              variant="outline"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => alert('Modal d\'ajout de partenaires à implémenter')}
            >
              Ajouter des partenaires
            </Button>
          </div>
        </div>
      </div>

      {/* STEP 3: Options et paramètres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Options et paramètres
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configurez les options d'inscription et de notification
          </p>
        </div>

        <div className="space-y-6">
          {/* Capacité maximale */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Gestion des participants
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.capacity !== undefined}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({ ...prev, capacity: 100 }))
                        } else {
                          setFormData((prev) => {
                            const { capacity, ...rest } = prev
                            return rest as any
                          })
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Limiter le nombre de participants
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Définir une capacité maximale pour cet événement
                      </p>
                    </div>
                  </label>

                  {formData.capacity !== undefined && (
                    <FormField label="Capacité maximale">
                      <Input
                        name="capacity"
                        type="number"
                        min={1}
                        value={formData.capacity || ''}
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined
                          setFormData((prev) => ({ ...prev, capacity: value }))
                        }}
                        placeholder="Ex: 100"
                      />
                    </FormField>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Approbation */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Gestion des inscriptions
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.registration_auto_approve}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          registration_auto_approve: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Approuver automatiquement tous les inscrits
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Les participants sont immédiatement approuvés sans validation manuelle
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.require_email_verification}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          require_email_verification: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Vérifier l'email pour être pris en compte
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        L'inscription est validée uniquement après vérification de l'adresse email
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications email */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Notifications par email
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.confirmation_email_enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmation_email_enabled: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Envoyer un email de confirmation lors de l'inscription
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Le participant reçoit un email confirmant son inscription
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.approval_email_enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          approval_email_enabled: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Envoyer un email lorsque l'inscription est approuvée
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Le participant reçoit un email quand son inscription est validée
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminder_email_enabled}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reminder_email_enabled: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Envoyer des rappels avant l'événement
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Les participants reçoivent des rappels quelques jours avant l'événement
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Template de badge */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Template de badge
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Sélectionnez le template de badge qui sera utilisé pour générer les badges des participants
                </p>
                
                <FormField label="Template de badge">
                  <Select
                    value={formData.badgeTemplateId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badgeTemplateId: e.target.value }))}
                  >
                    <SelectOption value="">Aucun template sélectionné</SelectOption>
                    {badgeTemplatesData?.data?.filter(t => t.is_active).map((template) => (
                      <SelectOption key={template.id} value={template.id}>
                        {template.name} {template.is_default ? '(Par défaut)' : ''}
                      </SelectOption>
                    ))}
                  </Select>
                </FormField>

                {formData.badgeTemplateId && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/badges/designer/${formData.badgeTemplateId}`)}
                    >
                      Modifier le template
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
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

      {/* Zone de danger */}
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
