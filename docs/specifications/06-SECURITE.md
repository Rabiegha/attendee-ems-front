# Section 6 - Sécurité et Authentification

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 5](./05-APPLICATION-MOBILE.md) | [▶ Section 7](./07-FONCTIONNALITES.md)

---

## 6.1 Système d'Authentification JWT

### 6.1.1 Tokens

#### Access Token
- **Durée de vie** : 15 minutes (900 secondes)
- **Algorithme** : HS256 (HMAC with SHA-256)
- **Stockage** : Mémoire (Redux) uniquement, jamais en localStorage
- **Usage** : Chaque requête API via header `Authorization: Bearer <token>`

**Payload** :
```json
{
  "sub": "user-uuid",              // User ID
  "email": "user@example.com",
  "currentOrgId": "org-uuid",      // Organisation active
  "role": "ADMIN",                 // Rôle dans l'org
  "permissions": [                 // Permissions granulaires
    "events.read:org",
    "events.create:org",
    "users.read:org"
  ],
  "iat": 1709567890,               // Issued at
  "exp": 1709568790                // Expiration (15min)
}
```

#### Refresh Token
- **Durée de vie** : 30 jours
- **Algorithme** : HS256
- **Stockage** :
  - **Web** : Cookie HttpOnly sécurisé
  - **Mobile** : expo-secure-store (encrypted storage)
- **Usage** : Renouvellement automatique de l'access token

**Stockage en base** (table `refresh_tokens`) :
```typescript
{
  id: 'cuid',
  userId: 'uuid',
  jti: 'unique-jwt-id',           // JWT ID
  tokenHash: 'sha256-hash',       // Token hashé (sécurité)
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1',
  createdAt: DateTime,
  expiresAt: DateTime,
  revokedAt: DateTime | null,
  replacedById: 'cuid' | null     // Rotation
}
```

### 6.1.2 Flow d'Authentification

#### Login
```
1. User → Frontend: email + password
2. Frontend → Backend: POST /auth/login
3. Backend: Validate credentials (bcrypt)
4. Backend: Generate access token (15min)
5. Backend: Generate refresh token (30d)
6. Backend: Store refresh token in DB (hashed)
7. Backend → Frontend: {
     access_token,
     refresh_token,
     expires_in: 900,
     user: {...},
     organization: {...}
   }
8. Frontend: Store access_token in Redux (memory)
9. Frontend: Store refresh_token in:
   - Web: HttpOnly cookie
   - Mobile: SecureStore
```

#### Refresh Token (Rotation)
```
1. Access token expires (15min)
2. Frontend: Detect 401 or proactive refresh (13min)
3. Frontend → Backend: POST /auth/refresh
   Headers: Cookie (web) or Body (mobile)
4. Backend: Validate refresh token (hash + expiry + revocation)
5. Backend: Generate NEW access token
6. Backend: Generate NEW refresh token
7. Backend: Revoke OLD refresh token (replacedById)
8. Backend: Store NEW refresh token
9. Backend → Frontend: {
     access_token,
     refresh_token,
     expires_in: 900
   }
10. Frontend: Update tokens in storage
11. Frontend: Retry original request
```

#### Logout
```
1. User → Frontend: Click logout
2. Frontend → Backend: POST /auth/logout
3. Backend: Revoke refresh token (set revokedAt)
4. Backend → Frontend: 200 OK
5. Frontend: Clear access_token (Redux)
6. Frontend: Clear refresh_token (Cookie/SecureStore)
7. Frontend: Redirect to /login
```

### 6.1.3 Sécurité des Tokens

#### Prévention des Attaques

**XSS (Cross-Site Scripting)** :
- ✅ Access token en mémoire uniquement (pas de localStorage)
- ✅ Refresh token en HttpOnly cookie (inaccessible au JS)
- ✅ CSP (Content Security Policy) headers
- ✅ Validation et escape des inputs utilisateur

**CSRF (Cross-Site Request Forgery)** :
- ✅ SameSite cookie attribute (`Lax` ou `Strict`)
- ✅ CORS configuré strictement
- ✅ Validation de l'origine des requêtes

**Token Theft** :
- ✅ Tokens hashés en base (SHA-256)
- ✅ Rotation automatique des refresh tokens
- ✅ Révocation immédiate possible
- ✅ Détection de réutilisation (rotation chain)

**Man-in-the-Middle** :
- ✅ HTTPS obligatoire en production
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Certificate pinning (mobile)

#### Révocation

**Révocation individuelle** :
```sql
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE jti = '<jwt-id>'
```

