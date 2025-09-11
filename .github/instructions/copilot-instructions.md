---
applyTo: '**'
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