import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus, Calendar, MapPin, Users, Tag } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { FormField } from '@/shared/ui/FormField'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import { createEventSchema, type CreateEventFormData } from '../lib/validation'

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
  mode = 'create'
}) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [newTag, setNewTag] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      location: initialData?.location || '',
      maxAttendees: initialData?.maxAttendees || undefined, // Sans limite par défaut
      tags: initialData?.tags || []
    }
  })

  const watchStartDate = watch('startDate')

  // Gestion des tags
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      setValue('tags', updatedTags)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setValue('tags', updatedTags)
  }

  const onFormSubmit = async (data: CreateEventFormData) => {
    try {
      await onSubmit({ ...data, tags })
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
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            {...register('name')}
            placeholder="Conférence Tech 2024"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </FormField>

      {/* Description */}
      <FormField
        label="Description (optionnel)"
        error={errors.description?.message}
      >
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Décrivez votre événement en détail..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
      <FormField
        label="Lieu (optionnel)"
        error={errors.location?.message}
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            {...register('location')}
            placeholder="Centre de Conférences Paris"
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </FormField>

      {/* Capacité maximum */}
      <FormField
        label="Nombre maximum de participants"
        error={errors.maxAttendees?.message}
        hint="Laissez vide pour sans limite"
      >
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              }
            })}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
      </FormField>

      {/* Tags */}
      <FormField
        label="Tags (optionnel)"
        hint="Ajoutez des mots-clés pour catégoriser votre événement"
      >
        <div className="space-y-3">
          {/* Tags existants */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Ajouter un nouveau tag */}
          {tags.length < 10 && (
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
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
          <span>{mode === 'create' ? 'Créer l\'événement' : 'Mettre à jour'}</span>
        </Button>
      </div>
    </form>
  )
}

export default EventForm
