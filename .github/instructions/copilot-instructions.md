---
applyTo: '**'
---

# 🎯 ATTENDEE EMS - PRODUCT SPECIFICATIONS

## 📋 RÈGLES DE GESTION DES INSTRUCTIONS & DOCUMENTATION

### ⚠️ RÈGLE ABSOLUE : STRUCTURE ET ORGANISATION

**AVANT TOUTE CRÉATION DE DOCUMENTATION :**

1. ✅ **Vérifier si documentation existante** dans `.github/instructions/` ou `/docs`
2. ✅ **Mettre à jour** le fichier existant si possible
3. ✅ **Créer nouveau fichier** SEULEMENT si thème totalement nouveau
4. ✅ **Placer dans bon répertoire** :
   - `.github/instructions/` : Instructions pour IA et développeurs
   - `/docs` : Documentation technique détaillée

**INTERDICTIONS STRICTES :**

- ❌ **PAS de documentation à la racine** du projet
- ❌ **PAS de fichiers temporaires** non nettoyés
- ❌ **PAS de duplication** d'informations existantes
- ❌ **PAS de noms vagues** : toujours explicite et structuré

**CONVENTION DE NOMMAGE :**

- Instructions IA : `copilot-instructions.md`, `db-instructions.md`
- Documentation : `NOM_FEATURE.md` (ex: `DEMO_SYSTEM.md`)
- Guides : `GUIDE_SUJET.md` (ex: `DEVELOPMENT_GUIDE.md`)

---

## ⚠️ EXIGENCES PRODUIT COMMERCIAL

**CETTE APPLICATION EST UN PRODUIT COMMERCIAL DESTINÉ À LA VENTE B2B.**

### Qualité Production Requise

- **ZÉRO TOLÉRANCE BUGS** : Chaque fonctionnalité doit être testée et fonctionnelle à 100%
- **SÉCURITÉ RENFORCÉE** : Authentification JWT réelle, validation côté serveur, protection CSRF, headers sécurisés
- **PERFORMANCES OPTIMALES** : Lazy loading, code splitting, mise en cache, métriques de performance
- **MONITORING & LOGGING** : Système complet de logging d'erreurs pour la production
- **TESTS EXHAUSTIFS** : Couverture E2E complète, tests d'intégration, validation RBAC en conditions réelles

### Standards de Développement

- **Architecture strictement respectée** (feature-sliced domain-driven)
- **TypeScript strict mode** obligatoire
- **Code propre et documenté** : commentaires, JSDoc, README complets
- **Gestion d'erreurs robuste** : Error Boundaries, fallbacks, retry logic
- **Accessibilité WCAG 2.1** : navigation clavier, screen readers, contraste
- **Internationalisation production** : français/anglais, gestion des formats de dates/nombres
- **🌙 DARK MODE OBLIGATOIRE** : Toute nouvelle page, composant, modal, popup doit inclure le support complet du dark mode avec classes `dark:` et transitions fluides
- **🚫 PAS D'EMOJIS SUR LE SITE** : Interdits dans toute interface utilisateur visible (OK dans logs/code/documentation)

### Règles Dark Mode - OBLIGATOIRES

- ✅ **Chaque élément UI** doit avoir ses variants `dark:` (bg, text, border, etc.)
- ✅ **Transitions fluides** : `transition-colors duration-200` sur tous les containers
- ✅ **Cohérence visuelle** : respecter la palette existante (gray-800/700 pour les fonds, white/gray-200 pour les textes)
- ✅ **Tests visuels** : vérifier le rendu dans les deux modes avant validation
- ✅ **Loading states** : skeletons adaptés avec `dark:bg-gray-600`
- ✅ **Empty states** : icônes et textes avec variants dark
- ✅ **Form elements** : inputs, selects, boutons avec support complet
- ✅ **Modals/Popups** : backdrop et contenu avec thème approprié

