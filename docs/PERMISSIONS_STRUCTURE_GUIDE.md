# 🔐 Guide Complet : Structure et Emplacement des Permissions RBAC

## 📍 Vue d'Ensemble de l'Architecture

```
src/shared/acl/
├── app-ability.ts          ← TYPES: Définition des Actions et Subjects
├── policies/
│   └── rbac-presets.ts     ← RÈGLES: Permissions par rôle + conditions
├── guards/
│   └── Can.tsx             ← COMPOSANT: Guard de permissions
└── providers/
    └── AbilityProvider.tsx ← CONTEXTE: Fournisseur de permissions
```

## 🎯 1. Définir les Types de Permissions (app-ability.ts)

**Emplacement :** `src/shared/acl/app-ability.ts`

```typescript
// ✅ Actions possibles - Verbes d'action
export type Actions = 
  | 'create'      // Créer une ressource
  | 'read'        // Lire/voir une ressource  
  | 'update'      // Modifier une ressource
  | 'delete'      // Supprimer une ressource
  | 'manage'      // Tous droits sur une ressource (create+read+update+delete)
  | 'assign'      // Assigner des ressources (users, roles)
  | 'view-all'    // Voir toutes les ressources vs seulement les siennes
  | 'export'      // Exporter des données
  | 'scan'        // Scanner des QR codes (HOTESSE)
  | 'checkin'     // Faire le check-in des participants

// ✅ Sujets/Ressources - Noms des entités
export type Subjects =
  | 'Event'           // Événements
  | 'User'            // Utilisateurs
  | 'Attendee'        // Participants
  | 'Organization'    // Organisations
  | 'Role'            // Rôles (pour gestion future)
  | 'Permission'      // Permissions (pour gestion future)
  | 'Invitation'      // Invitations
  | 'all'            // Toutes ressources (pour SUPER_ADMIN)

// ✅ Type principal CASL
export type AppAbility = PureAbility<[Actions, Subjects | InferSubjects<any>], MongoQuery>
```

### 🎨 Convention de Nommage

```typescript
// ✅ BONNE pratique - Actions génériques et réutilisables
'create' | 'read' | 'update' | 'delete' | 'manage'

// ✅ BONNE pratique - Actions spécialisées courtes  
'assign' | 'scan' | 'checkin' | 'export' | 'view-all'

// ❌ MAUVAISE pratique - Actions trop spécifiques
'create-event-for-organization' | 'update-user-profile-only'

// ✅ BONNE pratique - Sujets au singulier et clairs
'Event' | 'User' | 'Organization' | 'Role'

// ❌ MAUVAISE pratique - Sujets flous ou pluriels
'Events' | 'Data' | 'AdminStuff' | 'Things'
```

## 🛠️ 2. Définir les Règles de Permissions (rbac-presets.ts)

**Emplacement :** `src/shared/acl/policies/rbac-presets.ts`

```typescript
// ✅ Structure des permissions par rôle
export const rolePermissions: Record<Role, Permission[]> = {
  
  // 👑 SUPER_ADMIN - Accès total sans restrictions d'organisation
  SUPER_ADMIN: [
    { action: 'manage', subject: 'all' }, // Tous droits sur tout
  ],

  // 🏢 ADMIN - Gestion complète de son organisation
  ADMIN: [
    // Gestion organisation
    { action: 'manage', subject: 'Organization', conditions: { id: '${user.orgId}' } },
    
    // Gestion événements
    { action: 'manage', subject: 'Event', conditions: { orgId: '${user.orgId}' } },
    { action: 'view-all', subject: 'Event', conditions: { orgId: '${user.orgId}' } },
    
    // Gestion utilisateurs
    { action: 'create', subject: 'User', conditions: { orgId: '${user.orgId}' } },
    { action: 'assign', subject: 'User', conditions: { orgId: '${user.orgId}' } },
    { action: 'manage', subject: 'Invitation', conditions: { orgId: '${user.orgId}' } },
    
    // Gestion rôles et permissions (FUTUR)
    { action: 'create', subject: 'Role', conditions: { orgId: '${user.orgId}' } },
    { action: 'manage', subject: 'Permission', conditions: { orgId: '${user.orgId}' } },
    
    // Participants
    { action: 'manage', subject: 'Attendee', conditions: { 'event.orgId': '${user.orgId}' } },
    { action: 'export', subject: 'Attendee', conditions: { 'event.orgId': '${user.orgId}' } },
  ],

  // 📋 MANAGER - Gestion des événements assignés
  MANAGER: [
    // Événements assignés
    { action: 'read', subject: 'Event', conditions: { assignedManagers: { $in: ['${user.id}'] } } },
    { action: 'update', subject: 'Event', conditions: { assignedManagers: { $in: ['${user.id}'] } } },
    { action: 'view-all', subject: 'Event', conditions: { orgId: '${user.orgId}' } },
    
    // Participants des événements assignés
    { action: 'manage', subject: 'Attendee', conditions: { 'event.assignedManagers': { $in: ['${user.id}'] } } },
    { action: 'checkin', subject: 'Attendee', conditions: { 'event.assignedManagers': { $in: ['${user.id}'] } } },
    { action: 'export', subject: 'Attendee', conditions: { 'event.assignedManagers': { $in: ['${user.id}'] } } },
    
    // Assignment de partenaires
    { action: 'assign', subject: 'User', conditions: { role: 'PARTNER', orgId: '${user.orgId}' } },
  ],

  // 👁️ VIEWER - Lecture seule
  VIEWER: [
    { action: 'read', subject: 'Event', conditions: { orgId: '${user.orgId}' } },
    { action: 'read', subject: 'Attendee', conditions: { 'event.orgId': '${user.orgId}' } },
    { action: 'read', subject: 'Organization', conditions: { id: '${user.orgId}' } },
  ],

  // 🤝 PARTNER - Événements assignés en lecture + check-in
  PARTNER: [
    { action: 'read', subject: 'Event', conditions: { assignedPartners: { $in: ['${user.id}'] } } },
    { action: 'read', subject: 'Attendee', conditions: { 'event.assignedPartners': { $in: ['${user.id}'] } } },
    { action: 'checkin', subject: 'Attendee', conditions: { 'event.assignedPartners': { $in: ['${user.id}'] } } },
  ],

  // 📱 HOTESSE - Scanner QR codes
  HOTESSE: [
    { action: 'scan', subject: 'Attendee', conditions: { 'event.orgId': '${user.orgId}' } },
    { action: 'checkin', subject: 'Attendee', conditions: { 'event.orgId': '${user.orgId}' } },
    { action: 'read', subject: 'Event', conditions: { orgId: '${user.orgId}' } },
  ],
}
```

