/**
 * 🔧 DONNÉES DEMO pour l'authentification
 *
 * ORGANIZATIONS:
 * - Choyou (Fred admin, Claudia graphiste, Rabie développeur)
 * - IT for Business (Thomas admin, Alessandro journaliste, Thierry rédacteur)
 *
 * SUPER ADMIN:
 * - Corentin Kistler (accès global)
 */

import { http, HttpResponse } from 'msw'
import { env } from '@/app/config/env'

// Types
interface Organization {
  id: string
  name: string
  slug: string
  timezone: string
  planCode?: string
}

interface Role {
  id: string
  orgId: string
  code: string
  name: string
  description: string
}

interface User {
  id: string
  orgId: string
  email: string
  firstName: string
  lastName: string
  roleId: string
  role: Role
  isActive: boolean
  isSuperAdmin?: boolean
  eventIds?: string[]
}

// 🏢 ORGANISATIONS
export const organizations: Organization[] = [
  {
    id: 'org-choyou',
    name: 'Choyou',
    slug: 'choyou',
    timezone: 'Europe/Paris',
    planCode: 'ENTERPRISE',
  },
  {
    id: 'org-itforbusiness',
    name: 'IT for Business',
    slug: 'it-for-business',
    timezone: 'Europe/Paris',
    planCode: 'PROFESSIONAL',
  },
]

// 🎯 RÔLES PAR ORGANISATION
export const roles: Role[] = [
  // Super Admin (pas d'org spécifique)
  {
    id: 'role-super-admin',
    orgId: '',
    code: 'SUPER_ADMIN',
    name: 'Super Administrateur',
    description: 'Accès global à toutes les organisations',
  },

  // CHOYOU
  {
    id: 'role-choyou-admin',
    orgId: 'org-choyou',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation',
    description: 'Accès complet à Choyou',
  },
  {
    id: 'role-choyou-graphic',
    orgId: 'org-choyou',
    code: 'GRAPHIC_DESIGNER',
    name: 'Graphiste',
    description: 'Spécialiste design et créativité',
  },
  {
    id: 'role-choyou-dev',
    orgId: 'org-choyou',
    code: 'DEVELOPER',
    name: 'Développeur',
    description: 'Spécialiste développement logiciel',
  },

  // IT FOR BUSINESS
  {
    id: 'role-itfb-admin',
    orgId: 'org-itforbusiness',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation',
    description: 'Accès complet à IT for Business',
  },
  {
    id: 'role-itfb-journalist',
    orgId: 'org-itforbusiness',
    code: 'JOURNALIST',
    name: 'Journaliste',
    description: 'Spécialiste investigation et rédaction',
  },
  {
    id: 'role-itfb-editor',
    orgId: 'org-itforbusiness',
    code: 'EDITOR',
    name: 'Rédacteur',
    description: 'Spécialiste édition et contenus',
  },

  // 🆕 RÔLES STANDARDS EMS (org-1 par défaut)
  {
    id: 'role-org-admin',
    orgId: 'org-1',
    code: 'ORG_ADMIN',
    name: 'Admin Organisation',
    description: "Accès complet à l'organisation avec gestion des utilisateurs",
  },
  {
    id: 'role-event-manager',
    orgId: 'org-1',
    code: 'EVENT_MANAGER',
    name: 'Gestionnaire Événement',
    description: "Création et gestion d'événements, gestion des participants",
  },
  {
    id: 'role-checkin-staff',
    orgId: 'org-1',
    code: 'CHECKIN_STAFF',
    name: 'Staff Check-in',
    description: 'Accès check-in/check-out des participants uniquement',
  },
  {
    id: 'role-partner',
    orgId: 'org-1',
    code: 'PARTNER',
    name: 'Partenaire',
    description: 'Accès limité à certains événements spécifiques',
  },
  {
    id: 'role-hotesse',
    orgId: 'org-1',
    code: 'HOTESSE',
    name: "Hôtesse d'accueil",
    description:
      'Scan QR codes et check-in des participants sur événements assignés',
  },
  {
    id: 'role-readonly',
    orgId: 'org-1',
    code: 'READONLY',
    name: 'Lecture seule',
    description: 'Accès en consultation uniquement, aucune modification',
  },
]

