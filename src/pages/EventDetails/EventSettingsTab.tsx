import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useBlocker } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  useUpdateEventMutation,
  useDeleteEventMutation,
} from '@/features/events/api/eventsApi'
import { Button, Input, Select, SelectOption, FormField, Textarea, AddressAutocomplete } from '@/shared/ui'
import { useToast } from '@/shared/hooks/useToast'
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
} from 'lucide-react'
import type { EventDPO } from '@/features/events/dpo/event.dpo'
import { TagInput } from '@/features/tags'
import { useUpdateEventTagsMutation } from '@/services/tags'
import { formatDateForInput } from '@/shared/lib/date-utils'
import { useTranslation } from 'react-i18next'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

interface EventSettingsTabProps {
  event: EventDPO
}

export const EventSettingsTab: React.FC<EventSettingsTabProps> = ({
  event,
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()
  const [updateEventTags] = useUpdateEventTagsMutation()
  const { t } = useTranslation(['events', 'common'])

  // Si l'événement est supprimé, afficher un message
  if (event.isDeleted) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-800 p-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-900 dark:text-red-300 mb-2">
          {t('events:settings.event_deleted_title')}
        </h2>
        <p className="text-red-700 dark:text-red-400">
          {t('events:settings.event_deleted_description')}
        </p>
      </div>
    )
  }

  // État initial mémorisé pour la comparaison
  const initialFormData = useMemo(() => ({
    name: event.name,
    description: event.description,
    startDate: formatDateForInput(event.startDate),
    endDate: formatDateForInput(event.endDate),
    location: event.addressFormatted || '', // Utiliser l'adresse réelle du backend, pas la location mappée
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
  }), [event])

  // État du formulaire
  const [formData, setFormData] = useState(initialFormData)
  const [isExiting, setIsExiting] = useState(false)
  const [showSaveButton, setShowSaveButton] = useState(false)

  // Mettre à jour le formulaire quand les données initiales changent (après sauvegarde ou chargement)
  useEffect(() => {
    setFormData(initialFormData)
  }, [initialFormData])

  // Détection des changements
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData)
  }, [formData, initialFormData])

  // Gérer l'animation d'entrée et de sortie
  useEffect(() => {
    if (isDirty) {
      setIsExiting(false)
      setShowSaveButton(true)
      return undefined
    } else if (showSaveButton) {
      // Déclencher l'animation de sortie
      setIsExiting(true)
      const timer = setTimeout(() => {
        setShowSaveButton(false)
        setIsExiting(false)
      }, 400) // Durée de l'animation
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isDirty, showSaveButton])

  // Protection contre la navigation interne
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && (
        currentLocation.pathname !== nextLocation.pathname || 
        currentLocation.search !== nextLocation.search
      )
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowUnsavedChangesModal(true)
    } else {
      setShowUnsavedChangesModal(false)
    }
  }, [blocker])

  const handleStay = () => {
    if (blocker) blocker.reset?.()
  }

  const handleLeave = () => {
    if (blocker) blocker.proceed?.()
  }

  const handleSaveAndLeave = async () => {
    const success = await handleSaveChanges()
    if (success) {
      if (blocker) blocker.proceed?.()
    } else {
      if (blocker) blocker.reset?.()
    }
  }

  // Protection contre la fermeture de l'onglet/navigateur
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // État pour la suppression (double confirmation)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0)
  const [deleteResult, setDeleteResult] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false)

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
        // Si l'événement est en ligne, vider l'adresse, sinon envoyer null si vide
        location: formData.locationType === 'online' ? null : (formData.location || null),
        locationType: formData.locationType,
        maxAttendees: maxAttendeesValue,
        // Envoyer null si vide pour supprimer la valeur
        websiteUrl: formData.websiteUrl || null,
        // Si capacity est undefined, on envoie null pour supprimer la limite
        capacity: formData.capacity !== undefined ? formData.capacity : null,
        registrationAutoApprove: formData.registration_auto_approve,
        requireEmailVerification: formData.require_email_verification,
        confirmationEmailEnabled: formData.confirmation_email_enabled,
        approvalEmailEnabled: formData.approval_email_enabled,
        reminderEmailEnabled: formData.reminder_email_enabled,
        // Envoyer null si vide pour supprimer le template
        badgeTemplateId: formData.badgeTemplateId || null,
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

      toast.success(t('events:settings.save_success'))
      return true
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error(t('events:settings.save_error'))
      return false
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
      alert(t('events:settings.delete_error'))
      setDeleteStep(0)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* STEP 1: Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('events:settings.basic_info')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('events:settings.basic_info_description')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Nom de l'événement */}
            <FormField label={t('events:settings.event_name')} required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('events:settings.name_placeholder')}
                required
              />
            </FormField>

            {/* Description */}
            <FormField 
              label={t('events:settings.description')}
              hint={t('events:settings.description_hint')}
            >
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('events:settings.description_placeholder')}
                rows={4}
              />
            </FormField>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label={t('events:settings.start_date')} required>
                <Input
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </FormField>

              <FormField label={t('events:settings.end_date')} required>
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
              label={t('events:settings.website_url')}
              hint={t('events:settings.website_hint')}
            >
              <Input
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder={t('events:settings.website_placeholder')}
              />
            </FormField>

            {/* Tags */}
            <FormField label={t('events:settings.tags')}>
              <TagInput
                value={formData.tags}
                onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                placeholder={t('events:settings.tags_placeholder')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('events:settings.tags_hint')}
              </p>
            </FormField>
          </div>
        </div>

        {/* STEP 2: Lieu et participants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('events:settings.location_and_participants')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('events:settings.location_description')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Type de lieu */}
            <FormField label={t('events:settings.location_type')}>
              <Select
                value={formData.locationType}
                onChange={(e) => {
                  const newLocationType = e.target.value as 'physical' | 'online' | 'hybrid'
                  setFormData((prev) => ({ 
                    ...prev, 
                    locationType: newLocationType,
                    location: newLocationType === 'online' 
                      ? '' 
                      : (prev.location || event.addressFormatted || '')
                  }))
                }}
              >
                <SelectOption value="physical">{t('events:settings.physical')}</SelectOption>
                <SelectOption value="online">{t('events:settings.online')}</SelectOption>
                <SelectOption value="hybrid">{t('events:settings.hybrid')}</SelectOption>
              </Select>
            </FormField>

            {/* Adresse (si physique ou hybride) */}
            {(formData.locationType === 'physical' || formData.locationType === 'hybrid') && (
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {t('events:settings.event_location')}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {t('events:settings.address_hint')}
                    </p>
                  </div>
                </div>

                <FormField label={t('events:settings.full_address')}>
                  <AddressAutocomplete
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                    onPlaceSelect={(place) => {
                      setFormData((prev) => ({
                        ...prev,
                        location: place.formatted_address,
                      }))
                    }}
                    placeholder={t('events:settings.search_address')}
                    apiKey={GOOGLE_MAPS_API_KEY}
                  />
                </FormField>
              </div>
            )}

            {/* Partenaires autorisés */}
            <div className="space-y-3">
              <FormField label={t('events:settings.authorized_partners')}>
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
                            {t('events:settings.partner_id', { id: partnerId })}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<UserMinus className="h-3 w-3" />}
                          onClick={() => {
                            if (confirm(t('events:settings.remove_partner_confirm'))) {
                              alert(t('events:settings.feature_todo'))
                            }
                          }}
                        >
                          {t('events:settings.remove')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('events:settings.no_partners')}
                  </p>
                )}
              </FormField>
              
              <Button
                variant="outline"
                leftIcon={<UserPlus className="h-4 w-4" />}
                onClick={() => alert(t('events:settings.add_partners_todo'))}
              >
                {t('events:settings.add_partners')}
              </Button>
            </div>
          </div>
        </div>

        {/* STEP 3: Options et paramètres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('events:settings.options_title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('events:settings.options_description')}
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
                    {t('events:settings.attendee_management')}
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
                          {t('events:settings.limit_attendees')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.limit_attendees_hint')}
                        </p>
                      </div>
                    </label>

                    {formData.capacity !== undefined && (
                      <FormField label={t('events:settings.max_capacity')}>
                        <Input
                          name="capacity"
                          type="number"
                          min={1}
                          value={formData.capacity || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined
                            setFormData((prev) => ({ ...prev, capacity: value }))
                          }}
                          placeholder={t('events:settings.capacity_placeholder')}
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
                    {t('events:settings.registration_management')}
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
                          {t('events:settings.auto_approve')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.auto_approve_hint')}
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
                          {t('events:settings.require_email_verification')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.email_verification_hint')}
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
                    {t('events:settings.email_notifications')}
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
                          {t('events:settings.confirmation_email')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.confirmation_email_hint')}
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
                          {t('events:settings.approval_email')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.approval_email_hint')}
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
                          {t('events:settings.reminder_email')}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('events:settings.reminder_email_hint')}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de danger */}
        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border-2 border-red-200 dark:border-red-800 p-6">
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-400 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('events:settings.danger_zone')}
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-red-800 dark:text-red-300">
              {t('events:settings.delete_warning')}
            </p>

            {deleteStep === 0 && (
              <Button
                variant="outline"
                onClick={() => setDeleteStep(1)}
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                {t('events:settings.delete_event')}
              </Button>
            )}

            {deleteStep === 1 && (
              <div className="space-y-3 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <p className="font-medium text-red-900 dark:text-red-300">
                  {t('events:settings.delete_confirm_message', { name: event.name })}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteStep(0)}
                    size="sm"
                  >
                    {t('common:app.cancel')}
                  </Button>
                  <Button
                    onClick={() => setDeleteStep(2)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {t('events:settings.yes_continue')}
                  </Button>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="space-y-3 p-4 bg-red-200 dark:bg-red-900/30 rounded-lg border-2 border-red-400 dark:border-red-700">
                <p className="font-bold text-red-900 dark:text-red-300">
                  {t('events:settings.last_confirmation')}
                </p>
                <p className="text-sm text-red-800 dark:text-red-300">
                  {t('events:settings.delete_irreversible')}
                </p>
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  {t('events:settings.confirm_delete_message', { name: event.name })}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteStep(0)}
                    size="sm"
                  >
                    {t('common:app.cancel')}
                  </Button>
                  <Button
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                    size="sm"
                    className="bg-red-700 hover:bg-red-800 text-white"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                  >
                    {isDeleting ? t('common:app.deleting') : t('events:settings.confirm_delete')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde flottant via Portal */}
      {showSaveButton && createPortal(
        <div 
          className={`fixed bottom-6 right-6 z-50 ${isExiting ? 'animate-slide-down' : 'animate-slide-up'}`}
          style={{
            marginLeft: typeof window !== 'undefined' && localStorage.getItem('sidebarOpen') === 'false' ? '4rem' : '16rem'
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-300 dark:border-amber-600 shadow-2xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                {t('events:settings.unsaved_changes')}
              </p>
            </div>
            <Button
              onClick={() => handleSaveChanges()}
              disabled={isUpdating}
              leftIcon={<Save className="h-4 w-4" />}
              className="whitespace-nowrap">
              {isUpdating ? t('common:app.saving') : t('common:app.save')}
            </Button>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de confirmation de navigation */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 transform transition-all">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('events:settings.unsaved_title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('events:settings.unsaved_description')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleStay}
                    className="order-3 sm:order-1"
                  >
                    {t('common:app.back')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLeave}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 order-2 sm:order-2"
                  >
                    {t('events:settings.leave')}
                  </Button>
                  <Button
                    onClick={handleSaveAndLeave}
                    disabled={isUpdating}
                    className="order-1 sm:order-3"
                  >
                    {isUpdating ? t('common:app.saving') : t('common:app.save')}
                  </Button>
                </div>
              </div>
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
                {t('events:settings.event_deleted_success')}
              </h3>

              {/* Message détaillé */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {deleteResult.message}
                </p>
                
                {deleteResult.type === 'hard' ? (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('events:settings.hard_delete')}
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('events:settings.soft_delete')}
                  </div>
                )}
              </div>

              {/* Message de redirection */}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('events:settings.redirecting')}
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
    </>
  )
}
