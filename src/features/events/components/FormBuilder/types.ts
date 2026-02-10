/**
 * Types pour les champs de formulaire custom
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Types de champs supportés pour les champs custom
 */
export type CustomFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multiselect'

/**
 * Option pour les champs à choix (select, radio, multiselect)
 */
export interface FieldOption {
  label: string
  value: string
}

/**
 * Validation pour un champ custom
 */
export interface CustomFieldValidation {
  min?: number              // Pour number/date
  max?: number
  minLength?: number        // Pour text/textarea
  maxLength?: number
  pattern?: string          // Regex pour validation avancée
  message?: string          // Message d'erreur personnalisé
}

/**
 * Champ standard (mappé à une colonne BDD)
 */
export interface StandardField {
  id: string
  type: 'standard'
  key?: string                    // 'first_name', 'email', etc.
  attendeeField?: string          // Nom de la colonne BDD
  registrationField?: string      // Pour les champs liés aux registrations
  storeInAnswers?: boolean        // Si true, stocké dans answers plutôt que dans attendee
  label: string
  placeholder?: string
  fieldType?: 'text' | 'email' | 'phone' | 'textarea'
  icon?: LucideIcon
  category?: 'identity' | 'contact' | 'professional' | 'event' | 'custom' | 'legal'
  description?: string
  required: boolean
  
  // Layout
  order: number
  width: 'full' | 'half'
  
  // Visibilité
  visibleInPublicForm: boolean
  visibleInAdminForm: boolean
  visibleInAttendeeTable: boolean
  visibleInExport: boolean
  
  // Validation
  validation?: CustomFieldValidation
  
  // Champ système
  isSystemField?: boolean
  
  // Pour les champs select personnalisés
  options?: FieldOption[]
  optionsKey?: string
  helpText?: string
}

/**
 * Champ personnalisé (stocké dans meta_data)
 */
export interface CustomField {
  id: string                     // UUID unique
  type: 'custom'
  fieldType: CustomFieldType
  label: string
  placeholder?: string
  description?: string           // Texte d'aide sous le champ
  checkboxText?: string          // Texte affiché à côté de la case à cocher
  required: boolean
  
  // Pour les champs à choix
  options?: FieldOption[]
  
  // Validation
  validation?: CustomFieldValidation
  
  // Layout
  order: number
  width: 'full' | 'half'
  
  // Visibilité
  visibleInPublicForm: boolean
  visibleInAdminForm: boolean
  visibleInAttendeeTable: boolean
  visibleInExport: boolean
  
  // Texte d'aide
  helpText?: string
  
  // Icon
  icon?: LucideIcon
  
  // Métadonnées
  createdAt?: string
  updatedAt?: string
}

/**
 * Union type pour tous les champs
 */
export type FormField = StandardField | CustomField

/**
 * Configuration complète du formulaire
 */
export interface FormConfig {
  fields: FormField[]
  submitButtonText?: string
  submitButtonColor?: string
  showTitle?: boolean
  showDescription?: boolean
  isDarkMode?: boolean
}

/**
 * Données pour créer un nouveau champ custom
 */
export interface CreateCustomFieldData {
  fieldType: CustomFieldType
  label: string
  placeholder?: string
  description?: string
  checkboxText?: string
  required?: boolean
  options?: FieldOption[]
  validation?: CustomFieldValidation
  width?: 'full' | 'half'
  visibleInPublicForm?: boolean
  visibleInAdminForm?: boolean
  visibleInAttendeeTable?: boolean
  visibleInExport?: boolean
}

/**
 * Type guard pour vérifier si un champ est custom
 */
export function isCustomField(field: FormField): field is CustomField {
  return field.type === 'custom'
}

/**
 * Type guard pour vérifier si un champ est standard
 */
export function isStandardField(field: FormField): field is StandardField {
  return field.type === 'standard'
}

/**
 * Vérifie si un type de champ nécessite des options
 */
export function fieldTypeRequiresOptions(fieldType: CustomFieldType): boolean {
  return ['select', 'radio', 'multiselect'].includes(fieldType)
}
