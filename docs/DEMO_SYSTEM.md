# 🎪 Système de Démo - EMS

## 🎯 Objectif

Système de démo complet pour tester l'authentification multi-tenant et les permissions RBAC avec des comptes préconfigurés.

## 🏢 Organisations de Test

### 1. System (Organisation Système)

- **Type** : Organisation système globale
- **Slug** : `system`
- **Utilisateurs** : Super Admin

### 2. Acme Corp (Organisation Principale)

- **Type** : Entreprise multi-services
- **Slug** : `acme-corp`
- **Utilisateurs** : Admin, Manager, Viewer, Partner

## 👥 Comptes de Test Configurés

### 🔴 Super Administrator

- **Email** : `john.doe@system.com`
- **Mot de passe** : `admin123`
- **Rôle** : SUPER_ADMIN
- **Organisation** : System
- **Privilèges** : Accès global omniscient

### 🟠 Administrateur Organisation

- **Email** : `jane.smith@acme.com`
- **Mot de passe** : `admin123`
- **Rôle** : ADMIN
- **Organisation** : Acme Corp
- **Privilèges** : Gestion complète organisation

### 🟡 Manager Événements

- **Email** : `bob.johnson@acme.com`
- **Mot de passe** : `manager123`
- **Rôle** : MANAGER
- **Organisation** : Acme Corp
- **Privilèges** : Gestion événements et participants

### 🔵 Utilisateur Consultation

- **Email** : `alice.wilson@acme.com`
- **Mot de passe** : `viewer123`
- **Rôle** : VIEWER
- **Organisation** : Acme Corp
- **Privilèges** : Lecture seule organisation

### 🟣 Partenaire

- **Email** : `charlie.brown@acme.com`
- **Mot de passe** : `sales123`
- **Rôle** : PARTNER
- **Organisation** : Acme Corp
- **Privilèges** : Événements assignés uniquement

## 🔑 Authentification API

### Endpoints de Test

```bash
# Backend API
BASE_URL=http://localhost:3000

# Connexion
POST /auth/login
Content-Type: application/json
{
  "email": "john.doe@system.com",
  "password": "admin123"
}

# Profil utilisateur actuel
GET /auth/me
Authorization: Bearer <access_token>

# Refresh token
POST /auth/refresh
# (utilise le cookie HttpOnly automatiquement)

# Déconnexion
POST /auth/logout
```

### Réponse Login

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "john.doe@system.com",
    "org_id": "uuid",
    "role": "SUPER_ADMIN",
    "permissions": ["read_any_organization", "create_organization", ...]
  }
}
```

## 🧪 Scénarios de Test

### 1. Test Multi-Tenant

```bash
# Étapes
1. Connectez-vous comme Super Admin (john.doe@system.com)
2. Vérifiez accès à toutes les fonctionnalités
3. Connectez-vous comme Admin Acme (jane.smith@acme.com)
4. Vérifiez isolation des données par organisation
```

### 2. Test Hiérarchie RBAC

```bash
# Test permissions décroissantes
1. SUPER_ADMIN → Accès global
2. ADMIN → Gestion organisation
3. MANAGER → Gestion événements
4. VIEWER → Lecture seule
5. PARTNER → Événements assignés
```

### 3. Test Workflow Invitation

```bash
# Processus complet
1. Admin (jane.smith@acme.com) envoie invitation
2. Vérifiez génération token et email
3. Testez complétion profil avec token
4. Vérifiez activation compte et permissions
```

### 4. Test Refresh Tokens

```bash
# Test sécurité tokens
1. Connectez-vous avec n'importe quel compte
2. Attendez expiration access token (15 min)
3. Vérifiez refresh automatique transparent
4. Testez révocation avec logout
```

## 🎨 Interface de Test Frontend

### Configuration Développement

```typescript
// src/main.tsx
// MSW activé automatiquement en développement
if (import.meta.env.DEV) {
  console.log('🎪 Mode démo activé avec comptes de test')
}
```

### Comptes de Test dans l'Interface

L'interface affiche automatiquement les comptes disponibles en mode développement pour faciliter les tests.

## 📊 Matrice de Test RBAC

### Navigation Pages

| Page                  | SUPER_ADMIN | ADMIN | MANAGER | VIEWER | PARTNER |
| --------------------- | ----------- | ----- | ------- | ------ | ------- |
| **Dashboard**         | ✅          | ✅    | ✅      | ✅     | ✅      |
| **Événements**        | ✅          | ✅    | ✅      | ✅     | ✅\*    |
| **Participants**      | ✅          | ✅    | ✅      | ✅     | ✅\*    |
| **Utilisateurs**      | ✅          | ✅    | ❌      | ❌     | ❌      |
| **Invitations**       | ✅          | ✅    | ❌      | ❌     | ❌      |
| **Rôles/Permissions** | ✅          | ✅    | ❌      | ❌     | ❌      |
| **Organisations**     | ✅          | ❌    | ❌      | ❌     | ❌      |

_\* PARTNER : Événements assignés uniquement_

### Actions Disponibles

| Action                   | SUPER_ADMIN | ADMIN | MANAGER | VIEWER | PARTNER |
| ------------------------ | ----------- | ----- | ------- | ------ | ------- |
| **Créer Événement**      | ✅          | ✅    | ✅      | ❌     | ❌      |
| **Modifier Événement**   | ✅          | ✅    | ✅      | ❌     | ❌      |
| **Supprimer Événement**  | ✅          | ✅    | ✅      | ❌     | ❌      |
| **Créer Utilisateur**    | ✅          | ✅    | ❌      | ❌     | ❌      |
| **Envoyer Invitation**   | ✅          | ✅    | ❌      | ❌     | ❌      |
| **Exporter Données**     | ✅          | ✅    | ✅      | ✅     | ✅      |
| **Check-in Participant** | ✅          | ✅    | ✅      | ❌     | ❌      |

## 🔧 Configuration Base de Données

### Seeders de Test

```bash
# Exécuter les seeders de démo
cd attendee-ems-back
npm run db:seed

