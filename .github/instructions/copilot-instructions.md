---
applyTo: '**'
---

# 🎯 ATTENDEE EMS - PRODUCT SPECIFICATIONS

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

### Règles Dark Mode - OBLIGATOIRES
- ✅ **Chaque élément UI** doit avoir ses variants `dark:` (bg, text, border, etc.)
- ✅ **Transitions fluides** : `transition-colors duration-200` sur tous les containers
- ✅ **Cohérence visuelle** : respecter la palette existante (gray-800/700 pour les fonds, white/gray-200 pour les textes)
- ✅ **Tests visuels** : vérifier le rendu dans les deux modes avant validation
- ✅ **Loading states** : skeletons adaptés avec `dark:bg-gray-600`
- ✅ **Empty states** : icônes et textes avec variants dark
- ✅ **Form elements** : inputs, selects, boutons avec support complet
- ✅ **Modals/Popups** : backdrop et contenu avec thème approprié

### Déploiement & Infrastructure
- **Configuration production** : HTTPS, CSP, variables d'environnement sécurisées
- **Docker & CI/CD** : Prêt pour déploiement automatisé
- **Scalabilité** : Architecture préparée pour montée en charge
- **Backup & Recovery** : Stratégies de sauvegarde des données

---

## 🔐 WORKFLOW DE CRÉATION D'UTILISATEUR - RÈGLE CRITIQUE

**⚠️ RÈGLE ABSOLUE : AUCUN UTILISATEUR NE PEUT SE CRÉER UN COMPTE DIRECTEMENT**

### Processus Obligatoire :
1. **Admin invite** → Saisie email + rôle + organisation
2. **User créé en DB** → `isActive: false`, `profileCompleted: false`, `invitationId`
3. **Email envoyé** → Lien `/signup/{token}` avec expiration
4. **Validation token** → Vérification token + email correspondent
5. **Complétion profil** → Formulaire prénom/nom/mot de passe
6. **Activation compte** → `isActive: true`, `profileCompleted: true`

### Sécurités Implémentées :
- 🔐 Token unique UUID par invitation
- ⏰ Expiration automatique (7 jours)
- 📧 Vérification email obligatoire  
- 🚫 Aucune création directe possible
- 🛡️ Validation multi-niveau (token/email/user)

**Documentation complète : `docs/USER_CREATION_WORKFLOW.md`**

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
      ability-provider.tsx        # CASL AbilityContext
    store/
      index.ts                    # configureStore, rootReducer
    routes/
      index.tsx                   # Router config
    config/
      env.ts                      # validation env (zod)
      constants.ts
    index.tsx

  shared/
    ui/                           # composants UI génériques (Button, Input, Modal…)
    lib/                          # utils (http client, telemetry, formatters)
    hooks/                        # hooks génériques (useDebounce, useToggle)
    types/                        # types transverses
    assets/                       # icons, images
    acl/                          # module CASL RBAC
      app-ability.ts              # types Actions/Subjects
      ability-factory.ts          # buildAbilityFromRules()
      policies/
        rbac-presets.ts           # fallback local role → rules
      hooks/
        useAbility.ts
        useCan.ts
      guards/
        Can.tsx
        GuardedRoute.tsx

  features/
    auth/
      api/
        authApi.ts                # login, me(), getPolicy()
      model/
        sessionSlice.ts           # user, orgId, roles, rules (CASL)
      ui/
        LoginForm.tsx
    events/
      api/
        eventsApi.ts              # RTK Query endpoints
      dpo/                        # DTO / DPO / mappers
        event.dto.ts
        event.dpo.ts
        event.mappers.ts
      model/
        eventsSlice.ts            # état UI (filtres, vues)
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
        attendeesSlice.ts         # état UI (tri, pagination client)
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
Actions: manage, create, read, update, delete, checkin, export, invite, approve, refuse, print
Subjects: Organization, Event, Subevent, Attendee, User, Badge, Scan, Report, Settings, all
Rôles par défaut: ORG_ADMIN, ORG_MANAGER, EVENT_MANAGER, CHECKIN_STAFF, PARTNER, READONLY

app/providers/ability-provider.tsx : AbilityContext provider.
shared/acl/app-ability.ts : types Actions/Subjects + AppAbility (MongoAbility<[Actions, Subjects]>).
shared/acl/ability-factory.ts : buildAbilityFromRules(rules) → AppAbility.
shared/acl/policies/rbac-presets.ts : fonction rulesFor(role, ctx { orgId, userId, eventIds? }) renvoyant un tableau de règles CASL (exemples inclus).
shared/acl/hooks/useAbility.ts + useCan.ts : accès ability et booléen can(action, subject, data?).
shared/acl/guards/Can.tsx : wrapper JSX conditionnel.
shared/acl/guards/GuardedRoute.tsx : guard de route avec fallback /403.

REDUX + RTK QUERY (SPÉCIFICATIONS)
app/store/index.ts : configureStore avec { authApi, eventsApi, attendeesApi }, slices UI, middleware RTKQ.
features/auth/api/authApi.ts :
  - endpoints: login, me, getPolicy(orgId) → { rules } (CASL) ou policyVersion.
features/auth/model/sessionSlice.ts :
  - state: user, orgId, roles, rules; selectors: selectAbilityRules, selectOrgId.
features/events/api/eventsApi.ts :
  - tagTypes: ["Events","Event"]
  - queries: list(params), byId(id)
  - mutations: create, update, remove
  - providesTags/invalidatesTags corrects + exemples d’optimistic update (updateQueryData).
features/attendees/api/attendeesApi.ts :
  - tagTypes: ["Attendees","Attendee"]
  - queries: list(params), byId(id)
  - mutations: updateStatus, exportCsv (mutation qui renvoie une URL).
Exemple d’usage selectFromResult dans EventList pour limiter les re-renders.

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
Vitest + RTL config, 1 test de composant (EventCard)
MSW pour mocker auth/events/attendees
Playwright: spec de base (login → Dashboard)

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
- [ ] Remplacer MSW par authentification JWT réelle
- [ ] Validation Zod complète côté serveur
- [ ] Protection CSRF et headers de sécurité
- [ ] Gestion des refresh tokens
- [ ] Rate limiting et protection DDoS

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

## 🔧 CORRECTIONS CRITIQUES APPLIQUÉES

### ✅ Cache RTK Query après Déconnexion (RÉSOLU)
- **Problème** : Données persistantes après logout, violation sécurité
- **Solution** : `resetApiState()` pour authApi, eventsApi, attendeesApi
- **Impact** : Isolation complète des sessions utilisateur
- **Fichier** : `src/widgets/Header/index.tsx`
- **Documentation** : `docs/LOGOUT_CACHE_FIX.md`