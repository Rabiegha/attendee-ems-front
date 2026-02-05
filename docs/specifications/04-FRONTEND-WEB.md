# Section 4 - Frontend Web

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 3](./03-BACKEND-API.md) | [▶ Section 5](./05-APPLICATION-MOBILE.md)

---

## 4.1 Vue d'Ensemble

**Framework** : React 18 + TypeScript + Vite  
**URL Production** : https://attendee.fr  
**Port Développement** : 5173

### Architecture

**Feature-Sliced Design** avec séparation claire :
- **app/** : Configuration globale (Redux, Router, CASL)
- **features/** : Modules métier isolés (auth, events, users, etc.)
- **shared/** : Code réutilisable (UI, hooks, utils)
- **pages/** : Pages de l'application
- **widgets/** : Widgets complexes

---

## 4.2 Pages Principales

### 4.2.1 Authentification

#### LoginPage (`/login`)
- Formulaire email/password
- Validation Zod
- Gestion erreurs (credentials invalides, compte désactivé)
- Redirection post-login
- Remember me (optionnel)

#### CompleteInvitationPage (`/complete-invitation`)
- Validation du token d'invitation
- Formulaire de création de compte
- Définition du mot de passe
- Acceptation des conditions

#### RequestPasswordResetPage (`/forgot-password`)
- Saisie email
- Envoi du lien de reset
- Message de confirmation

#### ResetPasswordPage (`/reset-password`)
- Validation du token
- Formulaire nouveau mot de passe
- Confirmation et redirection vers login

### 4.2.2 Tableau de Bord

#### DashboardPage (`/dashboard`)
- Vue d'ensemble des événements
- Statistiques rapides
- Événements à venir
- Événements récents
- Graphiques d'activité

### 4.2.3 Événements

#### EventsPage (`/events`)
- **Liste des événements** avec :
  - Filtres (statut, dates, tags, recherche)
  - Tri (date, nom, statut)
  - Vue carte ou tableau
  - Actions rapides (éditer, dupliquer, archiver)
- **Création rapide** via modal
- **Actions de masse** (suppression, changement statut)

#### EventDetailsPage (`/events/:id`)
- **Onglet Informations**
  - Détails de l'événement
  - Édition inline
  - Configuration des settings
  - Gestion des tags

- **Onglet Participants**
  - Liste des inscrits
  - Filtres par statut, type, recherche
  - Check-in/check-out
  - Génération de badges
  - Import/Export Excel
  - Actions de masse

- **Onglet Badges**
  - Règles d'attribution
  - Preview des badges
  - Génération en masse

- **Onglet Sessions** (si activé)
  - Liste des sessions
  - Gestion de la capacité
  - Restriction par type de participant

- **Onglet Analytics**
  - Statistiques en temps réel
  - Graphiques de présence
  - Taux de check-in
  - Répartition par type

#### CreateEventPage (`/events/new`)
- **Étape 1** : Informations de base (nom, dates, description)
- **Étape 2** : Lieu (physique/online/hybride, adresse avec Google Maps)
- **Étape 3** : Paramètres (capacité, auto-approval, types de participants)
- **Étape 4** : Badge (sélection template ou création)
- **Étape 5** : Confirmation et publication

#### BadgeDesignerPage (`/events/:id/badge-designer`)
- **Éditeur visuel** (GrapesJS)
- **Composants drag & drop**
- **Variables dynamiques** (nom, prénom, entreprise, QR code)
- **Preview en temps réel**
- **Sauvegarde de templates**
- **Export HTML/CSS**

### 4.2.4 Participants (CRM)

#### AttendeesPage (`/attendees`)
- **Vue CRM complète**
- Liste de tous les participants de l'organisation
- Recherche et filtres avancés
- Historique des événements par participant
- Tags et labels
- Import/Export Excel
- Création manuelle

#### AttendeeDetailPage (`/attendees/:id`)
- Profil complet du participant
- Historique des inscriptions
- Événements passés et à venir
- Notes et commentaires
- Timeline d'activité

### 4.2.5 Utilisateurs et Rôles

#### UsersPage (`/users`)
- Liste des utilisateurs de l'organisation
- Filtres (rôle, statut, recherche)
- Inviter de nouveaux utilisateurs
- Modifier les rôles
- Activer/Désactiver utilisateurs
- Réinitialiser mots de passe

#### InvitationsPage (`/invitations`)
- Liste des invitations envoyées
- Statuts (pending, accepted, expired, cancelled)
- Renvoyer une invitation
- Annuler une invitation

#### RolePermissionsAdminPage (`/roles`) (SUPER_ADMIN only)
- Gestion des rôles
- Attribution des permissions
- Visualisation de la matrice

### 4.2.6 Configuration

#### AttendeeTypesPage (`/attendee-types`)
- Liste des types de participants
- Création/Édition de types
- Personnalisation (couleurs, icônes)
- Activation/Désactivation

#### OrganizationSettingsPage (`/settings/organization`)
- Informations de l'organisation
- Timezone
- Configuration générale

#### ProfilePage (`/profile`)
- Informations personnelles de l'utilisateur
- Changement de mot de passe
- Préférences

### 4.2.7 Inscription Publique

#### PublicRegistrationPage (`/public/events/:publicToken`)
- **Formulaire public** accessible sans authentification
- Champs personnalisables par événement
- Validation côté client
- Confirmation visuelle post-inscription
- Design responsive

---

## 4.3 Composants UI (Design System)

### 4.3.1 Composants de Base (shared/ui/)

#### Button
```tsx
<Button variant="primary|secondary|outline|ghost" size="sm|md|lg">
  Click me
</Button>
```

#### Input
```tsx
<Input
  type="text|email|password|number"
  placeholder="Enter value"
  error="Error message"
/>
```

#### Select
```tsx
<Select
  options={[{ value: '1', label: 'Option 1' }]}
  value={selected}
  onChange={setSelected}
/>
```

#### Modal
```tsx
<Modal isOpen={open} onClose={close} title="Modal Title">
  <ModalContent />
  <ModalFooter>
    <Button>Save</Button>
  </ModalFooter>
</Modal>
```

#### Table
```tsx
<Table
  columns={columns}
  data={data}
  sorting={sorting}
  onSortingChange={setSorting}
  onRowClick={handleRowClick}
/>
```

#### Toast
```tsx
toast.success('Operation successful!')
toast.error('An error occurred')
toast.info('Info message')
```

### 4.3.2 Composants Métier

#### EventCard
- Affichage compact d'un événement
- Statut visuel
- Actions rapides
- Compteur de participants

#### RegistrationRow
- Ligne de tableau pour inscription
- Actions inline (check-in, badge, éditer)
- Statut coloré
- Type de participant

#### StatsCard
- Carte de statistique
- Valeur + variation
- Icône et couleur
- Tooltip explicatif

#### BadgePreview
- Aperçu d'un badge
- Zoom/Pan
- Download PDF

#### EventTimeline
- Timeline des événements
- Groupement par date
- Statuts visuels

---

## 4.4 State Management (Redux Toolkit)

### 4.4.1 Slices Principaux

#### authSlice
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  organization: Organization | null
  ability: Ability | null
}

// Actions
login(credentials) // Thunk async
logout()
refreshToken()
switchOrganization(orgId)
```

#### eventsSlice
```typescript
interface EventsState {
  events: Event[]
  selectedEvent: Event | null
  filters: EventFilters
  loading: boolean
  error: string | null
}

// Actions (RTK Query)
useGetEventsQuery(filters)
useGetEventByIdQuery(id)
useCreateEventMutation()
useUpdateEventMutation()
useDeleteEventMutation()
```

#### registrationsSlice
```typescript
// Actions (RTK Query)
useGetRegistrationsQuery(eventId, filters)
useCreateRegistrationMutation()
useCheckInMutation()
useBulkCheckInMutation()
useBulkUpdateStatusMutation()
```

#### usersSlice
```typescript
// Actions (RTK Query)
useGetUsersQuery(filters)
useInviteUserMutation()
useUpdateUserRoleMutation()
```

### 4.4.2 RTK Query API

**Configuration** :
```typescript
// features/events/api/events.api.ts
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    }
  }),
  tagTypes: ['Event', 'Registration'],
  endpoints: (builder) => ({
    getEvents: builder.query<Event[], ListEventsDto>({
      query: (filters) => ({
        url: '/events',
        params: filters
      }),
      providesTags: ['Event']
    }),
    createEvent: builder.mutation<Event, CreateEventDto>({
      query: (data) => ({
        url: '/events',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Event']
    })
  })
})
```

**Avantages** :
- Cache automatique des requêtes
- Invalidation intelligente
- Retry automatique
- Polling en temps réel
- Optimistic updates

---

## 4.5 Permissions Frontend (CASL)

### 4.5.1 Configuration

```typescript
// shared/acl/ability.ts
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

export function defineAbilitiesFor(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

  // Permissions basées sur le rôle
  if (user.role === 'ADMIN') {
    can('manage', 'all') // Tout sauf son propre rôle
    cannot('update', 'User', { id: user.id, field: 'role' })
  }

  if (user.role === 'MANAGER') {
    can('read', 'Event')
    can('create', 'Event')
    can('update', 'Event')
    can('read', 'Registration')
    can('create', 'Registration')
    can('update', 'Registration')
  }

  if (user.role === 'HOSTESS') {
    can('read', 'Event', { assignedTo: user.id })
    can('read', 'Registration', { eventAssignedTo: user.id })
    can('checkin', 'Registration')
  }

  return build()
}
```

### 4.5.2 Utilisation dans les Composants

#### Hook useAbility
```tsx
import { useAbility } from '@/shared/acl/hooks/useAbility'

function EventActions({ event }) {
  const ability = useAbility()

  return (
    <>
      {ability.can('update', 'Event') && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      {ability.can('delete', 'Event') && (
        <Button onClick={handleDelete}>Delete</Button>
      )}
    </>
  )
}
```

#### Composant Can
```tsx
import { Can } from '@/shared/acl/components/Can'

function EventDetails() {
  return (
    <Can I="update" a="Event">
      <EditButton />
    </Can>
  )
}
```

#### ProtectedRoute
```tsx
import { ProtectedRoute } from '@/shared/acl/guards/ProtectedRoute'

<Route
  path="/users"
  element={
    <ProtectedRoute permission="users.read">
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

---

## 4.6 Formulaires (React Hook Form + Zod)

### 4.6.1 Schéma de Validation

```typescript
// features/events/schemas/event.schema.ts
import { z } from 'zod'

export const createEventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  locationType: z.enum(['physical', 'online', 'hybrid']),
  capacity: z.number().int().positive().optional(),
  addressFormatted: z.string().optional()
}).refine(
  (data) => new Date(data.endAt) > new Date(data.startAt),
  {
    message: 'End date must be after start date',
    path: ['endAt']
  }
)

export type CreateEventFormData = z.infer<typeof createEventSchema>
```

### 4.6.2 Utilisation dans un Composant

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema } from './schemas'

function CreateEventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createEventSchema)
  })

  const onSubmit = (data: CreateEventFormData) => {
    createEvent(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('name')}
        error={errors.name?.message}
      />
      <Input
        type="datetime-local"
        {...register('startAt')}
        error={errors.startAt?.message}
      />
      <Button type="submit">Create</Button>
    </form>
  )
}
```

---

## 4.7 Internationalisation (i18next)

### Configuration

```typescript
// app/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'auth.login': 'Login',
          'events.create': 'Create Event',
          // ...
        }
      },
      fr: {
        translation: {
          'auth.login': 'Connexion',
          'events.create': 'Créer un Événement',
          // ...
        }
      }
    },
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  })
```

### Utilisation

```tsx
import { useTranslation } from 'react-i18next'

function LoginPage() {
  const { t, i18n } = useTranslation()

  return (
    <>
      <h1>{t('auth.login')}</h1>
      <Button onClick={() => i18n.changeLanguage('en')}>
        English
      </Button>
    </>
  )
}
```

---

## 4.8 Optimisations

### 4.8.1 Code Splitting

```tsx
// Lazy loading des pages
const EventsPage = lazy(() => import('@/pages/Events'))
const UsersPage = lazy(() => import('@/pages/Users'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/events" element={<EventsPage />} />
    <Route path="/users" element={<UsersPage />} />
  </Routes>
</Suspense>
```

### 4.8.2 Memoization

```tsx
// Composants coûteux
const ExpensiveComponent = memo(({ data }) => {
  // ...
})

// Callbacks stables
const handleClick = useCallback(() => {
  // ...
}, [dependencies])

// Valeurs calculées
const sortedData = useMemo(() => {
  return data.sort(...)
}, [data])
```

### 4.8.3 Virtualisation

```tsx
// Grandes listes avec react-window
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>{items[index]}</div>
  )}
</FixedSizeList>
```

---

[▶ Section 5 : Application Mobile](./05-APPLICATION-MOBILE.md)
