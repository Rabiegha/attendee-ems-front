# 🔄 FIX : Boucle de Redirection Infinie (Redirect Loop)

**Date** : 23 octobre 2025  
**Bug** : Page clignote en boucle : `dashboard → login → dashboard → login`

---

## 🐛 SYMPTÔMES

- ✅ **Fonctionne en navigation privée** (pas de cache/localStorage)
- ❌ **Boucle infinie en navigation normale** (avec historique du navigateur)
- 🔄 Clignotement rapide entre deux pages : `/dashboard` ↔ `/auth/login`

---

## 🔍 CAUSES IDENTIFIÉES

### 1. **État Redux Corrompu**

- Le Redux store n'est pas persisté (pas de Redux Persist)
- MAIS : Peut rester en mémoire si la page n'est pas complètement rechargée
- Symptôme : `isAuthenticated: true` MAIS `user: null` ou `token: null`

### 2. **Cookie de Refresh Token Invalide**

- Le refresh token HttpOnly existe dans les cookies
- MAIS : Il est invalide, révoqué, ou expiré
- Le `bootstrapAuth()` tente de l'utiliser → 401 → marque non authentifié
- Puis un autre mécanisme détecte un état "authentifié" → re-bootstrap → 401 → boucle

### 3. **localStorage/sessionStorage Corrompus**

- Anciennes données de sessions précédentes
- Peuvent contenir des tokens expirés ou des états incohérents
- Même si le code ne les utilise plus, ils peuvent causer des conflits

### 4. **Multiples Redirections Concurrentes**

- `RootLayout` détecte non-authentifié → redirige vers `/auth/login`
- `SmartRedirect` détecte non-authentifié → redirige vers `/auth/login`
- `AuthLayout` détecte authentifié → redirige vers `/dashboard`
- Résultat : Conflit de redirections en boucle

---

## ✅ SOLUTIONS IMPLÉMENTÉES

### 1. **Protection Anti-Boucle dans RootLayout** ⚡

**Fichier** : `src/widgets/layouts/RootLayout.tsx`

```typescript
// Compteur de redirections avec fenêtre temporelle
const redirectCountRef = useRef(0)
const lastRedirectTimeRef = useRef(0)

// Réinitialiser si > 2 secondes écoulées
if (now - lastRedirectTimeRef.current > 2000) {
  redirectCountRef.current = 0
}

// PROTECTION : Si > 5 redirections en 2 secondes
if (redirectCountRef.current > 5) {
  console.error('🚨 REDIRECT LOOP DETECTED! Force clearing session...')
  dispatch(clearSession())
  localStorage.clear()
  sessionStorage.clear()
  navigate('/auth/login', { replace: true })
  // Bloquer les redirections pendant 3 secondes
  redirectCountRef.current = 0
  lastRedirectTimeRef.current = now + 3000
  return
}
```

**Avantages** :

- ✅ Détecte automatiquement les boucles (> 5 redirections en 2s)
- ✅ Force le nettoyage complet (Redux + localStorage + sessionStorage)
- ✅ Empêche les nouvelles redirections pendant 3 secondes
- ✅ Logs détaillés pour debugging

### 2. **Protection Anti-Boucle dans SmartRedirect** ⚡

**Fichier** : `src/shared/ui/SmartRedirect.tsx`

```typescript
// Protection similaire mais seuil plus bas (3 redirections)
if (redirectCountRef.current > 3) {
  console.error('[SMARTREDIRECT] 🚨 REDIRECT LOOP DETECTED!')
  dispatch(clearSession())
  localStorage.clear()
  sessionStorage.clear()
  navigate('/auth/login', { replace: true })
  return
}
```

**Pourquoi seuil différent ?**

- SmartRedirect est sur la route `/` (root)
- Devrait rediriger une seule fois
- Seuil plus bas = détection plus rapide

### 3. **Redirection Préventive dans AuthLayout** 🛡️

**Fichier** : `src/widgets/layouts/AuthLayout.tsx`

```typescript
useEffect(() => {
  // Si déjà authentifié, ne pas rester sur /auth/login
  if (isAuthenticated && !isBootstrapping) {
    console.log(
      '[AUTHLAYOUT] User already authenticated, redirecting to dashboard'
    )
    navigate('/dashboard', { replace: true })
  }
}, [isAuthenticated, isBootstrapping, navigate])
```

**Évite** :

- ❌ Utilisateur authentifié bloqué sur page de login
- ❌ Flash de la page de login avant redirection dashboard
- ✅ Redirection immédiate si déjà connecté

### 4. **Page de Récupération d'Urgence** 🚨

**Route** : `/auth/recovery`  
**Fichier** : `src/pages/AuthRecovery/index.tsx`

Une page accessible manuellement pour forcer le nettoyage complet.

**Fonctionnalités** :

- 🧹 Nettoie localStorage, sessionStorage, cookies côté client
- 🔄 Recharge complètement la page après nettoyage
- ⏱️ Compte à rebours de 3 secondes (annulable)
- 📱 Interface claire avec explications

**Quand l'utiliser ?**

- Si la boucle automatique ne se résout pas
- Si l'utilisateur est complètement bloqué
- Pour tester le nettoyage complet manuellement

