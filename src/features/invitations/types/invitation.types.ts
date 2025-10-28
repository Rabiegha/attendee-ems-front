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
  roleId: string
  orgId: string
}

export interface CreateInvitationResponse {
  id: string
  email: string
  invitationToken: string
  expiresAt: string
  emailSent: boolean
  organization: string
  role: string
}

export interface CompleteInvitationRequest {
  firstName: string
  lastName: string
  password: string
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSTESS'
  | 'PARTNER'
  | 'ADMIN'
  | 'VIEWER'
  | 'MANAGER'

export const ROLE_DESCRIPTIONS: Record<
  UserRole,
  { label: string; description: string; requiresEventSelection?: boolean }
> = {
  SUPER_ADMIN: {
    label: 'Super Administrateur',
    description: 'Accès global à toutes les organisations',
  },
  ADMIN: {
    label: 'Administrateur',
    description: "Accès complet à l'organisation",
  },
  MANAGER: {
    label: 'Manager',
    description: 'Gestion des événements et utilisateurs',
  },
  VIEWER: {
    label: 'Visualiseur',
    description: 'Accès en lecture seule',
    requiresEventSelection: true,
  },
  HOSTESS: {
    label: 'Hôtesse',
    description: 'Accès aux fonctions de check-in',
    requiresEventSelection: true,
  },
  PARTNER: {
    label: 'Partenaire',
    description: 'Accès partenaire limité',
    requiresEventSelection: true,
  },
}
