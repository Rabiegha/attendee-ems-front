# Event Management System (EMS)

Un système de gestion d'événements B2B moderne et complet, construit avec React 18, TypeScript, et une architecture feature-sliced robuste.

## 🚀 Stack Technique

### Core
- **React 18** avec TypeScript strict
- **Vite** pour le build et le développement
- **Tailwind CSS** + **Radix UI** pour l'interface utilisateur
- **React Router v6** pour la navigation

### State Management
- **Redux Toolkit** + **RTK Query** pour la gestion d'état et le cache API
- Architecture **feature-sliced** avec séparation claire des responsabilités

### Authentification & Autorisation
- **CASL** pour le contrôle d'accès basé sur les rôles (RBAC)
- Système de permissions granulaire avec "deny by default"

### Formulaires & Validation
- **React Hook Form** + **Zod** pour les formulaires typés
- Validation côté client avec schémas TypeScript

### Internationalisation
- **i18next** avec chargement lazy des namespaces
- Support français et anglais

### Tests & Qualité
- **Vitest** + **React Testing Library** pour les tests unitaires
- **Playwright** pour les tests E2E
- **Storybook** pour la documentation des composants
- **ESLint** + **Prettier** + **Husky** pour la qualité du code

### Mocking & Développement
- **MSW** (Mock Service Worker) pour les APIs mockées

## 🏗️ Architecture de Données

### Modèle Attendees vs Registrations

Le système utilise une **architecture à deux niveaux** pour la gestion des participants :

#### 📊 **Attendees (Base Globale)**
- **Table globale** de tous les participants de l'organisation
- **Profil unique** par personne avec informations personnelles
- **Historique complet** de toutes les participations
- **CRM intégré** avec suivi des interactions

```typescript
interface Attendee {
  id: string
  orgId: string
  personId: string  // Lien vers persons (table globale)
  defaultTypeId?: string
  labels: string[]
  notes?: string
  // Historique calculé des événements
}
```

#### 🎟️ **Registrations (Inscriptions Spécifiques)**
- **Inscription spécifique** à un événement
- **Statut d'inscription** (awaiting, approved, refused, cancelled)
- **Données contextuelles** (type de participation, réponses aux formulaires)
- **Lien vers l'attendee global**

```typescript
interface Registration {
  id: string
  eventId: string
  attendeeId: string  // Lien vers attendee global
  status: 'awaiting' | 'approved' | 'refused' | 'cancelled'
  attendanceType: 'online' | 'onsite' | 'hybrid'
  answers: Record<string, any>
  // + badges, présences, etc.
}
```

### 🔄 Flux d'Inscription

1. **Landing Page Event** → Formulaire d'inscription
2. **Vérification Attendee** :
   - Si existe → Récupération du profil
   - Si nouveau → Création du profil attendee
3. **Création Registration** → Inscription à l'événement spécifique
4. **Mise à jour CRM** → Enrichissement du profil global

### 💡 Avantages de cette Architecture

- **✅ CRM Unifié** : Vue globale sur chaque participant
- **✅ Historique Complet** : Tous les événements d'une personne
- **✅ Éviter les Doublons** : Une personne = un profil unique
- **✅ Analytics Avancées** : Comportement cross-événements
- **✅ Marketing Ciblé** : Segmentation basée sur l'historique
- **✅ Support Multi-événements** : Gestion facilitée des séries

> 📚 **Documentation détaillée** : [Architecture Attendees vs Registrations](./docs/ATTENDEES_ARCHITECTURE.md)

## 📁 Architecture

```
src/
├── app/                    # Configuration de l'application
│   ├── config/            # Variables d'environnement et constantes
│   ├── providers/         # Providers React (Redux, Router, i18n, CASL)
│   ├── routes/           # Configuration du routage
│   └── store/            # Configuration Redux
├── shared/               # Code partagé
│   ├── ui/              # Composants UI génériques
│   ├── lib/             # Utilitaires et helpers
│   ├── hooks/           # Hooks React réutilisables
│   ├── types/           # Types TypeScript globaux
│   └── acl/             # Système CASL RBAC
├── features/            # Modules métier
│   ├── auth/           # Authentification
│   ├── events/         # Gestion des événements
│   └── attendees/      # Gestion des participants
├── pages/              # Pages de l'application
├── widgets/            # Composants complexes (Header, Sidebar)
└── styles/            # Styles globaux
```

## 🔐 Système RBAC (CASL)

### Rôles Disponibles
- **ORG_ADMIN** : Accès complet à l'organisation
- **ORG_MANAGER** : Gestion des événements et participants
- **EVENT_MANAGER** : Gestion d'événements spécifiques
- **CHECKIN_STAFF** : Enregistrement des participants
- **PARTNER** : Accès limité pour les partenaires
- **READONLY** : Accès en lecture seule