**Révocation globale (tous les tokens d'un user)** :
```sql
UPDATE refresh_tokens
SET revoked_at = NOW()
WHERE user_id = '<user-id>' AND revoked_at IS NULL
```

**Use cases** :
- Logout
- Changement de mot de passe
- Compromission détectée
- Suppression de compte

---

## 6.2 RBAC (Role-Based Access Control)

### 6.2.1 Hiérarchie des Rôles

```
SUPER_ADMIN (100) → Développeurs, accès cross-tenant
    └── ADMIN (80) → Responsable organisation
        └── MANAGER (60) → Chef de projet événements
            └── VIEWER (40) → Observateur (lecture seule)
                ├── PARTNER (20) → Partenaire externe (événements assignés)
                └── HOSTESS (10) → Personnel accueil (check-in only)
```

**Règles** :
- 1 utilisateur = 1 rôle par organisation
- Niveau supérieur hérite implicitement des permissions inférieures
- ADMIN ne peut pas modifier son propre rôle (sécurité)

### 6.2.2 Matrice des Permissions

| Resource | Action | SUPER_ADMIN | ADMIN | MANAGER | VIEWER | PARTNER | HOSTESS |
|----------|--------|-------------|-------|---------|--------|---------|---------|
| **Organizations** | create | ✅ any | ❌ | ❌ | ❌ | ❌ | ❌ |
| | read | ✅ any | ✅ org | ✅ org | ✅ org | ❌ | ❌ |
| | update | ✅ any | ✅ org | ❌ | ❌ | ❌ | ❌ |
| **Users** | create | ✅ any | ✅ org | ❌ | ❌ | ❌ | ❌ |
| | read | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| | update | ✅ any | ✅ org | ❌ | ❌ | ❌ | ❌ |
| | delete | ✅ any | ✅ org | ❌ | ❌ | ❌ | ❌ |
| **Events** | create | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| | read | ✅ any | ✅ org | ✅ org | ✅ org | ✅ assigned | ✅ assigned |
| | update | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| | delete | ✅ any | ✅ org | ❌ | ❌ | ❌ | ❌ |
| **Registrations** | create | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| | read | ✅ any | ✅ org | ✅ org | ✅ org | ✅ assigned | ✅ assigned |
| | update | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| | checkin | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ✅ assigned |
| | delete | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ❌ |
| **Badges** | generate | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ✅ assigned |
| | print | ✅ any | ✅ org | ✅ org | ❌ | ❌ | ✅ assigned |

### 6.2.3 Scopes de Permissions

#### `any` (Cross-tenant)
- Accès à **toutes** les ressources de **toutes** les organisations
- **Uniquement SUPER_ADMIN**

#### `org` (Organization-wide)
- Accès à toutes les ressources de **son organisation**
- ADMIN, MANAGER, VIEWER

#### `assigned` (Resource-specific)
- Accès uniquement aux **ressources assignées**
- PARTNER, HOSTESS (via `event_assigned_users`)

#### `own` (Self-only)
- Accès uniquement à **ses propres ressources**
- Tous les rôles (ex: modifier son profil)

#### `none`
- Aucun accès
- Permission explicitement refusée

### 6.2.4 Implémentation Backend

#### Guard de Permission

```typescript
// require-permission.guard.ts
@Injectable()
export class RequirePermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler()
    )

    const user = request.user
    const userPermissions = user.permissions || []

    // Vérifier si permission présente
    const hasPermission = userPermissions.some(p =>
      p === requiredPermission ||
      p.startsWith(requiredPermission.split(':')[0])
    )

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }
}
```

#### Decorator

```typescript
// require-permission.decorator.ts
export const RequirePermission = (permission: string) =>
  SetMetadata('permission', permission)

// Utilisation
@RequirePermission('events.create')
async createEvent(@Body() dto: CreateEventDto) {
  // ...
}
```

#### Résolution du Scope

```typescript
// resolve-scope.util.ts
export function resolveEventReadScope(user: User): EventScope {
  const permissions = user.permissions || []

  // SUPER_ADMIN: any
  if (permissions.includes('events.read:any')) {
    return { scope: 'any', orgId: null, userId: null }
  }

  // ADMIN/MANAGER/VIEWER: org
  if (permissions.includes('events.read:org')) {
    return { scope: 'org', orgId: user.currentOrgId, userId: null }
  }

  // PARTNER/HOSTESS: assigned
  if (permissions.includes('events.read:assigned')) {
    return { scope: 'assigned', orgId: user.currentOrgId, userId: user.sub }
  }

  // own (fallback)
  return { scope: 'own', orgId: user.currentOrgId, userId: user.sub }
}
```

#### Application dans les Services

```typescript
// events.service.ts
async findAll(filters: ListEventsDto, context: AuthContext) {
  const { scope, orgId, userId } = context

  const where: any = { deleted_at: null }

  switch (scope) {
    case 'any':
      // Pas de filtre (SUPER_ADMIN)
      break

    case 'org':
      where.org_id = orgId
      break

    case 'assigned':
      where.org_id = orgId
      where.event_assigned_users = {
        some: { user_id: userId }
      }
      break

    case 'own':
      where.org_id = orgId
      where.created_by = userId
      break
  }

  return this.prisma.event.findMany({ where, ...filters })
}
```

### 6.2.5 Implémentation Frontend (CASL)

```typescript
// shared/acl/ability.ts
import { defineAbility } from '@casl/ability'

export function defineAbilitiesFor(user: User) {
  return defineAbility((can, cannot) => {
    const role = user.role

    // SUPER_ADMIN
    if (role === 'SUPER_ADMIN') {
      can('manage', 'all')
      return
    }

    // ADMIN
    if (role === 'ADMIN') {
      can('manage', 'all')
      // Exception: ne peut pas modifier son propre rôle
      cannot('update', 'User', { id: user.id, field: 'role' })
      return
    }

    // MANAGER
    if (role === 'MANAGER') {
      can('read', 'Organization')
      can(['read', 'create', 'update'], 'Event')
      can(['read', 'create', 'update'], 'Registration')
      can('checkin', 'Registration')
      can('generate', 'Badge')
      can('read', 'User')
      return
    }

    // VIEWER
    if (role === 'VIEWER') {
      can('read', ['Event', 'Registration', 'Badge', 'User'])
      return
    }

    // PARTNER
    if (role === 'PARTNER') {
      can('read', 'Event', { assignedTo: user.id })
      can('read', 'Registration', { eventAssignedTo: user.id })
      return
    }

    // HOSTESS
    if (role === 'HOSTESS') {
      can('read', 'Event', { assignedTo: user.id })
      can('read', 'Registration', { eventAssignedTo: user.id })
      can('checkin', 'Registration')
      can('generate', 'Badge')
      return
    }
  })
}
```

---

## 6.3 Protection des Données

### 6.3.1 Chiffrement

**En transit** :
- ✅ HTTPS/TLS 1.3 obligatoire
- ✅ Certificats Let's Encrypt (auto-renouvellement)
- ✅ HSTS (HTTP Strict Transport Security)

**Au repos** :
- ✅ Mots de passe hashés avec bcrypt (salt rounds: 10)
- ✅ Tokens hashés en SHA-256 avant stockage
- ✅ Encryption at rest PostgreSQL (optionnel)

### 6.3.2 Validation et Sanitisation

**Backend** :
```typescript
// DTOs avec class-validator
export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @IsInt()
  @Min(1)
  @Max(10000)
  capacity: number
}
```

**Frontend** :
```typescript
// Zod schemas
const eventSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  email: z.string().email().toLowerCase(),
  capacity: z.number().int().min(1).max(10000)
})
```

### 6.3.3 Protection contre les Injections

**SQL Injection** :
- ✅ Prisma ORM avec requêtes paramétrées (protection native)
- ✅ Pas de requêtes SQL brutes

**XSS (Cross-Site Scripting)** :
- ✅ React échappe automatiquement les valeurs
- ✅ `dangerouslySetInnerHTML` utilisé uniquement après sanitisation
- ✅ CSP headers configurés

**CSRF** :
- ✅ SameSite cookies
- ✅ CORS strict

### 6.3.4 Rate Limiting

```typescript
// main.ts (NestJS)
import rateLimit from 'express-rate-limit'

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: 'Too many requests from this IP'
  })
)

// Routes sensibles (login)
app.use(
  '/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5 // 5 tentatives de login max
  })
)
```

### 6.3.5 CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://attendee.fr',
    'https://www.attendee.fr',
    process.env.NODE_ENV === 'development' && 'http://localhost:5173'
  ].filter(Boolean),
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

