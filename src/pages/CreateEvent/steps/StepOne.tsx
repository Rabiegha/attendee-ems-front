/**
 * StepOne - Informations de base
 * - Nom de l'événement
 * - Description
 * - Dates de début et fin
 */

import { Input, Textarea, FormField } from '@/shared/ui'
import { CreateEventFormData } from '../index'
import { TagInput } from '@/features/tags'
import { useEventNameAvailability } from '@/features/events/hooks/useEventNameAvailability'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface StepOneProps {
  formData: CreateEventFormData
  updateFormData: (updates: Partial<CreateEventFormData>) => void
}

export function StepOne({ formData, updateFormData }: StepOneProps) {
  const { isChecking, isAvailable, errorMessage } = useEventNameAvailability(formData.name)

  const getNameValidationUI = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      return null
    }

    if (isChecking) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Vérification de la disponibilité...</span>
        </div>
      )
    }

    if (isAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-1">
          <CheckCircle2 className="h-4 w-4" />
          <span>Ce nom est disponible</span>
        </div>
      )
    }

    if (isAvailable === false || errorMessage) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-1">
          <XCircle className="h-4 w-4" />
          <span>{errorMessage || 'Ce nom n\'est pas disponible'}</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Informations de base
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Commencez par les informations essentielles de votre événement
        </p>
      </div>

      {/* Nom de l'événement */}
      <FormField label="Nom de l'événement" required>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Ex: Conférence annuelle 2024"
          required
          autoFocus
        />
        {getNameValidationUI()}
      </FormField>

      {/* Description */}
      <FormField 
        label="Description"
        hint="Optionnel - Décrivez brièvement votre événement"
      >
        <Textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateFormData({ description: e.target.value })}
          placeholder="Décrivez votre événement..."
          rows={4}
        />
      </FormField>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date de début */}
        <FormField label="Date et heure de début" required>
          <Input
            id="start_at"
            name="start_at"
            type="datetime-local"
            value={formData.start_at}
            onChange={(e) => updateFormData({ start_at: e.target.value })}
            required
          />
        </FormField>

        {/* Date de fin */}
        <FormField label="Date et heure de fin" required>
          <Input
            id="end_at"
            name="end_at"
            type="datetime-local"
            value={formData.end_at}
            onChange={(e) => updateFormData({ end_at: e.target.value })}
            min={formData.start_at}
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
          id="website_url"
          name="website_url"
          type="url"
          value={formData.website_url || ''}
          onChange={(e) => updateFormData({ website_url: e.target.value })}
          placeholder="https://example.com/mon-evenement"
        />
      </FormField>

      {/* Tags */}
      <FormField label="Tags">
        <TagInput
          value={formData.tags || []}
          onChange={(tags) => updateFormData({ tags })}
          placeholder="Ex: Technologie, Networking, Innovation"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Utilisez les tags pour catégoriser et filtrer vos événements
        </p>
      </FormField>

      {/* Info timezone */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <span className="font-medium">Fuseau horaire :</span> {formData.timezone}
        </p>
      </div>
    </div>
  )
}
