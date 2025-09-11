# Système de Démo Multi-Organisations

Ce document décrit le système de démo créé pour tester l'authentification multi-tenant et les permissions RBAC.

## 🎯 Objectif

Permettre de tester facilement différents rôles et permissions à travers plusieurs organisations fictives, sans avoir besoin d'une base de données réelle.

## 🏢 Organisations de Démo

### 1. TechCorp (org-1)
- **Type** : Entreprise technologique
- **Plan** : Enterprise
- **Timezone** : Europe/Paris
- **Utilisateurs** : 4 (Super Admin, Admin, Manager, Staff)

### 2. Creative Agency (org-2)
- **Type** : Agence créative
- **Plan** : Professional
- **Timezone** : Europe/London
- **Utilisateurs** : 3 (Admin, Partner, ReadOnly)

### 3. Startup Hub (org-3)
- **Type** : Hub de startups
- **Plan** : Basic
- **Timezone** : America/New_York
- **Utilisateurs** : 2 (Admin, Manager)

## 👥 Comptes de Test

### Super Admin
- **Email** : `super@admin.com`
- **Rôle** : ORG_ADMIN
- **Privilèges** : Peut naviguer entre toutes les organisations
- **Usage** : Tests d'administration globale

### TechCorp Users
- **admin@techcorp.com** - Administrateur complet
- **manager@techcorp.com** - Gestionnaire d'événements
- **staff@techcorp.com** - Personnel de check-in

### Creative Agency Users
- **admin@creative.com** - Administrateur complet
- **partner@creative.com** - Partenaire avec accès limité
- **readonly@creative.com** - Consultation uniquement

### Startup Hub Users
- **admin@startup.com** - Administrateur complet
- **manager@startup.com** - Gestionnaire organisation

## 🔑 Authentification

**Mot de passe universel** : `demo123`

### Endpoints API Démo

```typescript
// Connexion
POST /api/auth/login
{
  "email": "super@admin.com",
  "password": "demo123",
  "orgId": "org-1" // optionnel
}

// Profil utilisateur
GET /api/auth/me
Header: Authorization: Bearer <token>

// Liste des organisations (super admin)
GET /api/organizations

// Changement d'organisation (super admin)
POST /api/auth/switch-org
{
  "orgId": "org-2"
}

// Règles CASL
GET /api/auth/policy/:orgId
```

## 🎪 Interface de Démo

### DemoLoginPanel
Composant React affiché uniquement en développement sur la page de login.

**Fonctionnalités** :
- Liste tous les comptes de démo
- Connexion en un clic
- Descriptions des rôles
- Notifications toast de succès/erreur

**Utilisation** :
```tsx
import { DemoLoginPanel } from '@/shared/ui/DemoLoginPanel'

// Affiché seulement en mode dev
{import.meta.env.DEV && <DemoLoginPanel />}
```

## 🧪 Scénarios de Test

### 1. Test Multi-Tenant
1. Connectez-vous comme Super Admin
2. Naviguez entre les organisations
3. Vérifiez que les données sont isolées par organisation

### 2. Test des Rôles
1. Connectez-vous avec différents rôles
2. Vérifiez les permissions d'accès aux pages
3. Testez les actions autorisées/interdites

### 3. Test CASL RBAC
1. Utilisez les guards `<Can>` et `<GuardedRoute>`
2. Vérifiez les hooks `useCan()` et `useAbility()`
3. Testez les conditions contextuelles

## 📂 Structure des Fichiers

```
src/mocks/
├── auth-demo.ts          # Données et handlers MSW
├── handlers.ts           # Integration avec MSW
src/shared/ui/
├── DemoLoginPanel.tsx    # Interface de sélection
src/pages/Login/
├── index.tsx            # Page login avec panel démo
```

## 🔧 Configuration

### Activation/Désactivation
Le système de démo est automatiquement activé en mode développement :

```typescript
// Dans handlers.ts
import { authDemoHandlers } from './auth-demo'

export const handlers = [
  ...existingHandlers,
  ...authDemoHandlers  // Ajout des handlers démo
]
```

### Variables d'Environnement
Aucune configuration supplémentaire requise. Le système utilise les mocks MSW existants.

## 🚀 Utilisation en Développement

1. **Démarrer le serveur de dev** :
   ```bash
   npm run dev
   ```

2. **Accéder à la page de login** :
   - Le panneau de démo apparaît automatiquement

3. **Tester les comptes** :
   - Cliquer sur "Se connecter" pour n'importe quel compte
   - Observer les toasts de notification
   - Naviguer dans l'application avec les permissions du rôle

## 🎯 Cas d'Usage

### Développement Frontend
- Test rapide des permissions UI
- Validation des composants protégés
- Vérification des flows utilisateur

### Tests E2E
- Scenarios multi-rôles automatisés
- Tests Playwright avec différents comptes
- Validation des parcours métier

### Démonstrations
- Présentation des fonctionnalités RBAC
- Démo client avec différents profils
- Formation équipe sur les permissions

## 🔒 Sécurité

⚠️ **Important** : Ce système est conçu uniquement pour le développement et les tests.

- Mots de passe statiques non sécurisés
- Tokens JWT simulés sans signature
- Données en mémoire non persistantes
- Ne jamais utiliser en production

## 🎉 Avantages

✅ **Tests rapides** : Connexion en un clic  
✅ **Multi-tenant** : 3 organisations préconfigurées  
✅ **RBAC complet** : 6 rôles différents  
✅ **Integration transparente** : Utilise MSW existant  
✅ **UI intuitive** : Panneau de sélection dédié  
✅ **Documentation** : Descriptions des rôles  

Cette approche permet de développer et tester efficacement les fonctionnalités multi-tenant et RBAC sans complexité d'infrastructure.
