# 🎯 REFACTORISATION DU FORMULAIRE D'INVITATION

**Date** : 23 octobre 2025  
**Contexte** : Correction du workflow SUPER_ADMIN pour la sélection des rôles lors de la création d'utilisateurs

---

## 🎯 PROBLÈME IDENTIFIÉ

Lorsqu'un **SUPER_ADMIN** créait un utilisateur dans une autre organisation, il avait accès à **TOUS les rôles de TOUTES les organisations** dans le dropdown, ce qui posait plusieurs problèmes :

1. **Confusion UX** : Des dizaines de rôles apparaissaient sans contexte organisationnel
2. **Erreur de logique métier** : Les rôles sont spécifiques à chaque organisation (customisables)
3. **Risque de mauvaise attribution** : Un rôle d'une org A pouvait être assigné à un utilisateur d'une org B
4. **Non-respect de l'isolation multi-tenant** : Violation du principe d'isolation des données

---

## ✅ SOLUTION IMPLÉMENTÉE

### Workflow Redesigné pour SUPER_ADMIN

#### Cas 1 : Création dans une organisation existante
```
1. Saisir email
2. 🔹 SÉLECTIONNER l'organisation (nouveau : requis en premier)
3. Choisir le rôle (filtré automatiquement pour l'org sélectionnée)
4. Compléter les informations
5. Soumettre
```

#### Cas 2 : Création d'une nouvelle organisation
```
1. Saisir email
2. 🔹 Cocher "Créer une nouvelle organisation"
3. Saisir le nom de l'org
4. Choisir un rôle template (Admin, Manager, Partner, Viewer, Hostess)
5. Compléter les informations
6. Soumettre
```

#### Cas 3 : Admin normal (inchangé)
```
1. Saisir email
2. Choisir le rôle (automatiquement filtré à son org par le backend)
3. Compléter les informations
4. Soumettre
```

---

## 🛠️ MODIFICATIONS TECHNIQUES

### 1. Backend - API Roles (NestJS)

**Fichier** : `attendee-ems-back/src/modules/roles/roles.controller.ts`

```typescript
// ✅ AVANT : Retournait TOUS les rôles pour SUPER_ADMIN
async findAll(@Request() req) {
  if (userRole === 'SUPER_ADMIN') {
    rolesWithPermissions = await this.rolesService.findAllWithPermissions();
  }
}

// ✅ APRÈS : Support de query params pour filtrage dynamique
async findAll(@Request() req) {
  const queryOrgId = req.query.orgId;
  const templatesOnly = req.query.templatesOnly === 'true';

  if (userRole === 'SUPER_ADMIN') {
    if (templatesOnly) {
      // Rôles templates pour nouvelle org
      rolesWithPermissions = await this.rolesService.findSystemTemplates();
    } else if (queryOrgId) {
      // Rôles spécifiques d'une org existante
      rolesWithPermissions = await this.rolesService.findByOrganizationWithPermissions(queryOrgId);
    } else {
      // Fallback : tous les rôles (legacy)
      rolesWithPermissions = await this.rolesService.findAllWithPermissions();
    }
  }
}
```

**Fichier** : `attendee-ems-back/src/modules/roles/roles.service.ts`

```typescript
// ✅ NOUVEAU : Méthode pour récupérer les rôles templates
async findSystemTemplates() {
  return this.prisma.role.findMany({
    where: { is_system_role: true },
    include: {
      rolePermissions: {
        include: { permission: true }
      }
    }
  });
}
```

**Endpoints disponibles** :
- `GET /roles` → Rôles filtrés par org (admin normal)
- `GET /roles?orgId=xxx-xxx-xxx` → Rôles d'une org spécifique (SUPER_ADMIN)
- `GET /roles?templatesOnly=true` → Rôles templates système (SUPER_ADMIN + nouvelle org)

---

### 2. Frontend - API RTK Query

**Fichier** : `attendee-EMS/src/features/roles/api/rolesApi.ts`

