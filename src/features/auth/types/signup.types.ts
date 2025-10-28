/**
 * 🔐 TYPES POUR LE SIGNUP SÉCURISÉ
 *
 * Workflow: Validation token → Vérification email → Complétion profil → Activation compte
 */

export interface InvitationTokenInfo {
  id: string
  email: string
  role: string
  orgId: string
  orgName: string
  invitedBy: string
  invitedByName: string
  expiresAt: string
  isExpired: boolean
}

export interface SignupFormData {
  firstName: string
  lastName: string
  password: string
  confirmPassword: string
  phone?: string
  acceptTerms: boolean
}

export interface CompleteSignupRequest {
  token: string
  firstName: string
  lastName: string
  password: string
  phone?: string
}

export interface CompleteSignupResponse {
  success: boolean
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    orgId: string
  }
  token: string
  message: string
}

export interface SignupValidationError {
  type:
    | 'INVALID_TOKEN'
    | 'TOKEN_EXPIRED'
    | 'EMAIL_MISMATCH'
    | 'USER_ALREADY_ACTIVE'
    | 'INVITATION_USED'
  message: string
  redirectTo?: string
}

export interface TokenValidationResponse {
  valid: boolean
  invitation?: InvitationTokenInfo
  error?: SignupValidationError
}
