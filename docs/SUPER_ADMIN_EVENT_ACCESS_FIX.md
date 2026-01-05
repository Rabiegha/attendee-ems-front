# 🔧 Correction : Super Admin ne peut pas accéder aux événements

## ❌ Problème Identifié

**Symptômes** :
- 🔴 Corentin (Super Admin) voit la liste des événements 
- 🔴 Mais en cliquant sur un événement → "Événement non trouvé"
- 🔴 Alors que les utilisateurs normaux (Claudia, Rabie) y accèdent normalement

**Cause racine** : Le handler MSW `/events/:id` vérifiait l'organisation de l'utilisateur, mais Corentin (Super Admin) a `orgId: ''` (vide), donc la vérification échouait pour tous les événements.

## ✅ Solution Appliquée

### Problème dans le Handler MSW

**Fichier** : `src/mocks/handlers.ts`

**Code problématique** :
```typescript
// Vérifier l'organisation
if (event.org_id !== currentUser.orgId) {
  return HttpResponse.json(
    { message: 'Event not found' },
    { status: 404 }
  )
}
```

**Pourquoi ça échouait** :
- Corentin : `orgId: ''` (vide)
- Événements : `org_id: 'org-choyou'` ou `org_id: 'org-itforbusiness'`
- Condition : `'org-choyou' !== ''` → `true` → 404 Error

### Correction Appliquée

**Code corrigé** :
```typescript
if (currentUser) {
  // Super Admin a accès à tous les événements
  if (currentUser.isSuperAdmin) {
    // Pas de vérification pour les Super Admins
  } else {
    // Vérifier l'organisation pour les autres utilisateurs
    if (event.org_id !== currentUser.orgId) {
      return HttpResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Vérifications spécifiques...
  }
}
```

## 🛡️ Logique de Sécurité Corrigée

### Niveaux d'Accès aux Événements

| Type d'Utilisateur | Vérification Organisation | Vérification EventIds | Accès |
|--------------------|-------------------------|----------------------|-------|
| **Super Admin** | ❌ Bypass | ❌ Bypass | ✅ Tous événements |
| **Org Admin** | ✅ Org spécifique | ❌ Bypass | ✅ Org complète |
| **Utilisateurs Spécialisés** | ✅ Org spécifique | ✅ EventIds | 📝 Événements assignés |

### Flux de Vérification

1. **Événement existe** ? → Sinon 404
2. **Utilisateur authentifié** ? → Sinon continuer (compatibilité)
3. **Super Admin** ? → ✅ **Accès direct**
4. **Organisation match** ? → Sinon 404  
5. **EventIds définis ET pas Org Admin** ? → Vérifier eventIds
6. **EventId autorisé** ? → Sinon 404
7. ✅ **Accès accordé**

##  Tests de Validation

### Test 1 : Super Admin (Corentin)
1. **Se connecter** avec `corentin@kistler.com`
2. **Aller** sur la page Events
3. **Vérifier** que tous les événements sont visibles (7 événements)
4. **Cliquer** sur n'importe quel événement → ✅ **Accès autorisé**
5. **Vérifier** que les détails s'affichent correctement

### Test 2 : Org Admin (Fred)
1. **Se connecter** avec `fred@choyou.com`  
2. **Vérifier** accès aux 5 événements Choyou ✅
3. **Tentative d'accès** à un événement IT for Business → 404 (normal)

### Test 3 : Utilisateur Spécialisé (Claudia)
1. **Se connecter** avec `claudia@choyou.com`
2. **Vérifier** accès aux 3 événements assignés ✅
3. **Tentative d'accès** à un événement non-assigné Choyou → 404 (normal)

## 🔍 Debug et Vérification

### Logs MSW Utiles
```javascript
// Dans la console du navigateur lors d'un accès événement
// ✅ Super Admin
"Event access for Super Admin - no restrictions"

// ✅ Org Admin  
"Event access granted for org admin in matching organization"

// ✅ Utilisateur spécialisé
"Event access granted for user with matching eventId"

// ❌ Accès refusé
"Event not found - organization mismatch" 
"Event not found - eventId not authorized"
```

### Vérification Manuelle
```typescript
// Dans la console, vérifier les données utilisateur
const user = window.store?.getState()?.session?.user
console.log('User orgId:', user?.orgId)
console.log('User isSuperAdmin:', user?.isSuperAdmin)
console.log('User eventIds:', user?.eventIds)
```

## 📊 Impact de la Correction

### Avant la Correction
- 🔴 Super Admin **ne pouvait pas** accéder aux détails des événements
- ✅ Utilisateurs normaux **pouvaient** accéder (car orgId non-vide)
- 🔴 **Incohérence** : Super Admin moins privilégié que les utilisateurs normaux

### Après la Correction
- ✅ Super Admin **peut accéder** à tous les événements
- ✅ Utilisateurs normaux **continuent** à accéder selon leurs permissions
- ✅ **Cohérence** : Hiérarchie de permissions respectée

## 📝 Notes Techniques

### Pourquoi `orgId: ''` pour Super Admin ?

Le Super Admin n'appartient à aucune organisation spécifique :
- **Avantage** : Accès cross-organisation
- **Inconvénient** : Nécessite une logique spéciale dans les vérifications

### Alternative Considérée

❌ **Donner un orgId spécifique au Super Admin** : Limiterait son accès global
✅ **Logique conditionnelle selon isSuperAdmin** : Plus flexible et sûr

---

**Status** : ✅ **RÉSOLU** - Super Admin peut maintenant accéder aux événements
**Test** : ✅ **À VALIDER** - Tester connexion Corentin → accès événements
**Sécurité** : ✅ **RENFORCÉE** - Hiérarchie de permissions cohérente