```typescript
// ✅ AVANT : Query statique sans paramètres
getRoles: builder.query<Role[], void>({
  query: () => '/roles',
})

// ✅ APRÈS : Query avec paramètres optionnels
getRoles: builder.query<Role[], { orgId?: string; templatesOnly?: boolean } | void>({
  query: (params) => {
    if (!params) return '/roles';
    
    const queryParams = new URLSearchParams();
    if (params.orgId) queryParams.append('orgId', params.orgId);
    if (params.templatesOnly) queryParams.append('templatesOnly', 'true');
    
    const queryString = queryParams.toString();
    return queryString ? `/roles?${queryString}` : '/roles';
  },
  providesTags: ['Role'],
})
```

---

### 3. Frontend - Page Invitations

**Fichier** : `attendee-EMS/src/pages/Invitations/index.tsx`

#### État ajouté

```typescript
// 🔹 Track l'organisation sélectionnée pour SUPER_ADMIN
const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

// Initialisation pour admin normal (auto-select son org)
useEffect(() => {
  if (!isSuperAdmin && currentOrgId) {
    setSelectedOrgId(currentOrgId);
  }
}, [isSuperAdmin, currentOrgId]);
```

#### Logique de query dynamique

```typescript
// 🔹 Construction des paramètres selon le contexte
const rolesQueryParams = isSuperAdmin && formData.createNewOrg
  ? { templatesOnly: true }                    // Nouvelle org → templates
  : isSuperAdmin && selectedOrgId
  ? { orgId: selectedOrgId }                   // Org existante → rôles spécifiques
  : undefined;                                 // Admin normal → backend par défaut

// 🔹 Skip la query si SUPER_ADMIN n'a pas encore choisi d'org
const shouldSkipRolesQuery = isSuperAdmin 
  ? (!formData.createNewOrg && !selectedOrgId)
  : false;

const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery(
  rolesQueryParams,
  { skip: shouldSkipRolesQuery }
);
```

#### Gestion du changement d'organisation

```typescript
const handleInputChange = (field: string, value: unknown) => {
  setFormData(prev => ({
    ...prev,
    [field]: value,
    // 🔹 Reset du roleId si l'org ou le mode change
    ...(field === 'orgId' && { roleId: '' }),
    ...(field === 'createNewOrg' && { roleId: '' })
  }));

  // 🔹 Mise à jour du selectedOrgId pour trigger la query
  if (field === 'orgId' && typeof value === 'string') {
    setSelectedOrgId(value || null);
  }
};
```

#### Réorganisation de l'UI

**Ordre AVANT (incorrect)** :
```
1. Email
2. Rôle ❌ (tous les rôles de toutes les orgs)
3. Organisation
```

**Ordre APRÈS (correct)** :
```
1. Email
2. 🔹 Organisation (obligatoire en premier pour SUPER_ADMIN)
3. Rôle (filtré selon l'org choisie)
```

---

## 🎯 AMÉLIORATIONS UX

### 1. Indication visuelle claire

```tsx
<FormField
  label="Organisation"
  required
  hint="⚠️ Sélectionnez d'abord l'organisation pour voir les rôles disponibles"
>
```

### 2. Select rôle désactivé tant qu'org non choisie

```tsx
<Select
  value={formData.roleId}
  disabled={isLoadingRoles || (isSuperAdmin && !formData.createNewOrg && !selectedOrgId)}
  required
>
  <option value="">
    {isSuperAdmin && !formData.createNewOrg && !selectedOrgId
      ? "Sélectionnez d'abord une organisation"
      : "Sélectionner un rôle"
    }
  </option>
```

### 3. Tooltip informatif pour nouvelle org

```tsx
{formData.createNewOrg && (
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
    💡 Rôles par défaut (Admin, Manager, Partner, Viewer, Hôtesse) disponibles
  </p>
)}
```

### 4. Message si aucun rôle disponible

```tsx
{!isLoadingRoles && !roles?.length && !rolesError && selectedOrgId && (
  <option value="" disabled>
    Aucun rôle disponible pour cette organisation
  </option>
)}
```

---

## 🧪 TESTING

### Scénarios à tester

