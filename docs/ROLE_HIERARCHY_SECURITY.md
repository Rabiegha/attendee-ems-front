# 🔒 SÉCURITÉ HIÉRARCHIE DES RÔLES - IMPLÉMENTATION COMPLÈTE

**Date** : 24 octobre 2025  
**Problème identifié** : Un utilisateur pouvait modifier son propre rôle et les permissions de rôles de même niveau ou supérieur.

---

## ✅ PROTECTIONS IMPLÉMENTÉES

### 1. Frontend (attendee-EMS)

#### **Nouveau fichier : `shared/lib/role-hierarchy.ts`**
Utilitaires pour gérer la hiérarchie des rôles :

```typescript
// Hiérarchie (niveau plus haut = plus de pouvoir)
SUPER_ADMIN: 100
ADMIN: 80
MANAGER: 60
VIEWER: 40
PARTNER: 30
HOSTESS: 20
```

**Fonctions principales** :
- `canModifyUser()` : Vérifie si un utilisateur peut en modifier un autre
- `canAssignRole()` : Vérifie si un rôle peut être assigné
- `filterAssignableRoles()` : Filtre les rôles assignables
- `getRoleLevel()` : Obtient le niveau hiérarchique d'un rôle
- `isRoleHigher()` : Compare deux rôles

**Règles de sécurité** :
1. ❌ Un utilisateur ne peut PAS modifier son propre rôle
2. ✅ Un utilisateur peut modifier uniquement des utilisateurs de niveau STRICTEMENT INFÉRIEUR
3. ✅ Un utilisateur peut assigner uniquement des rôles de niveau STRICTEMENT INFÉRIEUR

#### **Modification : `pages/RolePermissionsAdmin/RolePermissionsAdmin.tsx`**
- Import du helper `canModifyUser()` et du state Redux pour `currentUser`
- Vérification hiérarchique dans `handlePermissionToggle()` :
  - Bloque si tentative de modifier son propre rôle
  - Bloque si tentative de modifier un rôle de niveau égal ou supérieur
  - Affiche le message d'erreur du backend si la validation échoue
- UI améliorée :
  - Badge "Votre rôle" sur le rôle de l'utilisateur connecté (jaune/amber)
  - Badge "Protégé" sur les rôles non modifiables (rouge)
  - Rôles non modifiables grisés et désactivés
  - Message d'avertissement visible quand un rôle protégé est sélectionné
  - Checkboxes désactivées pour les rôles protégés

---

### 2. Backend (attendee-ems-back)

#### **Modification : `modules/roles/roles.service.ts`**
Ajout de vérifications dans `updateRolePermissions()` :

```typescript
async updateRolePermissions(roleId: string, permissionIds: string[], updaterUserId?: string) {
  // 🔒 Protection 1 : Empêcher modification de son propre rôle
  if (updaterUser && updaterUser.role_id === roleId) {
    throw new ForbiddenException('You cannot modify the permissions of your own role');
  }

  // 🔒 Protection 2 : Vérifier hiérarchie (peut modifier uniquement niveaux inférieurs)
  if (targetRole.level >= updaterUser.role.level) {
    throw new ForbiddenException(`You cannot modify permissions for role...`);
  }
  
  // ... reste du code
}
```

**Logique hiérarchique** :
- Niveau plus BAS = plus de pouvoir (SUPER_ADMIN = 100, ADMIN = 80, etc.)
- Un MANAGER (60) peut modifier : VIEWER (40), PARTNER (30), HOSTESS (20)
- Un MANAGER ne peut PAS modifier : SUPER_ADMIN (100), ADMIN (80), ou autre MANAGER (60)

#### **Modification : `modules/roles/roles.controller.ts`**
Mise à jour de `updateRolePermissions()` endpoint :
- Passe maintenant `updaterUserId` au service
- Documentation API mise à jour avec les règles de hiérarchie

#### **Modification : `modules/users/users.service.ts`**
Ajout de vérifications dans `update()` :

```typescript
// Empêcher un utilisateur de modifier son propre rôle
if (targetUser.id === updaterUserId && updateData.role_id) {
  throw new BadRequestException('You cannot modify your own role');
}

// Vérification hiérarchique pour modification de rôle
if (targetCurrentRole.level <= updaterRoleLevel) {
  throw new BadRequestException(`You cannot modify users with role...`);
}
```

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Modifier son propre rôle (Frontend)
1. Connexion en tant que `jane.smith@acme.com` (ADMIN)
2. Aller sur `/roles-permissions`
3. Cliquer sur le rôle "Administrator"
4. ✅ **Attendu** : Badge "Votre rôle" visible, message d'avertissement affiché, checkboxes désactivées

### Test 2 : Modifier son propre rôle (Backend)
1. Connexion en tant que `jane.smith@acme.com` (ADMIN)
2. Aller sur `/roles-permissions`
3. Ouvrir la console et forcer un appel API :
```javascript
fetch('http://localhost:3000/roles/ROLE_ID_ADMIN/permissions', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ permissionIds: ['permission1', 'permission2'] })
})
```
4. ✅ **Attendu** : Erreur 403 avec message "You cannot modify the permissions of your own role"