### 🚫 Règle "Pas d'Emojis sur le Site" - OBLIGATOIRE (21/10/2025)

**⚠️ RÈGLE STRICTE :** Les emojis sont **INTERDITS** dans toute interface visible par les utilisateurs finaux.

**AUTORISÉ** ✅ :

- Dans les commentaires du code
- Dans les console.log() et logs de développement
- Dans la documentation technique (fichiers .md)
- Dans les fichiers d'instructions

**INTERDIT** ❌ :

- Dans les textes affichés à l'écran (titres, boutons, labels, messages)
- Dans les notifications/toasts visibles par les utilisateurs
- Dans les placeholders de formulaires
- Dans les messages d'erreur/succès UI

**Exemples :**

```tsx
// ❌ INTERDIT
<Button>🎉 Créer un événement</Button>
<h1>Dashboard 📊</h1>
toast.success('✅ Événement créé !')

// ✅ CORRECT
<Button>Créer un événement</Button>
<h1>Dashboard</h1>
toast.success('Événement créé avec succès')

// ✅ OK dans le code
console.log('🎉 Événement créé') // OK
// 📝 Note: Cette fonction gère la création // OK
```

**EXISTANT :** Ne pas supprimer les emojis déjà présents dans le code actuel, mais ne plus en ajouter de nouveaux dans l'UI.

### Déploiement & Infrastructure

- **Configuration production** : HTTPS, CSP, variables d'environnement sécurisées
- **Docker & CI/CD** : Prêt pour déploiement automatisé
- **Scalabilité** : Architecture préparée pour montée en charge
- **Backup & Recovery** : Stratégies de sauvegarde des données

---

## 🔐 WORKFLOW DE CRÉATION D'UTILISATEUR - RÈGLE CRITIQUE

**⚠️ RÈGLE ABSOLUE : AUCUN UTILISATEUR NE PEUT SE CRÉER UN COMPTE DIRECTEMENT**

### Processus Obligatoire (Mis à jour 30/09/2025) :

1. **Admin créé compte** → Saisie prénom + nom + email + rôle + organisation
2. **Système génère** → Mot de passe temporaire sécurisé (12 caractères)
3. **User créé en DB** → `isActive: true`, `mustChangePassword: true`
4. **Email envoyé** → Identifiants de connexion (email + mot de passe temporaire)
5. **Première connexion** → Redirection forcée vers page changement mot de passe
6. **Changement mdp** → `mustChangePassword: false`, accès complet au système

### Architecture Base de Données :

```sql
-- Colonne ajoutée à la table users
ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT false;

-- Workflow de création
CREATE TABLE user_creation_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  temp_password VARCHAR(255),  -- Hash du mot de passe temporaire
  created_at TIMESTAMP DEFAULT NOW(),
  password_changed_at TIMESTAMP
);
```

### Sécurités Implémentées :

- 🔐 **Mot de passe généré** : 12 caractères (majuscules, minuscules, chiffres, symboles)
- 📧 **Email sécurisé** : Identifiants transmis par email chiffré
- 🚫 **Aucune création directe** possible
- � **Changement obligatoire** : Impossible d'utiliser le système sans changer le mdp
- 📊 **Audit trail** : Log de toutes les créations de comptes
- ⏰ **Expiration** : Mots de passe temporaires expirent après 30 jours

### Avantages du Nouveau Système :

- ✅ **Plus simple** : Pas de token/lien complexe
- ✅ **Plus rapide** : Compte immédiatement utilisable
- ✅ **Plus sécurisé** : Obligation de changer le mot de passe
- ✅ **Meilleure UX** : Email clair avec identifiants
- ✅ **Traçabilité** : Logs complets des créations

**Documentation complète : `docs/USER_CREATION_WORKFLOW_V2.md`**

---

## 📧 MODULE EMAIL POUR CRÉATION DE COMPTES

### Architecture Email Système :