// 👥 UTILISATEURS
export const users: User[] = [
  // 🌟 SUPER ADMIN
  {
    id: 'user-super-admin',
    orgId: '',
    email: 'corentin@kistler.com',
    firstName: 'Corentin',
    lastName: 'Kistler',
    roleId: 'role-super-admin',
    role: roles.find((r) => r.id === 'role-super-admin')!,
    isActive: true,
    isSuperAdmin: true,
  },

  // CHOYOU
  {
    id: 'user-choyou-admin',
    orgId: 'org-choyou',
    email: 'fred@choyou.com',
    firstName: 'Fred',
    lastName: 'Ktorza',
    roleId: 'role-choyou-admin',
    role: roles.find((r) => r.id === 'role-choyou-admin')!,
    isActive: true,
  },
  {
    id: 'user-choyou-graphic',
    orgId: 'org-choyou',
    email: 'claudia@choyou.com',
    firstName: 'Claudia',
    lastName: 'Tessier',
    roleId: 'role-choyou-graphic',
    role: roles.find((r) => r.id === 'role-choyou-graphic')!,
    isActive: true,
    eventIds: ['choyou-design-1', 'choyou-design-2', 'choyou-shared'],
  },
  {
    id: 'user-choyou-dev',
    orgId: 'org-choyou',
    email: 'rabie@choyou.com',
    firstName: 'Rabie',
    lastName: 'Gharghar',
    roleId: 'role-choyou-dev',
    role: roles.find((r) => r.id === 'role-choyou-dev')!,
    isActive: true,
    eventIds: ['choyou-dev-1', 'choyou-dev-2', 'choyou-shared'],
  },

  // 📰 IT FOR BUSINESS
  {
    id: 'user-itfb-admin',
    orgId: 'org-itforbusiness',
    email: 'thomas@itforbusiness.com',
    firstName: 'Thomas',
    lastName: 'Pagbe',
    roleId: 'role-itfb-admin',
    role: roles.find((r) => r.id === 'role-itfb-admin')!,
    isActive: true,
  },
  {
    id: 'user-itfb-journalist',
    orgId: 'org-itforbusiness',
    email: 'alessandro@itforbusiness.com',
    firstName: 'Alessandro',
    lastName: 'Rossi',
    roleId: 'role-itfb-journalist',
    role: roles.find((r) => r.id === 'role-itfb-journalist')!,
    isActive: true,
    eventIds: ['itfb-journalism'],
  },
  {
    id: 'user-itfb-editor',
    orgId: 'org-itforbusiness',
    email: 'thierry@itforbusiness.com',
    firstName: 'Thierry',
    lastName: 'Martin',
    roleId: 'role-itfb-editor',
    role: roles.find((r) => r.id === 'role-itfb-editor')!,
    isActive: true,
    eventIds: ['itfb-editorial'],
  },

  // 🏢 HÔTESSES D'ACCUEIL
  {
    id: 'user-hotesse-1',
    orgId: 'org-1',
    email: 'sophie.accueil@ems.com',
    firstName: 'Sophie',
    lastName: 'Dubois',
    roleId: 'role-hotesse',
    role: roles.find((r) => r.id === 'role-hotesse')!,
    isActive: true,
    eventIds: ['event-1', 'event-2'], // Événements assignés pour le scan
  },
  {
    id: 'user-hotesse-2',
    orgId: 'org-1',
    email: 'marie.reception@ems.com',
    firstName: 'Marie',
    lastName: 'Leroy',
    roleId: 'role-hotesse',
    role: roles.find((r) => r.id === 'role-hotesse')!,
    isActive: true,
    eventIds: ['event-3'], // Événement spécifique assigné
  },
]

