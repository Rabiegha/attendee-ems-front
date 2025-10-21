# 🛠️ Guide de Développement - EMS

## 🏗️ Architecture et Standards

### Architecture Feature-Sliced Design ✅

```
src/
├── app/                 # Configuration globale
│   ├── config/         # Constantes, env, routes
│   ├── providers/      # Providers (RBAC, Redux, Theme)
│   ├── routes/         # Configuration routing
│   └── store/          # Configuration Redux
├── features/           # Features métier isolées
│   ├── auth/           # Authentification complète
│   ├── events/         # Gestion événements
│   ├── users/          # Gestion utilisateurs
│   ├── invitations/    # Système d'invitation
│   └── attendees/      # Gestion participants
├── pages/              # Pages de routing
├── shared/             # Code partagé
│   ├── ui/             # Composants UI système
│   ├── lib/            # Utilitaires
│   ├── hooks/          # Hooks partagés
│   ├── acl/            # Système RBAC/CASL
│   └── types/          # Types globaux
└── widgets/            # Widgets complexes
```

### Standards de Code ✅

#### TypeScript Configuration
```jsonc
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    // Path mapping pour imports absolus
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

#### ESLint + Prettier
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "eslint-config-prettier"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

## 🔧 Stack Technologique

### Frontend
- **React 18** avec TypeScript strict
- **Vite** pour bundling rapide
- **Redux Toolkit Query** pour state management
- **React Hook Form** + **Zod** pour validation
- **TailwindCSS** + **RadixUI** pour UI
- **@casl/ability** pour RBAC

### Backend
- **NestJS** avec TypeScript
- **PostgreSQL** + **Prisma ORM**
- **JWT** + **Refresh Tokens**
- **CASL** pour permissions
- **Class Validator** pour validation
- **Swagger** pour documentation API

## 🔄 Système API Centralisé

### rootApi Architecture
```typescript
// services/rootApi.ts
export const rootApi = createApi({
  reducerPath: 'rootApi',
  baseQuery: baseQueryWithReauth, // Gestion auto 401 + refresh
  tagTypes: [
    'Auth', 'User', 'Event', 'Attendee', 
    'Role', 'Invitation', 'Organization'
  ],
  endpoints: () => ({}), // Injectés par les features
})

// Auto-refresh transparent
const baseQueryWithReauth = async (args, api, extra) => {
  let result = await baseQuery(args, api, extra)
  
  if (result.error?.status === 401) {
    // Tentative refresh automatique
    const refreshResult = await baseQuery('/auth/refresh', api, extra)
    if (refreshResult.data) {
      // Token refreshé, retry la requête
      result = await baseQuery(args, api, extra)
    } else {
      // Refresh échoué, logout
      api.dispatch(clearSession())
    }
  }
  return result
}
```

### Injection d'Endpoints par Feature
```typescript
// features/auth/api/authApi.ts
export const authApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const { useLoginMutation } = authApi
```

## 🛡️ Système RBAC

### Rôles et Permissions
```typescript
// 6 rôles hiérarchiques
export type UserRole = 
  | 'SUPER_ADMIN'  // Accès global
  | 'ADMIN'        // Gestion organisation
  | 'MANAGER'      // Gestion événements
  | 'VIEWER'       // Lecture seule
  | 'PARTNER'      // Événements assignés
  | 'HOSTESS'      // Check-in/scan

// Permissions granulaires avec conditions
export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  subject: 'User' | 'Event' | 'Organization' | 'Attendee'
  conditions?: { orgId?: string; eventIds?: string[] }
}
```

### Utilisation dans les Composants
```tsx
import { Can, useCan } from '@/shared/acl'

// Guard déclaratif
<Can do="create" on="Event">
  <Button>Créer un événement</Button>
</Can>

// Hook programmatique
const canManageUsers = useCan('manage', 'User')
const canExportData = useCan('export', 'Attendee')

// Guard sur les routes
<GuardedRoute action="manage" subject="User">
  <UsersPage />
</GuardedRoute>
```

## 🎨 Design System

### Dark Mode Obligatoire
```tsx
// Tous les composants doivent supporter dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <p className="text-gray-600 dark:text-gray-400">
    Texte avec variants dark
  </p>
</div>

// Transitions fluides
<div className="transition-colors duration-200">
  Animations GPU-accelerated
</div>
```

### Composants UI Système
```tsx
// Utiliser les composants shared/ui
import { Button, Modal, Toast } from '@/shared/ui'

// Configuration Toast centralisée
const { success, error } = useToast()
success('Action réussie!', 'Description détaillée')
```

### Palette de Couleurs
```css
/* Variables CSS pour cohérence */
:root {
  --primary: hsl(240, 100%, 50%);
  --background: hsl(0, 0%, 100%);
  --foreground: hsl(222, 84%, 5%);
}

