import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Select } from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Plus, X, GripVertical } from 'lucide-react'
import type {
  CustomFieldType,
  CreateCustomFieldData,
  FieldOption,
  FormField,
} from './types'
import { fieldTypeRequiresOptions } from './types'

const fieldTypeLabels: Record<CustomFieldType, string> = {
  text: 'Texte court',
  textarea: 'Texte long',
  number: 'Nombre',
  email: 'Email',
  phone: 'Téléphone',
  date: 'Date',
  select: 'Liste déroulante',
  radio: 'Choix unique',
  checkbox: 'Case à cocher',
  multiselect: 'Choix multiples',
}

// Fonction pour générer un slug à partir d'un label
const generateSlug = (label: string): string => {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '_') // Remplacer espaces et caractères spéciaux par _
    .replace(/^_+|_+$/g, '') // Supprimer _ au début et à la fin
}

const customFieldSchema = z.object({
  fieldType: z.enum([
    'text',
    'textarea',
    'number',
    'email',
    'phone',
    'date',
    'select',
    'radio',
    'checkbox',
    'multiselect',
  ]),
  label: z.string().min(1, 'Le label est requis'),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  checkboxText: z.string().optional(),
  required: z.boolean().default(false),
  
  // Validation
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.string().optional(), // String pour supporter date et number
  maxValue: z.string().optional(),
})

type CustomFieldFormData = z.infer<typeof customFieldSchema>

interface CustomFieldCreatorProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateCustomFieldData, fieldId?: string) => void
  editingField?: FormField | null
}

