/**
 * Mock Data - Events
 * 
 * Événements réalistes pour tests et développement
 * Inclut public_tokens, settings avec registration_fields JSONB
 */

import type { Event } from '@/features/events/types'

// Configuration par défaut des champs d'inscription
const DEFAULT_REGISTRATION_FIELDS: any = {
  fields: [
    {
      name: 'first_name',
      type: 'text' as const,
      label: 'Prénom',
      required: true,
      enabled: true,
      placeholder: 'Votre prénom',
      validation: { minLength: 2, maxLength: 50 }
    },
    {
      name: 'last_name',
      type: 'text' as const,
      label: 'Nom',
      required: true,
      enabled: true,
      placeholder: 'Votre nom',
      validation: { minLength: 2, maxLength: 50 }
    },
    {
      name: 'email',
      type: 'email' as const,
      label: 'Email',
      required: true,
      enabled: true,
      placeholder: 'votre@email.com'
    },
    {
      name: 'phone',
      type: 'tel' as const,
      label: 'Téléphone',
      required: false,
      enabled: true,
      placeholder: '+33 6 XX XX XX XX'
    },
    {
      name: 'company',
      type: 'text' as const,
      label: 'Entreprise',
      required: false,
      enabled: true,
      placeholder: 'Nom de votre entreprise'
    },
    {
      name: 'job_title',
      type: 'text' as const,
      label: 'Fonction',
      required: false,
      enabled: true,
      placeholder: 'Votre fonction'
    },
    {
      name: 'country',
      type: 'text' as const,
      label: 'Pays',
      required: false,
      enabled: true,
      placeholder: 'France'
    }
  ]
}

// Configuration avec champs custom
const CONFERENCE_REGISTRATION_FIELDS: any = {
  fields: [
    ...DEFAULT_REGISTRATION_FIELDS.fields,
    {
      name: 'dietary_restrictions',
      type: 'textarea',
      label: 'Restrictions alimentaires',
      required: false,
      enabled: true,
      custom: true,
      placeholder: 'Végétarien, allergies, etc.'
    },
    {
      name: 'tshirt_size',
      type: 'select',
      label: 'Taille T-Shirt',
      required: false,
      enabled: true,
      custom: true,
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      name: 'workshops',
      type: 'multiselect',
      label: 'Ateliers souhaités',
      required: false,
      enabled: true,
      custom: true,
      options: [
        'React Advanced',
        'TypeScript Deep Dive',
        'Node.js Performance',
        'GraphQL Masterclass'
      ]
    }
  ]
}

const WEBINAR_REGISTRATION_FIELDS: any = {
  fields: [
    {
      name: 'first_name',
      type: 'text',
      label: 'Prénom',
      required: true,
      enabled: true
    },
    {
      name: 'last_name',
      type: 'text',
      label: 'Nom',
      required: true,
      enabled: true
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      enabled: true
    },
    {
      name: 'company',
      type: 'text',
      label: 'Entreprise',
      required: true,
      enabled: true
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      enabled: true,
      custom: true,
      options: ['Développeur', 'CTO/Tech Lead', 'Product Manager', 'Designer', 'Autre']
    }
  ]
}

