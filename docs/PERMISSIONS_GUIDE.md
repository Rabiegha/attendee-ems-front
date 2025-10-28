# Guide du Système de Permissions

## 📋 Vue d'Ensemble

Le système de permissions utilise **CASL** (Can I do Something Library) pour gérer les autorisations de manière granulaire et en temps réel.

### Architecture

```
Backend (NestJS + Prisma)
  ↓ Permissions stockées en DB
  ↓ API /auth/policy retourne les règles CASL
Frontend (React + CASL)
  ↓ Polling toutes les 5 secondes
  ↓ Guards conditionnent l'affichage
```

## 🔑 Format des Permissions

### Backend (Base de données)

```typescript
code: 'resource.action:scope'
// Exemples:
;('users.read:any') // Lire tous les users
;('users.read:own') // Lire son propre profil
;('events.create') // Créer des événements
;('roles.manage') // Gérer les rôles et permissions
```

### Frontend (Règles CASL)

```typescript
{
  action: 'read' | 'create' | 'update' | 'delete' | 'manage',
  subject: 'User' | 'Event' | 'Role' | 'Organization' | ...,
  conditions?: { ... } // Pour :own/:org scopes
}
```

## 📊 Mapping Permission → CASL

| Permission Backend       | Action CASL | Subject CASL   | Notes                              |
| ------------------------ | ----------- | -------------- | ---------------------------------- |
| `users.read:any`         | `read`      | `User`         | Voir tous les utilisateurs         |
| `users.create`           | `create`    | `User`         | Créer un utilisateur               |
| `users.update`           | `update`    | `User`         | Modifier un utilisateur            |
| `users.delete`           | `delete`    | `User`         | Supprimer un utilisateur           |
| `roles.read`             | `read`      | `Role`         | Voir les rôles                     |
| `roles.manage`           | `manage`    | `Role`         | Gérer les permissions (page admin) |
| `roles.assign`           | `assign`    | `Role`         | Assigner des rôles aux users       |
| `invitations.create`     | `create`    | `Invitation`   | Envoyer des invitations            |
| `events.read:any`        | `read`      | `Event`        | Voir tous les événements           |
| `events.read:own`        | `read`      | `Event`        | Voir ses événements assignés       |
| `attendees.read`         | `read`      | `Attendee`     | Voir les participants              |
| `organizations.read:own` | `read`      | `Organization` | Voir son organisation              |
| `organizations.update`   | `update`    | `Organization` | Modifier l'organisation            |

## 👥 Permissions par Rôle

### SUPER_ADMIN (29 permissions)

- **Scope**: Cross-tenant, toutes les organisations
- **Permissions spéciales**:
  - `organizations.read:any` - Voir toutes les organisations
  - `organizations.create` - Créer des organisations
  - CASL rule: `{action: 'manage', subject: 'all'}`

### ADMIN (26 permissions)

- **Scope**: Gestion complète de son organisation
- **Inclut**:
  - Gestion users (CRUD)
  - Gestion events (CRUD)
  - Gestion roles & permissions (`roles.manage`)
  - Envoi invitations
  - Analytics

### MANAGER (16 permissions)

- **Scope**: Gestion opérationnelle (événements + participants)
- **Inclut**:
  - Events (CRU - pas delete)
  - Attendees (CRUD + check-in)
  - Users (read only)
  - Roles (read only - **PAS** manage)
- **Exclus**:
  - Gestion users (pas de création/modification)
  - Gestion permissions
  - Invitations (read only)

### VIEWER (5 permissions)

- **Scope**: Lecture seule
- Events, Attendees, Analytics en lecture seule

### PARTNER (3 permissions)

- **Scope**: Événements assignés uniquement
- `events.read:own`, `attendees.read`

### HOSTESS (4 permissions)

- **Scope**: Check-in uniquement
- `attendees.read`, `attendees.checkin`

## 🛡️ Utilisation dans le Code

### Menu (Sidebar)

```tsx
// Dans navigation array
{
  name: 'navigation.users',
  href: '/users',
  icon: UserCog,
  action: 'read' as const,  // ← Correspond à users.read:any
  subject: 'User' as const,
}
```

Le menu n'affiche que si l'utilisateur a la permission.

### Routes (Protection)

```tsx
// Dans routes/index.tsx
{
  path: 'users',
  element: (
    <GuardedRoute action="read" subject="User">
      <UsersPage />
    </GuardedRoute>
  ),
}
```

Redirige vers `/403` si pas de permission.

### Composants (Affichage conditionnel)

```tsx
import { Can } from '@/shared/acl/guards/Can'

// Afficher un bouton uniquement si autorisé
<Can do="create" on="User">
  <Button>Ajouter un utilisateur</Button>
</Can>

// Avec fallback
<Can
  do="manage"
  on="Role"
  fallback={<Navigate to="/403" />}
>
  <RoleManagementPage />
</Can>
```

### Hook personnalisé

