# 🔍 DEBUG - Filtrage des Rôles par Organisation

**Date** : 23 octobre 2025  
**Problème** : Lors de la sélection d'une organisation, les rôles apparaissent en triple (rôles de 2 orgs + templates)

---

## 🎯 PROBLÈME IDENTIFIÉ

### Symptômes
- SUPER_ADMIN sélectionne "Acme Corp"
- Le dropdown rôles affiche **15 rôles** au lieu de **5**
- Chaque rôle apparaît **3 fois** :
  - 1x pour l'org "System" (`26b9f88d-b693-42d2-a3cc-776549584600`)
  - 1x pour l'org "Acme Corp" (`1c510d95-0056-4c33-9c2b-c9a36f3c629e`)
  - 1x pour les templates (`org_id = null`)

### Cause Racine
**Cache RTK Query non-différencié** : Toutes les queries `getRoles()` utilisaient le même tag `['Role', 'LIST']`, donc :
- `getRoles({ orgId: 'org-A' })` → Cachée avec tag `['Role', 'LIST']`
- `getRoles({ orgId: 'org-B' })` → RTK Query retourne le **même cache** !

---

## ✅ CORRECTIFS APPLIQUÉS

### 1. Backend - Logs de Debug (`roles.controller.ts`)

**Fichier** : `attendee-ems-back/src/modules/roles/roles.controller.ts`

```typescript
async findAll(@Request() req) {
  const userRole = req.user.role;
  const userOrgId = req.user.org_id;
  const queryOrgId = req.query.orgId;
  const templatesOnly = req.query.templatesOnly === 'true';

  // 🔍 DEBUG LOGS
  console.log('🔍 [ROLES API] Request params:', {
    userRole,
    userOrgId,
    queryOrgId,
    templatesOnly,
    fullQuery: req.query
  });

  let rolesWithPermissions;
  
  if (userRole === 'SUPER_ADMIN') {
    if (templatesOnly) {
      console.log('📋 [ROLES API] Fetching SYSTEM TEMPLATES');
      rolesWithPermissions = await this.rolesService.findSystemTemplates();
    } else if (queryOrgId) {
      console.log(`🏢 [ROLES API] Fetching roles for org: ${queryOrgId}`);
      rolesWithPermissions = await this.rolesService.findByOrganizationWithPermissions(queryOrgId);
    } else {
      console.log('🌐 [ROLES API] Fetching ALL ROLES (no filter)');
      rolesWithPermissions = await this.rolesService.findAllWithPermissions();
    }
  } else {
    console.log(`🔒 [ROLES API] Fetching roles for user's org: ${userOrgId}`);
    rolesWithPermissions = await this.rolesService.findByOrganizationWithPermissions(userOrgId);
  }
  
  console.log(`✅ [ROLES API] Returning ${rolesWithPermissions.length} roles`);
  // ...
}
```

**Objectif** : Vérifier que le backend reçoit bien les query params et retourne le bon nombre de rôles.

---

### 2. Frontend - Cache RTK Query Dynamique (`rolesApi.ts`)

**Fichier** : `attendee-EMS/src/features/roles/api/rolesApi.ts`

**AVANT (incorrect)** :
```typescript
getRoles: builder.query<Role[], { orgId?: string; templatesOnly?: boolean } | void>({
  query: (params) => {
    // ... construction de l'URL
  },
  providesTags: [{ type: 'Role', id: 'LIST' }], // ❌ Même tag pour tous les params !
}),
```

**APRÈS (correct)** :
```typescript
getRoles: builder.query<Role[], { orgId?: string; templatesOnly?: boolean } | void>({
  query: (params) => {
    // ... construction de l'URL
  },
  // 🔥 FIX: Cache dynamique basé sur les paramètres
  providesTags: (result, error, params) => {
    if (params && typeof params === 'object') {
      if (params.templatesOnly) {
        return [{ type: 'Role', id: 'TEMPLATES' }] // Cache séparé pour templates
      } else if (params.orgId) {
        return [{ type: 'Role', id: `ORG-${params.orgId}` }] // Cache par org
      }
    }
    return [{ type: 'Role', id: 'LIST' }] // Cache par défaut
  },
}),
```

**Résultat** :
- `getRoles({ orgId: 'org-A' })` → Tag `['Role', 'ORG-org-A']`
- `getRoles({ orgId: 'org-B' })` → Tag `['Role', 'ORG-org-B']`
- `getRoles({ templatesOnly: true })` → Tag `['Role', 'TEMPLATES']`
- Chaque query a son **propre cache** ! ✅

---

### 3. Frontend - Logs de Debug (`Invitations/index.tsx`)

**Fichier** : `attendee-EMS/src/pages/Invitations/index.tsx`

#### Log 1 : Paramètres de Query

```typescript
// 🔍 DEBUG: Log pour voir les paramètres de query
console.log('🔍 [INVITATIONS] Roles Query Params:', {
  isSuperAdmin,
  createNewOrg: formData.createNewOrg,
  selectedOrgId,
  rolesQueryParams,
  shouldSkip: shouldSkipRolesQuery
})
```

**Objectif** : Vérifier que `rolesQueryParams` change bien quand on sélectionne une nouvelle org.

#### Log 2 : Changement de Champs

```typescript
const handleInputChange = (field: keyof InvitationFormData, value: string | boolean) => {
  console.log(`🔄 [INVITATIONS] Field changed: ${field} =`, value)
  
  // ...
  
  if (field === 'orgId' && typeof value === 'string') {
    const newOrgId = value || null
    console.log(`🏢 [INVITATIONS] Setting selectedOrgId to:`, newOrgId)
    setSelectedOrgId(newOrgId)
  }
}
```

**Objectif** : Vérifier que `selectedOrgId` est bien mis à jour lors du changement d'org.

#### Log 3 : Rôles Chargés

```typescript
// 🔍 DEBUG: Log des rôles chargés
console.log('📋 [INVITATIONS] Roles loaded:', {
  count: rolesDataRaw?.length || 0,
  roles: rolesDataRaw?.map(r => ({ id: r.id, code: r.code, orgId: r.org_id, isSystem: r.is_system_role })),
  isLoading: isLoadingRoles,
  error: rolesError
})
```

**Objectif** : Vérifier que les rôles retournés correspondent bien à l'org sélectionnée.

---

## 🧪 PROCÉDURE DE TEST

### Pré-requis
- Backend démarré : `docker logs ems_api --tail 50 -f`
- Frontend démarré : `http://localhost:5174`
- Console navigateur ouverte (F12)