### 🔍 Explications des Conditions

```typescript
// ✅ Conditions par contexte organisation
{ orgId: '${user.orgId}' }              // Ressource de l'orga user
{ 'event.orgId': '${user.orgId}' }      // Via relation event

// ✅ Conditions par assignation
{ assignedManagers: { $in: ['${user.id}'] } }    // User dans la liste
{ 'event.assignedPartners': { $in: ['${user.id}'] } } // Via relation

// ✅ Conditions par propriété
{ createdBy: '${user.id}' }             // User propriétaire
{ id: '${user.orgId}' }                 // ID spécifique

// ✅ Conditions par rôle (pour assignations)
{ role: 'PARTNER', orgId: '${user.orgId}' }      // Filtrage multi-critères
```

## 🎯 3. Utiliser les Permissions dans les Composants

### 📁 Dans les Pages (ex: Events/index.tsx)

```tsx
// ✅ Import des hooks/composants RBAC
import { Can } from '@/shared/acl/guards/Can'
import { useCan } from '@/shared/acl/hooks/useCan' // Si besoin

export const EventsPage = () => {
  // ✅ Guards sur les actions UI
  return (
    <div>
      {/* Bouton créer - visible si permission */}
      <Can do="create" on="Event">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Créer un événement
        </Button>
      </Can>

      {/* Liste des événements */}
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          
          {/* Actions par événement - avec contexte */}
          <div className="actions">
            <Can do="update" on="Event" data={event}>
              <Button onClick={() => handleEdit(event)}>
                Modifier
              </Button>
            </Can>
            
            <Can do="delete" on="Event" data={event}>
              <Button onClick={() => handleDelete(event)}>
                Supprimer  
              </Button>
            </Can>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 🎛️ Dans les Formulaires (ex: InviteUserModal.tsx)

```tsx
export const InviteUserModal = () => {
  // ✅ Hooks pour vérifications conditionnelles
  const canInviteAdmins = useCan('manage', 'Organization')
  const canCreateUsers = useCan('create', 'User')
  const canAssignRoles = useCan('assign', 'User')

  // ✅ Filtrage des rôles disponibles selon permissions
  const availableRoles = allRoles.filter(role => {
    if (role === 'SUPER_ADMIN') return false           // Jamais disponible
    if (role === 'ADMIN' && !canInviteAdmins) return false // Seulement si manage org
    if (!canCreateUsers) return false                  // Besoin create user
    return true
  })

  // ✅ Validation avant soumission
  const handleSubmit = (data) => {
    if (!canCreateUsers) {
      toast.error("Vous n'avez pas la permission de créer des utilisateurs")
      return
    }
    
    if (data.role === 'ADMIN' && !canInviteAdmins) {
      toast.error("Vous ne pouvez pas inviter d'administrateurs")
      return  
    }
    
    // Continuer...
  }

  // ✅ UI conditionnelle
  return (
    <Modal>
      <Can do="create" on="User">
        <form onSubmit={handleSubmit}>
          {/* Formulaire */}
        </form>
      </Can>
      
      <Can not do="create" on="User">
        <div>Vous n'avez pas la permission de créer des utilisateurs</div>
      </Can>
    </Modal>
  )
}
```

### 🔒 Dans les Pages Protégées (ex: Dashboard.tsx)

```tsx
export const DashboardPage = () => {
  const canViewOrganization = useCan('read', 'Organization')
  const canViewAllEvents = useCan('view-all', 'Event') 
  const canManageUsers = useCan('manage', 'User')

  // ✅ Redirection si pas de permissions de base
  if (!canViewOrganization) {
    return <Navigate to="/forbidden" />
  }

  return (
    <div className="dashboard">
      {/* Stats générales */}
      <Can do="read" on="Organization">
        <StatsCards />
      </Can>

      {/* Section événements */}
      {canViewAllEvents ? (
        <AllEventsWidget />
      ) : (
        <MyEventsWidget /> {/* Seulement événements assignés */}
      )}

      {/* Gestion utilisateurs */}
      <Can do="manage" on="User">
        <UserManagementWidget />
      </Can>
    </div>
  )
}
```

## 🚀 4. Permissions pour Fonctionnalités Futures

### 👤 Interface de Gestion des Rôles (Futur)

```typescript
// Dans rbac-presets.ts - Permissions pour ADMIN
{
  action: 'create', 
  subject: 'Role', 
  conditions: { orgId: '${user.orgId}' }
},
{
  action: 'update', 
  subject: 'Role', 
  conditions: { orgId: '${user.orgId}', isSystemRole: false } // Pas les rôles système
},
{
  action: 'delete', 
  subject: 'Role', 
  conditions: { orgId: '${user.orgId}', isSystemRole: false }
},
{
  action: 'manage', 
  subject: 'Permission', 
  conditions: { orgId: '${user.orgId}' }
}
```

```tsx
// Composant futur RoleManagementPage.tsx
export const RoleManagementPage = () => {
  return (
    <Can do="manage" on="Role">
      <div>
        <h1>Gestion des Rôles</h1>
        
        <Can do="create" on="Role">
          <Button onClick={handleCreateRole}>
            Créer un rôle personnalisé
          </Button>
        </Can>
        
        {customRoles.map(role => (
          <div key={role.id}>
            <h3>{role.name}</h3>
            
            <Can do="update" on="Role" data={role}>
              <Button onClick={() => handleEdit(role)}>
                Modifier
              </Button>
            </Can>
            
            <Can do="delete" on="Role" data={role}>
              <Button onClick={() => handleDelete(role)}>
                Supprimer
              </Button>
            </Can>
          </div>
        ))}
      </div>
    </Can>
  )
}
```

## 🎨 5. Bonnes Pratiques de Structure

### ✅ DO - Bonnes Pratiques

```tsx
// ✅ Permissions granulaires et spécifiques
<Can do="checkin" on="Attendee" data={attendee}>
<Can do="export" on="Attendee">
<Can do="assign" on="User">