```tsx
import { useCan } from '@/shared/acl/hooks/useCan'

const MyComponent = () => {
  const canEdit = useCan('update', 'User')

  return <div>{canEdit && <EditButton />}</div>
}
```

## ➕ Ajouter une Nouvelle Permission

### 1. Backend: Ajouter dans le Seeder

```typescript
// prisma/seeders/permissions.seeder.ts
const permissionsData: PermissionSeedData[] = [
  // ... existing permissions
  {
    code: 'reports.create',
    name: 'Create reports',
    description: 'Generate custom reports',
  },
]
```

### 2. Backend: Assigner aux Rôles

```typescript
// Dans rolePermissionsMap
'ADMIN': [
  // ... existing permissions
  'reports.create',
],
```

### 3. Backend: Vérifier le Mapping CASL

```typescript
// src/auth/auth.service.ts - mapPermissionsToCASlRules()
// Le mapping se fait automatiquement:
// 'reports.create' → {action: 'create', subject: 'Report'}

// Vérifier que 'reports' est dans subjectMap:
const subjectMap: Record<string, string> = {
  // ... existing
  reports: 'Report', // ✓ Déjà présent
}
```

### 4. Backend: Protéger le Controller

```typescript
// src/modules/reports/reports.controller.ts
@Post()
@Permissions('reports.create')  // ← Ajouter ce decorator
async createReport(@Body() dto: CreateReportDto) {
  // ...
}
```

### 5. Frontend: Définir le Type CASL

```typescript
// src/shared/acl/app-ability.ts
export type Actions = 'read' | 'create' | 'update' | 'delete' | 'manage'
// ... autres

export type Subjects = 'User' | 'Event' | 'Report' // ← Ajouter si nouveau subject
// ... autres
```

### 6. Frontend: Ajouter au Menu (Optionnel)

```tsx
// src/widgets/Sidebar/index.tsx
const navigation = [
  // ... existing items
  {
    name: 'navigation.create_report',
    href: '/reports/new',
    icon: FileText,
    action: 'create' as const,
    subject: 'Report' as const,
  },
]
```

### 7. Frontend: Protéger la Route

```tsx
// src/app/routes/index.tsx
{
  path: 'reports/new',
  element: (
    <GuardedRoute action="create" subject="Report">
      <CreateReportPage />
    </GuardedRoute>
  ),
}
```

### 8. Exécuter le Seed

```bash
docker exec ems_api npm run db:seed
# Ou reset complet
docker exec ems_api npx prisma migrate reset --force
```

## 🐛 Debug

### Voir les Permissions Actuelles

Le debug widget affiche en temps réel les règles CASL de l'utilisateur connecté (dev mode uniquement).

### Tester une Permission

```bash
# Obtenir un token
$token = (Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method POST `
  -Body '{"email":"jane.smith@acme.com","password":"admin123"}' `
  -ContentType "application/json").access_token

# Voir les règles CASL
Invoke-RestMethod -Uri "http://localhost:3000/auth/policy" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 3
```

### Vérifier les Permissions en DB

```bash
docker exec ems_db psql -U postgres -d ems -c "
  SELECT p.code, p.name
  FROM users u
  JOIN roles r ON u.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE u.email = 'jane.smith@acme.com'
  ORDER BY p.code;
"
```

## ⚠️ Bonnes Pratiques

### ✅ À Faire

- Toujours utiliser des permissions granulaires (`read`, `create`, `update`, `delete`)
- Documenter chaque nouvelle permission
- Tester avec chaque rôle après modification
- Utiliser `roles.manage` pour accès à la page d'administration des permissions
- Vérifier la cohérence Menu ↔ Route ↔ Backend

### ❌ À Éviter

- Ne pas utiliser `manage` pour des actions spécifiques (sauf cas particuliers comme `roles.manage`)
- Ne pas mélanger les scopes (`:own`, `:any`, `:org`)
- Ne pas oublier de protéger les routes backend avec `@Permissions()`
- Ne pas modifier directement la DB sans passer par le seeder

## 🔄 Mise à Jour en Temps Réel

Les permissions sont rechargées automatiquement:

- **Polling**: Toutes les 5 secondes (`ability-provider.tsx`)
- **Cache invalidation**: Lors de la modification des permissions par un admin
- **Reconnexion**: Nouveau token généré avec nouvelles permissions

## 📚 Ressources

- [CASL Documentation](https://casl.js.org/v6/en/)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [NestJS Guards](https://docs.nestjs.com/guards)

## 🆘 Problèmes Courants

### Menu visible mais route bloquée (403)

→ Vérifier que `sidebar action/subject` === `route action/subject`

### Permission en DB mais pas dans CASL rules

→ Vérifier le mapping dans `auth.service.ts` - `mapPermissionsToCASlRules()`

### MANAGER a trop/pas assez de permissions

→ Reset DB: `docker exec ems_api npx prisma migrate reset --force`

### Page 403 différente selon les pages

→ Toutes les pages doivent utiliser `<Navigate to="/403" />` ou `ForbiddenPage`