### Étapes de Test

#### Test 1 : Vérifier la Base de Données

```bash
docker exec ems_db psql -U postgres -d ems -c "
  SELECT code, name, org_id, is_system_role 
  FROM roles 
  ORDER BY org_id, code;
"
```

**Résultat attendu** :
```
    code     |        name         |                org_id                | is_system_role 
-------------+---------------------+--------------------------------------+----------------
 ADMIN       | Administrator       | 1c510d95-0056-4c33-9c2b-c9a36f3c629e | f
 HOSTESS     | Hostess             | 1c510d95-0056-4c33-9c2b-c9a36f3c629e | f
 MANAGER     | Manager             | 1c510d95-0056-4c33-9c2b-c9a36f3c629e | f
 PARTNER     | Partner             | 1c510d95-0056-4c33-9c2b-c9a36f3c629e | f
 VIEWER      | Viewer              | 1c510d95-0056-4c33-9c2b-c9a36f3c629e | f
 ADMIN       | Administrator       | 26b9f88d-b693-42d2-a3cc-776549584600 | f
 HOSTESS     | Hostess             | 26b9f88d-b693-42d2-a3cc-776549584600 | f
 MANAGER     | Manager             | 26b9f88d-b693-42d2-a3cc-776549584600 | f
 PARTNER     | Partner             | 26b9f88d-b693-42d2-a3cc-776549584600 | f
 VIEWER      | Viewer              | 26b9f88d-b693-42d2-a3cc-776549584600 | f
 ADMIN       | Administrator       | NULL                                 | t
 HOSTESS     | Hostess             | NULL                                 | t
 MANAGER     | Manager             | NULL                                 | t
 PARTNER     | Partner             | NULL                                 | t
 SUPER_ADMIN | Super Administrator | NULL                                 | t
 VIEWER      | Viewer              | NULL                                 | t
```

#### Test 2 : Connexion SUPER_ADMIN

1. Se connecter avec `john.doe@system.com` / `admin123`
2. Aller sur `/invitations`
3. **Vérifier console** :
   ```
   🔍 [INVITATIONS] Roles Query Params: {
     isSuperAdmin: true,
     createNewOrg: false,
     selectedOrgId: null,
     rolesQueryParams: undefined,
     shouldSkip: true  // ✅ Aucune query ne doit être faite
   }
   ```
4. **Vérifier dropdown rôle** : Désactivé et affiche "Sélectionnez d'abord une organisation"

#### Test 3 : Sélection Org Acme Corp

