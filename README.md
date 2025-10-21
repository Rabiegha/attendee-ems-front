# 🎯 EMS Frontend - Event Management System# Event Management System (EMS)



**Version**: 1.0.0-dev  Un système de gestion d'événements B2B moderne et complet, construit avec React 18, TypeScript, et une architecture feature-sliced robuste.

**Date**: 21 octobre 2025  

**Statut**: 🟢 Production Ready (90%)**🎯 Status : Version 1.0.0-dev - Système d'invitation fonctionnel !**



---> **Dernière mise à jour** : 13 octobre 2025  

> **Fonctionnalités principales** : ✅ Auth, ✅ RBAC, ✅ Events, ✅ Users, ✅ **Invitations complètes**

## 📋 Vue d'ensemble

## 🚀 Stack Technique

Application React moderne de gestion d'événements B2B multi-tenant avec authentification sécurisée, RBAC granulaire, et interface utilisateur responsive.

### Core

### 🏗️ Stack Technique- **React 18** avec TypeScript strict

- **Vite** pour le build et le développement

- **React 18** + **TypeScript** (strict mode)- **Tailwind CSS** + **Radix UI** pour l'interface utilisateur

- **Vite** pour build ultra-rapide- **React Router v6** pour la navigation

- **RTK Query** pour state management et cache API

- **TailwindCSS** + **RadixUI** pour l'interface### State Management

- **React Router v6** pour navigation- **Redux Toolkit** + **RTK Query** pour la gestion d'état et le cache API

- **CASL** pour RBAC côté client- Architecture **feature-sliced** avec séparation claire des responsabilités

- **React Hook Form** + **Zod** pour formulaires

### Authentification & Autorisation

---- **CASL** pour le contrôle d'accès basé sur les rôles (RBAC)

- Système de permissions granulaire avec "deny by default"

## 🚀 Démarrage Rapide

### Formulaires & Validation

### Prérequis- **React Hook Form** + **Zod** pour les formulaires typés

- Node.js 18+ (LTS recommandé)- Validation côté client avec schémas TypeScript

- npm ou yarn

- Backend EMS en cours d'exécution sur `http://localhost:3000`### Internationalisation

- **i18next** avec chargement lazy des namespaces

### Installation- Support français et anglais



```bash### Tests & Qualité

# 1. Installer les dépendances- **Vitest** + **React Testing Library** pour les tests unitaires

npm install- **Playwright** pour les tests E2E

- **Storybook** pour la documentation des composants

# 2. Configurer l'environnement- **ESLint** + **Prettier** + **Husky** pour la qualité du code

cp .env.example .env

# Modifier VITE_API_URL si nécessaire### Mocking & Développement

- **MSW** (Mock Service Worker) pour les APIs mockées

# 3. Démarrer le dev server

npm run dev## 🏗️ Architecture de Données

```

### Modèle Attendees vs Registrations

✅ Application disponible sur **http://localhost:5173**

Le système utilise une **architecture à deux niveaux** pour la gestion des participants :

### Connexion Test

- **Email**: `john.doe@system.com`#### 📊 **Attendees (Base Globale)**

- **Mot de passe**: `admin123`- **Table globale** de tous les participants de l'organisation

- **Rôle**: Super Administrator- **Profil unique** par personne avec informations personnelles

- **Historique complet** de toutes les participations

---- **CRM intégré** avec suivi des interactions



## 📚 Documentation```typescript

interface Attendee {

Toute la documentation est disponible dans le dossier `/docs` :  id: string

  orgId: string

- 📖 [Guide de Développement](./docs/DEVELOPMENT_GUIDE.md) - Standards et architecture  personId: string  // Lien vers persons (table globale)

- 🎪 [Système de Démo](./docs/DEMO_SYSTEM.md) - Comptes de test  defaultTypeId?: string

- 🛡️ [Guide RBAC](./docs/RBAC_GUIDE.md) - Système de permissions  labels: string[]

- 🎨 [Design System](./docs/DESIGN_SYSTEM.md) - Composants UI  notes?: string

- 🎨 [Système de Couleurs](./docs/COLOR_SYSTEM.md) - Palette et tokens  // Historique calculé des événements

- 📊 [Architecture Attendees](./docs/ATTENDEES_ARCHITECTURE.md) - Structure participants}