**Backend (attendee-ems-back) :**

- Module Email avec Nodemailer/SendGrid pour envoi d'identifiants
- Service de génération de mots de passe sécurisés
- Templates HTML pour emails d'identifiants
- Logs d'audit pour traçabilité des créations

**Workflow Backend :**

```typescript
// Service de création d'utilisateur
async createUser(userData, creatorId) {
  // 1. Générer mot de passe temporaire
  const tempPassword = generateSecurePassword(12);
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // 2. Créer utilisateur en DB
  const user = await User.create({
    ...userData,
    password_hash: hashedPassword,
    is_active: true,
    must_change_password: true
  });

  // 3. Log de création
  await UserCreationLog.create({
    user_id: user.id,
    created_by: creatorId,
    temp_password: hashedPassword
  });

  // 4. Envoyer email avec identifiants
  await this.emailService.sendCredentials(user.email, tempPassword);

  return user;
}
```

**Frontend Integration :**

- Page `/admin/users` avec formulaire création
- Modal de confirmation avant envoi email
- Interface de gestion des utilisateurs avec statut "Doit changer mdp"
- Page `/change-password` pour première connexion (redirection forcée)

### Middleware de Contrôle First Login :

```typescript
// Guard pour forcer changement de mot de passe
@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    // Si must_change_password = true, rediriger vers /change-password
    if (user.must_change_password && request.path !== '/auth/change-password') {
      throw new ForbiddenException('Must change password first')
    }

    return true
  }
}
```

**PRIORITÉ** : Module Email + Interface création utilisateur.

---

## 🎯 SYSTÈME DE FORMULAIRES EMBEDDABLES - ARCHITECTURE SaaS B2B

**🎯 VISION PRODUIT (29/09/2025)** : Créer un SaaS multi-tenant où les clients peuvent créer des événements et collecter des inscriptions via des formulaires embeddables sur leurs propres sites.

### Modèle Business Multi-Tenant :

**VOTRE PLATEFORME** → **CLIENTS (Organizations)** → **ÉVÉNEMENTS** → **FORMULAIRES EMBED** → **PARTICIPANTS**

1. **Clients** s'inscrivent et ont leur compte admin sur votre plateforme
2. **Admins clients** invitent leur équipe dans leur organisation
3. **Équipes** créent des événements pour leur organisation
4. **Événements** génèrent automatiquement un formulaire d'inscription embeddable
5. **Public** s'inscrit via ce formulaire intégré sur le site du client
6. **Inscriptions** arrivent automatiquement dans le back-office du client

### Architecture Données CRM Intégrée :

**ATTENDEES (Base Globale CRM)** - **RÈGLE CRITIQUE**

- Table `attendees` : profils uniques par personne dans l'organisation
- Lien vers `persons` (table globale cross-org)
- Historique complet de toutes les participations
- CRM intégré avec labels, notes, segmentation

**REGISTRATIONS (Inscriptions Spécifiques)**

- Table `registrations` : inscription à un événement spécifique
- Lien vers `attendee` global (attendeeId)
- Statut d'inscription (awaiting, approved, refused, cancelled)
- Données contextuelles (type participation, réponses formulaires)
- Badges, présences, check-ins liés

**FLUX D'INSCRIPTION AVEC CRM :**

1. Formulaire Embed → Soumission inscription
2. **Vérification existence attendee** (par email + org_id)
3. **Si nouveau** → Création profil attendee global
4. **Si existant** → Récupération profil existant
5. **Création registration** liée à l'attendee
6. **Mise à jour historique** et CRM automatique

### Workflow Technique :