// ✅ Conditions contextuelles
useCan('update', 'Event', event)           // Avec objet pour conditions
useCan('manage', 'Organization')           // Sans objet pour général

// ✅ Nommage cohérent et prévisible
'create' | 'read' | 'update' | 'delete' | 'manage'  // CRUD standard
'assign' | 'scan' | 'checkin' | 'export'           // Actions métier

// ✅ Hiérarchie logique des permissions
'read' < 'update' < 'delete' < 'manage'            // Ordre de puissance
```

### ❌ DON'T - À Éviter

```tsx
// ❌ Vérifications de rôles directes  
{user.role === 'ADMIN' && <AdminPanel />}

// ❌ Permissions trop spécifiques
<Can do="create-event-in-paris-for-managers" on="Event">

// ❌ Noms incohérents
'add' vs 'create' | 'modify' vs 'update' | 'remove' vs 'delete'

// ❌ Conditions hardcodées
useCan('read', 'Event', { orgId: 'org-123' })      // Pas flexible
```

## 📊 6. Récapitulatif par Fichier

| Fichier | Responsabilité | Exemple |
|---------|---------------|---------|
| `app-ability.ts` | **Types CASL** | `Actions`, `Subjects`, `AppAbility` |
| `rbac-presets.ts` | **Règles métier** | `rolePermissions[ADMIN] = [...]` |
| `Can.tsx` | **Guard UI** | `<Can do="create" on="Event">` |
| `useCan.ts` | **Hook logique** | `useCan('update', 'Event', event)` |
| `AbilityProvider.tsx` | **Contexte global** | Fournit les permissions au contexte |
| Pages/Composants | **Utilisation** | Guards et hooks selon besoins |

## 🎯 Résumé : Où Mettre Quoi ?

1. **Types de permissions** → `app-ability.ts`
2. **Règles par rôle** → `rbac-presets.ts`  
3. **Guards dans l'UI** → `<Can do="..." on="...">` dans les composants
4. **Logique conditionnelle** → `useCan(...)` dans les hooks/fonctions
5. **Pages futures admin** → Nouveaux composants avec guards appropriés

**Le système est déjà bien structuré et prêt pour l'extension ! 🚀**