- ✅ [Audit Complet](./docs/AUDIT_COMPLET.md) - Score 9.25/10```

- 🔑 [Comptes de Test](./docs/TEST_ACCOUNTS.md) - Credentials démo

#### 🎟️ **Registrations (Inscriptions Spécifiques)**

---- **Inscription spécifique** à un événement

- **Statut d'inscription** (awaiting, approved, refused, cancelled)

## 🏗️ Architecture- **Données contextuelles** (type de participation, réponses aux formulaires)

- **Lien vers l'attendee global**

### Feature-Sliced Design

```typescript

```interface Registration {

src/  id: string

├── app/                        # Configuration globale  eventId: string

│   ├── config/                # Constants, env, routes  attendeeId: string  // Lien vers attendee global

│   ├── providers/             # Providers (Redux, Router, CASL)  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'

│   ├── routes/                # Configuration routing  attendanceType: 'online' | 'onsite' | 'hybrid'

│   └── store/                 # Redux store setup  answers: Record<string, any>

├── features/                  # Modules métier isolés  // + badges, présences, etc.

│   ├── auth/                  # Authentification}

│   │   ├── api/              # Endpoints RTK Query```

│   │   ├── components/       # Composants auth

│   │   ├── hooks/            # Hooks auth### 🔄 Flux d'Inscription

│   │   └── store/            # Slice Redux

│   ├── events/               # Gestion événements1. **Landing Page Event** → Formulaire d'inscription

│   ├── users/                # Gestion utilisateurs2. **Vérification Attendee** :

│   ├── invitations/          # Système invitations   - Si existe → Récupération du profil

│   ├── attendees/            # Gestion participants   - Si nouveau → Création du profil attendee

│   └── organizations/        # Multi-tenancy3. **Création Registration** → Inscription à l'événement spécifique

├── shared/                   # Code réutilisable4. **Mise à jour CRM** → Enrichissement du profil global

│   ├── ui/                   # Composants UI génériques

│   │   ├── Button/### 💡 Avantages de cette Architecture

│   │   ├── Modal/

│   │   ├── Table/- **✅ CRM Unifié** : Vue globale sur chaque participant

│   │   └── Form/- **✅ Historique Complet** : Tous les événements d'une personne

│   ├── acl/                  # Système RBAC/CASL- **✅ Éviter les Doublons** : Une personne = un profil unique

│   │   ├── hooks/           # useAbility, useCan- **✅ Analytics Avancées** : Comportement cross-événements

│   │   ├── components/      # <Can>, <AbilityGuard>- **✅ Marketing Ciblé** : Segmentation basée sur l'historique

│   │   └── utils/           # defineAbility- **✅ Support Multi-événements** : Gestion facilitée des séries

│   ├── hooks/                # Hooks partagés

│   ├── lib/                  # Utilitaires> 📚 **Documentation détaillée** : [Architecture Attendees vs Registrations](./docs/ATTENDEES_ARCHITECTURE.md)

│   └── types/                # Types globaux

├── pages/                    # Pages routing## 📁 Architecture

│   ├── LoginPage.tsx

│   ├── DashboardPage.tsx```

│   ├── EventsPage.tsxsrc/

│   └── ...├── app/                    # Configuration de l'application

└── widgets/                  # Composants complexes│   ├── config/            # Variables d'environnement et constantes

    ├── Header/│   ├── providers/         # Providers React (Redux, Router, i18n, CASL)

    ├── Sidebar/│   ├── routes/           # Configuration du routage

    └── ...│   └── store/            # Configuration Redux

```├── shared/               # Code partagé

│   ├── ui/              # Composants UI génériques

---│   ├── lib/             # Utilitaires et helpers

│   ├── hooks/           # Hooks React réutilisables

## 🔐 Système RBAC (CASL)│   ├── types/           # Types TypeScript globaux

│   └── acl/             # Système CASL RBAC

### 6 Rôles Hiérarchiques├── features/            # Modules métier

│   ├── auth/           # Authentification

```│   ├── events/         # Gestion des événements

🔴 SUPER_ADMIN    → Accès global omniscient│   └── attendees/      # Gestion des participants

🟠 ADMIN          → Gestion complète organisation├── pages/              # Pages de l'application

🟡 MANAGER        → Gestion événements et participants├── widgets/            # Composants complexes (Header, Sidebar)

🔵 VIEWER         → Lecture seule organisation└── styles/            # Styles globaux

🟣 PARTNER        → Gestion partenaires/sponsors```

