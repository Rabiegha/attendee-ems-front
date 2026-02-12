import type { EventDTO, CreateEventDTO, UpdateEventDTO } from './event.dto'
import type { EventDPO, CreateEventDPO, UpdateEventDPO } from './event.dpo'

/**
 * Maps EventDTO from API to EventDPO for client use
 */
export const mapEventDTOtoDPO = (dto: EventDTO): EventDPO => {
  const startDate = new Date(dto.start_at)
  const endDate = new Date(dto.end_at)
  const now = new Date()

  // Construire le location string en fonction du type de lieu
  let location = 'Non spécifié'
  if (dto.location_type === 'online') {
    location = 'En ligne'
  } else if (dto.location_type === 'hybrid') {
    location = 'Hybride'
  } else {
    // Pour les événements physiques, utiliser l'adresse
    location =
      dto.address_formatted ||
      [dto.address_city, dto.address_country].filter(Boolean).join(', ') ||
      'Non spécifié'
  }

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    startDate: dto.start_at, // Keep as ISO string
    endDate: dto.end_at, // Keep as ISO string
    location: location,
    locationType: dto.location_type,
    maxAttendees: dto.capacity || 999999, // Si null, considérer comme illimité
    currentAttendees: dto._count?.registrations || 0, // Utiliser le compteur du backend
    status: dto.status === 'archived' ? 'completed' : (dto.status as any), // Map archived -> completed
    orgId: dto.org_id,
    publicToken: dto.settings?.public_token || dto.public_token || '', // From settings or root
    createdAt: dto.created_at, // Keep as ISO string
    updatedAt: dto.updated_at, // Keep as ISO string
    deletedAt: dto.deleted_at || null, // Keep as ISO string or null
    createdBy: dto.created_by || '',
    tags: dto.eventTags?.map((et) => et.tag.name) || [],
    partnerIds: [], // TODO: À implémenter
    metadata: {}, // TODO: À implémenter si le backend ajoute metadata
    settings: dto.settings, // Pass through settings including registration_fields
    ...(dto.settings?.website_url && { websiteUrl: dto.settings.website_url }),
    ...(dto.address_formatted && { addressFormatted: dto.address_formatted }),
    ...(dto.address_street && { addressStreet: dto.address_street }),
    ...(dto.address_city && { addressCity: dto.address_city }),
    ...(dto.address_postal_code && { addressPostalCode: dto.address_postal_code }),
    ...(dto.address_country && { addressCountry: dto.address_country }),
    ...(dto.latitude && { latitude: Number(dto.latitude) }),
    ...(dto.longitude && { longitude: Number(dto.longitude) }),
    ...(dto.capacity && { capacity: dto.capacity }),
    ...(dto.settings?.registration_auto_approve !== undefined && { registrationAutoApprove: dto.settings.registration_auto_approve }),
    ...(dto.emailSettings?.require_email_verification !== undefined && { requireEmailVerification: dto.emailSettings.require_email_verification }),
    ...(dto.emailSettings?.confirmation_enabled !== undefined && { confirmationEmailEnabled: dto.emailSettings.confirmation_enabled }),
    ...(dto.emailSettings?.approval_enabled !== undefined && { approvalEmailEnabled: dto.emailSettings.approval_enabled }),
    ...(dto.emailSettings?.reminder_enabled !== undefined && { reminderEmailEnabled: dto.emailSettings.reminder_enabled }),
    ...(dto.settings?.include_qr_code_in_approval !== undefined && { includeQrCodeInApproval: dto.settings.include_qr_code_in_approval }),
    ...(dto.settings?.badge_template_id && { badgeTemplateId: dto.settings.badge_template_id }),

    // Computed properties (calculated from dates but stored as primitives)
    isActive: dto.status === 'published',
    isDraft: dto.status === 'draft',
    isCompleted: dto.status === 'archived',
    isDeleted: !!dto.deleted_at,
    isFull: dto.capacity
      ? (dto._count?.registrations || 0) >= dto.capacity
      : false,
    daysUntilStart: Math.ceil(
      (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ),
    duration: Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    ),
  }
}

/**
 * Maps CreateEventDPO to CreateEventDTO for API
 */
