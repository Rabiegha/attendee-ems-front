export interface UserInvitation {
  id: string
  email: string
  role: UserRole
  orgId: string
  invitedBy: string
  token: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  createdAt: string
  expiresAt: string
  eventIds?: string[]
  personalizedMessage?: string
}

export interface CreateInvitationRequest {
  email: string
  role: UserRole
  orgId?: string // Optionnel pour Super Admin, automatique pour Org Admin
  eventIds?: string[]
  personalizedMessage?: string
}

export interface CreateInvitationResponse {
  invitation: UserInvitation
  emailSent: boolean
}

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ORG_ADMIN'
  | 'ORG_MANAGER' 
  | 'EVENT_MANAGER'
  | 'CHECKIN_STAFF'
  | 'PARTNER'
  | 'READONLY'

export const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string; requiresEventSelection?: boolean }> = {
  SUPER_ADMIN: {
    label: 'Super Administrateur',
    description: 'Accès global à toutes les organisations'
  },
  ORG_ADMIN: {
    label: 'Administrateur Organisation',
    description: 'Accès complet à l\'organisation'
  },
  ORG_MANAGER: {
    label: 'Manager Organisation',
    description: 'Gestion des événements et utilisateurs'
  },
  EVENT_MANAGER: {
    label: 'Gestionnaire d\'Événements',
    description: 'Gestion d\'événements spécifiques',
    requiresEventSelection: true
  },
  CHECKIN_STAFF: {
    label: 'Staff Check-in',
    description: 'Accès aux fonctions de check-in',
    requiresEventSelection: true
  },
  PARTNER: {
    label: 'Partenaire',
    description: 'Accès partenaire limité',
    requiresEventSelection: true
  },
  READONLY: {
    label: 'Lecture Seule',
    description: 'Accès en lecture uniquement',
    requiresEventSelection: true
  }
}