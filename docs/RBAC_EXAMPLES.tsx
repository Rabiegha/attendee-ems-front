// Exemples d'utilisation des permissions RBAC granulaires

import { useCan } from '@/shared/acl/hooks/useCan'

// ✅ EXEMPLES DE BONNES PRATIQUES RBAC

export const EventManagementExample = () => {
  // Permissions spécifiques pour différentes actions
  const canCreateEvent = useCan('create', 'Event')
  const canViewAllEvents = useCan('view-all', 'Event') // ADMIN/MANAGER voient tout
  const canAssignPartners = useCan('assign', 'User') // Assigner partenaires aux événements
  const canManageRoles = useCan('manage', 'Role') // Future: gestion des rôles
  
  return (
    <div>
      {/* Création d'événements */}
      {canCreateEvent && (
        <button>Créer un événement</button>
      )}
      
      {/* Assignation de partenaires - seulement ADMIN/MANAGER */}
      {canAssignPartners && (
        <PartnerAssignmentComponent />
      )}
      
      {/* Voir tous vs événements assignés */}
      {canViewAllEvents ? (
        <AllEventsView />
      ) : (
        <AssignedEventsView />
      )}
      
      {/* Gestion des rôles - future fonctionnalité */}
      {canManageRoles && (
        <RoleManagementButton />
      )}
    </div>
  )
}

export const UserManagementExample = () => {
  // Permissions utilisateurs
  const canCreateUser = useCan('create', 'User')
  const canInviteUser = useCan('invite', 'User')
  const canManageOrg = useCan('manage', 'Organization')
  const canAssignRoles = useCan('assign', 'User')
  
  return (
    <div>
      {/* Création directe d'utilisateurs */}
      {canCreateUser && (
        <CreateUserButton />
      )}
      
      {/* Invitations par email */}
      {canInviteUser && (
        <InviteUserButton />
      )}
      
      {/* Gestion organisation - seulement ADMIN */}
      {canManageOrg && (
        <OrganizationSettingsPanel />
      )}
      
      {/* Assignment de rôles */}
      {canAssignRoles && (
        <RoleAssignmentComponent />
      )}
    </div>
  )
}

export const ScanningExample = () => {
  // Permissions spécialisées pour HOTESSE
  const canScanQR = useCan('scan', 'QRCode')
  const canCheckinAttendee = useCan('check-in', 'Attendee')
  
  if (!canScanQR) {
    return <div>Accès non autorisé</div>
  }
  
  return (
    <div>
      <QRScanner />
      {canCheckinAttendee && (
        <CheckinInterface />
      )}
    </div>
  )
}

// ❌ EXEMPLES À ÉVITER - Vérifications de rôles directes

export const BadExample = () => {
  const user = useSelector(selectUser)
  
  // ❌ NE PAS FAIRE : vérification directe du rôle
  if (user.role?.code === 'ADMIN') {
    return <AdminPanel />
  }
  
  // ❌ NE PAS FAIRE : logique métier basée sur les rôles
  const userActions = {
    'SUPER_ADMIN': ['create', 'delete', 'manage'],
    'ADMIN': ['create', 'update'],
    'MANAGER': ['update']
  }[user.role?.code || ''] || []
  
  return <div>{/* Interface basée sur le rôle */}</div>
}

// ✅ VERSION CORRIGÉE - Utilisation de permissions

export const GoodExample = () => {
  // ✅ FAIRE : vérifications par permissions
  const canManageAll = useCan('manage', 'all')
  const canCreateEvents = useCan('create', 'Event')
  const canUpdateEvents = useCan('update', 'Event')
  
  return (
    <div>
      {canManageAll && <SuperAdminPanel />}
      {canCreateEvents && <CreateEventButton />}
      {canUpdateEvents && <EventEditForm />}
    </div>
  )
}

// 🔮 EXEMPLES FUTURS - Rôles personnalisables

export const CustomRoleExample = () => {
  // Ces permissions pourront être configurées dynamiquement
  const canAccessCustomFeature = useCan('read', 'CustomModule')
  const canExecuteWorkflow = useCan('execute', 'Workflow')
  const canViewAnalytics = useCan('read', 'Analytics')
  
  return (
    <div>
      {/* Fonctionnalités qui s'activent selon les permissions du rôle personnalisé */}
      {canAccessCustomFeature && <CustomModuleAccess />}
      {canExecuteWorkflow && <WorkflowInterface />}
      {canViewAnalytics && <AnalyticsDashboard />}
    </div>
  )
}

// Composants factices pour les exemples
const PartnerAssignmentComponent = () => <div>Assignation partenaires</div>
const AllEventsView = () => <div>Tous les événements</div>
const AssignedEventsView = () => <div>Événements assignés</div>
const RoleManagementButton = () => <button>Gérer les rôles</button>
const CreateUserButton = () => <button>Créer utilisateur</button>
const InviteUserButton = () => <button>Inviter utilisateur</button>
const OrganizationSettingsPanel = () => <div>Paramètres organisation</div>
const RoleAssignmentComponent = () => <div>Assignment rôles</div>
const QRScanner = () => <div>Scanner QR</div>
const CheckinInterface = () => <div>Interface check-in</div>
const SuperAdminPanel = () => <div>Panel Super Admin</div>
const CreateEventButton = () => <button>Créer événement</button>
const EventEditForm = () => <div>Formulaire édition</div>
const CustomModuleAccess = () => <div>Module personnalisé</div>
const WorkflowInterface = () => <div>Interface workflow</div>
const AnalyticsDashboard = () => <div>Dashboard analytics</div>