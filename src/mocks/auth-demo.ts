import { http, HttpResponse } from 'msw'
import { env } from '@/app/config/env'

// Types pour les données de démo
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
  eventIds?: string[]  // IDs des événements accessibles (pour les partenaires)
}

// Organisations de démo
export const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'TechCorp',
    slug: 'techcorp',
    timezone: 'Europe/Paris',
    planCode: 'ENTERPRISE'
  },
  {
    id: 'org-2',
    name: 'Creative Agency',
    slug: 'creative-agency',
    timezone: 'Europe/London',
    planCode: 'PROFESSIONAL'
  },
  {
    id: 'org-3',
    name: 'Startup Hub',
    slug: 'startup-hub',
    timezone: 'America/New_York',
    planCode: 'BASIC'
  }
]

// Rôles par organisation
export const roles: Role[] = [
  // TechCorp roles
  {
    id: 'role-1-admin',
    orgId: 'org-1',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation',
    description: 'Accès complet à l\'organisation'
  },
  {
    id: 'role-1-manager',
    orgId: 'org-1',
    code: 'EVENT_MANAGER',
    name: 'Gestionnaire Événements',
    description: 'Gestion des événements et participants'
  },
  {
    id: 'role-1-staff',
    orgId: 'org-1',
    code: 'CHECKIN_STAFF',
    name: 'Personnel Check-in',
    description: 'Check-in et gestion des présences'
  },
  // Creative Agency roles
  {
    id: 'role-2-admin',
    orgId: 'org-2',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation',
    description: 'Accès complet à l\'organisation'
  },
  {
    id: 'role-2-partner',
    orgId: 'org-2',
    code: 'PARTNER',
    name: 'Partenaire',
    description: 'Accès aux événements partenaires'
  },
  {
    id: 'role-2-partner-tech',
    orgId: 'org-2',
    code: 'PARTNER_TECH',
    name: 'Partenaire Tech',
    description: 'Partenaire spécialisé événements tech'
  },
  {
    id: 'role-2-partner-design',
    orgId: 'org-2',
    code: 'PARTNER_DESIGN',
    name: 'Partenaire Design',
    description: 'Partenaire spécialisé événements design'
  },
  {
    id: 'role-2-readonly',
    orgId: 'org-2',
    code: 'READONLY',
    name: 'Lecture seule',
    description: 'Consultation uniquement'
  },
  // Startup Hub roles
  {
    id: 'role-3-admin',
    orgId: 'org-3',
    code: 'ORG_ADMIN',
    name: 'Administrateur Organisation',
    description: 'Accès complet à l\'organisation'
  },
  {
    id: 'role-3-manager',
    orgId: 'org-3',
    code: 'ORG_MANAGER',
    name: 'Gestionnaire Organisation',
    description: 'Gestion de l\'organisation'
  },
  {
    id: 'role-3-staff',
    orgId: 'org-3',
    code: 'CHECKIN_STAFF',
    name: 'Personnel Check-in',
    description: 'Check-in et gestion des présences'
  }
]