```sql
-- Events avec token public pour embed
CREATE TABLE events (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  public_token VARCHAR(255) UNIQUE NOT NULL,  -- Pour formulaires embeds
  title VARCHAR(255) NOT NULL,
  form_fields JSONB DEFAULT '[...]'            -- Configuration formulaire
);

-- CRM Global Attendees
CREATE TABLE attendees (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,        -- Isolation multi-tenant
  person_id UUID,              -- Lien vers profil global cross-org
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  tags JSONB DEFAULT '[]',     -- Labels CRM
  notes TEXT,                  -- Notes CRM
  created_at TIMESTAMP
);

-- Inscriptions spécifiques par événement
CREATE TABLE registrations (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  attendee_id UUID NOT NULL REFERENCES attendees(id),
  org_id UUID NOT NULL,       -- Sécurité multi-tenant
  status VARCHAR(50) DEFAULT 'registered',
  form_data JSONB NOT NULL,   -- Données saisies dans le formulaire
  source_url VARCHAR(255),    -- URL où était intégré le formulaire
  registered_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints :

```typescript
// ===== API ADMIN (Clients) =====
POST   /events                        // Créer événement
GET    /events/:id/embed-code         // Générer code HTML embed
GET    /events/:id/registrations      // Liste participants
GET    /attendees                     // CRM global organisation
GET    /attendees/:id                 // Profil + historique complet

// ===== API PUBLIQUE (Formulaires) =====
GET    /public/events/:token             // Info événement pour formulaire
POST   /public/events/:token/register    // Soumission inscription
```

### Code Embed Généré :

```html
<!-- Ce que reçoivent les clients -->
<div id="ems-registration-form"></div>
<script
  src="https://votre-ems.com/embed.js"
  data-event-token="abc-123-def-456"
  data-target="#ems-registration-form"
