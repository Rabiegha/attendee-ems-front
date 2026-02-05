# Section 3 - Backend API

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 2](./02-ARCHITECTURE-TECHNIQUE.md) | [▶ Section 4](./04-FRONTEND-WEB.md)

---

## 3.1 Vue d'Ensemble du Backend

**Framework** : NestJS 10.x  
**Base de données** : PostgreSQL 16 + Prisma 5  
**Port par défaut** : 3000  
**Documentation** : Swagger UI disponible sur `/api`

### Modules Métier

Le backend est composé de **17 modules** principaux :

1. **auth** - Authentification JWT
2. **events** - Gestion des événements
3. **registrations** - Inscriptions aux événements
4. **attendees** - Profils participants (CRM)
5. **attendee-types** - Types de participants
6. **users** - Gestion des utilisateurs
7. **organizations** - Multi-tenancy
8. **roles** - Rôles utilisateurs
9. **permissions** - Permissions granulaires
10. **invitations** - Invitations d'utilisateurs
11. **badges** - Gestion des badges
12. **badge-templates** - Templates de badges
13. **badge-generation** - Génération PDF
14. **email** - Envoi d'emails SMTP
15. **tags** - Système de tags
16. **sessions** - Sessions d'événements
17. **public** - API publique (inscriptions)

---

## 3.2 Endpoints Principaux

### 3.2.1 Authentification (`/auth`)

```typescript
POST   /auth/login                    // Connexion utilisateur
POST   /auth/refresh                  // Renouvellement token
POST   /auth/logout                   // Déconnexion (révocation refresh token)
GET    /auth/me                       // Informations utilisateur connecté
POST   /auth/switch-org/:orgId        // Changement d'organisation (SUPER_ADMIN)
```

**Login Flow** :
```json
// Request
POST /auth/login
{
  "email": "admin@choyou.fr",
  "password": "admin123"
}

// Response
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",  // Aussi en cookie HttpOnly
  "expires_in": 900,  // 15 minutes
  "user": {
    "id": "uuid",
    "email": "admin@choyou.fr",
    "firstName": "Admin",
    "lastName": "Choyou",
    "role": "ADMIN",
    "permissions": ["events.read", "events.create", ...]
  },
  "organization": {
    "id": "uuid",
    "name": "Choyou",
    "slug": "choyou"
  }
}
```

### 3.2.2 Événements (`/events`)

```typescript
// CRUD de base
GET    /events                        // Liste des événements (avec filtres)
GET    /events/:id                    // Détails d'un événement
POST   /events                        // Créer un événement
PUT    /events/:id                    // Modifier un événement
DELETE /events/:id                    // Supprimer un événement (soft delete)
DELETE /events/bulk-delete            // Suppression multiple

// Actions spécifiques
GET    /events/check-name?name=...    // Vérifier disponibilité nom
PUT    /events/:id/status             // Changer le statut
GET    /events/:id/stats              // Statistiques de l'événement

// Gestion des participants
GET    /events/:id/registrations      // Liste des inscrits (via registrations)
POST   /events/:id/registrations      // Inscrire un participant

// Types de participants
GET    /events/:id/attendee-types     // Types configurés pour l'événement
POST   /events/:id/attendee-types     // Ajouter un type
PUT    /events/:id/attendee-types/:typeId  // Modifier un type

// Badges
GET    /events/:id/badge-rules        // Règles d'attribution de badges
POST   /events/:id/badge-rules        // Créer une règle
PUT    /events/:id/badge-rules/:ruleId    // Modifier une règle
DELETE /events/:id/badge-rules/:ruleId    // Supprimer une règle

// Sessions
GET    /events/:id/sessions           // Sessions de l'événement
POST   /events/:id/sessions           // Créer une session
```

**Filtres disponibles** :
- `status` : draft, published, archived, etc.
- `search` : Recherche par nom/code
- `startDate` / `endDate` : Filtrage par dates
- `tags` : Filtrage par tags
- `assigned` : Événements assignés à l'utilisateur (PARTNER/HOSTESS)

### 3.2.3 Inscriptions (`/registrations`)

