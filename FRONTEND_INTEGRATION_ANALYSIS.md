# 📊 Analyse : Intégration Frontend du Refactor RBAC Multi-tenant

> **Date d'analyse** : 13 janvier 2026  
> **Portée** : Vérification de l'intégration frontend des STEP 1-4 du refactor backend

---

## 🎯 Verdict Global

**❌ LE FRONTEND N'EST PAS ADAPTÉ AU NOUVEAU SYSTÈME**

Le frontend est encore sur l'**ancien modèle single-tenant** et n'utilise **PAS** le nouveau système RBAC multi-tenant du backend.

### Résumé par Feature

| Feature | Backend (STEP 1-4) | Frontend | Gap |
|---------|-------------------|----------|-----|
| **Multi-tenant** | ✅ Implémenté | ❌ Pas adapté | CRITIQUE |
| **JWT Minimal** | ✅ `{sub, mode, currentOrgId}` | ❌ Attend ancien format | CRITIQUE |
| **Switch Org** | ✅ Endpoint créé | ❌ Pas d'UI | BLOQUANT |
| **/me/ability** | ✅ Endpoint créé | ❌ Pas appelé | CRITIQUE |
| **@RequirePermission** | ✅ Guards backend | ❌ ACL frontend obsolète | IMPORTANT |

---

## 🔍 Analyse Détaillée

### 1. Authentification (authApi.ts)

#### ❌ Problèmes identifiés

```typescript
// attendee-ems-front/src/features/auth/api/authApi.ts

// ❌ PROBLÈME 1 : Pas d'endpoint pour switch-org
export const authApi = rootApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({ ... }),
    me: builder.query<UserProfileResponse, void>({ ... }),
    getPolicy: builder.query<PolicyResponse, void>({ ... }),
    // ❌ MANQUANT : switchOrg
    // ❌ MANQUANT : getAvailableOrgs
    // ❌ MANQUANT : getAbility (/me/ability)
  }),
})
```

**Impact** : L'utilisateur ne peut pas switcher d'organisation, même si le backend le permet.

---

### 2. Session State (sessionSlice.ts)

#### ❌ Problèmes identifiés

```typescript
// attendee-ems-front/src/features/auth/model/sessionSlice.ts

export interface SessionState {
  token: string | null
  user: User | null
  organization: Organization | null  // ❌ PROBLÈME : 1 seule org
  rules: AppRule[]
  isAuthenticated: boolean
  // ❌ MANQUANT : availableOrgs (liste des orgs de l'utilisateur)
  // ❌ MANQUANT : mode ('tenant' | 'platform')
  // ❌ MANQUANT : requiresOrgSelection (pour multi-org users)
}
```

**Impact** : Le state ne peut gérer qu'une seule organisation, incompatible avec multi-tenant.

---

### 3. User Interface (authApi.ts)

#### ❌ Problèmes identifiés

```typescript
// attendee-ems-front/src/features/auth/api/authApi.ts

export interface User {
  id: string
  email: string
  roles: string[]
  permissions?: string[]  // ❌ Format ancien "code:scope"
  orgId?: string          // ❌ UNE SEULE org
  // ❌ MANQUANT : isPlatform (pour users platform)
  // ❌ MANQUANT : isRoot (pour root users)
  // ❌ MANQUANT : currentOrgId (org active)
  // ❌ MANQUANT : availableOrgs (liste des orgs)
}
```

**Impact** : L'interface User ne correspond pas au nouveau modèle backend.

---

### 4. Ability Provider (ability-provider.tsx)

#### ⚠️ Problèmes partiels

```typescript
// attendee-ems-front/src/app/providers/ability-provider.tsx

// ✅ POSITIF : Check isPlatform existe (ligne 56)
(!orgId && !user.isPlatform) || // Pas d'org ET pas platform user

// ❌ PROBLÈME 1 : Charge les règles via /auth/policy (ancien endpoint)
const { data: policyData } = useGetPolicyQuery(undefined, { ... })

// ❌ PROBLÈME 2 : Devrait charger via /me/ability (nouveau endpoint)
// const { data: abilityData } = useGetAbilityQuery(undefined, { ... })
```

**Impact** : Les permissions sont chargées via l'ancien système, pas le nouveau `/me/ability`.

---

### 5. API Constants (constants.ts)

#### ❌ Endpoints manquants

```typescript
// attendee-ems-front/src/app/config/constants.ts

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',          // ✅ OK
    REFRESH: '/auth/refresh',      // ✅ OK
    ME: '/users/me',               // ⚠️ Utilise ancien endpoint
    POLICY: '/auth/policy',        // ❌ OBSOLÈTE (remplacé par /me/ability)
    // ❌ MANQUANT : ABILITY: '/me/ability'
    // ❌ MANQUANT : AVAILABLE_ORGS: '/me/orgs'
    // ❌ MANQUANT : SWITCH_ORG: '/auth/switch-org'
  },
  // ...
}
```

---

### 6. Login Response

#### ⚠️ Format incomplet

```typescript
// Le backend retourne maintenant (STEP 2) :
{
  access_token: string,
  mode: 'tenant' | 'platform',
  requiresOrgSelection?: boolean,  // ❌ Frontend ne gère pas
  user: { isPlatform, isRoot },    // ❌ Frontend ne gère pas
}

// Le frontend attend toujours l'ancien format :
{
  access_token: string,
  user: { roles, orgId },
  organization: { ... }
}
```

---

## 📋 Ce qui MANQUE dans le Frontend

### CRITIQUE (Bloquant)

