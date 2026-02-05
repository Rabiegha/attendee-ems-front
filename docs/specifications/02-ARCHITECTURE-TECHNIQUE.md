# Section 2 - Architecture Technique

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 1](./01-VUE-ENSEMBLE.md) | [▶ Section 3](./03-BACKEND-API.md)

---

## 2.1 Stack Technologique Complète

### 2.1.1 Backend (attendee-ems-back)

#### Framework et Langage
- **NestJS** 10.x - Framework Node.js progressif et modulaire
- **TypeScript** 5.x - Typage strict, mode strict activé
- **Node.js** 18+ LTS

#### Base de Données
- **PostgreSQL** 16 - Base de données relationnelle
- **Prisma** 5.x - ORM moderne avec génération de types
- **Extensions PostgreSQL** : citext (emails case-insensitive)

#### Authentification & Autorisation
- **JWT** (jsonwebtoken) - Tokens d'accès et refresh
- **Passport.js** - Stratégies d'authentification
- **bcrypt** - Hachage de mots de passe
- **RBAC custom** - Système de permissions granulaires (sans CASL côté backend)

#### Génération de Documents
- **Puppeteer** 24.x - Génération de PDF (badges)
- **QRCode** - Génération de QR codes
- **ExcelJS** - Import/Export Excel

#### Stockage Cloud
- **Cloudflare R2** - Stockage S3-compatible pour badges PDF/images
- **AWS SDK S3** - Client compatible R2

#### Communication
- **Nodemailer** - Envoi d'emails SMTP
- **Socket.IO** - WebSockets pour temps réel

#### Validation et Transformation
- **class-validator** - Validation de DTOs
- **class-transformer** - Transformation d'objets

#### Monitoring et Logging
- **@sentry/node** - Tracking d'erreurs et performance
- **Winston** (optionnel) - Logging structuré

#### Tests
- **Jest** - Framework de tests unitaires
- **Supertest** - Tests d'intégration API

### 2.1.2 Frontend Web (attendee-ems-front)

#### Framework et Langage
- **React** 18.2 - Bibliothèque UI avec Hooks
- **TypeScript** 5.x - Typage strict
- **Vite** 6.x - Build tool ultra-rapide

#### Styling
- **TailwindCSS** 3.3 - Utility-first CSS
- **PostCSS** - Processeur CSS
- **@tailwindcss/forms** - Styles de formulaires
- **@tailwindcss/typography** - Styles typographiques

#### Composants UI
- **Radix UI** - Composants accessibles headless
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-toast
- **Lucide React** - Icônes modernes
- **Heroicons** - Icônes complémentaires

#### State Management
- **Redux Toolkit** 2.0 - Gestion d'état globale
- **RTK Query** - Cache API et requêtes
- **Redux Persist** - Persistance du state

#### Routing
- **React Router** 6.20 - Navigation SPA

#### Formulaires
- **React Hook Form** 7.48 - Gestion de formulaires performante
- **Zod** 3.22 - Validation de schémas TypeScript
- **@hookform/resolvers** - Intégration Zod

#### Tables et Données
- **@tanstack/react-table** 8.21 - Tables puissantes
- **Fuse.js** 7.1 - Recherche floue
- **date-fns** 4.1 - Manipulation de dates

#### Visualisation
- **ECharts** 6.0 - Graphiques interactifs
- **echarts-for-react** - Wrapper React

#### Cartes
- **@vis.gl/react-google-maps** 1.7 - Google Maps React
- **react-google-autocomplete** - Autocomplete adresses

#### Éditeur de Badges
- **GrapesJS** 0.22 - Éditeur visuel drag & drop
- **grapesjs-preset-webpage** - Preset pour pages web
- **react-qr-code** - Génération QR codes en React

#### Permissions (Frontend)
- **@casl/ability** 6.5 - RBAC côté client
- **@casl/react** 4.0 - Intégration React

#### Drag & Drop
- **@dnd-kit/core** 6.3 - Système de DnD moderne
- **@dnd-kit/sortable** - Listes triables
- **@dnd-kit/modifiers** - Modificateurs DnD

#### Internationalisation
- **i18next** 23.7 - Framework i18n
- **react-i18next** 13.5 - Intégration React
- **i18next-browser-languagedetector** - Détection langue

#### Utilitaires
- **clsx** / **tailwind-merge** - Gestion classes CSS
- **class-variance-authority** - Variants de composants
- **xlsx** - Manipulation Excel
- **react-zoom-pan-pinch** - Zoom/Pan sur images