```typescript
// Lecture
GET    /registrations/events/:eventId/registrations  // Liste des inscrits
GET    /registrations/:id                            // Détails inscription

// Création/Modification
POST   /registrations/events/:eventId/registrations  // Inscrire quelqu'un
PATCH  /registrations/:id                            // Modifier inscription
DELETE /registrations/:id                            // Supprimer (soft delete)

// Actions de masse
PATCH  /registrations/bulk-update-status             // Changer statut multiple
POST   /registrations/bulk-checkin                   // Check-in multiple
DELETE /registrations/bulk-delete                    // Suppression multiple
POST   /registrations/bulk-restore                   // Restauration multiple
DELETE /registrations/bulk-permanent-delete          // Suppression définitive

// Check-in/Check-out
POST   /registrations/:id/checkin                    // Check-in participant
POST   /registrations/:id/checkout                   // Check-out participant

// Badges
POST   /registrations/:id/generate-badge             // Générer badge
GET    /registrations/:id/badge                      // Récupérer badge

// Statuts
PUT    /registrations/:id/status                     // Changer statut (approve/refuse)

// Import/Export
GET    /registrations/template                       // Template Excel import
POST   /registrations/import                         // Import Excel
GET    /registrations/export?eventId=...             // Export Excel
```

**Statuts de registration** :
- `awaiting` : En attente d'approbation
- `approved` : Approuvé
- `refused` : Refusé
- `cancelled` : Annulé

**Check-in payload** :
```json
POST /registrations/:id/checkin
{
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  }
}
```

### 3.2.4 Participants (`/attendees`)

```typescript
// CRUD
GET    /attendees                     // Liste des participants (CRM)
GET    /attendees/:id                 // Détails participant
POST   /attendees                     // Créer un participant
PATCH  /attendees/:id                 // Modifier participant
DELETE /attendees/:id                 // Désactiver participant

// Recherche
GET    /attendees/search?q=...        // Recherche floue
GET    /attendees/check-email?email=...  // Vérifier si email existe

// Historique
GET    /attendees/:id/history         // Historique des modifications
GET    /attendees/:id/events          // Événements du participant

// Import/Export
POST   /attendees/import              // Import Excel
GET    /attendees/export              // Export Excel
```

### 3.2.5 Utilisateurs (`/users`)

```typescript
GET    /users                         // Liste des utilisateurs
GET    /users/:id                     // Détails utilisateur
POST   /users                         // Créer utilisateur (avec invitation)
PATCH  /users/:id                     // Modifier utilisateur
DELETE /users/:id                     // Désactiver utilisateur
POST   /users/:id/restore             // Réactiver utilisateur

// Gestion des rôles
PATCH  /users/:id/role                // Changer le rôle

// Mot de passe
POST   /password/request-reset        // Demander reset mot de passe
POST   /password/validate-token       // Valider token reset
POST   /password/reset                // Réinitialiser mot de passe
POST   /users/:id/change-password     // Changer son propre mot de passe
```

### 3.2.6 Organisations (`/organizations`)

```typescript
GET    /organizations                 // Liste (SUPER_ADMIN only)
GET    /organizations/:id             // Détails organisation
POST   /organizations                 // Créer organisation (SUPER_ADMIN)
PATCH  /organizations/:id             // Modifier organisation
DELETE /organizations/:id             // Supprimer organisation
```

### 3.2.7 Invitations (`/invitations`)

```typescript
GET    /invitations                   // Liste des invitations
POST   /invitations                   // Envoyer une invitation
DELETE /invitations/:id               // Annuler invitation
POST   /invitations/complete          // Compléter l'invitation (créer compte)
POST   /invitations/resend/:id        // Renvoyer email invitation
```

**Flow d'invitation** :
1. ADMIN envoie invitation : `POST /invitations`
2. Email envoyé avec token
3. Invité clique sur lien : `/complete-invitation?token=...`
4. Invité crée son compte : `POST /invitations/complete`
5. Compte créé avec rôle assigné

### 3.2.8 Badges (`/badges`, `/badge-templates`, `/badge-generation`)

```typescript
// Templates
GET    /badge-templates               // Liste des templates
GET    /badge-templates/:id           // Détails template
POST   /badge-templates               // Créer template
PUT    /badge-templates/:id           // Modifier template
DELETE /badge-templates/:id           // Supprimer template
POST   /badge-templates/:id/duplicate // Dupliquer template

// Génération
POST   /badge-generation/registrations/:id/generate    // Générer 1 badge
POST   /badge-generation/events/:eventId/generate-all  // Générer tous badges
POST   /badge-generation/bulk-generate                 // Génération multiple

// Badges générés
GET    /badges/:id                    // Détails badge
GET    /badges/:id/pdf                // Télécharger PDF
GET    /badges/:id/image              // Télécharger image
POST   /badges/:id/print              // Marquer comme imprimé
GET    /badges/:id/print-history      // Historique d'impression
```

