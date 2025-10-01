# Architecture RBAC Complète - Guidelines et Migration

## 🎯 Vision : RBAC Scalable avec Rôles Personnalisables

### Objectifs
- **Permissions granulaires** : Contrôle fin des actions utilisateur
- **Rôles personnalisables** : Admins peuvent créer/modifier des rôles
- **Scalabilité** : Architecture prête pour nouvelles fonctionnalités
- **Sécurité** : Principe du moindre privilège

## ✅ État Actuel du Système RBAC

### Fonctionnalités RBAC Déjà Implémentées
```tsx
// ✅ CORRECT - Vérifications par permissions
<Can do="create" on="Event">
  <Button>Créer un événement</Button>
</Can>

const canManageUsers = useCan('manage', 'User')
const canExportData = useCan('export', 'Attendee')
```

### Architecture Technique Existante
- **CASL Integration** : `@casl/ability` pour permissions dynamiques
- **Guards** : Composant `<Can>` et hook `useCan`
- **Types** : Actions et Subjects définis
- **Context** : AbilityProvider avec règles dynamiques

## 🔍 Points à Migrer vers RBAC

### 1. Vérifications de Rôles Hardcodées

#### ❌ Problématique Actuelle
```tsx
// Dans mocks/handlers.ts
if (currentUser.role.code !== 'ORG_ADMIN') {
  // Logique basée sur le rôle
}

// Dans sessionSlice.ts  
if (tokenData.role !== 'SUPER_ADMIN') {
  // Logique spécifique au rôle
}

// Dans InviteUserModal.tsx
if (role === 'SUPER_ADMIN') return false
```

#### ✅ Migration vers RBAC
```tsx
// Remplacer par des permissions granulaires
const canViewAllEvents = useCan('read', 'Event') // Sans conditions = tous
const canManageOrganization = useCan('manage', 'Organization') 
const canInviteUsers = useCan('invite', 'User')
```

### 2. Affichage d'Informations Basé sur les Rôles

#### ❌ Problématique Actuelle
```tsx
// Dans Header/index.tsx
{user.roles?.[0] ? getRoleLabel(user.roles[0]) : 'Utilisateur'}

// Dans Users/index.tsx
{user.role?.name || 'Non défini'}
```

#### ✅ Migration vers RBAC
```tsx
// Garder l'affichage du rôle pour UX, mais utiliser permissions pour la logique
{user.roles?.[0] ? getRoleLabel(user.roles[0]) : 'Utilisateur'}

// Mais contrôler l'accès par permissions
<Can do="read" on="User" data={user}>
  <UserDetails user={user} />
</Can>
```

## 🔧 Permissions Granulaires à Définir

### Permissions Système Global
```typescript
// Organisation Management  
'create:organization'     // Créer des organisations (SUPER_ADMIN)
'manage:organization'     // Gérer sa propre org (ADMIN)
'read:organization'       // Lire infos org (tous sauf SUPER_ADMIN sans org)

// Role Management (Future)
'create:role'            // Créer des rôles personnalisés (ADMIN)
'assign:role'            // Assigner des rôles (ADMIN)  
'manage:permissions'     // Gérer permissions des rôles (ADMIN)

// User Management
'create:user'            // Créer utilisateurs (ADMIN)
'invite:user'            // Inviter utilisateurs (ADMIN)
'manage:user'            // Gérer utilisateurs org (ADMIN)
'read:user'              // Voir utilisateurs (MANAGER+)

// Event Management  
'create:event'           // Créer événements (ADMIN, MANAGER)
'manage:event'           // Gérer tous événements org (ADMIN, MANAGER)
'read:event'             // Lire événements (tous selon scope)
'assign:partners'        // Assigner partenaires aux événements (ADMIN, MANAGER)

// Attendee Management
'create:attendee'        // Créer participants (ADMIN, MANAGER)
'manage:attendee'        // Gérer participants (ADMIN, MANAGER) 
'checkin:attendee'       // Check-in participants (ADMIN, MANAGER, HOTESSE)
'export:attendee'        // Exporter données (ADMIN, MANAGER)

// QR Code & Scanning
'scan:qrcode'           // Scanner QR codes (HOTESSE)
'generate:qrcode'       // Générer QR codes (ADMIN, MANAGER)

// Reports & Analytics
'read:reports'          // Voir rapports (ADMIN, MANAGER, VIEWER)
'export:reports'        // Exporter rapports (ADMIN, MANAGER)
'read:analytics'        // Analytics avancées (ADMIN)
```

### Permissions avec Contexte
```typescript
// Événements assignés (PARTNER, HOTESSE)
{ action: 'read', subject: 'Event', conditions: { id: { $in: eventIds } } }

// Utilisateurs de la même org  
{ action: 'manage', subject: 'User', conditions: { orgId } }

// Participants d'événements spécifiques
{ action: 'checkin', subject: 'Attendee', conditions: { eventId: { $in: eventIds } } }
```