></script>
```

### Avantages Architecture CRM :

- ✅ **CRM unifié** avec vue globale par participant
- ✅ **Évite les doublons** de profils
- ✅ **Historique cross-événements** pour analytics
- ✅ **Marketing ciblé** basé sur comportement
- ✅ **Support multi-événements** et récurrents
- ✅ **Isolation multi-tenant** sécurisée

**PRIORITÉ DÉVELOPPEMENT** : Module Events Backend → Module Attendees/Registrations → API Publique Embed

---

BUT
Créer un projet **React 18 + TypeScript + Vite** pour un Event Management System (EMS) B2B, avec :
Redux Toolkit + RTK Query (state management + cache API)
React Router v6
Tailwind CSS + Radix primitives (UI de base), shadcn/ui optionnel
React Hook Form + Zod (formulaires + validation typée)
i18next (internationalisation, fr par défaut)
Storybook (documentation UI)
Vitest + React Testing Library (unit/integration), Playwright (E2E)
MSW (mock API dev/test)
ESLint + Prettier + Husky + lint-staged
CASL (RBAC côté front)

CONTRAINTES
TypeScript strict.
Architecture **feature-sliced / domain-driven**.
RTK Query pour l’état serveur, slices Redux pour l’état purement UI (filtres, modals).
i18n lazy (namespaces chargés à la demande).
CASL pour RBAC (ability, guards, hooks). “Deny by default” sur l’UI.

SCRIPTS NPM ATTENDUS
dev, build, preview
test (vitest), test:e2e (playwright)
storybook, build-storybook
lint, format, typecheck
prepare (husky)

ARBORESCENCE À RESPECTER
src/
app/
providers/
store-provider.tsx
router-provider.tsx
i18n-provider.tsx
ability-provider.tsx # CASL AbilityContext
store/
index.ts # configureStore, rootReducer
routes/
index.tsx # Router config
config/
env.ts # validation env (zod)
constants.ts
index.tsx

shared/
ui/ # composants UI génériques (Button, Input, Modal…)
lib/ # utils (http client, telemetry, formatters)
hooks/ # hooks génériques (useDebounce, useToggle)
types/ # types transverses
assets/ # icons, images
acl/ # module CASL RBAC
app-ability.ts # types Actions/Subjects
ability-factory.ts # buildAbilityFromRules()
policies/
rbac-presets.ts # fallback local role → rules
hooks/
useAbility.ts
useCan.ts
guards/
Can.tsx
GuardedRoute.tsx

features/
auth/
api/
authApi.ts # login, me(), getPolicy()
model/
sessionSlice.ts # user, orgId, roles, rules (CASL)
ui/
LoginForm.tsx
events/
api/
eventsApi.ts # RTK Query endpoints
dpo/ # DTO / DPO / mappers
event.dto.ts
event.dpo.ts
event.mappers.ts
model/
eventsSlice.ts # état UI (filtres, vues)
ui/
EventList.tsx
EventCard.tsx
attendees/
api/
attendeesApi.ts
dpo/
attendee.dto.ts
attendee.dpo.ts
attendee.mappers.ts
model/
attendeesSlice.ts # état UI (tri, pagination client)
ui/
AttendeeTable.tsx
AttendeeFilters.tsx

pages/
Dashboard/
index.tsx
EventDetails/
index.tsx
Attendees/
index.tsx

widgets/
Header/
index.tsx
Sidebar/
index.tsx
StatsCards/
index.tsx

styles/
tailwind.css
tokens.css

CONFIG ATTENDUE
Tailwind configuré (postcss.config.cjs, tailwind.config.ts), préfixes utilitaires, tokens basiques.
ESLint (react, ts, hooks) + Prettier (conflits résolus) + tsconfig strict + path aliases "@/…".
MSW prêt (handlers basiques auth/events/attendees).
Storybook configuré (CSF, addon-a11y, i18n provider).
Playwright prêt (1 spec e2e ex: login → liste événements).
Sentry prêt à brancher (optionnel: DSN via env).

CASL RBAC (DÉTAILS À IMPLÉMENTER)
Actions: manage, create, read, update, delete, check_in, scan, export, invite, approve, refuse, print
Subjects: Organization, Event, Subevent, Attendee, User, Badge, Registration, Invitation, Report, Settings, all
Rôles du système: SUPER_ADMIN, ADMIN, MANAGER, VIEWER, PARTNER, HOSTESS
⚠️ **IMPORTANT** : Utiliser EXACTEMENT ces 6 rôles. Pas d'autres rôles (ORG_ADMIN, ORG_MANAGER, EVENT_MANAGER, etc. sont OBSOLÈTES)

app/providers/ability-provider.tsx : AbilityContext provider.
shared/acl/app-ability.ts : types Actions/Subjects + AppAbility (MongoAbility<[Actions, Subjects]>).
shared/acl/ability-factory.ts : buildAbilityFromRules(rules) → AppAbility.
shared/acl/policies/rbac-presets.ts : fonction rulesFor(role, ctx { orgId, userId, eventIds? }) renvoyant un tableau de règles CASL (exemples inclus).
shared/acl/hooks/useAbility.ts + useCan.ts : accès ability et booléen can(action, subject, data?).
shared/acl/guards/Can.tsx : wrapper JSX conditionnel.
shared/acl/guards/GuardedRoute.tsx : guard de route avec fallback /403.

REDUX + RTK QUERY (SPÉCIFICATIONS)
⚠️ **ARCHITECTURE UNIFIÉE** : Utiliser un seul rootApi pour tous les endpoints (pas de authApi, eventsApi séparés)
app/store/rootApi.ts : API unique avec injectEndpoints() par feature
app/store/index.ts : configureStore avec rootApi, slices UI, middleware RTKQ

features/auth/api/authApi.ts :

- Injecter dans rootApi avec rootApi.injectEndpoints()
- endpoints: login, logout, me, refresh, getPolicy(orgId) → { rules } (CASL)
- ⚠️ **CRITIQUE** : resetApiState() dans logout pour vider le cache (sécurité)

features/auth/model/sessionSlice.ts :

- state: user, orgId, roles, rules; selectors: selectAbilityRules, selectOrgId, selectUser
  features/events/api/eventsApi.ts :
- Injecter dans rootApi avec rootApi.injectEndpoints()
- tagTypes: ["Event"] (définis dans rootApi)
- queries: getEvents(params), getEventById(id)
- mutations: createEvent, updateEvent, deleteEvent
- providesTags/invalidatesTags corrects + optimistic updates (updateQueryData)

features/attendees/api/attendeesApi.ts :

- Injecter dans rootApi avec rootApi.injectEndpoints()
- tagTypes: ["Attendee"] (définis dans rootApi)
- queries: getAttendees(params), getAttendeeById(id)
- mutations: updateAttendeeStatus, exportAttendeesCsv

⚠️ **TAGS RTK QUERY** : Tous définis dans rootApi :
['Auth', 'User', 'Event', 'Attendee', 'Registration', 'Role', 'Invitation', 'Organization']

Exemple d'usage selectFromResult dans EventList pour limiter les re-renders.

PROVIDERS À MONTER DANS src/app/index.tsx
Redux Provider (store)
AbilityProvider (rules depuis sessionSlice, fallback presets)
I18nProvider (fr par défaut, lazy)
RouterProvider (React Router v6)

FORMULAIRES
React Hook Form + zodResolver
Composant FormField générique (label, hint, error)
Exemple: LoginForm avec schéma Zod

ROUTING
pages/Dashboard, EventDetails/:id, Attendees
GuardedRoute pour routes sensibles (ex: /events/:id/edit → manage Event)
Page 403 simple

TESTS
Vitest + RTL config pour tests unitaires
Playwright pour tests E2E (login → Dashboard → Création événement)
⚠️ **MSW N'EST PLUS UTILISÉ** : L'application utilise une vraie API backend (attendee-ems-back)
Pour les tests : utiliser l'API backend en mode test ou des fixtures JSON

STORYBOOK
Story pour Button (shared/ui/Button)
Story pour EventCard
Addon a11y, controls

DARK MODE - RÈGLES STRICTES
**⚠️ OBLIGATOIRE : CHAQUE NOUVEAU COMPOSANT DOIT SUPPORTER LE DARK MODE**

SYSTÈME IMPLÉMENTÉ :

- ThemeProvider global avec persistance localStorage
- useThemeContext() hook pour accéder au thème
- ThemeToggle composant (modes : light, dark, system)
- Classes CSS : `dark:` variants pour tous les éléments

RÈGLES DE DÉVELOPPEMENT :

1. **Container backgrounds** : `bg-white dark:bg-gray-800`
2. **Text colors** : `text-gray-900 dark:text-white` (headings), `text-gray-600 dark:text-gray-300` (body)
3. **Borders** : `border-gray-200 dark:border-gray-700`
4. **Transitions** : `transition-colors duration-200` OBLIGATOIRE
5. **Form elements** : inputs, selects, buttons avec variants dark complets
6. **Hover states** : `hover:bg-gray-100 dark:hover:bg-gray-700`
7. **Loading/Empty states** : skeletons et icônes avec support dark

EXEMPLES TYPES :

```tsx
// ✅ BON - Support dark mode complet
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
  <h2 className="text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>

