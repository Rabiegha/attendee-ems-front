export enum EmailTemplateType {
  REGISTRATION_CONFIRMATION = 'registration_confirmation',
  REGISTRATION_APPROVED = 'registration_approved',
  INVITATION = 'invitation',
  PASSWORD_RESET = 'password_reset',
}

export interface EmailTemplate {
  id: string
  type: EmailTemplateType
  name: string
  subject: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailStatus {
  enabled: boolean
  connected: boolean
  host: string
  port: string
  from: string
}

export interface UpdateEmailTemplatePayload {
  name?: string
  subject?: string
  description?: string
  is_active?: boolean
}

export interface SendTestEmailPayload {
  email: string
  templateType: EmailTemplateType
}

export interface SendTestEmailResponse {
  success: boolean
  message: string
}