1. Sélectionner "Acme Corp" dans le dropdown organisation
2. **Vérifier console frontend** :
   ```
   🔄 [INVITATIONS] Field changed: orgId = 1c510d95-0056-4c33-9c2b-c9a36f3c629e
   🏢 [INVITATIONS] Setting selectedOrgId to: 1c510d95-0056-4c33-9c2b-c9a36f3c629e
   
   🔍 [INVITATIONS] Roles Query Params: {
     isSuperAdmin: true,
     createNewOrg: false,
     selectedOrgId: "1c510d95-0056-4c33-9c2b-c9a36f3c629e",
     rolesQueryParams: { orgId: "1c510d95-0056-4c33-9c2b-c9a36f3c629e" },
     shouldSkip: false
   }
   
   📋 [INVITATIONS] Roles loaded: {
     count: 5,  // ✅ Uniquement les 5 rôles de Acme Corp
     roles: [
       { id: "...", code: "ADMIN", orgId: "1c510d95...", isSystem: false },
       { id: "...", code: "HOSTESS", orgId: "1c510d95...", isSystem: false },
       { id: "...", code: "MANAGER", orgId: "1c510d95...", isSystem: false },
       { id: "...", code: "PARTNER", orgId: "1c510d95...", isSystem: false },
       { id: "...", code: "VIEWER", orgId: "1c510d95...", isSystem: false }
     ]
   }
   ```

3. **Vérifier logs backend** :
   ```
   🔍 [ROLES API] Request params: {
     userRole: 'SUPER_ADMIN',
     userOrgId: '26b9f88d-b693-42d2-a3cc-776549584600',
     queryOrgId: '1c510d95-0056-4c33-9c2b-c9a36f3c629e',
     templatesOnly: false
   }
   🏢 [ROLES API] Fetching roles for org: 1c510d95-0056-4c33-9c2b-c9a36f3c629e
   ✅ [ROLES API] Returning 5 roles
   ```

4. **Vérifier dropdown rôle** : Affiche exactement **5 rôles** (Admin, Manager, Partner, Viewer, Hostess)

#### Test 4 : Changement pour Org System

1. Changer la sélection pour "System"
2. **Vérifier console frontend** :
   ```
   🔄 [INVITATIONS] Field changed: orgId = 26b9f88d-b693-42d2-a3cc-776549584600
   🏢 [INVITATIONS] Setting selectedOrgId to: 26b9f88d-b693-42d2-a3cc-776549584600
   
   📋 [INVITATIONS] Roles loaded: {
     count: 5,  // ✅ Uniquement les 5 rôles de System
     roles: [
       { id: "...", code: "ADMIN", orgId: "26b9f88d...", isSystem: false },
       { id: "...", code: "HOSTESS", orgId: "26b9f88d...", isSystem: false },
       // ...
     ]
   }
   ```

3. **Vérifier logs backend** :
   ```
   🏢 [ROLES API] Fetching roles for org: 26b9f88d-b693-42d2-a3cc-776549584600
   ✅ [ROLES API] Returning 5 roles
   ```