// ❌ MAUVAIS - Pas de support dark mode
<div className="bg-white border border-gray-200">
  <h2 className="text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

ANIMATIONS & MODALS
TOUJOURS utiliser le composant Modal de base (shared/ui/Modal.tsx) pour toutes les modals.
Animations subtiles et élégantes :

- Fade-in/out backdrop (200ms ease-out)
- Scale + slide modal (95% → 100% scale, 4px translate-y)
- Portal rendering pour éviter les z-index conflicts
- Gestion state isVisible + shouldRender pour animations propres
  Tailles supportées: sm, md, lg, xl, 2xl, 4xl
  Props: title, maxWidth, showCloseButton, closeOnBackdropClick
  Exemples: CreateEventModal, EditEventModal, DeleteEventModal
  **🌙 DARK MODE OBLIGATOIRE** : backdrop et contenu avec thème approprié

TOASTS SYSTÈME
TOUJOURS utiliser le système de toast centralisé (shared/ui/Toast.tsx).

- Position : bottom-center avec animations slide-up
- Types : success, error, warning, info
- Auto-dismiss 5s, closable manuellement
- Hook useToast() pour usage simple
- Store Redux dédié (toast-slice.ts)
- **🌙 DARK MODE REQUIS** : Support automatique via classes `dark:`
  Exemples: toast.success('Événement créé !', 'Message détaillé.')

