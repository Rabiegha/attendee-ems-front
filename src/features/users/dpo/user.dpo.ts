import { z } from 'zod';

// Schéma pour la création d'utilisateur - adapté au backend
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  
  role_id: z
    .string()
    .uuid('ID de rôle invalide')
    .min(1, 'Rôle requis'),
  
  is_active: z
    .boolean()
    .optional()
    .default(true),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Types DTO pour le mapping
export interface CreateUserDto {
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  org_id: string;
  role: {
    id: string;
    code: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

// Mapper pour convertir les données du formulaire vers le DTO backend
export const mapCreateUserFormToDto = (formData: CreateUserFormData): CreateUserDto => ({
  email: formData.email,
  password: formData.password,
  role_id: formData.role_id,
  is_active: formData.is_active ?? true,
});

// Mapper pour afficher les données utilisateur
export const mapUserResponseToDisplay = (user: UserResponse) => ({
  id: user.id,
  email: user.email,
  fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email,
  role: user.role.name,
  roleCode: user.role.code,
  isActive: user.is_active,
  createdAt: new Date(user.created_at).toLocaleDateString('fr-FR'),
});

// Types pour les rôles
export interface RoleOption {
  id: string;
  code: string;
  name: string;
  description?: string;
}

// Mappage des codes de rôles vers des descriptions
export const roleDescriptions: Record<string, string> = {
  'org_admin': 'Administrateur de l\'organisation avec tous les droits',
  'staff': 'Membre du personnel avec droits limités',
  'event_manager': 'Gestionnaire d\'événements',
  'checkin_staff': 'Personnel d\'accueil',
  'partner': 'Partenaire externe',
  'readonly': 'Lecture seule',
};