import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Users } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { FormField } from '@/shared/ui/FormField'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { GooglePlacesAutocomplete } from '@/shared/ui/GooglePlacesAutocomplete'
import { createEventSchema, type CreateEventFormData } from '../lib/validation'
import { PartnerSelect } from './PartnerSelect'
import { TagInput } from '@/features/tags'

interface EventFormProps {
  initialData?: Partial<CreateEventFormData>
  onSubmit: (data: CreateEventFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [partnerIds, setPartnerIds] = useState<string[]>(
    initialData?.partnerIds || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      location: initialData?.location || '',
      maxAttendees: initialData?.maxAttendees || undefined, // Sans limite par défaut
      tags: initialData?.tags || [],
      partnerIds: initialData?.partnerIds || [],
    },
  })

  const watchStartDate = watch('startDate')

  // Gestion des tags via le composant TagInput
  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onFormSubmit = async (data: CreateEventFormData) => {
    try {
      await onSubmit({ ...data, tags, partnerIds })
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Nom de l'événement */}
      <FormField
        label="Nom de l'événement"
        error={errors.name?.message}
        required
      >
        <Input
          {...register('name')}
          placeholder="Conférence Tech 2024"
          leftIcon={<Calendar className="h-4 w-4" />}
          disabled={isLoading}
        />
      </FormField>

      {/* Description */}
      <FormField
        label="Description (optionnel)"
        error={errors.description?.message}
      >
        <Textarea
          {...register('description')}
          rows={4}
          placeholder="Décrivez votre événement en détail..."
          disabled={isLoading}
        />
      </FormField>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Date et heure de début"
          error={errors.startDate?.message}
          required
        >
          <Input
            type="datetime-local"
            {...register('startDate')}
            disabled={isLoading}
            min={new Date().toISOString().slice(0, 16)}
          />
        </FormField>

        <FormField
          label="Date et heure de fin"
          error={errors.endDate?.message}
          required
        >
          <Input
            type="datetime-local"
            {...register('endDate')}
            disabled={isLoading}
            min={watchStartDate || new Date().toISOString().slice(0, 16)}
          />
        </FormField>
      </div>

      {/* Lieu */}
      <FormField label="Lieu (optionnel)" error={errors.location?.message}>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <GooglePlacesAutocomplete
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="Rechercher une adresse..."
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
              disabled={isLoading}
            />
          )}
        />
      </FormField>

      {/* Capacité maximum */}
      <FormField
        label="Nombre maximum de participants"
        error={errors.maxAttendees?.message}
        hint="Laissez vide pour sans limite"
      >
        <Input
          type="number"
          min="1"
          max="10000"
          placeholder="Sans limite"
          {...register('maxAttendees', {
            setValueAs: (value: string) => {
              // Si vide ou non numérique, retourner undefined pour "sans limite"
              const num = parseInt(value, 10)
              return isNaN(num) || value === '' ? undefined : num
            },
          })}
          leftIcon={<Users className="h-4 w-4" />}
          disabled={isLoading}
        />
      </FormField>

      {/* Tags */}
      <FormField
        label="Tags (optionnel)"
        hint="Recherchez et sélectionnez des tags existants ou créez-en de nouveaux"
      >
        <TagInput
          value={tags}
          onChange={handleTagsChange}
          disabled={isLoading}
          maxTags={10}
        />
      </FormField>

      {/* Partenaires autorisés */}
      <FormField
        label="Partenaires autorisés (optionnel)"
        hint="Sélectionnez les partenaires qui auront accès à cet événement"
        error={errors.partnerIds?.message}
      >
        <PartnerSelect
          value={partnerIds}
          onChange={(newPartnerIds) => {
            setPartnerIds(newPartnerIds)
            setValue('partnerIds', newPartnerIds)
          }}
          disabled={isLoading}
        />
      </FormField>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>
            {mode === 'create' ? "Créer l'événement" : 'Mettre à jour'}
          </span>
        </Button>
      </div>
    </form>
  )
}

export default EventForm