⚪ HOSTESS         → Check-in événements uniquement

```## 🆕 Système d'Invitation - NOUVEAU !



### Utilisation dans les Composants### Fonctionnalités complètes ✅

- **Page d'invitation** (`/invitations`) - Interface admin pour envoyer des invitations

```tsx- **Sélection de rôles** - Dropdown automatique depuis l'API backend

import { Can } from '@/shared/acl'- **Envoi d'emails** - SMTP automatique avec templates HTML

- **Tokens sécurisés** - Génération et expiration (48h)

// Affichage conditionnel- **Page de complétion** (`/complete-invitation/:token`) - Interface publique

<Can I="create" a="Event">- **Validation forte** - Mots de passe avec indicateur de force

  <Button>Créer un événement</Button>- **Intégration RBAC** - Permissions et rôles automatiques

</Can>

### Workflow testé ✅

// Hook personnalisé1. **Admin** → Accès `/invitations` → Formulaire (email + rôle)

const { can } = useAbility()2. **Système** → Génération token + Envoi email automatique

if (can('update', event)) {3. **Invité** → Clic lien email → Complétion profil

  // Logique métier4. **Validation** → Création compte + Connexion immédiate

}

### API Endpoints

// Guard de route- `POST /invitations/invitations/send` - Envoyer une invitation

<ProtectedRoute permission="read" subject="Event">- `POST /invitations/invitations/complete/:token` - Compléter l'inscription

  <EventsPage />

</ProtectedRoute>## 🔐 Système RBAC (CASL)

```

### Rôles Disponibles

### Permissions Disponibles- **SUPER_ADMIN** : Accès complet système multi-tenant

- **ADMIN** : Accès complet à l'organisation

- **Actions**: `manage`, `create`, `read`, `update`, `delete`, `invite`, `check_in`- **MANAGER** : Gestion des événements et participants

- **Sujets**: `Organization`, `Event`, `User`, `Attendee`, `Invitation`, `Badge`- **VIEWER** : Accès en lecture seule

- **PARTNER** : Accès limité pour les partenaires

---- **HOSTESS** : Personnel d'accueil événements



## 🎨 Design System### Actions Supportées

- `manage`, `create`, `read`, `update`, `delete`

### Composants UI Principaux- `checkin`, `export`, `invite`, `approve`, `refuse`, `print`



#### Buttons### Sujets (Resources)

```tsx- `Organization`, `Event`, `Subevent`, `Attendee`, `User`

<Button variant="primary">Action principale</Button>- `Badge`, `Scan`, `Report`, `Settings`

<Button variant="secondary">Action secondaire</Button>

<Button variant="danger">Supprimer</Button>## 🛠 Scripts NPM

<Button variant="ghost">Discret</Button>

``````bash

# Développement

#### Modalsnpm run dev              # Démarre le serveur de développement

```tsxnpm run build           # Build de production

<Modal open={isOpen} onClose={handleClose}>npm run preview         # Prévisualise le build

  <Modal.Header>Titre</Modal.Header>

  <Modal.Body>Contenu</Modal.Body># Tests

  <Modal.Footer>npm run test            # Tests unitaires (Vitest)

    <Button onClick={handleConfirm}>Confirmer</Button>npm run test:e2e        # Tests E2E (Playwright)

  </Modal.Footer>

</Modal># Storybook

```npm run storybook       # Démarre Storybook

npm run build-storybook # Build Storybook

#### Forms

```tsx# Qualité du code

import { useForm } from 'react-hook-form'npm run lint            # ESLint

import { zodResolver } from '@hookform/resolvers/zod'npm run format          # Prettier

npm run typecheck       # Vérification TypeScript

const schema = z.object({

  email: z.string().email(),# Git hooks

  name: z.string().min(2)npm run prepare         # Installation des hooks Husky

})```



const form = useForm({## 🚀 Démarrage Rapide

  resolver: zodResolver(schema)

})1. **Installation des dépendances**

```   ```bash

   npm install

### Palette de Couleurs   ```



- **Primary**: Bleu (`#3B82F6`)2. **Configuration de l'environnement**

- **Secondary**: Gris (`#6B7280`)   ```bash

- **Success**: Vert (`#10B981`)   cp .env.example .env

- **Warning**: Orange (`#F59E0B`)   # Modifier les variables selon vos besoins

- **Danger**: Rouge (`#EF4444`)   ```



---3. **Démarrage du serveur de développement**

   ```bash

