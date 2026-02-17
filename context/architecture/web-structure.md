# Architecture Web — Structure Frontend

## Scope
- web/*
- web/architecture

## Purpose
Organisation du frontend React : routing, state management, structure des dossiers, conventions de composants.

## Content

### Stack technique

| Outil | Rôle |
|-------|------|
| React 18+ | UI framework |
| Vite | Build tool & dev server |
| TypeScript | Typage statique |
| TailwindCSS | Styling utilitaire |
| React Router | Routing client-side |
| Axios / Fetch | Appels API |
| React Query (optionnel) | Cache & sync serveur |

### Structure des dossiers

```
src/
├── features/          # Modules métier (feature-based)
│   ├── auth/          # Login, register, guards
│   ├── events/        # CRUD événements
│   ├── attendees/     # Gestion participants
│   ├── dashboard/     # Vue d'ensemble
│   └── checkin/       # Interface check-in (si applicable)
├── components/        # Composants partagés (Button, Modal, Table...)
├── hooks/             # Hooks custom partagés
├── lib/               # Utilitaires, API client, helpers
│   └── api/           # Axios instance, intercepteurs, error handler
├── layouts/           # Layouts (MainLayout, AuthLayout)
├── pages/             # Pages (si routing basé sur pages)
├── stores/            # State global (Context ou Zustand)
├── types/             # Types TypeScript globaux
└── App.tsx            # Entry point React
```

### Conventions

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Composant | PascalCase, un fichier par composant | `EventCard.tsx` |
| Hook | camelCase, préfixe `use` | `useAuth.ts` |
| Page | PascalCase + `Page` | `EventsPage.tsx` |
| Service/API | camelCase | `eventsApi.ts` |
| Types | PascalCase, suffixe selon usage | `Event`, `CreateEventPayload` |
| Feature folder | kebab-case | `features/auth/` |

### Routing

- Routes protégées via un composant `ProtectedRoute` qui vérifie l'auth.
- Routes publiques : `/login`, `/register`.
- Routes protégées : `/dashboard`, `/events`, `/events/:id`.
- Lazy loading pour les features lourdes.

### State management

- **Server state** : React Query (ou useEffect + useState pour le simple).
- **Client state** : React Context pour l'auth, Zustand pour le reste si besoin.
- Pas de Redux — trop lourd pour notre taille.

## Code
- Features : `src/features/`
- API client : `src/lib/api/`
- Composants partagés : `src/components/`
- Pages : `src/pages/`