ARCHITECTURE DONNÉES ATTENDEES/REGISTRATIONS
IMPORTANT : Le système utilise une architecture à deux niveaux pour la gestion des participants.

ATTENDEES (Base Globale CRM)

- Table attendees : profils uniques par personne dans l'organisation
- Lien vers persons (table globale cross-org)
- Historique complet de toutes les participations
- CRM intégré avec labels, notes, segmentation

REGISTRATIONS (Inscriptions Spécifiques)

- Table registrations : inscription à un événement spécifique
- Lien vers attendee global (attendeeId)
- Statut d'inscription (awaiting, approved, refused, cancelled)
- Données contextuelles (type participation, réponses formulaires)
- Badges, présences, check-ins liés

FLUX D'INSCRIPTION

1. Landing Page Event → Formulaire inscription
2. Vérification existence attendee (par email/person_id)
3. Si nouveau → Création profil attendee
4. Si existant → Récupération profil existant
5. Création registration liée à l'attendee
6. Mise à jour historique et CRM

AVANTAGES

- CRM unifié avec vue globale par participant
- Évite les doublons de profils
- Historique cross-événements pour analytics
- Marketing ciblé basé sur comportement
- Support multi-événements et événements récurrents

API ENDPOINTS À PRÉVOIR
GET /attendees → Liste CRM global
GET /attendees/:id → Profil complet + historique
POST /events/:eventId/register → Inscription (crée attendee si besoin)
GET /events/:eventId/registrations → Inscriptions à l'événement
PUT /registrations/:id/status → Changement statut inscription

---

## 🚀 ROADMAP PRODUCTION

### Phase 1 : Sécurité & Authentification ⚡

- [x] **CRITIQUE RÉSOLU** : Cache RTK Query vidé lors de la déconnexion (fuite de données corrigée)
- [x] **IMPLÉMENTÉ** : Authentification JWT réelle avec backend NestJS
- [x] **IMPLÉMENTÉ** : Refresh tokens avec rotation (cookies HttpOnly)
- [ ] Validation Zod complète côté client (formulaires)
- [ ] Protection CSRF et headers de sécurité
- [ ] Rate limiting côté client (throttle requests)

### Phase 2 : Qualité & Monitoring 📊

- [ ] Error Boundaries React dans tous les providers
- [ ] Système de logging d'erreurs Sentry/LogRocket
- [ ] Métriques de performance (Core Web Vitals)
- [ ] Tests E2E exhaustifs avec Playwright
- [ ] Tests d'intégration RTK Query

### Phase 3 : Performance & Scalabilité ⚡

- [ ] Lazy loading des routes et features
- [ ] Code splitting optimisé (Vite bundles)
- [ ] Cache Strategy avancée (RTK Query + Service Worker)
- [ ] Optimisation images et assets
- [ ] Compression et minification production

### Phase 4 : Déploiement & Infrastructure 🏗️

- [ ] Configuration HTTPS et SSL
- [ ] Content Security Policy (CSP)
- [ ] Variables d'environnement sécurisées
- [ ] Docker multi-stage builds
- [ ] CI/CD Pipeline (GitHub Actions)
- [ ] Health checks et monitoring

### Phase 5 : UX & Accessibilité ♿