export const CustomFieldCreator: React.FC<CustomFieldCreatorProps> = ({
  open,
  onClose,
  onSave,
  editingField,
}) => {
  const [options, setOptions] = useState<FieldOption[]>([
    { label: '', value: '' },
  ])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CustomFieldFormData>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      fieldType: 'text',
      required: false,
    },
  })

  const fieldType = watch('fieldType')
  const showOptions = fieldTypeRequiresOptions(fieldType)

  // Pre-remplir le formulaire en mode édition ou réinitialiser en mode création
  useEffect(() => {
    if (editingField && open) {
      // Mode édition: pré-remplir avec les données du champ
      reset({
        fieldType: editingField.fieldType as CustomFieldType,
        label: editingField.label,
        placeholder: editingField.placeholder || '',
        description: editingField.description || '',
        checkboxText: (editingField as any).checkboxText || '',
        required: editingField.required,
        minLength: editingField.validation?.minLength,
        maxLength: editingField.validation?.maxLength,
        minValue: editingField.validation?.min,
        maxValue: editingField.validation?.max,
      })
      
      // Initialiser les options si le champ en a
      if (editingField.options && editingField.options.length > 0) {
        setOptions(editingField.options)
      } else {
        setOptions([{ label: '', value: '' }])
      }
    } else if (!editingField && open) {
      // Mode création: réinitialiser avec les valeurs par défaut
      reset({
        fieldType: 'text',
        label: '',
        placeholder: '',
        description: '',
        checkboxText: '',
        required: false,
        minLength: undefined,
        maxLength: undefined,
        minValue: undefined,
        maxValue: undefined,
      })
      setOptions([{ label: '', value: '' }])
    }
  }, [editingField, open, reset])

  const handleClose = () => {
    reset()
    setOptions([{ label: '', value: '' }])
    onClose()
  }

  const onSubmit = (data: CustomFieldFormData) => {
    // Validation spéciale pour les dates
    if (data.fieldType === 'date' && data.minValue && data.maxValue) {
      const minDate = new Date(data.minValue as string)
      const maxDate = new Date(data.maxValue as string)
      if (minDate >= maxDate) {
        alert('La date maximale doit être supérieure à la date minimale')
        return
      }
    }

    const validation: any = {}
    
    if (data.minLength) validation.minLength = data.minLength
    if (data.maxLength) validation.maxLength = data.maxLength
    if (data.minValue) validation.min = data.minValue
    if (data.maxValue) validation.max = data.maxValue

    const fieldData: CreateCustomFieldData = {
      fieldType: data.fieldType,
      label: data.label,
      required: data.required,
      width: 'full', // Toujours pleine largeur par défaut
      // Visibilité : garder la valeur existante en édition, ou true par défaut en création
      visibleInPublicForm: editingField?.visibleInPublicForm ?? true,
      visibleInAdminForm: editingField?.visibleInAdminForm ?? true,
      visibleInAttendeeTable: editingField?.visibleInAttendeeTable ?? true,
      visibleInExport: editingField?.visibleInExport ?? true,
    }

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (data.placeholder) {
      fieldData.placeholder = data.placeholder
    }
    if (data.description) {
      fieldData.description = data.description
    }
    if (data.checkboxText && data.fieldType === 'checkbox') {
      ;(fieldData as any).checkboxText = data.checkboxText
    }

    // Ajouter les options si nécessaire
    if (showOptions) {
      const validOptions = options.filter(opt => opt.label && opt.value)
      if (validOptions.length > 0) {
        fieldData.options = validOptions
      }
    }

    // Ajouter la validation si des règles sont définies
    if (Object.keys(validation).length > 0) {
      fieldData.validation = validation
    }

    // Passer l'id du champ si on est en mode édition
    onSave(fieldData, editingField?.id)
    handleClose()
  }

  const addOption = () => {
    setOptions([...options, { label: '', value: '' }])
  }

  const removeOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    const option = newOptions[index]
    if (option) {
      option.label = value
      option.value = generateSlug(value)
      setOptions(newOptions)
    }
  }

  return (
    <Modal 
      isOpen={open} 
      onClose={handleClose}
      title={editingField ? "Modifier le champ personnalisé" : "Créer un champ personnalisé"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">{/* Type de champ */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type de champ *
          </label>
          <Select
            {...register('fieldType')}
            onChange={(e) => setValue('fieldType', e.target.value as CustomFieldType)}
            value={watch('fieldType')}
          >
            {Object.entries(fieldTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {/* Label */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Label *
          </label>
          <Input
            id="label"
            {...register('label')}
            placeholder="Ex: Numéro de badge"
          />
          {errors.label && (
            <p className="text-sm text-red-500">{errors.label.message}</p>
          )}
        </div>

        {/* Placeholder */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Placeholder
          </label>
          <Input
            id="placeholder"
            {...register('placeholder')}
            placeholder="Texte d'aide dans le champ"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Texte d'aide sous le champ"
            rows={2}
          />
        </div>

        {/* Texte de la case à cocher */}
        {fieldType === 'checkbox' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Texte à côté de la case *
            </label>
            <Input
              id="checkboxText"
              {...register('checkboxText')}
              placeholder="Ex: J'accepte les conditions"
            />
            {errors.checkboxText && (
              <p className="text-red-500 text-xs">{errors.checkboxText.message}</p>
            )}
          </div>
        )}

        {/* Options (pour select, radio, multiselect) */}
        {showOptions && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Options *
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Titre de l'option"
                    value={option.label}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1"
                  />
                  {option.value && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">({option.value})</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={options.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une option
            </Button>
          </div>
        )}

        {/* Validation - afficher uniquement si le type de champ supporte la validation */}
        {['text', 'textarea', 'number', 'date'].includes(fieldType) && (
          <div className="space-y-4 border-t pt-4 dark:border-gray-700">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white">Validation (optionnelle)</h4>
            <div className="grid grid-cols-2 gap-4">
              {['text', 'textarea'].includes(fieldType) && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Longueur minimale
                  </label>
                  <Input
                    id="minLength"
                    type="number"
                    placeholder="Ex: 3"
                    {...register('minLength', { 
                      setValueAs: v => v === '' ? undefined : parseInt(v, 10)
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Longueur maximale
                  </label>
                  <Input
                    id="maxLength"
                    type="number"
                    placeholder="Ex: 100"
                    {...register('maxLength', { 
                      setValueAs: v => v === '' ? undefined : parseInt(v, 10)
                    })}
                  />
                </div>
              </>
            )}

            {fieldType === 'number' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valeur minimale
                  </label>
                  <Input
                    id="minValue"
                    type="number"
                    placeholder="Ex: 0"
                    {...register('minValue')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valeur maximale
                  </label>
                  <Input
                    id="maxValue"
                    type="number"
                    placeholder="Ex: 100"
                    {...register('maxValue')}
                  />
                </div>
              </>
            )}

            {fieldType === 'date' && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date minimale
                  </label>
                  <Input
                    id="minValue"
                    type="date"
                    {...register('minValue')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date maximale
                  </label>
                  <Input
                    id="maxValue"
                    type="date"
                    min={watch('minValue') || undefined}
                    {...register('maxValue')}
                  />
                  {watch('minValue') && watch('maxValue') && watch('minValue') >= watch('maxValue') && (
                    <p className="text-red-500 text-xs">La date maximale doit être après la date minimale</p>
                  )}
                </div>
</>
            )}
            </div>
          </div>
        )}

        {/* Champ obligatoire */}
        <div className="border-t pt-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Checkbox
              id="required"
              checked={watch('required')}
              onChange={(e) => setValue('required', e.target.checked)}
            />
            <label htmlFor="required" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Champ obligatoire
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="submit">
            {editingField ? 'Enregistrer' : 'Créer le champ'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