export const mapCreateEventDPOtoDTO = (dpo: CreateEventDPO): CreateEventDTO => {
  const dto: CreateEventDTO = {
    name: dpo.name,
    code: dpo.name.toLowerCase().replace(/\s+/g, '-').substring(0, 50), // Auto-generate code from name
    start_at: dpo.startDate, // Already ISO string from form
    end_at: dpo.endDate, // Already ISO string from form
  }

  // Only include optional fields if they have values
  if (dpo.description) dto.description = dpo.description
  if (dpo.maxAttendees !== undefined) dto.capacity = dpo.maxAttendees
  if (dpo.websiteUrl) dto.website_url = dpo.websiteUrl
  if (dpo.locationType) dto.location_type = dpo.locationType
  
  // Map location data
  if (dpo.location) dto.address_formatted = dpo.location
  if (dpo.addressFormatted) dto.address_formatted = dpo.addressFormatted
  if (dpo.addressStreet) dto.address_street = dpo.addressStreet
  if (dpo.addressCity) dto.address_city = dpo.addressCity
  if (dpo.addressPostalCode) dto.address_postal_code = dpo.addressPostalCode
  if (dpo.addressCountry) dto.address_country = dpo.addressCountry
  if (dpo.latitude !== undefined) dto.latitude = dpo.latitude
  if (dpo.longitude !== undefined) dto.longitude = dpo.longitude

  // Map email/registration options
  if (dpo.capacity !== undefined) dto.capacity = dpo.capacity
  if (dpo.registrationAutoApprove !== undefined) dto.registration_auto_approve = dpo.registrationAutoApprove
  if (dpo.requireEmailVerification !== undefined) dto.require_email_verification = dpo.requireEmailVerification
  if (dpo.confirmationEmailEnabled !== undefined) dto.confirmation_enabled = dpo.confirmationEmailEnabled
  if (dpo.approvalEmailEnabled !== undefined) dto.approval_enabled = dpo.approvalEmailEnabled
  if (dpo.reminderEmailEnabled !== undefined) dto.reminder_enabled = dpo.reminderEmailEnabled

  // Map partnerIds to assigned_user_ids for backend
  if (dpo.partnerIds && dpo.partnerIds.length > 0) {
    dto.assigned_user_ids = dpo.partnerIds
  }

  // Map tags
  if (dpo.tags && dpo.tags.length > 0) {
    dto.tags = dpo.tags
  }

  return dto
}

/**
 * Maps UpdateEventDPO to UpdateEventDTO for API
 */
export const mapUpdateEventDPOtoDTO = (dpo: UpdateEventDPO): UpdateEventDTO => {
  const dto: UpdateEventDTO = {}

  if (dpo.name) dto.name = dpo.name
  if (dpo.description !== undefined) dto.description = dpo.description
  if (dpo.startDate) dto.start_at = dpo.startDate
  if (dpo.endDate) dto.end_at = dpo.endDate
  if (dpo.maxAttendees !== undefined) dto.capacity = dpo.maxAttendees
  if (dpo.location !== undefined) dto.address_formatted = dpo.location
  if (dpo.locationType) dto.location_type = dpo.locationType
  if (dpo.websiteUrl !== undefined) dto.website_url = dpo.websiteUrl

  // Map email/registration options for update
  if (dpo.capacity !== undefined) dto.capacity = dpo.capacity
  if (dpo.registrationAutoApprove !== undefined) dto.registration_auto_approve = dpo.registrationAutoApprove
  if (dpo.requireEmailVerification !== undefined) dto.require_email_verification = dpo.requireEmailVerification
  if (dpo.confirmationEmailEnabled !== undefined) dto.confirmation_enabled = dpo.confirmationEmailEnabled
  if (dpo.approvalEmailEnabled !== undefined) dto.approval_enabled = dpo.approvalEmailEnabled
  if (dpo.reminderEmailEnabled !== undefined) dto.reminder_enabled = dpo.reminderEmailEnabled
  if (dpo.includeQrCodeInApproval !== undefined) dto.include_qr_code_in_approval = dpo.includeQrCodeInApproval
  if (dpo.badgeTemplateId !== undefined) dto.badge_template_id = dpo.badgeTemplateId

  // Map partnerIds to assigned_user_ids for backend
  if (dpo.partnerIds !== undefined) {
    dto.assigned_user_ids = dpo.partnerIds
  }

  // Map status
  if (dpo.status) {
    dto.status = dpo.status as any
  }

  return dto
}
