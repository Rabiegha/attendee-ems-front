import type { Role, Permission, UpdateRolePermissionsRequest, UpdateRolePermissionsResponse } from '../types'

// 🎭 MOCK DATA - Basé sur la structure réelle de la base de données
const MOCK_PERMISSIONS: Permission[] = [
  // Événements
  { id: 'perm-1', code: 'events.create', name: 'Créer des événements', category: 'EVENTS', description: 'Créer de nouveaux événements dans l\'organisation' },
  { id: 'perm-2', code: 'events.read', name: 'Voir les événements', category: 'EVENTS', description: 'Consulter la liste des événements' },
  { id: 'perm-3', code: 'events.update', name: 'Modifier les événements', category: 'EVENTS', description: 'Éditer les détails des événements' },
  { id: 'perm-4', code: 'events.delete', name: 'Supprimer des événements', category: 'EVENTS', description: 'Supprimer définitivement des événements' },
  { id: 'perm-5', code: 'events.manage_all', name: 'Gérer tous les événements', category: 'EVENTS', description: 'Accès total aux événements de l\'organisation' },

  // Utilisateurs
  { id: 'perm-6', code: 'users.create', name: 'Créer des utilisateurs', category: 'USERS', description: 'Ajouter de nouveaux utilisateurs à l\'équipe' },
  { id: 'perm-7', code: 'users.read', name: 'Voir les utilisateurs', category: 'USERS', description: 'Consulter la liste des utilisateurs' },
  { id: 'perm-8', code: 'users.update', name: 'Modifier les utilisateurs', category: 'USERS', description: 'Éditer les profils utilisateurs' },
  { id: 'perm-9', code: 'users.delete', name: 'Supprimer des utilisateurs', category: 'USERS', description: 'Désactiver ou supprimer des comptes utilisateurs' },
  { id: 'perm-10', code: 'users.invite', name: 'Inviter des utilisateurs', category: 'USERS', description: 'Envoyer des invitations par email' },

  // Participants
  { id: 'perm-11', code: 'attendees.create', name: 'Ajouter des participants', category: 'ATTENDEES', description: 'Inscrire de nouveaux participants' },
  { id: 'perm-12', code: 'attendees.read', name: 'Voir les participants', category: 'ATTENDEES', description: 'Consulter les listes de participants' },
  { id: 'perm-13', code: 'attendees.update', name: 'Modifier les participants', category: 'ATTENDEES', description: 'Éditer les informations des participants' },
  { id: 'perm-14', code: 'attendees.delete', name: 'Supprimer des participants', category: 'ATTENDEES', description: 'Retirer des participants des événements' },
  { id: 'perm-15', code: 'attendees.checkin', name: 'Check-in participants', category: 'ATTENDEES', description: 'Scanner QR codes et enregistrer les présences' },

  // Rapports
  { id: 'perm-16', code: 'reports.read', name: 'Voir les rapports', category: 'REPORTS', description: 'Consulter les statistiques et rapports' },
  { id: 'perm-17', code: 'reports.export', name: 'Exporter les rapports', category: 'REPORTS', description: 'Télécharger les données en CSV/Excel' },

  // Paramètres
  { id: 'perm-18', code: 'settings.read', name: 'Voir les paramètres', category: 'SETTINGS', description: 'Consulter la configuration système' },
  { id: 'perm-19', code: 'settings.update', name: 'Modifier les paramètres', category: 'SETTINGS', description: 'Changer la configuration de l\'organisation' },

  // Organisation
  { id: 'perm-20', code: 'organization.read', name: 'Voir l\'organisation', category: 'ORGANIZATION', description: 'Consulter les informations de l\'organisation' },
  { id: 'perm-21', code: 'organization.update', name: 'Modifier l\'organisation', category: 'ORGANIZATION', description: 'Éditer les détails de l\'organisation' },
  { id: 'perm-22', code: 'roles.read', name: 'Voir les rôles', category: 'ORGANIZATION', description: 'Consulter la liste des rôles et permissions' },
  { id: 'perm-23', code: 'roles.manage', name: 'Gérer les rôles', category: 'ORGANIZATION', description: 'Modifier les permissions des rôles' },
]