## 🛠️ Scripts NPM   npm run dev

   ```

```bash

# Développement4. **Accès à l'application**

npm run dev              # Dev server avec HMR   - Application : http://localhost:5173

npm run build            # Build production   - Storybook : http://localhost:6006

npm run preview          # Preview du build

## 🔑 Connexion de Démonstration

# Tests

npm run test             # Tests unitaires (Vitest)Pour tester l'application avec la base de données réelle :

npm run test:e2e         # Tests E2E (Playwright)- **Email** : `admin@acme.test`

npm run test:coverage    # Couverture de tests- **Mot de passe** : `Admin#12345`



# Qualité du code## 🏗 Flux de Développement Démonstratif

npm run lint             # ESLint

npm run lint:fix         # Fix auto ESLintL'application inclut un flux complet de démonstration :

npm run format           # Prettier

npm run typecheck        # Vérification TypeScript1. **Connexion** → Authentification avec JWT mocké

2. **Tableau de bord** → Vue d'ensemble avec statistiques

# Storybook3. **Liste des événements** → Affichage avec filtres et permissions CASL

npm run storybook        # Dev Storybook4. **Détails d'événement** → Informations complètes avec actions conditionnelles

npm run build-storybook  # Build Storybook5. **Gestion des participants** → Table avec actions groupées et export

```6. **Contrôle d'accès** → Boutons et actions visibles selon les permissions



---## 📊 Fonctionnalités Clés



## 📊 État Management (Redux + RTK Query)### Gestion des Événements

- Création, modification, suppression d'événements

### Structure du Store- Statuts : brouillon, publié, actif, terminé, annulé

- Gestion des capacités et inscriptions

```typescript- Tags et métadonnées personnalisables

store/

├── index.ts              # Configuration store### Gestion des Participants

├── auth/                 # Slice authentification- Import/export CSV et Excel

│   ├── authSlice.ts- Statuts : en attente, confirmé, enregistré, annulé, absent

│   └── authApi.ts       # Endpoints RTK Query- Check-in/check-out en temps réel

├── events/               # Slice événements- Filtres avancés et recherche

└── users/                # Slice utilisateurs

```### Contrôle d'Accès

- Permissions granulaires par ressource

### Exemple d'Usage RTK Query- Conditions contextuelles (organisation, événement)

- Guards de routes automatiques

```typescript- Composants conditionnels `<Can>`

// Définition API

export const eventsApi = createApi({### Interface Utilisateur

  reducerPath: 'eventsApi',- Design moderne avec Tailwind CSS

  baseQuery: fetchBaseQuery({ - Composants accessibles (Radix UI)

    baseUrl: '/api/v1',- Mode sombre/clair (prêt)

    prepareHeaders: (headers, { getState }) => {- Responsive design

      const token = getState().auth.token

      if (token) headers.set('Authorization', `Bearer ${token}`)##  Tests

      return headers

    }### Tests Unitaires

  }),```bash

  endpoints: (builder) => ({npm run test

    getEvents: builder.query<Event[], void>({# Tests des composants, hooks, et utilitaires

      query: () => '/events',```

      providesTags: ['Event']

    }),### Tests E2E

    createEvent: builder.mutation<Event, CreateEventDto>({```bash

      query: (body) => ({npm run test:e2e

        url: '/events',# Tests du flux complet utilisateur

        method: 'POST',```

        body

      }),### Storybook

      invalidatesTags: ['Event']```bash

    })npm run storybook

  })# Documentation interactive des composants

})```



// Usage dans composant## 🔧 Structure des Données

const { data: events, isLoading } = useGetEventsQuery()

const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()### DTOs vs DPOs

```- **DTO** (Data Transfer Object) : Structure des données API

- **DPO** (Domain Presentation Object) : Structure côté client

---- **Mappers** : Transformation entre DTO et DPO



## 🧪 Tests### Exemple Event

```typescript

### Tests Unitaires (Vitest)// API Response (DTO)

{

```bash  "start_date": "2024-06-15T09:00:00Z",

npm run test  "max_attendees": 200

```}



```typescript// Client Model (DPO)

import { render, screen } from '@testing-library/react'{

import { Button } from './Button'  "startDate": Date,

  "maxAttendees": 200,

describe('Button', () => {  "daysUntilStart": 45,  // computed

  it('renders correctly', () => {  "isFull": false        // computed

    render(<Button>Click me</Button>)}

    expect(screen.getByText('Click me')).toBeInTheDocument()```

  })

})## 🌐 Internationalisation