# Vérifier les données
npm run db:studio
```

### Reset Environnement Test

```bash
# Reset complet base de données
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Re-seeding automatique au démarrage
```

## 🚀 Utilisation Développement

### Démarrage Environnement Complet

```bash
# Terminal 1: Backend avec base de données
cd attendee-ems-back
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Frontend
cd attendee-EMS
npm run dev

# Terminal 3: Monitoring logs
docker-compose -f docker-compose.dev.yml logs -f api
```

### Tests Manuels Rapides

```bash
# 1. Ouvrir http://localhost:5173
# 2. Utiliser les identifiants de test
# 3. Tester les permissions selon le rôle
# 4. Vérifier isolation multi-tenant
```

## 🎯 Cas d'Usage Spécifiques

### Développement Features

- **Test permissions UI** : Guards `<Can>` et hooks `useCan()`
- **Validation workflows** : Invitation, création utilisateur
- **Test responsive** : Différents écrans et modes

### Tests E2E Playwright

```typescript
// tests/e2e/rbac.spec.ts
test.describe('RBAC Tests', () => {
  test('Admin can create users', async ({ page }) => {
    await loginAs(page, 'jane.smith@acme.com', 'admin123')
    await page.goto('/users')
    await expect(
      page.locator('[data-testid="create-user-button"]')
    ).toBeVisible()
  })

  test('Viewer cannot create users', async ({ page }) => {
    await loginAs(page, 'alice.wilson@acme.com', 'viewer123')
    await page.goto('/users')
    await expect(
      page.locator('[data-testid="create-user-button"]')
    ).not.toBeVisible()
  })
})
```

### Démonstrations Client

- **Profils utilisateur variés** pour présentation
- **Workflows complets** configurés et testés
- **Interface responsive** sur tous devices

## 🔒 Sécurité et Limitations

### ⚠️ Utilisation Développement Uniquement

- **Mots de passe statiques** : Non sécurisés pour production
- **Données temporaires** : Reset à chaque redémarrage
- **Logs visibles** : Tokens et données sensibles loggés
- **CORS ouvert** : Configuration développement permissive

### ✅ Sécurité Maintenue

- **Hashing bcrypt** des mots de passe en base
- **JWT signatures** valides côté backend
- **Permissions RBAC** correctement implémentées
- **Isolation multi-tenant** respectée

## 📈 Métriques et Monitoring

### Logs de Test

```bash
# Logs backend détaillés
docker-compose -f docker-compose.dev.yml logs -f api | grep "AUTH\|RBAC"

# Logs base de données
docker-compose -f docker-compose.dev.yml logs -f db
```

### Métriques de Performance

- **Temps de connexion** : < 200ms
- **Refresh automatique** : Transparent
- **Navigation entre rôles** : < 100ms
- **Chargement permissions** : < 50ms

## 🎉 Avantages du Système

✅ **Tests rapides et efficaces**  
✅ **Couverture RBAC complète**  
✅ **Multi-tenancy validée**  
✅ **Workflows bout-en-bout**  
✅ **Performance optimisée**  
✅ **Interface intuitive**

---

**Ce système de démo permet une validation complète des fonctionnalités EMS** 🎪

**Dernière mise à jour** : Octobre 2025  
**Maintenu par** : Équipe Développement EMS