const MOCK_ROLES: Role[] = [
  {
    id: 'role-1',
    code: 'ADMIN',
    name: 'Administrateur',
    description: 'Gestion complète de l\'organisation, équipe et invitations',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    permissions: [
      'perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5', // Tous événements
      'perm-6', 'perm-7', 'perm-8', 'perm-9', 'perm-10', // Tous utilisateurs
      'perm-11', 'perm-12', 'perm-13', 'perm-14', 'perm-15', // Tous participants
      'perm-16', 'perm-17', // Tous rapports
      'perm-18', 'perm-19', // Tous paramètres
      'perm-20', 'perm-21', 'perm-22', 'perm-23' // Tous organisation
    ]
  },
  {
    id: 'role-2',
    code: 'MANAGER',
    name: 'Manager',
    description: 'Gestion des événements sans invitation d\'utilisateurs',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    permissions: [
      'perm-1', 'perm-2', 'perm-3', 'perm-4', 'perm-5', // Tous événements
      'perm-7', 'perm-8', // Utilisateurs (lecture/modification seulement)
      'perm-11', 'perm-12', 'perm-13', 'perm-14', 'perm-15', // Tous participants
      'perm-16', 'perm-17', // Tous rapports
      'perm-18', // Paramètres (lecture seulement)
      'perm-20', 'perm-22' // Organisation (lecture seulement)
    ]
  },
  {
    id: 'role-3',
    code: 'VIEWER',
    name: 'Visualiseur',
    description: 'Lecture seule sur tous les événements de l\'organisation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    permissions: [
      'perm-2', // Événements (lecture seulement)
      'perm-7', // Utilisateurs (lecture seulement)
      'perm-12', // Participants (lecture seulement)
      'perm-16', // Rapports (lecture seulement)
      'perm-18', // Paramètres (lecture seulement)
      'perm-20', 'perm-22' // Organisation (lecture seulement)
    ]
  },
  {
    id: 'role-4',
    code: 'PARTNER',
    name: 'Partenaire',
    description: 'Lecture seule uniquement sur les événements assignés',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    permissions: [
      'perm-2', // Événements (lecture seulement, limité aux assignés)
      'perm-12', // Participants (lecture seulement)
      'perm-16', // Rapports (lecture seulement)
      'perm-20' // Organisation (lecture seulement)
    ]
  },
  {
    id: 'role-5',
    code: 'HOTESSE',
    name: 'Hôtesse',
    description: 'Scanner QR codes et check-in des participants',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    permissions: [
      'perm-2', // Événements (lecture seulement)
      'perm-12', 'perm-15', // Participants (lecture et check-in)
      'perm-20' // Organisation (lecture seulement)
    ]
  }
]

// 🌐 API SIMULATION
class RolePermissionsApi {
  
  /**
   * Récupère tous les rôles avec leurs permissions
   * 🔮 Future API: GET /api/roles?include=permissions
   */
  async getRoles(): Promise<Role[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...MOCK_ROLES]
  }

  /**
   * Récupère toutes les permissions disponibles
   * 🔮 Future API: GET /api/permissions
   */
  async getPermissions(): Promise<Permission[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...MOCK_PERMISSIONS]
  }

  /**
   * Met à jour les permissions d'un rôle
   * 🔮 Future API: PUT /api/roles/:roleId/permissions
   */
  async updateRolePermissions(request: UpdateRolePermissionsRequest): Promise<UpdateRolePermissionsResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Find role and update permissions
    const role = MOCK_ROLES.find(role => role.id === request.roleId)
    
    if (!role) {
      throw new Error(`Role with ID ${request.roleId} not found`)
    }
    
    // Update mock data
    role.permissions = [...request.permissionIds]

    return {
      success: true,
      role: { ...role },
      message: `Permissions updated for role ${role.name}`
    }
  }

  /**
   * Toggle une permission spécifique pour un rôle
   * 🔮 Future API: PATCH /api/roles/:roleId/permissions/:permissionId
   */
  async toggleRolePermission(roleId: string, permissionId: string): Promise<UpdateRolePermissionsResponse> {
    const role = MOCK_ROLES.find(role => role.id === roleId)
    
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`)
    }

    const hasPermission = role.permissions.includes(permissionId)
    
    if (hasPermission) {
      // Remove permission
      role.permissions = role.permissions.filter(id => id !== permissionId)
    } else {
      // Add permission
      role.permissions = [...role.permissions, permissionId]
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    return {
      success: true,
      role: { ...role },
      message: `Permission ${hasPermission ? 'removed from' : 'added to'} role ${role.name}`
    }
  }
}

// Export singleton instance
export const rolePermissionsApi = new RolePermissionsApi()

// Export mock data for testing
export { MOCK_ROLES, MOCK_PERMISSIONS }