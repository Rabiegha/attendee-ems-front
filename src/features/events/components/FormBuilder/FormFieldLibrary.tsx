/**
 * Bibliothèque de champs prédéfinis pour le constructeur de formulaire
 * Ces champs sont mappés aux bonnes colonnes de la base de données
 */

import {
  Mail,
  User,
  Phone,
  Building2,
  Briefcase,
  Globe,
  MessageSquare,
  List,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { FormFieldConfig } from '@/features/registrations/config/formFields.config'

export interface PredefinedFieldTemplate extends FormFieldConfig {
  id: string
  icon: LucideIcon
  category: 'identity' | 'contact' | 'professional' | 'event' | 'custom'
  description: string
}

/**
 * BIBLIOTHÈQUE DES CHAMPS PRÉDÉFINIS
 * Ces champs sont mappés aux colonnes de la base de données
 */
export const PREDEFINED_FIELDS: PredefinedFieldTemplate[] = [
  // ===== CATÉGORIE : IDENTITÉ =====
  {
    id: 'first_name',
    key: 'first_name',
    label: 'Prénom',
    placeholder: 'Jean',
    type: 'text',
    icon: User,
    category: 'identity',
    description: 'Prénom du participant',
    required: true,
    attendeeField: 'firstName',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      message: 'Le prénom doit contenir entre 2 et 50 caractères',
    },
  },
  {
    id: 'last_name',
    key: 'last_name',
    label: 'Nom',
    placeholder: 'Dupont',
    type: 'text',
    icon: User,
    category: 'identity',
    description: 'Nom de famille du participant',
    required: true,
    attendeeField: 'lastName',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      message: 'Le nom doit contenir entre 2 et 50 caractères',
    },
  },

  // ===== CATÉGORIE : CONTACT =====
  {
    id: 'email',
    key: 'email',
    label: 'Email',
    placeholder: 'exemple@entreprise.com',
    type: 'email',
    icon: Mail,
    category: 'contact',
    description: 'Adresse email du participant (unique)',
    required: true,
    attendeeField: 'email',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Veuillez saisir une adresse email valide',
    },
  },
  {
    id: 'phone',
    key: 'phone',
    label: 'Téléphone',
    placeholder: '+33 6 12 34 56 78',
    type: 'phone',
    icon: Phone,
    category: 'contact',
    description: 'Numéro de téléphone du participant',
    required: false,
    attendeeField: 'phone',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },

  // ===== CATÉGORIE : PROFESSIONNEL =====
  {
    id: 'company',
    key: 'company',
    label: 'Organisation',
    placeholder: 'Nom de votre entreprise',
    type: 'text',
    icon: Building2,
    category: 'professional',
    description: "Nom de l'entreprise ou organisation",
    required: false,
    attendeeField: 'company',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    id: 'job_title',
    key: 'job_title',
    label: 'Désignation / Poste',
    placeholder: 'Directeur Marketing',
    type: 'text',
    icon: Briefcase,
    category: 'professional',
    description: 'Fonction ou titre professionnel',
    required: false,
    attendeeField: 'jobTitle',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    id: 'country',
    key: 'country',
    label: 'Pays',
    placeholder: 'France',
    type: 'country',
    icon: Globe,
    category: 'professional',
    description: 'Pays de résidence',
    required: false,
    attendeeField: 'country',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },

  // ===== CATÉGORIE : ÉVÉNEMENT =====
  {
    id: 'attendee_type',
    key: 'attendee_type',
    label: 'Type de participant',
    placeholder: 'Sélectionnez un type',
    type: 'attendee_type',
    icon: Users,
    category: 'event',
    description:
      'Type de participant (Staff, Partenaire, Invité...) - Réservé aux administrateurs',
    required: false,
    registrationField: 'eventAttendeeTypeId',
    visibleInPublicForm: false, // ❌ Jamais visible pour le public
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    adminOnly: true,
  },
  {
    id: 'attendance_type',
    key: 'attendance_type',
    label: 'Mode de participation',
    placeholder: 'Sélectionnez le mode',
    type: 'select',
    icon: Users,
    category: 'event',
    description: "Mode de participation à l'événement",
    required: false,
    registrationField: 'attendanceType',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false,
    visibleInExport: true,
    options: [
      { value: 'onsite', label: 'Présentiel' },
      { value: 'online', label: 'En ligne' },
      { value: 'hybrid', label: 'Hybride' },
    ],
  },

  // ===== CATÉGORIE : PERSONNALISÉ =====
  {
    id: 'comment',
    key: 'comment',
    label: 'Commentaire',
    placeholder: 'Informations complémentaires...',
    type: 'textarea',
    icon: MessageSquare,
    category: 'custom',
    description: 'Champ de texte libre pour commentaires',
    required: false,
    storeInAnswers: true,
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false,
    visibleInExport: true,
  },
]

/**
 * Catégories de champs pour l'organisation dans l'UI
 */
export const FIELD_CATEGORIES = [
  {
    id: 'identity',
    label: 'Identité',
    description: 'Informations personnelles du participant',
    icon: User,
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Coordonnées de contact',
    icon: Mail,
  },
  {
    id: 'professional',
    label: 'Professionnel',
    description: 'Informations professionnelles',
    icon: Briefcase,
  },
  {
    id: 'event',
    label: 'Événement',
    description: "Champs spécifiques à l'événement",
    icon: Users,
  },
  {
    id: 'custom',
    label: 'Personnalisé',
    description: 'Champs personnalisés',
    icon: List,
  },
] as const

/**
 * Obtenir les champs par catégorie
 */
export function getFieldsByCategory(
  category: string
): PredefinedFieldTemplate[] {
  return PREDEFINED_FIELDS.filter((field) => field.category === category)
}

/**
 * Obtenir un champ par son ID
 */
export function getFieldById(id: string): PredefinedFieldTemplate | undefined {
  return PREDEFINED_FIELDS.find((field) => field.id === id)
}

/**
 * Créer une instance de champ personnalisé
 */
export function createCustomField(
  type: 'text' | 'textarea' | 'select',
  label: string,
  key?: string
): PredefinedFieldTemplate {
  const generatedKey =
    key ||
    label
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

  const baseField: Partial<PredefinedFieldTemplate> = {
    id: `custom_${Date.now()}`,
    key: generatedKey,
    label,
    placeholder: `Saisissez ${label.toLowerCase()}`,
    type,
    icon: type === 'textarea' ? MessageSquare : type === 'select' ? List : User,
    category: 'custom',
    description: `Champ personnalisé : ${label}`,
    required: false,
    storeInAnswers: true,
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false,
    visibleInExport: true,
  }

  if (type === 'select') {
    return { ...baseField, options: [] } as PredefinedFieldTemplate
  }

  return baseField as PredefinedFieldTemplate
}
