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

// 🆕 Nouveau schéma pour création avec mot de passe généré
export const createUserWithGeneratedPasswordSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'Email requis'),
  
  roleId: z
    .string()
    .min(1, 'Rôle requis'),
  
  // 🆕 Organisation - obligatoire pour SUPER_ADMIN, automatique pour autres rôles
  orgId: z
    .string()
    .optional(),
    
  // 🆕 Création d'organisation - uniquement pour SUPER_ADMIN
  createNewOrg: z
    .boolean()
    .optional()
    .default(false),
    
  newOrgName: z
    .string()
    .optional(),
    
  newOrgSlug: z
    .string()
    .optional(),
  
  phone: z
    .string()
    .optional(),
});

export type CreateUserWithGeneratedPasswordFormData = z.infer<typeof createUserWithGeneratedPasswordSchema>;

// Types DTO pour le mapping
export interface CreateUserDto {
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
  org_id?: string; // 🆕 Pour SUPER_ADMIN qui peut choisir l'organisation
}

export interface CreateUserWithGeneratedPasswordDto {
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
  org_id?: string; // 🆕 Pour SUPER_ADMIN qui peut choisir l'organisation
  first_name?: string; // 🆕 Ajout des noms
  last_name?: string; // 🆕 Ajout des noms
}

// 🆕 DTO pour créer une nouvelle organisation (SUPER_ADMIN uniquement)
export interface CreateOrganizationDto {
  name: string;
  slug: string;
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

// 🆕 Mapper pour le nouveau workflow avec mot de passe généré
export const mapCreateUserWithGeneratedPasswordFormToDto = (
  formData: CreateUserWithGeneratedPasswordFormData
): { 
  dto: CreateUserWithGeneratedPasswordDto; 
  temporaryPassword: string;
  newOrgData?: CreateOrganizationDto;
} => {
  const temporaryPassword = generateTemporaryPassword();
  
  const result: {
    dto: CreateUserWithGeneratedPasswordDto;
    temporaryPassword: string;
    newOrgData?: CreateOrganizationDto;
  } = {
    dto: {
      email: formData.email,
      password: temporaryPassword,
      role_id: formData.roleId,
      is_active: true,
      first_name: formData.firstName,
      last_name: formData.lastName,
      // Inclure org_id seulement si spécifié (SUPER_ADMIN)
      ...(formData.orgId && { org_id: formData.orgId }),
    },
    temporaryPassword,
  };
  
  // Si création d'une nouvelle organisation
  if (formData.createNewOrg && formData.newOrgName && formData.newOrgSlug) {
    result.newOrgData = {
      name: formData.newOrgName,
      slug: formData.newOrgSlug,
    };
  }
  
  return result;
};

// Générateur de mot de passe temporaire (12 caractères sécurisés)
const generateTemporaryPassword = (): string => {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

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
  'SUPER_ADMIN': 'Accès global à toutes les organisations et fonctionnalités',
  'ORG_ADMIN': 'Administrateur de l\'organisation avec tous les droits de gestion',
  'EVENT_MANAGER': 'Création et gestion d\'événements, gestion des participants',
  'CHECKIN_STAFF': 'Accès check-in/check-out des participants uniquement',
  'PARTNER': 'Accès limité à certains événements spécifiques',
  'READONLY': 'Accès en consultation uniquement, aucune modification autorisée',
  'GRAPHIC_DESIGNER': 'Spécialiste design et créativité pour les événements',
  'DEVELOPER': 'Spécialiste développement technique et intégrations',
  'JOURNALIST': 'Spécialiste investigation et rédaction de contenus',
  'EDITOR': 'Spécialiste édition et gestion de contenus médias',
};