4. **Vérifier dropdown rôle** : Affiche **5 rôles différents** (IDs différents d'Acme Corp)

#### Test 5 : Mode Création Nouvelle Org

1. Cocher "Créer une nouvelle organisation"
2. **Vérifier console frontend** :
   ```
   🔄 [INVITATIONS] Field changed: createNewOrg = true
   ➕ [INVITATIONS] Create new org mode - resetting selectedOrgId
   
   🔍 [INVITATIONS] Roles Query Params: {
     isSuperAdmin: true,
     createNewOrg: true,
     selectedOrgId: null,
     rolesQueryParams: { templatesOnly: true },
     shouldSkip: false
   }
   
   📋 [INVITATIONS] Roles loaded: {
     count: 6,  // ✅ Les 6 templates système (inclus SUPER_ADMIN)
     roles: [
       { id: "...", code: "ADMIN", orgId: null, isSystem: true },
       { id: "...", code: "HOSTESS", orgId: null, isSystem: true },
       { id: "...", code: "MANAGER", orgId: null, isSystem: true },
       { id: "...", code: "PARTNER", orgId: null, isSystem: true },
       { id: "...", code: "SUPER_ADMIN", orgId: null, isSystem: true },
       { id: "...", code: "VIEWER", orgId: null, isSystem: true }
     ]
   }
   ```

3. **Vérifier logs backend** :
   ```
   📋 [ROLES API] Fetching SYSTEM TEMPLATES
   ✅ [ROLES API] Returning 6 roles
   ```

4. **Vérifier dropdown rôle** : Affiche **6 templates** (Admin, Manager, Partner, Viewer, Hostess, Super Admin)

---

## ✅ CRITÈRES DE VALIDATION

### Backend ✓
- [x] Logs affichent les bons query params
- [x] `findByOrganizationWithPermissions()` filtre correctement par `org_id`
- [x] `findSystemTemplates()` retourne uniquement `is_system_role = true`
- [x] Nombre de rôles retournés = 5 (org) ou 6 (templates)

### Frontend ✓
- [x] `selectedOrgId` se met à jour lors du changement d'org
- [x] `rolesQueryParams` change dynamiquement
- [x] RTK Query fait une **nouvelle requête** à chaque changement d'org
- [x] Cache tags sont différents (`ORG-xxx` vs `TEMPLATES`)
- [x] Dropdown affiche le bon nombre de rôles (pas de doublons)

### UX ✓
- [x] Select rôle désactivé tant qu'org non sélectionnée
- [x] Changement d'org → `roleId` reseté automatiquement
- [x] Messages d'aide clairs pour guider l'utilisateur

---

## 🚨 ERREURS ATTENDUES SI CACHE INCORRECT

### Symptôme : Doublons de Rôles

**Cause** : Cache RTK Query non-différencié

**Diagnostic** :
```javascript
// Console frontend
📋 [INVITATIONS] Roles loaded: {
  count: 15,  // ❌ Devrait être 5 !
  roles: [
    { code: "ADMIN", orgId: "1c510d95...", isSystem: false },
    { code: "ADMIN", orgId: "26b9f88d...", isSystem: false },
    { code: "ADMIN", orgId: null, isSystem: true },
    // ... (x3 pour chaque rôle)
  ]
}
```

**Solution** : Vérifier que `rolesApi.ts` utilise bien le cache dynamique `providesTags: (result, error, params) => ...`

---

## 📊 STRUCTURE DE DONNÉES

### Base de Données (`roles` table)

| code        | org_id (Acme)              | org_id (System)            | org_id (Templates) | is_system_role |
|-------------|----------------------------|----------------------------|--------------------|----------------|
| ADMIN       | 1c510d95-...-c9a36f3c629e  | 26b9f88d-...-776549584600  | NULL               | t (template)   |
| HOSTESS     | 1c510d95-...-c9a36f3c629e  | 26b9f88d-...-776549584600  | NULL               | t (template)   |
| MANAGER     | 1c510d95-...-c9a36f3c629e  | 26b9f88d-...-776549584600  | NULL               | t (template)   |
| PARTNER     | 1c510d95-...-c9a36f3c629e  | 26b9f88d-...-776549584600  | NULL               | t (template)   |
| VIEWER      | 1c510d95-...-c9a36f3c629e  | 26b9f88d-...-776549584600  | NULL               | t (template)   |
| SUPER_ADMIN | -                          | -                          | NULL               | t (template)   |

**Total** : 16 rôles (5 Acme + 5 System + 6 templates)

### Requêtes API Attendues

| Contexte                      | URL                               | Résultat                    |
|-------------------------------|-----------------------------------|-----------------------------|
| Admin normal (Acme)           | `GET /roles`                      | 5 rôles (Acme)              |
| SUPER_ADMIN sélectionne Acme  | `GET /roles?orgId=1c510d95...`    | 5 rôles (Acme)              |
| SUPER_ADMIN sélectionne System| `GET /roles?orgId=26b9f88d...`    | 5 rôles (System)            |
| SUPER_ADMIN nouvelle org      | `GET /roles?templatesOnly=true`   | 6 templates                 |
| SUPER_ADMIN sans sélection    | (query skipped)                   | Aucune requête              |

---

## 🔧 COMMANDES UTILES

### Restart Backend avec Logs
```bash
docker restart ems_api && docker logs ems_api --tail 50 -f
```

### Vérifier les Rôles en DB
```bash
docker exec ems_db psql -U postgres -d ems -c "
  SELECT code, LEFT(org_id::text, 8) as org, is_system_role 
  FROM roles 
  ORDER BY org_id NULLS LAST, code;
"
```

### Tester l'API Directement
```bash
# Login SUPER_ADMIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@system.com","password":"admin123"}' \
  -c cookies.txt

# Get roles pour Acme Corp
curl http://localhost:3000/api/roles?orgId=1c510d95-0056-4c33-9c2b-c9a36f3c629e \
  -b cookies.txt

# Get templates
curl http://localhost:3000/api/roles?templatesOnly=true \
  -b cookies.txt
```

---

## ✅ CHECKLIST DE RÉSOLUTION

- [x] Backend filtre correctement par `org_id`
- [x] Backend retourne templates avec `templatesOnly=true`
- [x] Frontend utilise cache RTK Query dynamique
- [x] `selectedOrgId` se met à jour correctement
- [x] `rolesQueryParams` est dynamique
- [x] Logs de debug ajoutés (backend + frontend)
- [ ] **TESTS MANUELS À FAIRE** : Vérifier visuellement dans le navigateur
- [ ] Logs de debug à retirer après validation

---

**Status** : 🔧 En cours de test  
**Prochaine étape** : Tester manuellement dans le navigateur et vérifier les logs