#### 1. Endpoints API manquants
```typescript
// À ajouter dans authApi.ts

switchOrg: builder.mutation<LoginResponse, { orgId: string }>({
  query: (body) => ({
    url: '/auth/switch-org',
    method: 'POST',
    body,
  }),
}),

getAvailableOrgs: builder.query<AvailableOrgsResponse, void>({
  query: () => '/me/orgs',
}),

getAbility: builder.query<UserAbility, void>({
  query: () => '/me/ability',
  providesTags: ['Ability'],
}),
```

#### 2. Session State multi-tenant
```typescript
// Modifier sessionSlice.ts

export interface SessionState {
  token: string | null
  user: User | null
  currentOrg: Organization | null        // ✅ Renommer
  availableOrgs: Organization[]          // ✅ NOUVEAU
  mode: 'tenant' | 'platform' | null     // ✅ NOUVEAU
  requiresOrgSelection: boolean          // ✅ NOUVEAU
  ability: UserAbility | null            // ✅ NOUVEAU (remplace rules)
  isAuthenticated: boolean
}
```

#### 3. UI de sélection d'organisation
```typescript
// Créer : src/features/auth/ui/OrgSelector.tsx

export const OrgSelector: React.FC = () => {
  const { availableOrgs } = useSelector(selectSession)
  const [switchOrg] = useSwitchOrgMutation()
  
  return (
    <div>
      <h2>Choisissez une organisation</h2>
      {availableOrgs.map(org => (
        <button onClick={() => switchOrg({ orgId: org.id })}>
          {org.name}
        </button>
      ))}
    </div>
  )
}
```

#### 4. Login Flow adapté
```typescript
// Modifier authLifecycle.ts pour gérer requiresOrgSelection

const handleLoginResponse = (response: LoginResponse) => {
  if (response.requiresOrgSelection) {
    // Afficher OrgSelector
    dispatch(setRequiresOrgSelection(true))
  } else {
    // Login normal
    dispatch(setSession(response))
  }
}
```

---

### IMPORTANT (Non bloquant mais recommandé)

#### 5. Ability Provider adapté
```typescript
// Modifier ability-provider.tsx pour utiliser /me/ability

const { data: abilityData } = useGetAbilityQuery(undefined, {
  skip: !user || !isAuthenticated,
})

const ability = useMemo(() => {
  if (abilityData?.grants) {
    return createAbilityFromGrants(abilityData.grants)
  }
  // Fallback...
}, [abilityData])
```

#### 6. Header avec switch org
```typescript
// Ajouter dropdown dans Header

<Dropdown>
  <DropdownTrigger>
    {currentOrg?.name} ▼
  </DropdownTrigger>
  <DropdownMenu>
    {availableOrgs.map(org => (
      <DropdownItem onClick={() => switchOrg(org.id)}>
        {org.name}
      </DropdownItem>
    ))}
  </DropdownMenu>
</Dropdown>
```

---

## 🎯 Effort Estimé

### Phase 1 : Fondations (2-3 jours)
- ✅ Ajouter endpoints API (`switchOrg`, `getAvailableOrgs`, `getAbility`)
- ✅ Adapter `sessionSlice` pour multi-tenant
- ✅ Modifier interface `User` (ajouter `isPlatform`, `isRoot`)

### Phase 2 : Login Flow (1-2 jours)
- ✅ Gérer `requiresOrgSelection` dans login
- ✅ Créer composant `OrgSelector`
- ✅ Adapter `authLifecycle` pour nouveau flow

### Phase 3 : Permissions (1-2 jours)
- ✅ Remplacer `/auth/policy` par `/me/ability`
- ✅ Adapter `AbilityProvider` pour grants
- ✅ Tester permissions multi-org

### Phase 4 : UI/UX (1 jour)
- ✅ Ajouter dropdown switch org dans Header
- ✅ Indicateur org courante
- ✅ Tests E2E

**Total estimé** : 5-8 jours pour adapter complètement le frontend

---

## 📝 Recommandations

### Court Terme (URGENT)

1. **Ne PAS déployer le backend refactoré** tant que le frontend n'est pas adapté
   - **Risque** : Frontend cassé, utilisateurs bloqués
   - **Alternative** : Garder une branche backend compatible ancien frontend

2. **Créer une branche frontend dédiée** : `feat/multi-tenant-rbac`
   - Paralléliser le développement frontend
   - Tests E2E avec backend refactoré

3. **Documentation d'intégration**
   - Guide step-by-step pour adapter le frontend
   - Exemples de code complets

### Moyen Terme

4. **Migration progressive**
   - Déployer backend + frontend ensemble (breaking change)
   - Migration des tokens existants
   - Communication aux utilisateurs (re-login requis)

5. **Tests E2E complets**
   - Scénarios multi-org
   - Switch org
   - Permissions dynamiques

---

## 🎉 Conclusion

**Le frontend n'est PAS adapté** au refactor backend. Il utilise encore l'ancien modèle single-tenant.

**Action immédiate requise** :
- ❌ **NE PAS déployer** le backend refactoré en production
- ✅ **Adapter le frontend** avant tout déploiement (5-8 jours)
- ✅ **Tests E2E** avant mise en production

**Ordre de priorité** :
1. 🔴 **CRITIQUE** : Adapter login flow + session state (3 jours)
2. 🟡 **IMPORTANT** : Adapter permissions (/me/ability) (2 jours)
3. 🟢 **OPTIONNEL** : UI/UX switch org (1 jour)

---

**Rapport généré le** : 13 janvier 2026  
**Analyste** : GitHub Copilot