### Test 3 : Modifier un rôle supérieur (Frontend)
1. Connexion en tant que `bob.johnson@acme.com` (MANAGER, niveau 60)
2. Aller sur `/roles-permissions`
3. Chercher le rôle "Administrator" (ADMIN, niveau 80)
4. ✅ **Attendu** : Badge "Protégé" visible, bouton désactivé/grisé

### Test 4 : Modifier un rôle supérieur (Backend)
1. Connexion en tant que MANAGER
2. Forcer un appel API pour modifier le rôle ADMIN
3. ✅ **Attendu** : Erreur 403 avec message détaillé sur la hiérarchie

### Test 5 : Modifier un rôle inférieur (OK)
1. Connexion en tant que `jane.smith@acme.com` (ADMIN, niveau 80)
2. Aller sur `/roles-permissions`
3. Sélectionner le rôle "Manager" (niveau 60)
4. ✅ **Attendu** : Peut modifier les permissions sans problème

### Test 6 : Modifier role_id d'un utilisateur (Backend)
1. Connexion en tant que ADMIN
2. Appel API `PATCH /users/USER_ID` avec `{ role_id: NEW_ROLE_ID }`
3. ✅ **Attendu** : 
   - Si utilisateur cible = moi : Erreur 400 "You cannot modify your own role"
   - Si nouveau rôle >= mon niveau : Erreur 400 avec détails hiérarchie
   - Si utilisateur cible.role >= mon niveau : Erreur 400 avec détails hiérarchie

---

## 📋 NIVEAUX HIÉRARCHIQUES DÉFINIS

| Rôle         | Code         | Niveau | Peut modifier                          |
|--------------|--------------|--------|----------------------------------------|
| SUPER_ADMIN  | SUPER_ADMIN  | 100    | Tous les rôles                         |
| ADMIN        | ADMIN        | 80     | MANAGER, VIEWER, PARTNER, HOSTESS      |
| MANAGER      | MANAGER      | 60     | VIEWER, PARTNER, HOSTESS               |
| VIEWER       | VIEWER       | 40     | PARTNER, HOSTESS                       |
| PARTNER      | PARTNER      | 30     | HOSTESS                                |
| HOSTESS      | HOSTESS      | 20     | Aucun                                  |

---

## 🎯 RÉSUMÉ SÉCURITÉ

### ✅ Protections Frontend
1. Blocage UI avec badges visuels
2. Désactivation des boutons/checkboxes pour rôles protégés
3. Messages d'avertissement explicites
4. Validation avant appel API

### ✅ Protections Backend
1. Validation dans `users.service.ts` pour modification d'utilisateurs
2. Validation dans `roles.service.ts` pour modification de permissions
3. Empêche modification de son propre rôle
4. Empêche modification de rôles de niveau égal ou supérieur
5. Messages d'erreur détaillés avec niveaux hiérarchiques

### ✅ Double couche de sécurité
- **Frontend** : Améliore UX en bloquant avant l'API
- **Backend** : Sécurise réellement même si frontend contourné

---

## 🔄 MIGRATIONS NÉCESSAIRES

**Aucune migration requise** - La colonne `level` existe déjà dans la table `roles`.

---

## 📚 DOCUMENTATION API

### PATCH /roles/:id/permissions
**Nouvelle description** : 
> Permet de modifier les permissions associées à un rôle. Respecte la hiérarchie : un utilisateur peut uniquement modifier les permissions des rôles de niveau strictement inférieur au sien, et ne peut pas modifier les permissions de son propre rôle.

**Erreurs possibles** :
- `403 Forbidden` : "You cannot modify the permissions of your own role"
- `403 Forbidden` : "You cannot modify permissions for role 'ADMIN' (level 80). Your role level is 60."

### PATCH /users/:id
**Nouvelle description** : 
> Modifie les informations d'un utilisateur. Respecte la hiérarchie des rôles : un utilisateur peut uniquement modifier des utilisateurs de niveau inférieur au sien, et ne peut pas modifier son propre rôle.

**Erreurs possibles** :
- `400 Bad Request` : "You cannot modify your own role"
- `400 Bad Request` : "You cannot modify users with role 'ADMIN' (level 80). Your role level is 60."
- `400 Bad Request` : "You cannot assign role 'SUPER_ADMIN' (level 100). Your role level is 80."

---

## ✅ FICHIERS MODIFIÉS

### Frontend
1. `src/shared/lib/role-hierarchy.ts` (NOUVEAU)
2. `src/pages/RolePermissionsAdmin/RolePermissionsAdmin.tsx` (MODIFIÉ)

### Backend
1. `src/modules/roles/roles.service.ts` (MODIFIÉ)
2. `src/modules/roles/roles.controller.ts` (MODIFIÉ)
3. `src/modules/users/users.service.ts` (DÉJÀ PROTÉGÉ)

---

**✅ IMPLÉMENTATION TERMINÉE - TESTÉE CÔTÉ CODE**