// Utilisateurs de démo
export const users: User[] = [
  // Super Admin (peut naviguer entre toutes les orgs)
  {
    id: 'user-super-admin',
    orgId: 'org-1',
    email: 'super@admin.com',
    firstName: 'Super',
    lastName: 'Admin',
    roleId: 'role-1-admin',
    role: roles.find(r => r.id === 'role-1-admin')!,
    isActive: true,
    isSuperAdmin: true
  },
  // TechCorp users
  {
    id: 'user-1-admin',
    orgId: 'org-1',
    email: 'admin@techcorp.com',
    firstName: 'Alice',
    lastName: 'Martin',
    roleId: 'role-1-admin',
    role: roles.find(r => r.id === 'role-1-admin')!,
    isActive: true
  },
  {
    id: 'user-1-manager',
    orgId: 'org-1',
    email: 'manager@techcorp.com',
    firstName: 'Bob',
    lastName: 'Dupont',
    roleId: 'role-1-manager',
    role: roles.find(r => r.id === 'role-1-manager')!,
    isActive: true
  },
  {
    id: 'user-1-staff',
    orgId: 'org-1',
    email: 'staff@techcorp.com',
    firstName: 'Charlie',
    lastName: 'Durand',
    roleId: 'role-1-staff',
    role: roles.find(r => r.id === 'role-1-staff')!,
    isActive: true
  },
  // Creative Agency users
  {
    id: 'user-2-admin',
    orgId: 'org-2',
    email: 'admin@creative.com',
    firstName: 'Diana',
    lastName: 'Smith',
    roleId: 'role-2-admin',
    role: roles.find(r => r.id === 'role-2-admin')!,
    isActive: true
  },
  {
    id: 'user-2-partner-tech',
    orgId: 'org-2',
    email: 'tech@creative.com',
    firstName: 'Alex',
    lastName: 'Chen',
    roleId: 'role-2-partner-tech',
    role: roles.find(r => r.id === 'role-2-partner-tech')!,
    isActive: true,
    eventIds: ['event-tech-1', 'event-tech-2', 'event-shared-1'] // Événements spécifiques + partagé
  },
  {
    id: 'user-2-partner-design',
    orgId: 'org-2',
    email: 'design@creative.com',
    firstName: 'Sophie',
    lastName: 'Martin',
    roleId: 'role-2-partner-design',
    role: roles.find(r => r.id === 'role-2-partner-design')!,
    isActive: true,
    eventIds: ['event-design-1', 'event-design-2', 'event-shared-1'] // Événements spécifiques + partagé
  },
  {
    id: 'user-2-readonly',
    orgId: 'org-2',
    email: 'readonly@creative.com',
    firstName: 'Frank',
    lastName: 'Brown',
    roleId: 'role-2-readonly',
    role: roles.find(r => r.id === 'role-2-readonly')!,
    isActive: true
  },
  // Startup Hub users
  {
    id: 'user-3-admin',
    orgId: 'org-3',
    email: 'admin@startup.com',
    firstName: 'Grace',
    lastName: 'Wilson',
    roleId: 'role-3-admin',
    role: roles.find(r => r.id === 'role-3-admin')!,
    isActive: true
  },
  {
    id: 'user-3-manager',
    orgId: 'org-3',
    email: 'manager@startup.com',
    firstName: 'Henry',
    lastName: 'Davis',
    roleId: 'role-3-manager',
    role: roles.find(r => r.id === 'role-3-manager')!,
    isActive: true
  }
]

// Utilitaires pour trouver les utilisateurs
function findUserByEmail(email: string): User | undefined {
  return users.find(user => user.email === email && user.isActive)
}

function findUserByEmailAndOrg(email: string, orgId?: string): User | undefined {
  if (orgId) {
    return users.find(user => user.email === email && user.orgId === orgId && user.isActive)
  }
  return findUserByEmail(email)
}

// Données de démo complètes avec organisations, rôles et utilisateurs
export const demoData = {
  organizations,
  roles,
  users,
  
  // Helpers pour les tests
  findUserByEmail,
  findUserByEmailAndOrg,
  
  // Exemples de connexion
  loginExamples: [
    { email: 'super@admin.com', password: 'demo123', description: 'Super Admin (peut naviguer entre toutes les orgs)' },
    { email: 'admin@techcorp.com', password: 'demo123', description: 'Admin TechCorp' },
    { email: 'manager@techcorp.com', password: 'demo123', description: 'Manager TechCorp' },
    { email: 'admin@creative.com', password: 'demo123', description: 'Admin Creative Agency' },
    { email: 'tech@creative.com', password: 'demo123', description: 'Partenaire Tech Creative (événements tech + partagés)' },
    { email: 'design@creative.com', password: 'demo123', description: 'Partenaire Design Creative (événements design + partagés)' },
    { email: 'readonly@creative.com', password: 'demo123', description: 'Lecture seule Creative Agency' },
    { email: 'admin@startup.com', password: 'demo123', description: 'Admin Startup Hub' }
  ]
}

// Handlers MSW pour l'authentification multi-tenant
console.log('🔧 Configuration des handlers de démo avec base URL:', env.VITE_API_BASE_URL)