### Actions Supportées
- `manage`, `create`, `read`, `update`, `delete`
- `checkin`, `export`, `invite`, `approve`, `refuse`, `print`

### Sujets (Resources)
- `Organization`, `Event`, `Subevent`, `Attendee`, `User`
- `Badge`, `Scan`, `Report`, `Settings`

## 🛠 Scripts NPM

```bash
# Développement
npm run dev              # Démarre le serveur de développement
npm run build           # Build de production
npm run preview         # Prévisualise le build

# Tests
npm run test            # Tests unitaires (Vitest)
npm run test:e2e        # Tests E2E (Playwright)

# Storybook
npm run storybook       # Démarre Storybook
npm run build-storybook # Build Storybook

# Qualité du code
npm run lint            # ESLint
npm run format          # Prettier
npm run typecheck       # Vérification TypeScript

# Git hooks
npm run prepare         # Installation des hooks Husky
```

## 🚀 Démarrage Rapide

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   # Modifier les variables selon vos besoins
   ```

3. **Démarrage du serveur de développement**
   ```bash
   npm run dev
   ```

4. **Accès à l'application**
   - Application : http://localhost:5173
   - Storybook : http://localhost:6006

## 🔑 Connexion de Démonstration

Pour tester l'application avec la base de données réelle :
- **Email** : `admin@acme.test`
- **Mot de passe** : `Admin#12345`

## 🏗 Flux de Développement Démonstratif

L'application inclut un flux complet de démonstration :

1. **Connexion** → Authentification avec JWT mocké
2. **Tableau de bord** → Vue d'ensemble avec statistiques
3. **Liste des événements** → Affichage avec filtres et permissions CASL
4. **Détails d'événement** → Informations complètes avec actions conditionnelles
5. **Gestion des participants** → Table avec actions groupées et export
6. **Contrôle d'accès** → Boutons et actions visibles selon les permissions

## 📊 Fonctionnalités Clés

### Gestion des Événements
- Création, modification, suppression d'événements
- Statuts : brouillon, publié, actif, terminé, annulé
- Gestion des capacités et inscriptions
- Tags et métadonnées personnalisables

### Gestion des Participants
- Import/export CSV et Excel
- Statuts : en attente, confirmé, enregistré, annulé, absent
- Check-in/check-out en temps réel
- Filtres avancés et recherche

### Contrôle d'Accès
- Permissions granulaires par ressource
- Conditions contextuelles (organisation, événement)
- Guards de routes automatiques
- Composants conditionnels `<Can>`

### Interface Utilisateur
- Design moderne avec Tailwind CSS
- Composants accessibles (Radix UI)
- Mode sombre/clair (prêt)
- Responsive design

## 🧪 Tests

### Tests Unitaires
```bash
npm run test
# Tests des composants, hooks, et utilitaires
```

### Tests E2E
```bash
npm run test:e2e
# Tests du flux complet utilisateur
```

### Storybook
```bash
npm run storybook
# Documentation interactive des composants
```

## 🔧 Structure des Données

### DTOs vs DPOs
- **DTO** (Data Transfer Object) : Structure des données API
- **DPO** (Domain Presentation Object) : Structure côté client
- **Mappers** : Transformation entre DTO et DPO

### Exemple Event
```typescript
// API Response (DTO)
{
  "start_date": "2024-06-15T09:00:00Z",
  "max_attendees": 200
}

// Client Model (DPO)
{
  "startDate": Date,
  "maxAttendees": 200,
  "daysUntilStart": 45,  // computed
  "isFull": false        // computed
}
```

## 🌐 Internationalisation

- Namespaces : `common`, `auth`, `events`, `attendees`
- Chargement lazy des traductions
- Détection automatique de la langue
- Support français (par défaut) et anglais

## 📈 Performance

- Code splitting automatique par route
- Lazy loading des composants
- Cache RTK Query avec invalidation intelligente
- Optimistic updates pour les mutations
- Debouncing des recherches

## 🔒 Sécurité

- Validation stricte avec Zod
- Sanitisation des entrées utilisateur
- Tokens JWT avec expiration
- Permissions vérifiées côté client et serveur
- Headers de sécurité configurés

## 🚀 Déploiement

Le projet est prêt pour le déploiement sur :
- Vercel, Netlify (SPA)
- Docker (avec Nginx)
- AWS S3 + CloudFront
- Tout hébergeur statique

## 📝 Contribution

1. Fork du projet
2. Création d'une branche feature
3. Commits avec messages conventionnels
4. Tests passants
5. Pull request avec description

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

---

**Développé avec ❤️ pour la gestion d'événements moderne**