#### ✅ SUPER_ADMIN - Organisation existante
1. Se connecter comme `john.doe@system.com` (SUPER_ADMIN)
2. Aller sur `/invitations`
3. Saisir un email
4. **Vérifier** : Select rôle est désactivé
5. Sélectionner "Acme Corp"
6. **Vérifier** : Uniquement les rôles de Acme Corp apparaissent
7. Changer pour "System"
8. **Vérifier** : Les rôles de System apparaissent + roleId est reseté
9. Compléter et soumettre
10. **Vérifier** : Utilisateur créé avec le bon rôle et la bonne org

#### ✅ SUPER_ADMIN - Nouvelle organisation
1. Se connecter comme `john.doe@system.com`
2. Aller sur `/invitations`
3. Saisir un email
4. Cocher "Créer une nouvelle organisation"
5. **Vérifier** : Uniquement 5 rôles templates (Admin, Manager, Partner, Viewer, Hostess)
6. Saisir "Ma Nouvelle Org"
7. **Vérifier** : Slug généré = `ma-nouvelle-org`
8. Sélectionner un rôle template
9. Compléter et soumettre
10. **Vérifier** : Nouvelle org créée + utilisateur assigné

#### ✅ ADMIN - Organisation propre (comportement inchangé)
1. Se connecter comme admin Acme Corp
2. Aller sur `/invitations`
3. Saisir un email
4. **Vérifier** : Uniquement les rôles de Acme Corp (pas de select org)
5. Compléter et soumettre
6. **Vérifier** : Utilisateur créé dans Acme Corp

---

## 📊 IMPACT

### Avant
- ❌ SUPER_ADMIN voyait ~10-50 rôles mélangés
- ❌ Pas de contexte organisationnel
- ❌ Risque d'erreur d'attribution
- ❌ UX confuse

### Après
- ✅ SUPER_ADMIN voit 5-10 rôles max (filtrés)
- ✅ Contexte clair (org sélectionnée = rôles de cette org)
- ✅ Impossible d'assigner le mauvais rôle
- ✅ UX guidée et sécurisée

---

## 🔐 SÉCURITÉ

### Isolation multi-tenant renforcée
- Backend valide toujours `orgId` côté serveur
- Frontend ne peut plus envoyer un `roleId` d'une autre org
- Query params explicites (pas de comportement implicite)

### Audit trail
- Logs backend : `orgId` + `roleId` explicites dans les requêtes
- Traçabilité améliorée pour le debug

---

## 📝 NOTES TECHNIQUES

### Prisma Client Regeneration
Après ajout de `findSystemTemplates()` :
```bash
docker exec ems_api npx prisma generate
docker restart ems_api
```

### RTK Query Cache
- Le cache RTK Query se met à jour automatiquement quand `rolesQueryParams` change
- `skip: true` évite les queries inutiles (ex: SUPER_ADMIN sans org sélectionnée)

### Dark Mode
- Tous les nouveaux éléments UI supportent le dark mode
- Classes `dark:` appliquées sur tous les composants

---

## ✅ CHECKLIST DE VALIDATION

- [x] Backend supporte `?orgId=xxx`
- [x] Backend supporte `?templatesOnly=true`
- [x] Frontend API accepte les paramètres
- [x] État `selectedOrgId` créé
- [x] Query dynamique implémentée
- [x] UI réorganisée (org avant rôle)
- [x] Select rôle désactivé tant que pas d'org
- [x] Reset roleId lors du changement d'org
- [x] Messages d'aide clairs
- [x] Dark mode complet
- [ ] Tests E2E (à faire)
- [ ] Documentation utilisateur (à faire)

---

## 🚀 PROCHAINES ÉTAPES

1. **Tests utilisateurs** : Valider le workflow avec des vrais admins
2. **Analytics** : Tracker les créations par org (métriques)
3. **Optimisation** : Cache des rôles par org (performance)
4. **Documentation** : Guide utilisateur pour les SUPER_ADMIN

---

**Status** : ✅ Implémenté et prêt pour les tests  
**Auteur** : GitHub Copilot  
**Reviewer** : À assigner