```

- Namespaces : `common`, `auth`, `events`, `attendees`

### Tests E2E (Playwright)- Chargement lazy des traductions

- Détection automatique de la langue

```bash- Support français (par défaut) et anglais

npm run test:e2e

```## 📈 Performance



```typescript- Code splitting automatique par route

import { test, expect } from '@playwright/test'- Lazy loading des composants

- Cache RTK Query avec invalidation intelligente

test('user can login', async ({ page }) => {- Optimistic updates pour les mutations

  await page.goto('http://localhost:5173')- Debouncing des recherches

  await page.fill('[name=email]', 'john.doe@system.com')

  await page.fill('[name=password]', 'admin123')## 🔒 Sécurité

  await page.click('button[type=submit]')

  await expect(page).toHaveURL('/dashboard')- Validation stricte avec Zod

})- Sanitisation des entrées utilisateur

```- Tokens JWT avec expiration

- Permissions vérifiées côté client et serveur

---- Headers de sécurité configurés



## 🌐 Internationalisation (i18next)## 🚀 Déploiement



### ConfigurationLe projet est prêt pour le déploiement sur :

- Vercel, Netlify (SPA)

```typescript- Docker (avec Nginx)

// i18n.ts- AWS S3 + CloudFront

i18n- Tout hébergeur statique

  .use(initReactI18next)

  .init({## 📝 Contribution

    resources: {

      fr: {1. Fork du projet

        common: () => import('./locales/fr/common.json'),2. Création d'une branche feature

        events: () => import('./locales/fr/events.json')3. Commits avec messages conventionnels

      },4. Tests passants

      en: {5. Pull request avec description

        common: () => import('./locales/en/common.json'),

        events: () => import('./locales/en/events.json')## 📄 Licence

      }

    },MIT License - voir le fichier LICENSE pour plus de détails.

    lng: 'fr',

    fallbackLng: 'fr'---

  })

```**Développé avec ❤️ pour la gestion d'événements moderne**


### Usage

```tsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation('events')
  return <h1>{t('title')}</h1>
}
```

---

## 📈 Performance

### Optimisations Implémentées

- ✅ **Code Splitting** : Routes chargées à la demande
- ✅ **Lazy Loading** : Composants lourds en lazy
- ✅ **RTK Query Cache** : Cache automatique avec invalidation
- ✅ **Optimistic Updates** : UI réactive avant réponse serveur
- ✅ **Debouncing** : Recherches et auto-complétion
- ✅ **Memoization** : `useMemo` et `useCallback` stratégiques

### Bundle Size

- **Initial**: ~250KB (gzipped)
- **Total**: ~500KB (gzipped)
- **Time to Interactive**: < 2s

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ **JWT Tokens** : Stockés en mémoire (pas de localStorage)
- ✅ **Refresh Tokens** : Cookies HttpOnly
- ✅ **CORS** : Headers configurés
- ✅ **XSS Protection** : Sanitisation des inputs
- ✅ **CSRF Protection** : Tokens anti-CSRF
- ✅ **Validation** : Zod schemas côté client
- ✅ **RBAC** : Permissions vérifiées avant chaque action

---

## 📦 Build & Déploiement

### Build Production

```bash
npm run build
```

Génère un dossier `dist/` optimisé.

### Déploiement

#### Vercel
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod --dir=dist
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

---

## 🤝 Contribution

### Standards

- **TypeScript strict mode** obligatoire
- **Feature-Sliced Design** respecté
- **Tests** requis pour nouvelles features
- **ESLint + Prettier** avant commit
- **Commits conventionnels** : `feat:`, `fix:`, `docs:`, etc.

### Workflow

1. Fork le projet
2. Créer une branche : `git checkout -b feature/amazing-feature`
3. Commit : `git commit -m 'feat: add amazing feature'`
4. Push : `git push origin feature/amazing-feature`
5. Ouvrir une Pull Request

---

## 📄 License

Propriétaire - Tous droits réservés © 2025

---

## 🆘 Support

Pour tout problème ou question :
1. Consulter la documentation dans `/docs`
2. Vérifier les issues GitHub existantes
3. Créer une nouvelle issue avec label approprié

---

**Dernière mise à jour** : 21 octobre 2025  
**Maintenu par** : Corentin