### 3.2.9 API Publique (`/public`)

**Accessible sans authentification**

```typescript
// Inscription publique
GET    /public/events/:publicToken              // Info événement public
POST   /public/events/:publicToken/register     // S'inscrire à un événement
POST   /public/events/:publicToken/check-duplicate  // Vérifier doublon
```

**Exemple inscription publique** :
```json
POST /public/events/abc123xyz/register
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "phone": "+33612345678",
  "answers": {
    "dietary_restrictions": "Vegan",
    "tshirt_size": "L"
  }
}
```

### 3.2.10 WebSocket Events

**Namespace** : `/events`

**Événements émis** :
```typescript
// Inscription créée
socket.emit('registration:created', {
  eventId: 'uuid',
  registration: { ... }
})

// Inscription modifiée
socket.emit('registration:updated', {
  eventId: 'uuid',
  registration: { ... }
})

// Check-in effectué
socket.emit('registration:checkedin', {
  eventId: 'uuid',
  registrationId: 'uuid'
})

// Badge généré
socket.emit('badge:generated', {
  registrationId: 'uuid',
  badgeUrl: 'https://...'
})
```

---

## 3.3 Services Métier

### 3.3.1 AuthService

**Responsabilités** :
- Validation des credentials
- Génération de tokens JWT (access + refresh)
- Rotation des refresh tokens
- Révocation de tokens
- Gestion des sessions

**Méthodes principales** :
```typescript
validateUser(email: string, password: string): Promise<User>
login(user: User): Promise<LoginResponse>
issueRefreshToken(user: User, ctx: Context): Promise<RefreshToken>
rotateRefreshToken(token: string, ctx: Context): Promise<TokenPair>
revokeRefreshToken(jti: string): Promise<void>
revokeAllUserTokens(userId: string): Promise<void>
```

### 3.3.2 EventsService

**Responsabilités** :
- CRUD événements
- Gestion des statuts et transitions
- Attribution d'utilisateurs
- Calcul de statistiques
- Vérification de capacité

**Méthodes principales** :
```typescript
create(dto: CreateEventDto, orgId: string): Promise<Event>
findAll(filters: ListEventsDto, context: AuthContext): Promise<Event[]>
findOne(id: string, context: AuthContext): Promise<Event>
update(id: string, dto: UpdateEventDto): Promise<Event>
changeStatus(id: string, status: EventStatus): Promise<Event>
getEventStats(eventId: string): Promise<EventStats>
checkCapacity(eventId: string): Promise<boolean>
```

### 3.3.3 RegistrationsService

**Responsabilités** :
- Création d'inscriptions avec upsert d'attendee
- Gestion des statuts
- Check-in/check-out
- Vérification doublons et capacité
- Émission d'événements WebSocket

**Méthodes principales** :
```typescript
create(eventId: string, dto: CreateRegistrationDto): Promise<Registration>
checkIn(id: string, dto: CheckInDto): Promise<Registration>
checkOut(id: string): Promise<Registration>
updateStatus(id: string, status: RegistrationStatus): Promise<Registration>
bulkCheckIn(ids: string[], userId: string): Promise<BulkResult>
bulkUpdateStatus(ids: string[], status: RegistrationStatus): Promise<BulkResult>
checkDuplicate(eventId: string, email: string): Promise<boolean>
```

### 3.3.4 BadgeGenerationService

**Responsabilités** :
- Initialisation de Puppeteer (browser singleton)
- Rendu HTML → PDF
- Génération de QR codes
- Upload vers Cloudflare R2
- Gestion des erreurs de génération

**Méthodes principales** :
```typescript
generateBadge(registrationId: string): Promise<Badge>
generateBulk(registrationIds: string[]): Promise<Badge[]>
generateForEvent(eventId: string): Promise<Badge[]>
renderTemplate(template: BadgeTemplate, data: any): string
generateQRCode(data: string): Promise<string>
uploadToR2(buffer: Buffer, key: string): Promise<string>
```

**Processus de génération** :
1. Récupération registration + template + données participant
2. Génération QR code (UUID de registration)
3. Injection données dans template HTML
4. Rendu Puppeteer (HTML → PNG + PDF)
5. Upload sur R2 (image + PDF)
6. Enregistrement URLs en base
7. Émission événement WebSocket