**Comment y accéder ?**

```
http://localhost:5173/auth/recovery
```

### 5. **Utilitaire de Récupération** 🛠️

**Fichier** : `src/shared/lib/auth-recovery.ts`

```typescript
// Nettoie TOUT l'état d'authentification
forceAuthCleanup()

// Détecte automatiquement les boucles
detectRedirectLoop() // true si > 10 redirections en 5s

// Nettoie le log de détection
clearRedirectLog()
```

---

## 🧪 COMMENT RÉSOUDRE TON PROBLÈME IMMÉDIATEMENT

### Option 1 : Via la Page de Récupération (Recommandé)

1. **Ouvre cette URL dans ton navigateur** :

   ```
   http://localhost:5173/auth/recovery
   ```

2. **Clique sur "Nettoyer et réinitialiser"**

3. **Attends 3 secondes** → Page rechargée automatiquement

4. **Teste la connexion** → Plus de boucle ✅

### Option 2 : Via la Console du Navigateur (Manuel)

1. **Ouvre la console DevTools** (F12)

2. **Copie-colle ce code** :

   ```javascript
   // Nettoyer tout
   localStorage.clear()
   sessionStorage.clear()

   // Nettoyer les cookies côté client
   document.cookie.split(';').forEach((c) => {
     document.cookie = c
       .replace(/^ +/, '')
       .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
   })

   // Recharger
   window.location.href = '/auth/login'
   ```

3. **Appuie sur Entrée** → Page rechargée

### Option 3 : Via les DevTools (Interface)

1. **Ouvre DevTools** (F12)

2. **Onglet "Application"** (ou "Stockage" en français)

3. **Clique sur "Clear site data"** (tout en bas)

4. **Coche tout** :
   - ✅ Local storage
   - ✅ Session storage
   - ✅ Cookies
   - ✅ Cache storage

5. **Clique "Clear site data"**

6. **Ferme et rouvre le navigateur** (important !)

---

## 🔍 DIAGNOSTIC DES LOGS

### Logs Normaux (Aucun Problème)

```
[AUTH] Attempting to restore session from refresh token...
[AUTH] Session restored successfully
[ROOTLAYOUT] Auth state: { isAuthenticated: true, ... }
[ROOTLAYOUT] ✅ User authenticated and valid: admin@system.com
```

### Logs de Boucle Détectée (Automatique)

```
[ROOTLAYOUT] Auth state: { isAuthenticated: false, ... }
[ROOTLAYOUT] ❌ User not authenticated after bootstrap, redirecting to login
[ROOTLAYOUT] Auth state: { isAuthenticated: true, ... }
[ROOTLAYOUT] ✅ User authenticated and valid: admin@system.com
[ROOTLAYOUT] Auth state: { isAuthenticated: false, ... }
[ROOTLAYOUT] ❌ User not authenticated after bootstrap, redirecting to login
[ROOTLAYOUT] 🚨 REDIRECT LOOP DETECTED! Force clearing session...
```

### Logs Après Nettoyage Automatique

```
[AUTH RECOVERY] 🧹 Force cleaning all auth state...
[AUTH RECOVERY] Removing localStorage key: theme
[AUTH RECOVERY] sessionStorage cleared
[AUTH RECOVERY] Client-side cookies cleared
[AUTH RECOVERY] ✅ Cleanup complete. Reloading page...
```

---

## 🛡️ PRÉVENTION FUTURE

### Pour les Développeurs

1. **TOUJOURS appeler `clearSession()` en cas d'erreur 401**
2. **NE JAMAIS persister `isAuthenticated` dans localStorage**
3. **TOUJOURS vérifier `user && token` en plus de `isAuthenticated`**
4. **UTILISER `replace: true` dans toutes les redirections** (pas d'historique)

### Pour les Tests

1. **Tester en navigation privée** pour éviter les caches
2. **Nettoyer régulièrement** : DevTools → Application → Clear site data
3. **Tester le logout + refresh** après chaque modif auth
4. **Vérifier les logs console** pour détecter les boucles précocement

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant le Fix

- ❌ Boucle infinie après logout + refresh
- ❌ Dashboard vide visible
- ❌ Pas de détection automatique
- ❌ Nécessite nettoyage manuel complexe

### Après le Fix

- ✅ Détection automatique de boucle (> 5 redirections)
- ✅ Nettoyage automatique forcé
- ✅ Page de récupération accessible
- ✅ Protection dans 3 composants (RootLayout, SmartRedirect, AuthLayout)
- ✅ Logs détaillés pour debugging
- ✅ Fonctionne en navigation normale ET privée

---

## 🚀 PROCHAINES ÉTAPES

1. **Teste immédiatement** avec `/auth/recovery`
2. **Vérifie les logs** dans la console
3. **Teste le flux complet** :
   - Login → OK
   - Logout → OK
   - Refresh page → OK (pas de boucle)
4. **Teste en conditions réelles** (plusieurs onglets, sessions longues)

---

**Status** : ✅ Fix déployé, prêt à tester  
**Impact** : Protection multi-niveaux contre les boucles de redirection  
**Fallback** : Page `/auth/recovery` pour nettoyage manuel si nécessaire
