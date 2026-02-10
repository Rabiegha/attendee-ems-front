import React, { useState, useEffect, useCallback } from 'react'
import {
  GripVertical,
  Trash2,
  Plus,
  X,
  Undo2,
  Redo2,
  RotateCcw,
  Columns,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PredefinedFieldTemplate, PREDEFINED_FIELDS } from './FormFieldLibrary'
import { CustomFieldCreator } from './CustomFieldCreator'
import type { FormField as FormFieldType, CreateCustomFieldData, CustomField, StandardField, CustomFieldValidation } from './types'
import { isCustomField, isStandardField } from './types'
import { v4 as uuidv4 } from 'uuid'

// Export le type FormField pour compatibilité
export type FormField = FormFieldType

export interface FormConfig {
  fields: FormField[]
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
}

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
  isDarkMode?: boolean
  onConfigChange?: (config: {
    submitButtonText?: string
    submitButtonColor?: string
    showTitle?: boolean
    showDescription?: boolean
    isDarkMode?: boolean
  }) => void
  className?: string
  eventId?: string
  onFieldDelete?: (fieldId: string) => Promise<{ affectedCount: number; canDelete: boolean }>
}

// Champs obligatoires qui ne peuvent pas être supprimés
const MANDATORY_FIELDS = ['first_name', 'last_name', 'email']

// Champs dont le statut required est verrouillé (toujours required)
const REQUIRED_LOCKED_FIELDS = ['email']

// Vérifie si un champ est obligatoire (non supprimable)
const isMandatoryField = (field: FormField): boolean => {
  // Vérifier d'abord si c'est un champ standard
  if (isStandardField(field)) {
    const isMandatory = MANDATORY_FIELDS.some(mandatoryKey => field.key === mandatoryKey)
    console.log('🔒 isMandatoryField check (standard):', { fieldKey: field.key, fieldLabel: field.label, isMandatory })
    return isMandatory
  }
  // Fallback: vérifier si le champ a une clé qui correspond (pour les anciens champs)
  if ('key' in field) {
    const isMandatory = MANDATORY_FIELDS.includes((field as any).key)
    console.log('🔒 isMandatoryField check (legacy):', { fieldKey: (field as any).key, fieldLabel: field.label, isMandatory })
    return isMandatory
  }
  return false // Les champs custom ne sont jamais mandatory
}

// Vérifie si le statut required d'un champ est verrouillé
const isRequiredLocked = (field: FormField): boolean => {
  // Vérifier d'abord si c'est un champ standard
  if (isStandardField(field)) {
    const isLocked = REQUIRED_LOCKED_FIELDS.some(lockedKey => field.key === lockedKey)
    console.log('🔐 isRequiredLocked check (standard):', { fieldKey: field.key, fieldLabel: field.label, isLocked })
    return isLocked
  }
  // Fallback: vérifier si le champ a une clé qui correspond (pour les anciens champs)
  if ('key' in field) {
    const isLocked = REQUIRED_LOCKED_FIELDS.includes((field as any).key)
    console.log('🔐 isRequiredLocked check (legacy):', { fieldKey: (field as any).key, fieldLabel: field.label, isLocked })
    return isLocked
  }
  return false
}

// Composant pour un champ draggable et sortable
interface SortableFieldItemProps {
  field: FormField
  onRemove: () => void
  onEdit?: () => void
  onToggleWidth: () => void
  onToggleRequired: () => void
  onToggleVisibility?: () => void
  isRemoveDisabled?: boolean
  isRequiredDisabled?: boolean
  isVisibilityDisabled?: boolean
  children: React.ReactNode
}

