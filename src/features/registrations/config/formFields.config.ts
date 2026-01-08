/**
 * Configuration centralisée des champs de formulaire d'inscription
 * Utilisé pour : formulaires dynamiques, import/export Excel, validation
 */

export type FieldType =
  | 'text' // Texte court
  | 'email' // Email avec validation
  | 'phone' // Téléphone
  | 'textarea' // Texte long (commentaires)
  | 'select' // Liste déroulante
  | 'radio' // Boutons radio (choix unique)
  | 'country' // Sélecteur de pays
  | 'attendee_type' // Type de participant (Staff, Partenaire, Invité...)
  | 'checkbox' // Case à cocher (RGPD, consentements)

export interface FormFieldConfig {
  // Identifiants
  key: string // Clé unique pour le champ (nom de colonne Excel, nom de propriété)

  // Affichage
  label: string // Label affiché dans le formulaire
  placeholder?: string // Texte d'aide
  helpText?: string // Texte d'aide supplémentaire affiché sous le champ
  type: FieldType // Type de champ

  // Validation
  required?: boolean // Champ obligatoire ?
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    message?: string
  }

  // Comportement
  visibleInPublicForm?: boolean // Visible pour les inscriptions publiques ?
  visibleInAdminForm?: boolean // Visible pour les admins ?
  visibleInAttendeeTable?: boolean // Affiché dans la table des participants ?
  visibleInExport?: boolean // Inclus dans les exports Excel ?
  adminOnly?: boolean // Modifiable uniquement par admin ?
  isSystemField?: boolean // Champ système non supprimable (RGPD)

  // Mapping base de données
  attendeeField?: string // Champ de la table attendees
  registrationField?: string // Champ de registration (si non dans answers)
  storeInAnswers?: boolean // Stocké dans le JSON answers ?

  // Options pour les listes
  options?: Array<{ value: string; label: string }>
  optionsKey?: string // Pour les listes multiples : nom unique de la liste
}

/**
 * CHAMPS STANDARDS - Configuration unifiée
 * Ces champs sont cohérents entre formulaires, Excel et base de données
 */