// Mock Events avec diversité de statuts, dates, types
export const mockEvents: Event[] = [
  // ========== ÉVÉNEMENTS FUTURS (PUBLISHED) ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    org_id: 'org-tech-corp',
    code: 'TECH2025',
    name: 'Tech Conference 2025',
    description: 'La plus grande conférence technologique de l\'année. Découvrez les dernières innovations en IA, Cloud et Web3.',
    start_at: '2025-11-15T09:00:00Z',
    end_at: '2025-11-15T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 500,
    location_type: 'physical',
    address_formatted: 'Paris Convention Center, 2 Place de la Porte de Versailles, 75015 Paris',
    address_city: 'Paris',
    address_country: 'France',
    latitude: 48.8324,
    longitude: 2.2867,
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-15T14:30:00Z',
    settings: {
      public_token: 'evt_pub_tech2025_abc123def456',
      website_url: 'https://techconf.com',
      attendance_mode: 'hybrid',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: CONFERENCE_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 342,
      approved: 320,
      awaiting: 22,
      refused: 5,
      cancelled: 0,
      checked_in: 0
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    org_id: 'org-tech-corp',
    code: 'WEBSUMMIT2025',
    name: 'Web Summit France 2025',
    description: 'Le plus grand événement tech d\'Europe débarque en France !',
    start_at: '2025-12-10T08:00:00Z',
    end_at: '2025-12-12T20:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 1000,
    location_type: 'physical',
    address_formatted: 'Palais des Congrès, Lyon',
    address_city: 'Lyon',
    address_country: 'France',
    latitude: 45.7640,
    longitude: 4.8357,
    created_at: '2025-08-15T09:00:00Z',
    updated_at: '2025-10-20T11:00:00Z',
    settings: {
      public_token: 'evt_pub_websummit2025_xyz789',
      website_url: 'https://websummit.fr',
      attendance_mode: 'onsite',
      registration_auto_approve: false,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: CONFERENCE_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 856,
      approved: 720,
      awaiting: 136,
      refused: 12,
      cancelled: 8
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    org_id: 'org-tech-corp',
    code: 'REACT2026',
    name: 'React Paris 2026',
    description: 'Conférence dédiée à React et l\'écosystème JavaScript moderne',
    start_at: '2026-03-20T09:00:00Z',
    end_at: '2026-03-20T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 300,
    location_type: 'physical',
    address_formatted: 'Station F, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-10-01T10:00:00Z',
    updated_at: '2025-10-22T16:00:00Z',
    settings: {
      public_token: 'evt_pub_react2026_pqr456',
      attendance_mode: 'hybrid',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 45,
      approved: 45,
      awaiting: 0,
      refused: 0,
      cancelled: 0
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    org_id: 'org-startup-hub',
    code: 'STARTUP2025',
    name: 'Startup Grind Paris',
    description: 'Rencontrez les entrepreneurs qui changent le monde',
    start_at: '2025-11-28T18:00:00Z',
    end_at: '2025-11-28T22:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 150,
    location_type: 'physical',
    address_formatted: 'Le Cargo, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-09-20T14:00:00Z',
    updated_at: '2025-10-18T09:30:00Z',
    settings: {
      public_token: 'evt_pub_startup2025_lmn789',
      attendance_mode: 'onsite',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 98,
      approved: 98,
      awaiting: 0,
      refused: 0,
      cancelled: 2
    }
  },

  // ========== WEBINAIRES ONLINE ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    org_id: 'org-tech-corp',
    code: 'WEBINAR-AI-NOV',
    name: 'Introduction à l\'IA Générative',
    description: 'Webinaire gratuit : Découvrez ChatGPT, Midjourney et leurs applications business',
    start_at: '2025-11-05T14:00:00Z',
    end_at: '2025-11-05T15:30:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: null, // Illimité
    location_type: 'online',
    created_at: '2025-10-10T08:00:00Z',
    updated_at: '2025-10-20T10:00:00Z',
    settings: {
      public_token: 'evt_pub_webinar_ai_nov_xyz',
      website_url: 'https://webinar-ai.tech',
      attendance_mode: 'online',
      registration_auto_approve: true,
      allow_checkin_out: false,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: WEBINAR_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 1245,
      approved: 1245,
      awaiting: 0,
      refused: 0,
      cancelled: 38
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    org_id: 'org-startup-hub',
    code: 'WEBINAR-GROWTH',
    name: 'Growth Hacking 101',
    description: 'Les techniques de croissance des startups qui fonctionnent vraiment',
    start_at: '2025-11-12T10:00:00Z',
    end_at: '2025-11-12T11:30:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: null,
    location_type: 'online',
    created_at: '2025-10-05T12:00:00Z',
    updated_at: '2025-10-19T15:00:00Z',
    settings: {
      public_token: 'evt_pub_growth_webinar_abc',
      attendance_mode: 'online',
      registration_auto_approve: true,
      allow_checkin_out: false,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: WEBINAR_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 567,
      approved: 567,
      awaiting: 0,
      refused: 0,
      cancelled: 12
    }
  },

  // ========== ÉVÉNEMENTS ACTIFS (EN COURS) ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    org_id: 'org-tech-corp',
    code: 'DEVFEST2025',
    name: 'DevFest Paris 2025',
    description: 'Festival de développeurs organisé par Google Developer Group',
    start_at: '2025-10-23T08:00:00Z',
    end_at: '2025-10-23T19:00:00Z',
    timezone: 'Europe/Paris',
    status: 'active',
    capacity: 800,
    location_type: 'physical',
    address_formatted: 'Cité des Sciences, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-07-15T10:00:00Z',
    updated_at: '2025-10-23T08:00:00Z',
    settings: {
      public_token: 'evt_pub_devfest2025_ghi123',
      website_url: 'https://devfest.fr',
      attendance_mode: 'hybrid',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: CONFERENCE_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 752,
      approved: 752,
      awaiting: 0,
      refused: 8,
      cancelled: 15,
      checked_in: 620
    }
  },

  // ========== ÉVÉNEMENTS TERMINÉS (COMPLETED) ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    org_id: 'org-tech-corp',
    code: 'JSCONF2025',
    name: 'JavaScript Conference 2025',
    description: 'La conférence JavaScript de référence en France',
    start_at: '2025-09-15T09:00:00Z',
    end_at: '2025-09-16T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'completed',
    capacity: 400,
    location_type: 'physical',
    address_formatted: 'Le Beffroi, Montrouge',
    address_city: 'Montrouge',
    address_country: 'France',
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-09-16T18:00:00Z',
    settings: {
      public_token: 'evt_pub_jsconf2025_jkl456',
      website_url: 'https://jsconf.fr',
      attendance_mode: 'hybrid',
      registration_auto_approve: false,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: CONFERENCE_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 387,
      approved: 365,
      awaiting: 0,
      refused: 22,
      cancelled: 12,
      checked_in: 342
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    org_id: 'org-startup-hub',
    code: 'PITCH2025-Q3',
    name: 'Startup Pitch Night Q3',
    description: '10 startups pitchent devant des investisseurs',
    start_at: '2025-09-28T19:00:00Z',
    end_at: '2025-09-28T22:00:00Z',
    timezone: 'Europe/Paris',
    status: 'completed',
    capacity: 100,
    location_type: 'physical',
    address_formatted: 'The Family, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-08-20T14:00:00Z',
    updated_at: '2025-09-28T22:00:00Z',
    settings: {
      public_token: 'evt_pub_pitch_q3_mno789',
      attendance_mode: 'onsite',
      registration_auto_approve: false,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 92,
      approved: 85,
      awaiting: 0,
      refused: 7,
      cancelled: 3,
      checked_in: 78
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    org_id: 'org-tech-corp',
    code: 'HACKATHON-AUG',
    name: 'Summer Hackathon 2025',
    description: '48h pour créer le prochain produit viral',
    start_at: '2025-08-10T18:00:00Z',
    end_at: '2025-08-12T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'completed',
    capacity: 120,
    location_type: 'physical',
    address_formatted: 'Ecole 42, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-08-12T18:00:00Z',
    settings: {
      public_token: 'evt_pub_hackathon_aug_pqr',
      attendance_mode: 'onsite',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: CONFERENCE_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 118,
      approved: 118,
      awaiting: 0,
      refused: 0,
      cancelled: 8,
      checked_in: 110
    }
  },

  // ========== ÉVÉNEMENTS ANNULÉS ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    org_id: 'org-startup-hub',
    code: 'CANCELLED-EVENT',
    name: 'Blockchain Summit (ANNULÉ)',
    description: 'Événement annulé suite à problèmes d\'organisation',
    start_at: '2025-10-30T09:00:00Z',
    end_at: '2025-10-30T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'cancelled',
    capacity: 200,
    location_type: 'physical',
    address_formatted: 'Paris La Défense',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-10-10T15:00:00Z',
    settings: {
      public_token: 'evt_pub_blockchain_cancelled',
      attendance_mode: 'onsite',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: false,
      auto_transition_to_completed: false,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 45,
      approved: 45,
      awaiting: 0,
      refused: 0,
      cancelled: 45
    }
  },

  // ========== BROUILLONS (DRAFT) ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    org_id: 'org-tech-corp',
    code: 'DRAFT-AI-2026',
    name: 'AI Summit 2026 (Brouillon)',
    description: 'Événement en préparation - Dates à confirmer',
    start_at: '2026-06-15T09:00:00Z',
    end_at: '2026-06-15T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'draft',
    capacity: 600,
    location_type: 'physical',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-10-20T14:00:00Z',
    settings: {
      public_token: 'evt_pub_draft_ai2026_stu',
      attendance_mode: 'hybrid',
      registration_auto_approve: false,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 0,
      approved: 0,
      awaiting: 0,
      refused: 0,
      cancelled: 0
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    org_id: 'org-startup-hub',
    code: 'DRAFT-MEETUP',
    name: 'Monthly Tech Meetup (Brouillon)',
    description: 'Meetup mensuel - En cours de préparation',
    start_at: '2025-12-05T19:00:00Z',
    end_at: '2025-12-05T22:00:00Z',
    timezone: 'Europe/Paris',
    status: 'draft',
    capacity: 50,
    location_type: 'physical',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-10-22T16:00:00Z',
    updated_at: '2025-10-22T16:30:00Z',
    settings: {
      public_token: 'evt_pub_draft_meetup_vwx',
      attendance_mode: 'onsite',
      registration_auto_approve: true,
      allow_checkin_out: false,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 0,
      approved: 0,
      awaiting: 0,
      refused: 0,
      cancelled: 0
    }
  },

  // ========== ÉVÉNEMENTS AUTRES ORGANISATIONS ==========
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    org_id: 'org-design-studio',
    code: 'UX2025',
    name: 'UX/UI Design Conference',
    description: 'La conférence design de référence',
    start_at: '2025-11-22T09:00:00Z',
    end_at: '2025-11-22T18:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 250,
    location_type: 'physical',
    address_formatted: 'Gaîté Lyrique, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-09-10T10:00:00Z',
    updated_at: '2025-10-18T12:00:00Z',
    settings: {
      public_token: 'evt_pub_ux2025_yza123',
      website_url: 'https://uxconf.fr',
      attendance_mode: 'hybrid',
      registration_auto_approve: false,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 178,
      approved: 150,
      awaiting: 28,
      refused: 5,
      cancelled: 2
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    org_id: 'org-marketing-agency',
    code: 'MARKETING2025',
    name: 'Digital Marketing Summit',
    description: 'Les dernières tendances du marketing digital',
    start_at: '2025-12-15T09:00:00Z',
    end_at: '2025-12-15T17:00:00Z',
    timezone: 'Europe/Paris',
    status: 'published',
    capacity: 180,
    location_type: 'physical',
    address_formatted: 'Impact Hub, Paris',
    address_city: 'Paris',
    address_country: 'France',
    created_at: '2025-09-25T14:00:00Z',
    updated_at: '2025-10-19T10:00:00Z',
    settings: {
      public_token: 'evt_pub_marketing2025_bcd',
      attendance_mode: 'hybrid',
      registration_auto_approve: true,
      allow_checkin_out: true,
      auto_transition_to_active: true,
      auto_transition_to_completed: true,
      registration_fields: DEFAULT_REGISTRATION_FIELDS
    },
    statistics: {
      total_registrations: 92,
      approved: 92,
      awaiting: 0,
      refused: 0,
      cancelled: 3
    }
  }
]

// Helper pour récupérer un event par public_token
export const getEventByPublicToken = (token: string): Event | undefined => {
  return mockEvents.find(event => event.settings?.public_token === token)
}

// Helper pour récupérer events par org_id
export const getEventsByOrgId = (orgId: string): Event[] => {
  return mockEvents.filter(event => event.org_id === orgId)
}

// Helper pour récupérer events par statut
export const getEventsByStatus = (status: string): Event[] => {
  return mockEvents.filter(event => event.status === status)
}

// Export du nombre total
export const TOTAL_MOCK_EVENTS = mockEvents.length