#### Tests
- **Vitest** 4.0 - Tests unitaires ultra-rapides
- **@testing-library/react** - Tests de composants
- **@testing-library/user-event** - Simulation interactions
- **Playwright** - Tests E2E
- **MSW** (Mock Service Worker) - Mocking API

#### Quality Tools
- **ESLint** - Linting TypeScript/React
- **Prettier** - Formatage de code
- **Husky** - Git hooks
- **lint-staged** - Lint sur fichiers stagés

#### Storybook
- **Storybook** 8.4 - Documentation composants
- **@storybook/addon-a11y** - Tests accessibilité

### 2.1.3 Application Mobile (attendee-ems-mobile)

#### Framework
- **React Native** (via Expo SDK 52)
- **Expo** - Plateforme de développement RN
- **TypeScript** 5.x

#### Styling
- **NativeWind** 4.x - Tailwind pour React Native
- **TailwindCSS** 3.x (config RN)

#### Navigation
- **React Navigation** 7.x
  - Stack Navigator
  - Bottom Tabs Navigator
  - Top Tabs Navigator

#### State Management
- **Redux Toolkit** 2.0
- **Redux Persist** + AsyncStorage

#### HTTP Client
- **Axios** - Requêtes HTTP avec intercepteurs

#### Stockage
- **expo-secure-store** - Stockage sécurisé (tokens)
- **@react-native-async-storage/async-storage** - Stockage local

#### Permissions Frontend
- **@casl/ability** - RBAC mobile

#### Internationalisation
- **react-i18next** - i18n mobile
- **dayjs** - Dates avec locale FR

#### Animations
- **React Native Reanimated** 3.x - Animations natives
- **React Native Gesture Handler** - Gestes

#### Caméra et Médias
- **expo-camera** - Accès caméra (scan QR)
- **expo-barcode-scanner** - Scan codes-barres

#### Permissions Natives
- **expo-permissions** - Gestion permissions système

#### Fonts et Assets
- **expo-font** - Chargement fonts custom
- **expo-asset** - Gestion d'assets

---

## 2.2 Architecture Globale du Système

### 2.2.1 Schéma d'Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEURS                               │
├──────────────┬──────────────────────┬───────────────────────────┤
│  Web Admins  │   Mobile Staff       │  Public Users             │
│  (Managers)  │   (Hostess)          │  (Registrations)          │
└──────┬───────┴──────────┬───────────┴────────────┬──────────────┘
       │                  │                        │
       ▼                  ▼                        ▼