const SortableFieldItem: React.FC<SortableFieldItemProps> = ({
  field,
  onRemove,
  onEdit,
  onToggleWidth,
  onToggleRequired,
  onToggleVisibility,
  isRemoveDisabled = false,
  isRequiredDisabled = false,
  isVisibilityDisabled = false,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? 'none' : 'auto',
  } as React.CSSProperties

  const Icon = 'icon' in field ? field.icon : undefined
  const isHidden = field.visibleInPublicForm === false

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-800 border-2 rounded-lg p-3 transition-all ${
        isDragging
          ? 'border-dashed border-gray-300 dark:border-gray-600'
          : isHidden
          ? 'border-gray-200 dark:border-gray-700 opacity-60'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      } ${field.width === 'half' ? 'col-span-1' : 'col-span-2'}`}
    >
      {/* Header avec icône, label et actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          {/* Icon & Label */}
          {Icon && <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className={`font-medium text-sm truncate ${isHidden ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
            {field.label}
          </span>
          {field.required && !isHidden && (
            <span className="text-red-500 text-xs">*</span>
          )}
          {isHidden && (
            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2">
              Masqué
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onToggleRequired}
            disabled={isRequiredDisabled}
            className={`p-1.5 rounded transition-colors ${
              field.required
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
            } ${isRequiredDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              isRequiredDisabled
                ? 'Ce champ doit être obligatoire'
                : field.required
                ? 'Champ obligatoire'
                : 'Champ facultatif'
            }
          >
            <AlertCircle className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggleWidth}
            className={`p-1.5 rounded transition-colors ${
              field.width === 'half'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }`}
            title={field.width === 'half' ? 'Pleine largeur' : 'Split 50%'}
          >
            <Columns className="h-4 w-4" />
          </button>
          
          {onToggleVisibility && (
            <button
              type="button"
              onClick={onToggleVisibility}
              disabled={isVisibilityDisabled}
              className={`p-1.5 rounded transition-colors ${
                isHidden
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
              } ${isVisibilityDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              title={
                 isVisibilityDisabled ? 'La visibilité de ce champ ne peut pas être modifiée' :
                 isHidden ? 'Afficher le champ' : 'Masquer le champ'
              }
            >
              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded transition-colors text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              title="Modifier"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            disabled={isRemoveDisabled}
            className={`p-1.5 rounded transition-colors ${
              isRemoveDisabled
                ? 'opacity-30 cursor-not-allowed text-gray-300 dark:text-gray-600'
                : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
            title={isRemoveDisabled ? 'Ce champ ne peut pas être supprimé' : 'Supprimer'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Field Content - prend toute la largeur */}
      <div className={`w-full ${isHidden ? 'opacity-50 pointer-events-none' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onChange,
  submitButtonText = "S'inscrire",
  submitButtonColor = '#4F46E5',
  showTitle = true,
  showDescription = true,
  isDarkMode = false,
  onConfigChange,
  className = '',
  eventId,
  onFieldDelete,
}) => {
  const [newOptions, setNewOptions] = useState<Record<string, string>>({})
  const [customColor, setCustomColor] = useState<string>(submitButtonColor)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showCustomFieldCreator, setShowCustomFieldCreator] = useState(false)
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null)
  const [deleteAffectedCount, setDeleteAffectedCount] = useState<number>(0)

  // Undo/Redo History
  const [history, setHistory] = useState<FormField[][]>([fields])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [isUpdatingFromHistory, setIsUpdatingFromHistory] = useState(false)

  // Séparer les champs standard et custom
  const standardFields = React.useMemo(() => fields.filter(isStandardField), [fields])
  const customFields = React.useMemo(() => fields.filter(isCustomField), [fields])

  // Calculer les champs disponibles (non encore ajoutés)
  const availableFields = React.useMemo(() => {
    const usedKeys = new Set(standardFields.map(f => f.key))
    return PREDEFINED_FIELDS.filter(
      // Exclure attendee_type ET gdpr_consent (champs spéciaux non configurables)
      (field) => field.key !== 'attendee_type' && field.key !== 'gdpr_consent' && !usedKeys.has(field.key)
    )
  }, [standardFields])

  // Update history when fields change externally (not from undo/redo)
  useEffect(() => {
    if (!isUpdatingFromHistory && fields.length > 0) {
      const lastHistoryEntry = history[historyIndex]
      const fieldsChanged =
        JSON.stringify(lastHistoryEntry) !== JSON.stringify(fields)

      if (fieldsChanged && lastHistoryEntry) {
        setHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1)
          newHistory.push(fields)
          return newHistory.slice(-50) // Keep last 50 entries
        })
        setHistoryIndex((prev) => Math.min(prev + 1, 49))
      }
    }
    setIsUpdatingFromHistory(false)
  }, [fields, history, historyIndex, isUpdatingFromHistory])

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setIsUpdatingFromHistory(true)
      const historyEntry = history[newIndex]
      if (historyEntry) {
        onChange(historyEntry)
      }
    }
  }, [historyIndex, history, onChange])

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setIsUpdatingFromHistory(true)
      const historyEntry = history[newIndex]
      if (historyEntry) {
        onChange(historyEntry)
      }
    }
  }, [historyIndex, history, onChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  const handleAddField = (fieldKey: string) => {
    const template = PREDEFINED_FIELDS.find((f) => f.key === fieldKey)
    if (!template) return

    const newId = `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Convert validation: RegExp → string
    let validation: CustomFieldValidation | undefined
    if (template.validation) {
      const { pattern, ...rest } = template.validation
      validation = {
        ...rest,
        ...(pattern && { pattern: typeof pattern === 'string' ? pattern : pattern.source })
      }
    }
    
    const newField: FormField = {
      type: 'standard',
      id: newId,
      order: fields.length,
      width: 'full',
      label: template.label,
      fieldType: template.type as 'text' | 'email' | 'phone' | 'textarea',
      required: template.required ?? false,
      visibleInPublicForm: template.visibleInPublicForm ?? true,
      visibleInAdminForm: template.visibleInAdminForm ?? true,
      visibleInAttendeeTable: template.visibleInAttendeeTable ?? true,
      visibleInExport: template.visibleInExport ?? true,
      ...(template.placeholder && { placeholder: template.placeholder }),
      ...(template.description && { description: template.description }),
      ...(template.key && { key: template.key }),
      ...(template.attendeeField && { attendeeField: template.attendeeField }),
      ...(template.registrationField && { registrationField: template.registrationField }),
      ...(template.storeInAnswers && { storeInAnswers: template.storeInAnswers }),
      ...(template.icon && { icon: template.icon }),
      ...(template.category && { category: template.category }),
      ...(validation && { validation }),
      ...(template.options && { options: template.options }),
      ...(template.optionsKey && { optionsKey: template.optionsKey }),
      ...(template.helpText && { helpText: template.helpText }),
      ...(template.isSystemField && { isSystemField: template.isSystemField }),
    }
    onChange([...fields, newField])
  }

  const handleSaveCustomField = (data: CreateCustomFieldData, fieldId?: string) => {
    if (fieldId) {
      // Mode édition: mettre à jour le champ existant
      onChange(
        fields.map((field) => {
          if (field.id === fieldId) {
            const updated: any = {
              ...field,
              fieldType: data.fieldType,
              label: data.label,
              required: data.required ?? false,
              width: data.width ?? field.width,
              visibleInPublicForm: data.visibleInPublicForm ?? true,
              visibleInAdminForm: data.visibleInAdminForm ?? true,
              visibleInAttendeeTable: data.visibleInAttendeeTable ?? true,
              visibleInExport: data.visibleInExport ?? true,
            }
            if (data.placeholder) updated.placeholder = data.placeholder
            if (data.description) updated.description = data.description
            if (data.checkboxText) updated.checkboxText = data.checkboxText
            if (data.options) updated.options = data.options
            if (data.validation) updated.validation = data.validation
            return updated
          }
          return field
        })
      )
      setEditingField(null)
    } else {
      // Mode création: ajouter un nouveau champ
      const newField: any = {
        id: uuidv4(),
        type: 'custom',
        fieldType: data.fieldType,
        label: data.label,
        required: data.required ?? false,
        order: fields.length,
        width: data.width ?? 'full',
        visibleInPublicForm: data.visibleInPublicForm ?? true,
        visibleInAdminForm: data.visibleInAdminForm ?? true,
        visibleInAttendeeTable: data.visibleInAttendeeTable ?? true,
        visibleInExport: data.visibleInExport ?? true,
        createdAt: new Date().toISOString(),
      }
      if (data.placeholder) newField.placeholder = data.placeholder
      if (data.description) newField.description = data.description
      if (data.checkboxText) newField.checkboxText = data.checkboxText
      if (data.options) newField.options = data.options
      if (data.validation) newField.validation = data.validation
      onChange([...fields, newField as CustomField])
    }
  }

  const handleRemoveField = async (fieldId: string) => {
    const fieldToRemove = fields.find((f) => f.id === fieldId)
    
    console.log('🗑️ handleRemoveField called for:', fieldId, fieldToRemove)
    
    // Empêcher la suppression des champs obligatoires
    if (fieldToRemove && isMandatoryField(fieldToRemove)) {
      console.log('❌ Cannot delete mandatory field')
      return
    }
    
    // Pour les champs custom, vérifier s'il y a des données existantes
    if (fieldToRemove && isCustomField(fieldToRemove) && onFieldDelete && eventId) {
      console.log('🔍 Checking for existing data...', { eventId, fieldId, hasCallback: !!onFieldDelete })
      try {
        const result = await onFieldDelete(fieldId)
        console.log('📊 Field data check result:', result)
        
        if (result.affectedCount > 0) {
          // Il y a des données, montrer le modal de confirmation
          console.log('⚠️ Found data, showing modal')
          setDeleteFieldId(fieldId)
          setDeleteAffectedCount(result.affectedCount)
          return
        }
        console.log('✅ No data found, proceeding with deletion')
      } catch (error) {
        console.error('❌ Error checking field data:', error)
        // En cas d'erreur, continuer avec la suppression normale
      }
    } else {
      console.log('ℹ️ Skipping data check:', { 
        isCustom: fieldToRemove && isCustomField(fieldToRemove),
        hasCallback: !!onFieldDelete,
        hasEventId: !!eventId
      })
    }
    
    // Pas de données ou pas de vérification nécessaire, supprimer directement
    console.log('🗑️ Performing field deletion')
    performFieldDeletion(fieldId)
  }

  const performFieldDeletion = (fieldId: string) => {
    const updatedFields = fields
      .filter((f) => f.id !== fieldId)
      .map((f, index) => ({ ...f, order: index }))
    onChange(updatedFields)
    setDeleteFieldId(null)
  }

  const handleConfirmDelete = () => {
    if (deleteFieldId) {
      performFieldDeletion(deleteFieldId)
    }
  }

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map((f) =>
      f.id === fieldId ? { ...f, ...updates } as FormField : f
    )
    onChange(updatedFields)
  }

  // Toggle field width between full and half
  const handleToggleWidth = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return

    const newWidth = field.width === 'half' ? 'full' : 'half'
    handleUpdateField(fieldId, { width: newWidth })
  }

  // Toggle field visibility
  const handleToggleVisibility = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return

    // Les champs obligatoires ne peuvent pas être masqués
    if (isMandatoryField(field)) {
      return
    }

    handleUpdateField(fieldId, { visibleInPublicForm: !field.visibleInPublicForm })
  }

  // Toggle field required status
  const handleToggleRequired = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return
    
    // Les champs avec required verrouillé ne peuvent pas changer
    if (isRequiredLocked(field)) {
      return
    }

    handleUpdateField(fieldId, { required: !field.required })
  }

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px pour éviter les drags accidentels
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)

      const reorderedFields = arrayMove(fields, oldIndex, newIndex).map(
        (f, index) => ({ ...f, order: index })
      )
      onChange(reorderedFields)
    }
    
    setActiveId(null)
  }

  const handleAddOption = (fieldId: string) => {
    const optionValue = newOptions[fieldId]?.trim()
    if (!optionValue) return

    const field = fields.find((f) => f.id === fieldId)
    if (!field || !('options' in field)) return

    const currentOptions = field.options || []
    const newOption = { value: optionValue, label: optionValue }

    handleUpdateField(fieldId, {
      options: [...currentOptions, newOption],
    })

    setNewOptions((prev) => ({ ...prev, [fieldId]: '' }))
  }

  const handleRemoveOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field || !('options' in field) || !field.options) return

    const newOptions = field.options.filter((_: any, idx: number) => idx !== optionIndex)
    handleUpdateField(fieldId, { options: newOptions })
  }

  const handleUpdateOption = (
    fieldId: string,
    optionIndex: number,
    newLabel: string
  ) => {
    const field = fields.find((f) => f.id === fieldId)
    if (!field || !('options' in field) || !field.options) return

    const updatedOptions = field.options.map((opt: any, idx: number) =>
      idx === optionIndex ? { value: newLabel, label: newLabel } : opt
    )
    handleUpdateField(fieldId, { options: updatedOptions })
  }

  // Reset to default fields
  const handleResetToDefault = () => {
    // Champs par défaut : Nom, Prénom, Email
    const firstNameTemplate = PREDEFINED_FIELDS.find(
      (f) => f.key === 'first_name'
    )
    const lastNameTemplate = PREDEFINED_FIELDS.find(
      (f) => f.key === 'last_name'
    )
    const emailTemplate = PREDEFINED_FIELDS.find((f) => f.key === 'email')

    if (!firstNameTemplate || !lastNameTemplate || !emailTemplate) {
      console.error('Templates par défaut introuvables')
      setShowResetConfirm(false)
      return
    }

    // Convert validations: RegExp → string
    const convertValidation = (val: any): CustomFieldValidation | undefined => {
      if (!val) return undefined
      const { pattern, ...rest } = val
      return {
        ...rest,
        ...(pattern && { pattern: typeof pattern === 'string' ? pattern : pattern.source })
      }
    }

    const lastValidation = convertValidation(lastNameTemplate.validation)
    const firstValidation = convertValidation(firstNameTemplate.validation)
    const emailValidation = convertValidation(emailTemplate.validation)

    const defaultFields: FormField[] = [
      {
        type: 'standard',
        id: `field_${Date.now()}_lastname`,
        order: 0,
        width: 'half',
        required: true,
        label: lastNameTemplate.label,
        fieldType: 'text' as const,
        visibleInPublicForm: lastNameTemplate.visibleInPublicForm ?? true,
        visibleInAdminForm: lastNameTemplate.visibleInAdminForm ?? true,
        visibleInAttendeeTable: lastNameTemplate.visibleInAttendeeTable ?? true,
        visibleInExport: lastNameTemplate.visibleInExport ?? true,
        ...(lastNameTemplate.placeholder && { placeholder: lastNameTemplate.placeholder }),
        ...(lastNameTemplate.key && { key: lastNameTemplate.key }),
        ...(lastNameTemplate.attendeeField && { attendeeField: lastNameTemplate.attendeeField }),
        ...(lastNameTemplate.icon && { icon: lastNameTemplate.icon }),
        ...(lastNameTemplate.category && { category: lastNameTemplate.category }),
        ...(lastValidation && { validation: lastValidation }),
      },
      {
        type: 'standard',
        id: `field_${Date.now() + 1}_firstname`,
        order: 1,
        width: 'half',
        required: true,
        label: firstNameTemplate.label,
        fieldType: 'text' as const,
        visibleInPublicForm: firstNameTemplate.visibleInPublicForm ?? true,
        visibleInAdminForm: firstNameTemplate.visibleInAdminForm ?? true,
        visibleInAttendeeTable: firstNameTemplate.visibleInAttendeeTable ?? true,
        visibleInExport: firstNameTemplate.visibleInExport ?? true,
        ...(firstNameTemplate.placeholder && { placeholder: firstNameTemplate.placeholder }),
        ...(firstNameTemplate.key && { key: firstNameTemplate.key }),
        ...(firstNameTemplate.attendeeField && { attendeeField: firstNameTemplate.attendeeField }),
        ...(firstNameTemplate.icon && { icon: firstNameTemplate.icon }),
        ...(firstNameTemplate.category && { category: firstNameTemplate.category }),
        ...(firstValidation && { validation: firstValidation }),
      },
      {
        type: 'standard',
        id: `field_${Date.now() + 2}_email`,
        order: 2,
        width: 'full',
        required: true,
        label: emailTemplate.label,
        fieldType: 'email' as const,
        visibleInPublicForm: emailTemplate.visibleInPublicForm ?? true,
        visibleInAdminForm: emailTemplate.visibleInAdminForm ?? true,
        visibleInAttendeeTable: emailTemplate.visibleInAttendeeTable ?? true,
        visibleInExport: emailTemplate.visibleInExport ?? true,
        ...(emailTemplate.placeholder && { placeholder: emailTemplate.placeholder }),
        ...(emailTemplate.key && { key: emailTemplate.key }),
        ...(emailTemplate.attendeeField && { attendeeField: emailTemplate.attendeeField }),
        ...(emailTemplate.icon && { icon: emailTemplate.icon }),
        ...(emailTemplate.category && { category: emailTemplate.category }),
        ...(emailValidation && { validation: emailValidation }),
      },
    ]

    onChange(defaultFields)
    setShowResetConfirm(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Champs du formulaire
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {fields.length} champ{fields.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Undo/Redo/Reset Buttons */}
        <div className="flex items-center space-x-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

          {/* Reset Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Réinitialiser le formulaire"
          >
            <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Add Field Dropdown */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
        <label className="block text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-2">
          ➕ Ajouter un champ standard
        </label>
        {availableFields.length > 0 ? (
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddField(e.target.value)
                e.target.value = ''
              }
            }}
            className="w-full px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Choisir un type de champ --</option>
            {availableFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label} ({field.type})
              </option>
            ))}
          </select>
        ) : (
          <div className="px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
            ✅ Tous les champs prédéfinis ont été ajoutés
          </div>
        )}
      </div>

      {/* Custom Fields Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <label className="text-sm font-medium text-purple-900 dark:text-purple-200">
              Champs personnalisés
            </label>
          </div>
          {customFields.length > 0 && (
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {customFields.length} champ{customFields.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowCustomFieldCreator(true)}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Créer un champ personnalisé
        </button>
        <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
          Créez des champs illimités : texte, nombre, date, liste, etc.
        </p>
      </div>

      {/* Field List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
            Aucun champ
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Ajoutez des champs ci-dessus
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-2 gap-3 auto-rows-min">
              {fields.map((field) => {
                const onEditHandler = field.type === 'custom' ? () => setEditingField(field) : undefined
                return (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    onRemove={() => handleRemoveField(field.id)}
                    {...(onEditHandler && { onEdit: onEditHandler })}
                    onToggleWidth={() => handleToggleWidth(field.id)}
                    onToggleRequired={() => handleToggleRequired(field.id)}
                    onToggleVisibility={() => handleToggleVisibility(field.id)}
                    isRemoveDisabled={isMandatoryField(field)}
                    isRequiredDisabled={isRequiredLocked(field)}
                    isVisibilityDisabled={isMandatoryField(field)}
                  >
                    {/* Field Content */}
                    <div className="space-y-3">
                    {/* Label & Placeholder */}
                    <div className={field.width === 'full' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Label{' '}
                          <span className="text-gray-400">(optionnel)</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Laisser vide si non utilisé"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Placeholder
                        </label>
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Ex: Votre nom"
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Description{' '}
                        <span className="text-gray-400">(texte d'aide sous le champ)</span>
                      </label>
                      <textarea
                        value={field.description || ''}
                        onChange={(e) =>
                          handleUpdateField(field.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Ex: Vous trouverez cette information sur votre badge"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="capitalize font-medium">
                        {('key' in field && field.key === 'event_attendee_type_id') ? 'Type de participant' : field.type}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{'key' in field ? field.key : field.id}</span>
                      {field.required && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            Obligatoire
                          </span>
                        </>
                      )}
                    </div>

                    {/* Attendee Type Info */}
                    {('key' in field && field.key === 'event_attendee_type_id') && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                        ℹ️ Ce champ affichera automatiquement la liste des types de participants configurés dans l'onglet "Types de participants".
                      </div>
                    )}

                    {/* Options for Select Fields */}
                    {('options' in field) && (
                      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                          Options de choix
                        </label>
                        {field.options && field.options.length > 0 && (
                          <div className="space-y-1.5">
                            {field.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs text-gray-400">
                                  {optIdx + 1}.
                                </span>
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) =>
                                    handleUpdateOption(
                                      field.id,
                                      optIdx,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                  onClick={() =>
                                    handleRemoveOption(field.id, optIdx)
                                  }
                                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newOptions[field.id] || ''}
                            onChange={(e) =>
                              setNewOptions((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) =>
                            e.key === 'Enter' && handleAddOption(field.id)
                          }
                          placeholder="Ajouter une option..."
                          className="flex-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAddOption(field.id)}
                          className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          title="Ajouter"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                    </div>
                </SortableFieldItem>
                )
              })}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeId ? (
              <div className="bg-white dark:bg-gray-800 border-2 border-blue-400 rounded-lg p-3 shadow-2xl opacity-90">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-blue-500" />
                  {(() => {
                    const field = fields.find((f) => f.id === activeId)
                    const Icon = field && 'icon' in field ? field.icon : undefined
                    return Icon ? <Icon className="h-4 w-4 text-blue-600" /> : null
                  })()}
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {fields.find((f) => f.id === activeId)?.label || 'Champ'}
                  </span>
                  {fields.find((f) => f.id === activeId)?.width === 'half' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      50%
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Note RGPD */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
              Consentement RGPD automatique
            </h4>
            <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
              Un champ de consentement à la{' '}
              <a 
                href="/privacy-policy" 
                target="_blank"
                className="underline hover:text-green-900 dark:hover:text-green-100 font-medium"
              >
                Politique de Confidentialité
              </a>
              {' '}sera automatiquement ajouté en bas de tous les formulaires d'inscription. Ce champ est obligatoire et ne peut pas être modifié ou supprimé.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Affichage du formulaire
        </h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={showTitle}
              onChange={(e) =>
                onConfigChange?.({
                  submitButtonText,
                  submitButtonColor,
                  showTitle: e.target.checked,
                  showDescription,
                  isDarkMode,
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Afficher le titre de l'événement
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={showDescription}
              onChange={(e) =>
                onConfigChange?.({
                  submitButtonText,
                  submitButtonColor,
                  showTitle,
                  showDescription: e.target.checked,
                  isDarkMode,
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Afficher la description de l'événement
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={(e) =>
                onConfigChange?.({
                  submitButtonText,
                  submitButtonColor,
                  showTitle,
                  showDescription,
                  isDarkMode: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Mode sombre du formulaire
            </span>
          </label>
        </div>
      </div>

      {/* Submit Button Configuration */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Personnalisation du bouton
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={submitButtonText}
              onChange={(e) =>
                onConfigChange?.({
                  submitButtonText: e.target.value,
                  submitButtonColor,
                  showTitle,
                  showDescription,
                  isDarkMode,
                })
              }
              placeholder="Ex: S'inscrire maintenant"
              className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Couleur
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  onConfigChange?.({
                    submitButtonText,
                    submitButtonColor: e.target.value,
                    showTitle,
                    showDescription,
                    isDarkMode,
                  })
                }}
                className="w-12 h-9 rounded-lg border border-purple-300 dark:border-purple-600 cursor-pointer"
                title="Choisir une couleur"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomColor(value)
                  // Valider que c'est un code hexa valide avant de sauvegarder
                  if (/^#[0-9A-F]{6}$/i.test(value)) {
                    onConfigChange?.({
                      submitButtonText,
                      submitButtonColor: value,
                      showTitle,
                      showDescription,
                      isDarkMode,
                    })
                  }
                }}
                placeholder="#4F46E5"
                className="flex-1 px-3 py-2 text-sm font-mono border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Réinitialiser le formulaire ?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Cette action supprimera{' '}
                  <strong>tous les champs personnalisés</strong> et rétablira le
                  formulaire par défaut (Prénom, Nom, Email).
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Field Confirmation Modal */}
      {deleteFieldId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Supprimer ce champ ?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Nous avons détecté que <strong>{deleteAffectedCount} inscription(s)</strong> contiennent des données pour ce champ.
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                  ⚠️ En supprimant ce champ, toutes les données associées seront définitivement perdues.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setDeleteFieldId(null)
                  setDeleteAffectedCount(0)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer définitivement</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom Field Creator Modal */}
      <CustomFieldCreator
        open={showCustomFieldCreator || !!editingField}
        onClose={() => {
          setShowCustomFieldCreator(false)
          setEditingField(null)
        }}
        onSave={handleSaveCustomField}
        editingField={editingField}
      />
    </div>
  )
}