[data-theme="dark"] {
  --background: hsl(222, 84%, 5%);
  --foreground: hsl(210, 40%, 98%);
}
```

## ✅ Validation et Formulaires

### Schémas Zod
```typescript
export const createUserSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  roleId: z.string().min(1, 'Rôle requis'),
  phone: z.string().optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
```

### React Hook Form Integration
```tsx
const form = useForm<CreateUserFormData>({
  resolver: zodResolver(createUserSchema),
  mode: 'onChange', // Validation en temps réel
})

const onSubmit = async (data: CreateUserFormData) => {
  try {
    await createUser(data).unwrap()
    toast.success('Utilisateur créé!')
    form.reset()
  } catch (error) {
    toast.error('Erreur de création')
  }
}
```

## 🧪 Tests

### Configuration Vitest + Testing Library
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/shared/lib/test/setup.ts'],
  },
})

// Tests unitaires
describe('CreateUserModal', () => {
  it('should validate form inputs', async () => {
    render(<CreateUserModal />)
    
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    expect(screen.getByText(/email invalide/i)).toBeInTheDocument()
  })
})
```

### Tests E2E avec Playwright
```typescript
// tests/e2e/auth.spec.ts
test('should login and access dashboard', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('[data-testid="email"]', 'john.doe@system.com')
  await page.fill('[data-testid="password"]', 'admin123')
  await page.click('[data-testid="login-button"]')
  
  await expect(page).toHaveURL('/dashboard')
})
```

## 🚀 Workflow de Développement

### 1. Créer une Feature
```bash
# Créer la structure feature
mkdir -p src/features/new-feature/{api,ui,types}

# Créer les fichiers de base
touch src/features/new-feature/api/newFeatureApi.ts
touch src/features/new-feature/ui/NewFeatureComponent.tsx
touch src/features/new-feature/types/newFeature.types.ts
```

### 2. Développement avec Hot Reload
```bash
# Terminal 1: Backend
cd attendee-ems-back
npm run start:dev

# Terminal 2: Frontend  
cd attendee-EMS
npm run dev

# Terminal 3: Database
docker-compose -f docker-compose.dev.yml logs -f db
```

### 3. Validation Qualité
```bash
# TypeScript
npm run typecheck

# Linting
npm run lint

# Tests
npm run test
npm run test:e2e

# Build
npm run build
```

## 📋 Checklist Nouvelle Feature

### 🎯 Architecture
- [ ] Structure FSD respectée
- [ ] Types TypeScript stricts définis
- [ ] API RTK Query injectée dans rootApi
- [ ] Composants UI dans feature/ui/

### 🎨 Interface
- [ ] Dark mode supporté complet
- [ ] Composants shared/ui utilisés
- [ ] Responsive design mobile-first
- [ ] Accessibilité WCAG respectée

### 🔒 Sécurité
- [ ] Permissions RBAC configurées
- [ ] Guards `<Can>` sur actions sensibles
- [ ] Validation Zod côté client
- [ ] Validation backend correspondante

### 🧪 Qualité
- [ ] Tests unitaires écrits
- [ ] Tests E2E critiques couverts
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de console.log en production

## 🔧 Scripts Utiles

### Base de Données
```bash
# Migrations
npm run db:migrate
npm run db:migrate:reset

# Seeders
npm run db:seed
npm run db:seed:minimal

# Studio
npm run db:studio
```

### Docker Development
```bash
# Démarrage complet
docker-compose -f docker-compose.dev.yml up -d

# Logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f api

# Shell dans le conteneur
docker-compose -f docker-compose.dev.yml exec api bash

# Reset base de données
docker-compose -f docker-compose.dev.yml down -v
```

### Production Build
```bash
# Frontend
npm run build
npm run preview

# Backend
npm run build
npm run start:prod

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Métriques de Qualité

### Standards à Maintenir
- **TypeScript Strict**: 100% (0 any types)
- **Test Coverage**: > 80%
- **Performance Score**: > 90
- **Accessibility Score**: > 95
- **SEO Score**: > 85

### Outils de Monitoring
```bash
# Bundle analyzer
npm run build -- --analyze

# Performance audit
npx lighthouse http://localhost:5173

# Security audit
npm audit
```

## 🎯 Bonnes Pratiques

### Code Organization
1. **Une responsabilité par fichier**
2. **Imports absolus avec alias @/**
3. **Types exportés depuis index.ts**
4. **Composants < 200 lignes**

### State Management
1. **Server state avec RTK Query**
2. **UI state local avec useState**
3. **Global state minimal (session uniquement)**
4. **Pas de state redondant**

### Performance
1. **Lazy loading des routes**
2. **Code splitting par feature**
3. **Memoization avec useMemo/useCallback**
4. **Images optimisées WebP/AVIF**

---

**Dernière mise à jour**: Octobre 2025  
**Maintenu par**: Équipe Développement EMS