┌─────────────────┐ ┌──────────────────┐  ┌──────────────────┐
│  Frontend Web   │ │  Mobile App      │  │  Public Form     │
│  (React SPA)    │ │  (React Native)  │  │  (React)         │
│  Port: 5173     │ │  iOS/Android     │  │  Embedded        │
└────────┬────────┘ └─────────┬────────┘  └────────┬─────────┘
         │                    │                     │
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              │
                     HTTPS (443) / WS
                              │
                              ▼
         ┌──────────────────────────────────────────┐
         │          NGINX Reverse Proxy             │
         │   - SSL/TLS Termination                  │
         │   - Load Balancing                       │
         │   - Static Files (Frontend Build)        │
         │   - Rate Limiting                        │
         └──────────────────┬───────────────────────┘
                            │
                    Port 3000 (internal)
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    BACKEND API (NestJS)                        │
│                                                                │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Auth      │  │  WebSocket   │  │   Public API       │  │
│  │   Module    │  │  Gateway     │  │   (No Auth)        │  │
│  │  (JWT)      │  │  (Socket.IO) │  │   /public/*        │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              BUSINESS MODULES                            │ │
│  │  - Events      - Registrations  - Badge Generation      │ │
│  │  - Attendees   - Users          - Invitations           │ │
│  │  - Organizations - Roles        - Email                 │ │
│  │  - Tags        - Sessions       - Permissions           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              INFRASTRUCTURE SERVICES                     │ │
│  │  - Prisma (ORM)    - Puppeteer (PDF)                   │ │
│  │  - Nodemailer      - R2 Service (Storage)              │ │
│  │  - Logger          - Config Service                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────┬─────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   PostgreSQL    │  │ Cloudflare R2│  │   SMTP Server    │
│   Database      │  │ (Badge PDFs) │  │   (Emails)       │
│   Port: 5432    │  │ S3 Compatible│  │   OVH/Gmail      │
└─────────────────┘  └──────────────┘  └──────────────────┘
```

### 2.2.2 Flux de Données

#### Flux d'Authentification
```
1. User → Frontend: Login (email/password)
2. Frontend → Backend: POST /auth/login
3. Backend → Database: Verify credentials
4. Backend → Frontend: JWT Access Token + Refresh Token (cookie)
5. Frontend: Store access token in memory (Redux)
6. Frontend: Store refresh token in secure cookie
7. Every request: Include access token in Authorization header
8. Token expiry: Auto-refresh using refresh token
```

#### Flux de Création d'Événement
```
1. Manager → Frontend: Fill event form
2. Frontend: Validate with Zod schema
3. Frontend → Backend: POST /events
4. Backend: Validate permissions (RBAC)
5. Backend → Database: Create event + settings + access
6. Backend → Frontend: Return created event
7. Frontend: Update Redux store
8. Frontend: Navigate to event details
```

#### Flux de Check-in Mobile
```
1. Hostess → Mobile: Scan QR code
2. Mobile: Decode registration ID
3. Mobile → Backend: POST /registrations/:id/checkin
4. Backend: Validate permissions
5. Backend → Database: Update registration (checked_in_at)
6. Backend → WebSocket: Emit event update
7. Backend → Mobile: Confirm check-in
8. Mobile: Show success + vibration
9. Web Dashboard: Real-time stats update via WebSocket
```

#### Flux de Génération de Badge
```
1. User → Frontend: Generate badge
2. Frontend → Backend: POST /badges/generate/:registrationId
3. Backend → Database: Get registration + template
4. Backend: Render HTML template with data
5. Backend → Puppeteer: Launch headless browser
6. Puppeteer: Render HTML → PDF
7. Backend → R2: Upload PDF + image
8. Backend → Database: Save badge URLs
9. Backend → Frontend: Return badge URLs
10. Frontend: Display badge preview
```

---

## 2.3 Modèle de Données (Schéma Prisma)

### 2.3.1 Tables Principales (31 au total)

#### Multi-Tenancy et Organisations

**organizations**
```prisma
- id (UUID, PK)
- name (String)
- slug (String, unique, citext)
- timezone (String?)
- created_at, updated_at
```

**users**
```prisma
- id (UUID, PK)
- email (String, unique, citext)
- password_hash (String)
- first_name, last_name, company, job_title, phone, country
- is_active (Boolean)
- metadata (JSON)
- created_at, updated_at
```

**org_users** (Jointure)
```prisma
- user_id (UUID, FK → users)
- org_id (UUID, FK → organizations)
- joined_at, created_at, updated_at
- PK: (user_id, org_id)
```

#### Rôles et Permissions

**roles**
```prisma
- id (UUID, PK)
- code (String) // SUPER_ADMIN, ADMIN, MANAGER, etc.
- name (String)
- org_id (UUID?, FK → organizations) // NULL pour rôles plateforme
- level (Int) // 100, 80, 60, 40, 20, 10
- is_platform, is_root, is_system_role, is_locked (Boolean)
- created_at, updated_at
```

**permissions**
```prisma
- id (UUID, PK)
- code (String) // events.read, registrations.update, etc.
- name (String)
- scope (Enum: any, org, assigned, own, none)
- description (String?)
- created_at, updated_at
```

**role_permissions** (Jointure)
```prisma
- role_id (UUID, FK → roles)
- permission_id (UUID, FK → permissions)
- PK: (role_id, permission_id)
```

**tenant_user_roles**
```prisma
- user_id (UUID, FK → users)
- org_id (UUID, FK → organizations)
- role_id (UUID, FK → roles)
- assigned_at, assigned_by
- PK: (user_id, org_id)
```

**platform_user_roles**
```prisma
- user_id (UUID, PK, FK → users)
- role_id (UUID, FK → roles)
- access_level (Enum: GLOBAL, LIMITED)
- assigned_at, assigned_by
```

#### Événements

**events**
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- code (String, unique per org)
- name (String)
- description (Text?)
- start_at, end_at (DateTime)
- timezone (String)
- status (Enum: draft, published, archived, registration_closed, cancelled, postponed)
- capacity (Int?)
- location_type (Enum: physical, online, hybrid)
- address_formatted, address_street, address_city, etc.
- latitude, longitude (Decimal?)
- metadata (JSON)
- created_by (UUID?)
- deleted_at (DateTime?) // Soft delete
- created_at, updated_at
```

**event_settings**
```prisma
- id (UUID, PK)
- event_id (UUID, unique, FK → events)
- org_id (UUID)
- public_token (String, unique) // Pour inscriptions publiques
- attendance_mode (Enum: onsite, online, hybrid)
- registration_auto_approve (Boolean)
- allow_checkin_out (Boolean)
- badge_template_id (UUID?, FK → badge_templates)
- registration_fields (JSON?) // Formulaire personnalisé
- auto_transition_to_active, auto_transition_to_completed (Boolean)
- website_url, logo_asset_id (String?)
- show_title, show_description (Boolean)
- submit_button_text, submit_button_color (String?)
- is_dark_mode (Boolean)
- created_at, updated_at
```

**event_assigned_users** (Jointure)
```prisma
- event_id (UUID, FK → events)
- user_id (UUID, FK → users)
- PK: (event_id, user_id)
```

#### Participants

**attendees** (Profils globaux)
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- email (String, citext)
- first_name, last_name, phone, company, job_title, country
- default_type_id (UUID?, FK → attendee_types)
- labels (String[])
- notes (Text?)
- metadata (JSON)
- is_active (Boolean)
- created_at, updated_at
- UNIQUE: (org_id, email)
```

**attendee_revisions** (Historique)
```prisma
- id (UUID, PK)
- org_id, attendee_id (UUID)
- change_type (String) // created, updated, imported
- source (String?) // public_form, manual, import
- snapshot (JSON) // État complet
- changed_by (UUID?)
- note (String?)
- changed_at (DateTime)
```

**attendee_types**
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- code (String) // VIP, SPEAKER, STANDARD, etc.
- name (String)
- color_hex, text_color_hex (String?)
- icon (String?)
- is_active (Boolean)
- created_at, updated_at
- UNIQUE: (org_id, code)
```

#### Inscriptions

**registrations** (Inscriptions spécifiques par événement)
```prisma
- id (UUID, PK)
- org_id (UUID)
- event_id (UUID, FK → events)
- attendee_id (UUID, FK → attendees)
- event_attendee_type_id (UUID?, FK → event_attendee_types)
- status (Enum: awaiting, approved, refused, cancelled)
- source (Enum: public_form, test_form, manual, import, mobile_app)
- attendance_mode (Enum: onsite, online, hybrid)
- answers (JSON?) // Réponses formulaire custom
- badge_template_id (UUID?, FK → badge_templates)
- badge_pdf_url, badge_image_url (String?)
- checked_in_at, checked_in_by (DateTime?, UUID?)
- checked_out_at, checked_out_by (DateTime?, UUID?)
- checkin_location, checkout_location (JSON?)
- invited_at, confirmed_at (DateTime?)
- snapshot_* (first_name, last_name, email, etc.) // Snapshot au moment de l'inscription
- comment (Text?)
- deleted_at (DateTime?) // Soft delete
- created_at, updated_at
- UNIQUE: (event_id, attendee_id)
```

**event_attendee_types**
```prisma
- id (UUID, PK)
- event_id (UUID, FK → events)
- org_id (UUID)
- attendee_type_id (UUID, FK → attendee_types)
- capacity (Int?)
- color_hex, text_color_hex (String?)
- is_active (Boolean)
- created_at, updated_at
- UNIQUE: (event_id, attendee_type_id)
```

#### Badges

**badge_templates**
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- event_id (UUID?, FK → events) // NULL = template global
- code (String)
- name (String)
- html (Text?) // Template HTML
- css (Text?) // Styles CSS
- template_data (JSON?) // Structure JSON
- variables (JSON?) // Variables disponibles
- width, height (Int) // Dimensions en pixels
- is_default, is_active (Boolean)
- usage_count (Int)
- created_by (UUID?)
- created_at, updated_at
- UNIQUE: (org_id, code)
```

**badges**
```prisma
- id (UUID, PK)
- org_id (UUID)
- registration_id (UUID, unique, FK → registrations)
- badge_template_id (UUID, FK → badge_templates)
- event_id (UUID, FK → events)
- status (Enum: pending, generating, completed, failed)
- badge_data (JSON?) // Données utilisées pour génération
- html_snapshot, css_snapshot (Text?) // HTML/CSS au moment de la génération
- data_snapshot (JSON?)
- qr_code_url (String?)
- image_url, pdf_url (String?) // URLs Cloudflare R2
- generated_at (DateTime?)
- generated_by (UUID?, FK → users)
- last_printed_at (DateTime?)
- print_count (Int)
- error_message (Text?)
- created_at, updated_at
```

**badge_prints** (Historique d'impression)
```prisma
- id (UUID, PK)
- org_id, badge_id (UUID)
- printed_by (UUID?)
- printed_at (DateTime)
```

**event_badge_rules** (Règles d'attribution automatique)
```prisma
- id (UUID, PK)
- event_id, org_id (UUID)
- badge_template_id (UUID, FK → badge_templates)
- name (String)
- priority (Int) // Ordre d'évaluation
- is_active (Boolean)
- created_at, updated_at
```

#### Sessions

**sessions**
```prisma
- id (UUID, PK)
- org_id, event_id (UUID, FK → events)
- name (String)
- description (Text?)
- start_at, end_at (DateTime)
- location (String?)
- capacity (Int?)
- created_at, updated_at
```

**session_attendee_types** (Types autorisés)
```prisma
- session_id (UUID, FK → sessions)
- event_attendee_type_id (UUID, FK → event_attendee_types)
- PK: (session_id, event_attendee_type_id)
```

**session_scans** (Scan entrée/sortie)
```prisma
- id (UUID, PK)
- session_id (UUID, FK → sessions)
- registration_id (UUID, FK → registrations)
- scan_type (String) // 'IN' | 'OUT'
- scanned_at (DateTime)
```

#### Invitations

**invitations**
```prisma
- id (UUID, PK)
- email (String, citext)
- token (String, unique)
- org_id (UUID, FK → organizations)
- role_id (UUID, FK → roles)
- invited_by_user_id (UUID, FK → users)
- status (Enum: PENDING, ACCEPTED, EXPIRED, CANCELLED)
- expires_at (DateTime)
- created_at, updated_at
- UNIQUE: (email, org_id)
```

#### Authentification

**refresh_tokens**
```prisma
- id (String, PK, CUID)
- userId (UUID, FK → users)
- jti (String, unique) // JWT ID
- tokenHash (String) // Hash du refresh token
- userAgent, ip (String?)
- createdAt, expiresAt (DateTime)
- revokedAt (DateTime?)
- replacedById (String?) // Rotation
```

**password_reset_tokens**
```prisma
- id (UUID, PK)
- user_id (UUID, FK → users)
- token (String, unique)
- expires_at (DateTime)
- used_at (DateTime?)
- created_at
```

#### Divers

**tags**
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- name (String)
- color (String?)
- usage_count (Int)
- created_at, updated_at
- UNIQUE: (org_id, name)
```

**event_tags** (Jointure)
```prisma
- event_id, tag_id (UUID)
- org_id (UUID)
- PK: (event_id, tag_id)
```

**email_senders**
```prisma
- id (UUID, PK)
- org_id (UUID, FK → organizations)
- from_name, from_email (String)
- reply_to_email (String?)
- is_active (Boolean)
- created_at, updated_at
```

**email_settings** (Par événement)
```prisma
- id (UUID, PK)
- org_id, event_id (UUID, unique)
- email_sender_id (UUID?, FK → email_senders)
- confirmation_enabled, confirmation_subject, confirmation_body
- reminder_enabled, reminder_subject, reminder_body, reminder_hours_before
- approval_enabled, approval_subject, approval_body
- require_email_verification (Boolean)
- created_at, updated_at
```

### 2.3.2 Relations Clés

- Une **organization** a plusieurs **users** (via org_users)
- Un **user** appartient à plusieurs **organizations** (multi-tenant)
- Un **user** a un **role** par **organization** (tenant_user_roles)
- Un **role** a plusieurs **permissions** (role_permissions)
- Un **event** appartient à une **organization**
- Un **attendee** (profil global) appartient à une **organization**
- Une **registration** lie un **attendee** à un **event** spécifique
- Un **badge** est lié à une **registration** (1-1)
- Un **event** peut avoir plusieurs **sessions**
- Un **refresh_token** appartient à un **user**

### 2.3.3 Enums

```typescript
enum EventStatus {
  draft, published, archived, registration_closed, cancelled, postponed
}

enum LocationType {
  physical, online, hybrid
}

enum AttendanceMode {
  onsite, online, hybrid
}

enum RegistrationStatus {
  awaiting, approved, refused, cancelled
}

enum RegistrationSource {
  public_form, test_form, manual, import, mobile_app
}

enum BadgeStatus {
  pending, generating, completed, failed
}

enum InvitationStatus {
  PENDING, ACCEPTED, EXPIRED, CANCELLED
}

enum PermissionScope {
  any, org, assigned, own, none
}

enum PlatformAccessLevel {
  GLOBAL, LIMITED
}
```

---

## 2.4 Patterns et Conventions

### 2.4.1 Architecture Backend (NestJS)

#### Structure Modulaire
```
src/
├── app.module.ts              # Module racine
├── main.ts                    # Point d'entrée
├── auth/                      # Module authentification
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/            # Passport strategies
│   └── dto/                   # Data Transfer Objects
├── modules/                   # Modules métier
│   ├── events/
│   ├── registrations/
│   ├── attendees/
│   └── ...
├── common/                    # Code partagé
│   ├── guards/                # Guards (JWT, Permissions)
│   ├── decorators/            # Decorators custom
│   ├── filters/               # Exception filters
│   ├── interceptors/          # Interceptors
│   └── utils/                 # Fonctions utilitaires
├── config/                    # Configuration
│   └── config.service.ts
├── infra/                     # Infrastructure
│   ├── db/                    # Prisma
│   └── storage/               # R2, S3
└── platform/                  # Plateforme (authz, etc.)
    └── authz/
```

#### Conventions de Nommage
- **Modules** : `events.module.ts`
- **Controllers** : `events.controller.ts`
- **Services** : `events.service.ts`
- **DTOs** : `create-event.dto.ts`
- **Interfaces** : `event.interface.ts`
- **Guards** : `jwt-auth.guard.ts`
- **Decorators** : `require-permission.decorator.ts`

#### Patterns Utilisés
- **Dependency Injection** (NestJS natif)
- **Repository Pattern** (via Prisma)
- **DTO Pattern** (validation avec class-validator)
- **Guard Pattern** (sécurité des routes)
- **Interceptor Pattern** (transformation de réponses)
- **Strategy Pattern** (Passport.js)

### 2.4.2 Architecture Frontend (React)

#### Feature-Sliced Design
```
src/
├── app/                       # Configuration globale
│   ├── config/
│   ├── providers/             # Redux, Router, CASL
│   ├── routes/
│   └── store/
├── features/                  # Modules métier isolés
│   ├── auth/
│   │   ├── api/               # RTK Query endpoints
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/             # Redux slice
│   ├── events/
│   ├── users/
│   └── ...
├── shared/                    # Code réutilisable
│   ├── ui/                    # Composants UI génériques
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── Table/
│   ├── acl/                   # RBAC/CASL
│   ├── hooks/                 # Hooks custom
│   └── utils/                 # Fonctions utilitaires
├── pages/                     # Pages de l'application
│   ├── Login/
│   ├── Events/
│   └── ...
└── widgets/                   # Widgets complexes
```

#### Conventions de Nommage
- **Composants** : PascalCase (`Button.tsx`, `EventCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`, `useEvents.ts`)
- **Stores** : camelCase avec suffixe `.slice` (`auth.slice.ts`)
- **API** : camelCase avec suffixe `.api` (`events.api.ts`)
- **Types** : PascalCase avec suffixe `Type` ou `Interface`

#### Patterns Utilisés
- **Compound Components** (Radix UI)
- **Render Props** (Conditional rendering)
- **Higher-Order Components** (ProtectedRoute)
- **Custom Hooks** (Logique réutilisable)
- **Context API** (Theme, CASL Ability)
- **Redux Toolkit** (State management)
- **RTK Query** (Data fetching)

### 2.4.3 Architecture Mobile (React Native)

#### Structure par Fonctionnalité
```
src/
├── navigation/                # Configuration navigation
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── EventsNavigator.tsx
├── screens/                   # Écrans de l'app
│   ├── Auth/
│   ├── Events/
│   └── Participants/
├── components/                # Composants réutilisables
│   ├── ui/
│   └── layout/
├── store/                     # Redux store
│   ├── index.ts
│   └── slices/
├── api/                       # Services API
│   ├── axiosClient.ts
│   └── *.service.ts
├── theme/                     # Système de thème
│   ├── tokens.ts
│   └── ThemeProvider.tsx
├── permissions/               # CASL
│   └── ability.ts
├── utils/                     # Utilitaires
└── types/                     # Types TypeScript
```

#### Patterns Utilisés
- **Navigation Pattern** (React Navigation)
- **Redux Pattern** (State management)
- **Service Pattern** (API calls)
- **Theme Pattern** (Runtime theming)
- **Permission Pattern** (CASL)

---

[▶ Section 3 : Backend API](./03-BACKEND-API.md)