## 🏗️ Architecture Future : Rôles Personnalisables

### Base de Données Étendue
```typescript
interface Role {
  id: string
  name: string
  code: string // Généré automatiquement ou personnalisé
  orgId: string
  description?: string
  isSystemRole: boolean // true pour SUPER_ADMIN, ADMIN, etc.
  isCustomRole: boolean // true pour rôles créés par les admins
  permissions: RolePermission[]
  createdAt: string
  createdBy: string
}

interface RolePermission {
  id: string
  roleId: string
  action: Actions
  subject: Subjects
  conditions?: Record<string, any>
  fields?: string[]
}

interface CustomRole extends Role {
  isCustomRole: true
  basedOnRole?: string // Rôle système utilisé comme template
  customPermissions: RolePermission[]
}
```

### Interface de Gestion des Rôles (Future)
```tsx
// Page: /roles
const RolesManagementPage = () => {
  return (
    <Can do="manage" on="Role">
      <div>
        <RolesList />
        <CreateCustomRoleModal />
        <PermissionsMatrix />
      </div>
    </Can>
  )
}

// Composant de création de rôles personnalisés
const CreateCustomRoleModal = () => {
  const permissions = usePermissionsMatrix()
  
  return (
    <Modal>
      <PermissionSelector 
        availablePermissions={permissions}
        onPermissionToggle={handlePermissionChange}
      />
    </Modal>
  )
}
```

## 📋 Plan de Migration Phase par Phase

### Phase 1: Audit et Nettoyage (Actuel)
- [x] Identifier toutes les vérifications de rôles hardcodées
- [ ] Remplacer par des vérifications de permissions existantes
- [ ] Nettoyer les imports et dépendances inutilisées

### Phase 2: Permissions Granulaires  
- [ ] Étendre les Actions et Subjects CASL
- [ ] Créer des permissions plus spécifiques
- [ ] Mettre à jour les règles RBAC avec les nouvelles permissions

### Phase 3: Backend Role Management
- [ ] API endpoints pour gestion des rôles
- [ ] Validation des permissions côté serveur
- [ ] Migration des données existantes

### Phase 4: Interface Rôles Personnalisés
- [ ] Page de gestion des rôles  
- [ ] Interface de création de rôles
- [ ] Matrice de permissions
- [ ] Assignment de rôles aux utilisateurs

### Phase 5: Advanced Features
- [ ] Rôles temporaires/avec expiration
- [ ] Héritage de permissions entre rôles
- [ ] Audit trail des changements de permissions
- [ ] Rôles contextuels (par événement, par projet)

## 💡 Bonnes Pratiques RBAC

### ✅ À Faire
```tsx
// Vérifications granulaires
<Can do="create" on="User">
<Can do="export" on="Attendee" data={{ eventId }}>
<Can do="manage" on="Event" data={event}>

// Hooks pour logique conditionnelle  
const canCreateEvents = useCan('create', 'Event')
const canManageThisEvent = useCan('manage', 'Event', event)

// Permissions avec contexte
const canAccessEvent = useCan('read', 'Event', { id: eventId })
```

### ❌ À Éviter
```tsx
// Vérifications de rôles hardcodées
if (user.role === 'ADMIN') { /* ... */ }
if (user.roles.includes('SUPER_ADMIN')) { /* ... */ }

// Logique métier basée sur les rôles
switch(user.role.code) {
  case 'ADMIN': // ...
  case 'MANAGER': // ...
}

// Vérifications directes dans le JSX
{user.role?.code === 'ADMIN' && <AdminPanel />}
```

### 🎯 Principes Directeurs

1. **Permission-First** : Toujours vérifier les permissions, jamais les rôles directement
2. **Granularité** : Préférer des permissions spécifiques (`create:event`) aux permissions générales (`manage:all`)
3. **Context-Aware** : Utiliser les conditions CASL pour les permissions contextuelles
4. **Defensive** : Par défaut, interdire l'accès si la permission n'est pas explicitement accordée
5. **Scalabilité** : Concevoir pour l'ajout facile de nouvelles permissions et rôles

## 🚀 Résultats Attendus

### Bénéfices Techniques
- **Flexibilité** : Ajout facile de nouvelles permissions sans modifier le code
- **Sécurité** : Contrôle d'accès fin et vérifiable
- **Maintenance** : Logique centralisée et réutilisable
- **Tests** : Permissions faciles à mocker et tester

### Bénéfices Business
- **Personnalisation** : Organisations peuvent créer leurs propres rôles
- **Conformité** : Audit trail des permissions et accès
- **Évolutivité** : Croissance sans refonte du système de permissions
- **UX** : Interface adaptée aux besoins spécifiques de chaque rôle