- [ ] Validation WCAG 2.1 complète
- [ ] Navigation clavier optimale
- [ ] Support screen readers
- [ ] Tests utilisateurs et optimisation UX
- [ ] Thèmes et préférences utilisateur

**PRINCIPE : Chaque phase doit être 100% fonctionnelle avant passage à la suivante.**

---

## 📋 ARCHITECTURE DES RÔLES - CRITIQUE

⚠️ **ATTENTION** : Le système utilise exactement 6 rôles avec des permissions très spécifiques. Aucun autre rôle n'existe.

### 1. SUPER_ADMIN

- **Portée** : Accès global à toutes les données (toutes les organisations, tous les utilisateurs, tous les attendees)
- **Particularité** : Peut avoir sa propre organisation ET voir les autres organisations
- **Permissions** :
  - Voir toutes les données de toutes les organisations
  - Créer des comptes utilisateurs dans n'importe quelle organisation
  - Créer de nouvelles organisations
  - Accès à toutes les fonctionnalités existantes
  - Dans les formulaires : peut choisir d'inviter dans une org existante OU créer un utilisateur dans une nouvelle org

### 2. ADMIN

- **Portée** : Limitée à sa propre organisation uniquement
- **Permissions** :
  - Voir tous les membres de son équipe/organisation
  - Créer des événements pour son organisation
  - Inviter des membres en leur créant des comptes (forcément dans sa propre organisation)
  - Accès à toutes les fonctionnalités liées à son organisation
  - Modifier les événements de son organisation

### 3. MANAGER

- **Portée** : Limitée à sa propre organisation uniquement
- **Permissions** :
  - Mêmes permissions que ADMIN SAUF inviter des membres
  - Créer des événements
  - Voir les inscrits aux événements
  - Pas le droit de créer de nouveaux comptes

### 4. VIEWER

- **Portée** : Limitée à sa propre organisation uniquement
- **Type** : Read-only sur TOUS les événements de l'organisation
- **Permissions** :
  - Voir tous les événements de son organisation
  - Voir les détails et les inscrits
  - Aucune permission de modification
  - Membre de l'équipe avec accès en lecture seule

### 5. PARTNER

- **Portée** : Limitée aux événements spécifiques qui lui sont attribués
- **Type** : Read-only sur des événements sélectionnés
- **Permissions** :
  - Voir uniquement les événements où il est assigné comme partner
  - Aucune permission de modification
  - Les créateurs d'événements peuvent attribuer des partners via un formulaire
- **Workflow** : Dans le formulaire de création d'événement, lister tous les partners disponibles pour attribution

### 6. HOSTESS

- **Portée** : Limitée aux événements spécifiques qui lui sont attribués
- **Type** : Accès aux fonctions de check-in et scan QR codes
- **Permissions** :
  - Scanner les QR codes pour les événements assignés
  - Accès aux fonctions de check-in
  - Voir les participants des événements assignés
  - Aucune permission de modification des données

### Règles critiques

1. **JAMAIS de rôles fantaisistes** en dehors de ces 6 rôles définis
2. **Hiérarchie stricte** : SUPER_ADMIN > ADMIN > MANAGER > VIEWER > PARTNER > HOSTESS
3. **Isolation des organisations** : sauf SUPER_ADMIN, tous les rôles sont limités à leur organisation
4. **Attribution des partners et hostess** : doit être gérée au niveau de chaque événement

---

## �🔧 CORRECTIONS CRITIQUES APPLIQUÉES

### ✅ Cache RTK Query après Déconnexion (RÉSOLU)

- **Problème** : Données persistantes après logout, violation sécurité
- **Solution** : `resetApiState()` pour authApi, eventsApi, attendeesApi
- **Impact** : Isolation complète des sessions utilisateur
- **Fichier** : `src/widgets/Header/index.tsx`
- **Documentation** : `docs/LOGOUT_CACHE_FIX.md`