// 🎯 ÉVÉNEMENTS/PROJETS
export const events = [
  // CHOYOU (5 projets)
  {
    id: 'choyou-dev-1',
    title: 'Application Mobile E-commerce',
    description: "Développement d'une app mobile pour la vente en ligne",
    startDate: '2024-11-15T09:00:00Z',
    endDate: '2024-12-15T17:00:00Z',
    location: 'Choyou - Lab Développement',
    maxAttendees: 50,
    status: 'published',
    org_id: 'org-choyou',
    category: 'development',
  },
  {
    id: 'choyou-dev-2',
    title: 'Plateforme Web SaaS',
    description: "Création d'une plateforme SaaS pour la gestion de projets",
    startDate: '2024-12-01T08:30:00Z',
    endDate: '2024-12-30T18:00:00Z',
    location: 'Choyou - Espace Tech',
    maxAttendees: 30,
    status: 'published',
    org_id: 'org-choyou',
    category: 'development',
  },
  {
    id: 'choyou-design-1',
    title: 'Identité Visuelle Startup',
    description:
      "Création d'une identité visuelle complète pour une startup tech",
    startDate: '2024-11-20T10:00:00Z',
    endDate: '2024-12-10T16:00:00Z',
    location: 'Choyou - Studio Créatif',
    maxAttendees: 25,
    status: 'published',
    org_id: 'org-choyou',
    category: 'design',
  },
  {
    id: 'choyou-design-2',
    title: 'Campagne Publicitaire Digital',
    description: "Design d'une campagne publicitaire multi-supports",
    startDate: '2024-12-05T09:30:00Z',
    endDate: '2024-12-25T17:30:00Z',
    location: 'Choyou - Atelier Design',
    maxAttendees: 20,
    status: 'published',
    org_id: 'org-choyou',
    category: 'design',
  },
  {
    id: 'choyou-shared',
    title: 'Projet Innovation Collaborative',
    description:
      "Projet mixte alliant développement et design pour l'innovation",
    startDate: '2024-12-20T09:00:00Z',
    endDate: '2024-12-22T18:00:00Z',
    location: 'Choyou - Espace Collaboration',
    maxAttendees: 40,
    status: 'published',
    org_id: 'org-choyou',
    category: 'collaboration',
  },

  // IT FOR BUSINESS (2 projets)
  {
    id: 'itfb-journalism',
    title: 'Investigation Tech & IA',
    description:
      "Enquête journalistique sur l'impact de l'IA dans les entreprises",
    startDate: '2024-11-25T08:00:00Z',
    endDate: '2024-12-15T19:00:00Z',
    location: 'IT for Business - Salle de Rédaction',
    maxAttendees: 15,
    status: 'published',
    org_id: 'org-itforbusiness',
    category: 'journalism',
  },
  {
    id: 'itfb-editorial',
    title: 'Guide Transformation Numérique',
    description:
      "Rédaction d'un guide complet sur la transformation numérique des PME",
    startDate: '2024-12-01T09:00:00Z',
    endDate: '2024-12-20T17:00:00Z',
    location: 'IT for Business - Bureau Éditorial',
    maxAttendees: 10,
    status: 'published',
    org_id: 'org-itforbusiness',
    category: 'editorial',
  },
]

// Utilitaires
function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email && user.isActive)
}

function findUserByEmailAndOrg(
  email: string,
  orgId?: string
): User | undefined {
  if (orgId) {
    return users.find(
      (user) => user.email === email && user.orgId === orgId && user.isActive
    )
  }
  return findUserByEmail(email)
}

// Données complètes
export const demoData = {
  organizations,
  roles,
  users,
  events,

  // Helpers
  findUserByEmail,
  findUserByEmailAndOrg,

  // Exemples de connexion
  loginExamples: [
    {
      email: 'corentin@kistler.com',
      password: 'demo123',
      description: 'Super Admin (accès global)',
    },
    {
      email: 'fred@choyou.com',
      password: 'demo123',
      description: 'Fred Ktorza - Admin Choyou',
    },
    {
      email: 'claudia@choyou.com',
      password: 'demo123',
      description: 'Claudia Tessier - Graphiste Choyou',
    },
    {
      email: 'rabie@choyou.com',
      password: 'demo123',
      description: 'Rabie Gharghar - Développeur Choyou',
    },
    {
      email: 'thomas@itforbusiness.com',
      password: 'demo123',
      description: 'Thomas Pagbe - Admin IT for Business',
    },
    {
      email: 'alessandro@itforbusiness.com',
      password: 'demo123',
      description: 'Alessandro Rossi - Journaliste',
    },
    {
      email: 'thierry@itforbusiness.com',
      password: 'demo123',
      description: 'Thierry Martin - Rédacteur',
    },
  ],
}

// Handlers MSW
console.log('🔧 Configuration des nouveaux handlers de démo')