---

## 6.4 Conformité RGPD

### 6.4.1 Droits des Utilisateurs

- ✅ **Droit d'accès** : Export de données personnelles
- ✅ **Droit de rectification** : Édition profil utilisateur
- ✅ **Droit à l'effacement** : Suppression de compte
- ✅ **Droit à la portabilité** : Export Excel/JSON
- ✅ **Droit d'opposition** : Opt-out emails

### 6.4.2 Minimisation des Données

- Collecte uniquement des données nécessaires
- Champs optionnels clairement indiqués
- Pas de tracking tiers sans consentement

### 6.4.3 Durée de Conservation

- **Utilisateurs actifs** : Illimité
- **Utilisateurs inactifs** : Anonymisation après 3 ans
- **Logs** : 90 jours
- **Tokens révoqués** : 30 jours puis purge

### 6.4.4 Traçabilité

```typescript
// attendee_revisions table
{
  change_type: 'created' | 'updated' | 'deleted',
  changed_by: 'user-uuid',
  snapshot: { /* état complet */ },
  changed_at: DateTime,
  note: 'Raison du changement'
}
```

---

## 6.5 Audit et Monitoring

### 6.5.1 Logging

**Événements loggés** :
- ✅ Authentification (success/failure)
- ✅ Changements de permissions
- ✅ Accès aux données sensibles
- ✅ Erreurs serveur (500)
- ✅ Tentatives d'accès non autorisées (403)

```typescript
logger.info('User logged in', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent']
})

logger.warn('Permission denied', {
  userId: user.id,
  resource: 'Event',
  action: 'delete',
  eventId: eventId
})
```

### 6.5.2 Monitoring Sentry

- Tracking d'erreurs frontend et backend
- Performance monitoring
- Session replay (opt-in)
- Release tracking
- Source maps upload

---

[▶ Section 7 : Fonctionnalités Métier](./07-FONCTIONNALITES.md)