### 3.3.5 EmailService

**Responsabilités** :
- Envoi d'emails SMTP (Nodemailer)
- Gestion des templates HTML
- Emails transactionnels (invitation, reset password, confirmation)

**Méthodes principales** :
```typescript
sendEmail(to: string, subject: string, html: string): Promise<void>
sendInvitation(email: string, token: string, org: Organization): Promise<void>
sendPasswordReset(email: string, token: string): Promise<void>
sendRegistrationConfirmation(registration: Registration): Promise<void>
sendEventReminder(event: Event, registration: Registration): Promise<void>
```

### 3.3.6 PrismaService

**Responsabilités** :
- Connexion à PostgreSQL
- Gestion du lifecycle Prisma Client
- Soft delete middleware
- Logging des requêtes (dev)

**Configuration** :
```typescript
// Middleware soft delete
prisma.$use(async (params, next) => {
  if (params.action === 'findMany' || params.action === 'findUnique') {
    params.args.where = {
      ...params.args.where,
      deleted_at: null
    }
  }
  return next(params)
})
```

### 3.3.7 R2Service (Cloudflare)

**Responsabilités** :
- Upload de fichiers vers R2
- Génération d'URLs signées
- Suppression de fichiers

**Configuration** :
```typescript
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=attendee-badges
R2_PUBLIC_URL=https://badges.attendee.fr
```

---

## 3.4 Middlewares et Guards

### 3.4.1 JwtAuthGuard

**Rôle** : Validation du token JWT sur toutes les routes protégées

**Fonctionnement** :
```typescript
@UseGuards(JwtAuthGuard)
export class EventsController {
  // Routes protégées
}
```

**Extraction du token** :
- Header : `Authorization: Bearer <token>`
- Validation avec JWT secret
- Injection de `req.user` avec payload décodé

### 3.4.2 RequirePermissionGuard

**Rôle** : Vérification des permissions granulaires

**Utilisation** :
```typescript
@RequirePermission('events.create')
async createEvent(@Body() dto: CreateEventDto) {
  // ...
}
```

**Vérification** :
1. Récupération du rôle de l'utilisateur
2. Récupération des permissions du rôle
3. Vérification de la permission demandée
4. Vérification du scope (any, org, assigned, own)

### 3.4.3 Scopes de Permissions

- **`any`** : Accès à toutes les ressources de toutes les organisations (SUPER_ADMIN)
- **`org`** : Accès à toutes les ressources de son organisation
- **`assigned`** : Accès uniquement aux événements assignés (PARTNER, HOSTESS)
- **`own`** : Accès uniquement à ses propres ressources
- **`none`** : Pas d'accès (permission refusée)

### 3.4.4 ValidationPipe

**Rôle** : Validation automatique des DTOs avec class-validator

**Configuration globale** :
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,        // Retire les props non déclarées
  forbidNonWhitelisted: true,  // Erreur si prop inconnue
  transform: true,        // Transformation auto en types
  transformOptions: {
    enableImplicitConversion: true
  }
}))
```

---

## 3.5 DTOs et Validation

### Exemple de DTO

```typescript
// create-event.dto.ts
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsDateString()
  startAt: string

  @IsDateString()
  endAt: string

  @IsEnum(LocationType)
  locationType: LocationType

  @IsInt()
  @IsOptional()
  @Min(1)
  capacity?: number

  @IsString()
  @IsOptional()
  addressFormatted?: string

  @ValidateNested()
  @Type(() => EventSettingsDto)
  @IsOptional()
  settings?: EventSettingsDto
}
```

### Transformation automatique

```typescript
// Query params automatiquement transformés
@Get()
findAll(@Query() dto: ListEventsDto) {
  // dto.page est un number, pas une string
  // dto.limit est un number
  // dto.status est validé comme EventStatus enum
}
```

---

## 3.6 Gestion des Erreurs

### Exception Filters

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error'

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url
    })
  }
}
```

### Codes d'erreur standards

- **400** Bad Request : Validation DTO échouée
- **401** Unauthorized : Token manquant ou invalide
- **403** Forbidden : Permissions insuffisantes
- **404** Not Found : Ressource introuvable
- **409** Conflict : Contrainte unique violée (ex: email déjà utilisé)
- **422** Unprocessable Entity : Erreur métier (ex: capacité atteinte)
- **500** Internal Server Error : Erreur serveur

---

[▶ Section 4 : Frontend Web](./04-FRONTEND-WEB.md)
