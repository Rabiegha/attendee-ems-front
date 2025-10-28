import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner'
import type { CreateOrganizationRequest } from '../types'

const organizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

interface OrganizationFormProps {
  onSubmit: (data: CreateOrganizationRequest) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
}

export const OrganizationForm: React.FC<OrganizationFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel,
  submitLabel = "Créer l'organisation",
  cancelLabel = 'Annuler',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Éviter tirets multiples
      .trim()
  }

  const handleFormSubmit = async (data: OrganizationFormData) => {
    const slug = generateSlug(data.name)

    await onSubmit({
      name: data.name,
      slug: slug,
      timezone: 'Europe/Paris',
    })

    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormField
        label="Nom de l'organisation"
        error={errors.name?.message}
        required
      >
        <Input
          {...register('name')}
          placeholder="Ex: ACME Corporation"
          disabled={isLoading}
        />
      </FormField>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Informations automatiques
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Le slug sera généré automatiquement (ex: acme-corporation)</li>
          <li>• Le fuseau horaire sera défini sur Europe/Paris</li>
          <li>• L'organisation sera créée avec un plan par défaut</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{submitLabel}</span>
        </Button>
      </div>
    </form>
  )
}