export const STANDARD_FORM_FIELDS: FormFieldConfig[] = [
  // ===== CHAMPS ATTENDEE (Fiche personne - réutilisables) =====
  {
    key: 'email',
    label: 'Email',
    placeholder: 'exemple@entreprise.com',
    type: 'email',
    required: true,
    attendeeField: 'email',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    key: 'first_name',
    label: 'Prénom',
    placeholder: 'Jean',
    type: 'text',
    required: true,
    attendeeField: 'firstName',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  {
    key: 'last_name',
    label: 'Nom',
    placeholder: 'Dupont',
    type: 'text',
    required: true,
    attendeeField: 'lastName',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
    validation: {
      minLength: 2,
      maxLength: 50,
    },
  },
  {
    key: 'phone',
    label: 'Téléphone',
    placeholder: '+33 6 12 34 56 78',
    type: 'phone',
    required: false,
    attendeeField: 'phone',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    key: 'company',
    label: 'Organisation',
    placeholder: 'Nom de votre entreprise',
    type: 'text',
    required: false,
    attendeeField: 'company',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    key: 'job_title',
    label: 'Désignation / Poste',
    placeholder: 'Directeur Marketing',
    type: 'text',
    required: false,
    attendeeField: 'jobTitle',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },
  {
    key: 'country',
    label: 'Pays',
    placeholder: 'France',
    type: 'country',
    required: false,
    attendeeField: 'country',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: true,
    visibleInExport: true,
  },

  // ===== CHAMPS REGISTRATION (Spécifiques à l'événement) =====
  {
    key: 'attendee_type',
    label: 'Type de participant',
    placeholder: 'Sélectionnez un type',
    type: 'attendee_type',
    required: false,
    registrationField: 'eventAttendeeTypeId',
    visibleInPublicForm: false, // ❌ Pas visible pour le public
    visibleInAdminForm: true, // ✅ Admin peut choisir
    visibleInAttendeeTable: true, // ✅ Affiché dans la table
    visibleInExport: true, // ✅ Exporté dans Excel
    adminOnly: true, // ✅ Modifiable uniquement par admin
    // Options chargées dynamiquement depuis l'API (Staff, Partenaire, Invité, etc.)
  },
  {
    key: 'attendance_type',
    label: 'Mode de participation',
    type: 'select',
    required: false,
    registrationField: 'attendanceType',
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false, // ❌ Pas dans la table attendee
    visibleInExport: true,
    options: [
      { value: 'onsite', label: 'Présentiel' },
      { value: 'online', label: 'En ligne' },
      { value: 'hybrid', label: 'Hybride' },
    ],
  },

  // ===== CHAMPS PERSONNALISÉS (Stockés dans answers JSON) =====
  {
    key: 'comment',
    label: 'Commentaire',
    placeholder: 'Informations complémentaires...',
    type: 'textarea',
    required: false,
    storeInAnswers: true,
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false, // ❌ Pas dans la table attendee
    visibleInExport: true, // ✅ Mais exporté dans Excel
  },
]

/**
 * Alias de colonnes Excel pour compatibilité
 * Permet d'importer des fichiers avec différents noms de colonnes
 */
export const EXCEL_COLUMN_ALIASES: Record<string, string[]> = {
  email: ['email', 'Email', 'E-mail', 'e-mail', 'mail', 'Mail'],
  first_name: [
    'first_name',
    'First Name',
    'Prénom',
    'prénom',
    'prenom',
    'firstname',
    'FirstName',
  ],
  last_name: ['last_name', 'Last Name', 'Nom', 'nom', 'lastname', 'LastName'],
  phone: [
    'phone',
    'Phone',
    'Téléphone',
    'téléphone',
    'telephone',
    'Tel',
    'tel',
  ],
  company: [
    'company',
    'Company',
    'Organisation',
    'organisation',
    'Entreprise',
    'entreprise',
    'org',
  ],
  job_title: [
    'job_title',
    'Job Title',
    'Désignation',
    'désignation',
    'Poste',
    'poste',
    'title',
  ],
  country: ['country', 'Country', 'Pays', 'pays'],
  attendee_type: [
    'attendee_type',
    'Attendee Type',
    'Type',
    'type',
    'participant_type',
  ],
  attendance_type: ['attendance_type', 'Attendance Type', 'Mode', 'mode'],
  comment: [
    'comment',
    'Comment',
    'Commentaire',
    'commentaire',
    'comments',
    'Comments',
  ],
}

/**
 * Utilitaire : Trouver la valeur d'une colonne Excel avec ses alias
 */
export function findExcelValue(
  row: Record<string, any>,
  fieldKey: string
): any {
  const aliases = EXCEL_COLUMN_ALIASES[fieldKey] || [fieldKey]

  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && row[alias] !== '') {
      return row[alias]
    }
  }

  return null
}

/**
 * Utilitaire : Obtenir les champs visibles pour le formulaire public
 */
export function getPublicFormFields(): FormFieldConfig[] {
  return STANDARD_FORM_FIELDS.filter((field) => field.visibleInPublicForm)
}

/**
 * Utilitaire : Obtenir les champs visibles pour le formulaire admin
 */
export function getAdminFormFields(): FormFieldConfig[] {
  return STANDARD_FORM_FIELDS.filter((field) => field.visibleInAdminForm)
}

/**
 * Utilitaire : Obtenir les champs à afficher dans la table attendee
 */
export function getAttendeeTableFields(): FormFieldConfig[] {
  return STANDARD_FORM_FIELDS.filter((field) => field.visibleInAttendeeTable)
}

/**
 * Utilitaire : Obtenir les champs à exporter dans Excel
 */
export function getExportFields(): FormFieldConfig[] {
  return STANDARD_FORM_FIELDS.filter((field) => field.visibleInExport)
}

/**
 * Utilitaire : Créer une liste déroulante personnalisée
 * @param key Clé unique (ex: "secteur_activite")
 * @param label Label affiché (ex: "Secteur d'activité")
 * @param options Options de la liste
 */
export function createCustomSelectField(
  key: string,
  label: string,
  options: Array<{ value: string; label: string }>,
  config?: Partial<FormFieldConfig>
): FormFieldConfig {
  return {
    key,
    label,
    type: 'select',
    required: false,
    storeInAnswers: true,
    optionsKey: key, // Pour différencier plusieurs listes
    options,
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false,
    visibleInExport: true,
    ...config,
  }
}