export const authDemoHandlers = [
  // Login avec support multi-org
  http.post('http://localhost:3001/api/auth/login', async ({ request }) => {
    console.log('🎯 Handler de démo appelé pour login:', `${env.VITE_API_BASE_URL}/auth/login`)
    
    const body = await request.json() as { email: string; password: string; orgId?: string }
    const { email, password, orgId } = body
    
    console.log('📧 Tentative de connexion:', { email, password, orgId })
    
    // Trouve l'utilisateur par email et org (ou org par défaut)
    const user = findUserByEmailAndOrg(email, orgId)
    
    console.log('👤 Utilisateur trouvé:', user ? `${user.firstName} ${user.lastName}` : 'Aucun')
    
    if (!user || password !== 'demo123') {
      return HttpResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Génère un token JWT mock
    const token = btoa(JSON.stringify({
      userId: user.id,
      orgId: user.orgId,
      role: user.role.code,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24h
    }))

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [user.role.code],
        orgId: user.orgId,
        eventIds: user.eventIds || [], // ← Utiliser les eventIds de l'utilisateur
        isSuperAdmin: user.isSuperAdmin || false
      },
      token,
      organization: organizations.find(org => org.id === user.orgId)
    })
  }),

  // Récupération du profil utilisateur
  http.get('http://localhost:3001/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      )
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token))
      
      if (payload.exp < Date.now()) {
        return HttpResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        )
      }

      const user = users.find(u => u.id === payload.userId && u.orgId === payload.orgId)
      
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
        eventIds: [],
        isSuperAdmin: user.isSuperAdmin || false
      })
    } catch (error) {
      return HttpResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
  }),

  // Liste des organisations (pour super admin ou sélection)
  http.get('http://localhost:3001/api/organizations', () => {
    return HttpResponse.json(organizations)
  }),

  // Changement d'organisation (pour super admin)
  http.post('http://localhost:3001/api/auth/switch-org', async ({ request }) => {
    const body = await request.json() as { orgId: string }
    const { orgId } = body
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Token manquant' },
        { status: 401 }
      )
    }

    try {
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token))
      
      const currentUser = users.find(u => u.id === payload.userId)
      
      if (!currentUser?.isSuperAdmin) {
        return HttpResponse.json(
          { error: 'Accès refusé' },
          { status: 403 }
        )
      }

      const targetOrg = organizations.find(org => org.id === orgId)
      
      if (!targetOrg) {
        return HttpResponse.json(
          { error: 'Organisation introuvable' },
          { status: 404 }
        )
      }

      // Pour un super admin, on utilise le rôle ORG_ADMIN par défaut
      const adminRole = roles.find(r => r.orgId === orgId && r.code === 'ORG_ADMIN')
      
      if (!adminRole) {
        return HttpResponse.json(
          { error: 'Rôle admin introuvable pour cette organisation' },
          { status: 500 }
        )
      }

      // Nouveau token avec la nouvelle org
      const newToken = btoa(JSON.stringify({
        userId: currentUser.id,
        orgId: orgId,
        role: adminRole.code,
        exp: Date.now() + 24 * 60 * 60 * 1000
      }))

      return HttpResponse.json({
        user: {
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          roles: [adminRole.code],
          orgId: orgId,
          eventIds: [],
          isSuperAdmin: true
        },
        token: newToken,
        organization: targetOrg
      })
    } catch (error) {
      return HttpResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      )
    }
  }),

  // Déconnexion
  http.post(`${env.VITE_API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ success: true })
  }),

  // Récupération des règles CASL pour une organisation
  http.get(`${env.VITE_API_BASE_URL}/auth/policy/:orgId`, ({ params }) => {
    const { orgId } = params
    
    // Pour la démo, on retourne des règles basiques basées sur l'organisation
    const baseRules = [
      { action: 'read', subject: 'Organization', conditions: { id: orgId } },
      { action: 'read', subject: 'Event', conditions: { orgId } },
      { action: 'read', subject: 'Attendee', conditions: { orgId } }
    ]

    return HttpResponse.json({
      rules: baseRules,
      version: '1.0.0'
    })
  })
]