export const authDemoHandlers = [
  // Login
  http.post(`${env.VITE_API_BASE_URL}/auth/login`, async ({ request }) => {
    console.log('🎯 Handler de login appelé')

    const body = (await request.json()) as {
      email: string
      password: string
      orgId?: string
    }
    const { email, password, orgId } = body

    console.log('📧 Tentative de connexion:', { email, orgId })

    const user = findUserByEmailAndOrg(email, orgId)

    if (!user || password !== 'demo123') {
      console.log('❌ Authentification échouée pour:', {
        email,
        password,
        userFound: !!user,
      })
      return HttpResponse.json(
        {
          message: 'Unauthorized',
          error: 'Identifiants invalides',
          statusCode: 401,
        },
        { status: 401 }
      )
    }

    console.log('✅ Connexion réussie:', user.firstName, user.lastName)

    // Pour le Super Admin, assigner la première organisation par défaut s'il n'en a pas
    let effectiveOrgId = user.orgId
    let currentOrganization = organizations.find((org) => org.id === user.orgId)

    if (user.isSuperAdmin && !user.orgId) {
      effectiveOrgId = organizations[0]?.id || ''
      currentOrganization = organizations[0]
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [user.role.code],
        orgId: effectiveOrgId,
        eventIds: user.eventIds || [],
        isSuperAdmin: user.isSuperAdmin || false,
      },
      token: btoa(
        JSON.stringify({
          userId: user.id,
          orgId: effectiveOrgId,
          role: user.role.code,
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })
      ),
      organization: currentOrganization,
    })
  }),

  // Profil utilisateur
  http.get(`${env.VITE_API_BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token))

      if (payload.exp < Date.now()) {
        return HttpResponse.json({ error: 'Token expiré' }, { status: 401 })
      }

      const user = users.find((u) => u.id === payload.userId)

      if (!user) {
        return HttpResponse.json(
          { error: 'Utilisateur introuvable' },
          { status: 404 }
        )
      }

      return HttpResponse.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [user.role.code],
        orgId: user.orgId,
        eventIds: user.eventIds || [],
        isSuperAdmin: user.isSuperAdmin || false,
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
  }),

  // Liste des organisations
  http.get(`${env.VITE_API_BASE_URL}/organizations/me`, () => {
    return HttpResponse.json(organizations)
  }),

  // Changement d'organisation (super admin)
  http.post(`${env.VITE_API_BASE_URL}/auth/switch-org`, async ({ request }) => {
    const body = (await request.json()) as { orgId: string }
    const { orgId } = body
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token))

      const currentUser = users.find((u) => u.id === payload.userId)

      if (!currentUser?.isSuperAdmin) {
        return HttpResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      const targetOrg = organizations.find((org) => org.id === orgId)
      if (!targetOrg) {
        return HttpResponse.json(
          { error: 'Organisation introuvable' },
          { status: 404 }
        )
      }

      const adminRole = roles.find(
        (r) => r.orgId === orgId && r.code === 'ORG_ADMIN'
      )
      if (!adminRole) {
        return HttpResponse.json(
          { error: 'Rôle admin introuvable' },
          { status: 500 }
        )
      }

      const newToken = btoa(
        JSON.stringify({
          userId: currentUser.id,
          orgId: orgId,
          role: adminRole.code,
          exp: Date.now() + 24 * 60 * 60 * 1000,
        })
      )

      return HttpResponse.json({
        user: {
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          roles: [adminRole.code],
          orgId: orgId,
          eventIds: [],
          isSuperAdmin: true,
        },
        token: newToken,
        organization: targetOrg,
      })
    } catch (error) {
      return HttpResponse.json({ error: 'Token invalide' }, { status: 401 })
    }
  }),

  // Déconnexion
  http.post(`${env.VITE_API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Politique CASL
  http.get(`${env.VITE_API_BASE_URL}/auth/policy/:orgId`, ({ params }) => {
    const { orgId } = params

    const baseRules = [
      { action: 'read', subject: 'Organization', conditions: { id: orgId } },
      { action: 'read', subject: 'Event', conditions: { orgId } },
      { action: 'read', subject: 'Attendee', conditions: { orgId } },
    ]

    return HttpResponse.json({
      rules: baseRules,
      version: '1.0.0',
    })
  }),
]
