# ⚙️ Guide de Configuration des Variables d'Environnement

Ce guide détaillé explique comment configurer toutes les variables d'environnement nécessaires pour le frontend EMS.

---

## 📋 Vue d'ensemble

Le frontend utilise **Vite** comme bundler, qui expose les variables d'environnement avec le préfixe `VITE_`.

### Fichiers de configuration

- `.env.example` : Template de référence (commité dans Git)
- `.env` : Configuration locale (ignoré par Git)
- `.env.production` : Variables de production (ignoré par Git)
- `.env.staging` : Variables de staging (ignoré par Git)

**⚠️ IMPORTANT** : Ne jamais commiter de fichiers `.env` contenant de vraies clés API dans Git.

---

## 🔧 Variables Requises

### 1. Configuration API Backend

#### `VITE_API_BASE_URL`

**Description** : URL de base de l'API backend NestJS.

**Valeurs courantes** :
```env
# Développement local
VITE_API_BASE_URL=http://localhost:3000

# Docker local
VITE_API_BASE_URL=http://localhost:3000

# Staging
VITE_API_BASE_URL=https://api-staging.votredomaine.com

# Production
VITE_API_BASE_URL=https://api.votredomaine.com
```

**📝 Configuration** :
1. Assurez-vous que le backend est accessible à cette URL
2. En production, utilisez **HTTPS uniquement**
3. Pas de slash `/` à la fin de l'URL
4. Configurer CORS sur le backend pour autoriser ce domaine frontend

**✅ Test** :
```bash
# Vérifier que l'API est accessible
curl $VITE_API_BASE_URL/health
```

**🔧 Dépannage** :
- ❌ `Network Error` → Vérifier que le backend est démarré
- ❌ `CORS Error` → Configurer `API_CORS_ORIGIN` dans le backend
- ❌ `404 Not Found` → Vérifier l'URL de base

---

### 2. Version de l'Application

#### `VITE_APP_VERSION`

**Description** : Numéro de version de l'application (affiché dans le footer/about).

**Format** : Semantic Versioning (SemVer)

```env
VITE_APP_VERSION=1.0.0
```

**📝 Bonnes pratiques** :
- `MAJOR.MINOR.PATCH` (ex: `2.1.5`)
- Incrémenter à chaque release
- Synchroniser avec `package.json`
- Afficher dans l'UI pour debug

**Usage dans le code** :
```typescript
import { env } from '@/shared/config/env'

console.log('App version:', env.VITE_APP_VERSION)
```

---

## 🗺️ Variables Optionnelles

### 3. Google Maps API (Optionnel)

#### `VITE_GOOGLE_MAPS_API_KEY`

**Description** : Clé API Google Maps pour afficher des cartes interactives (localisation d'événements).

**Format** :
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC2N68FbZcV7NtT8d_ZNFuKpweG6_-Jf_o
```

**⚠️ Important** : Cette fonctionnalité est **optionnelle**. Si non configurée, la carte ne s'affichera pas mais l'application fonctionnera normalement.

#### 📝 Obtenir une clé Google Maps API

##### Étape 1 : Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un compte (carte bancaire requise, mais **gratuit jusqu'à 28 000 chargements de carte/mois**)
3. Créer un nouveau projet : **Cliquer** sur le sélecteur de projet en haut → **New Project**
4. Nom du projet : `EMS Production` (ou autre nom)
5. Cliquer **Create**

##### Étape 2 : Activer l'API Maps JavaScript

1. Dans le menu, aller dans **APIs & Services** → **Library**
2. Rechercher `Maps JavaScript API`
3. Cliquer sur **Maps JavaScript API**
4. Cliquer **Enable**
5. Répéter pour `Geocoding API` (si vous utilisez la géolocalisation)

##### Étape 3 : Créer une clé API

1. Aller dans **APIs & Services** → **Credentials**
2. Cliquer **+ CREATE CREDENTIALS** → **API key**
3. Une clé sera générée : `AIzaSyC...` (42 caractères)
4. **⚠️ Copier immédiatement** cette clé

##### Étape 4 : Sécuriser la clé API (IMPORTANT)

🔐 **Ne jamais utiliser une clé non restreinte en production !**

1. Cliquer sur le nom de la clé créée
2. Section **Application restrictions** :
   - Sélectionner **HTTP referrers (web sites)**
   - Ajouter vos domaines autorisés :
     ```
     http://localhost:5173/*       (développement local)
     https://votredomaine.com/*    (production)
     https://www.votredomaine.com/*
     ```
3. Section **API restrictions** :
   - Sélectionner **Restrict key**
   - Cocher uniquement :
     - ✅ Maps JavaScript API
     - ✅ Geocoding API (si utilisé)
4. Cliquer **Save**

##### Étape 5 : Configuration dans .env

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC2N68FbZcV7NtT8d_ZNFuKpweG6_-Jf_o
```

#### 💰 Tarification Google Maps

- **Gratuit** : 28 000 chargements de carte/mois
- **Au-delà** : $7 par 1000 chargements supplémentaires
- **Crédit mensuel** : $200 de crédit gratuit (couvre ~28k chargements)

**💡 Pour la plupart des applications**, vous resterez dans le tier gratuit.

#### ✅ Tester votre configuration

```bash
# 1. Ajouter la clé dans .env
echo "VITE_GOOGLE_MAPS_API_KEY=AIzaSyC..." >> .env

# 2. Redémarrer le serveur de développement
npm run dev

# 3. Accéder à la page d'un événement avec localisation
# La carte devrait s'afficher
```

**Messages attendus dans la console** :
- ✅ `Google Maps loaded successfully`
- ❌ `Google Maps API key is missing` → Ajouter `VITE_GOOGLE_MAPS_API_KEY`
- ❌ `RefererNotAllowedMapError` → Ajouter votre domaine dans les restrictions
- ❌ `ApiNotActivatedMapError` → Activer Maps JavaScript API

#### 🔧 Dépannage Google Maps

##### Erreur : "This page can't load Google Maps correctly"

**Causes possibles** :
1. ❌ Clé API invalide → Vérifier la clé copiée
2. ❌ APIs non activées → Activer Maps JavaScript API et Geocoding API
3. ❌ Restrictions trop strictes → Vérifier les HTTP referrers
4. ❌ Facturation non activée → Ajouter une carte bancaire (tier gratuit disponible)

**Solutions** :
```bash
# Vérifier que la clé est bien chargée
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

# Tester la clé directement
curl "https://maps.googleapis.com/maps/api/js?key=VOTRE_CLE"
```

##### Erreur : "RefererNotAllowedMapError"

Votre domaine n'est pas autorisé.

**Solution** :
1. Google Cloud Console → **Credentials** → Votre clé
2. **Application restrictions** → Ajouter :
   ```
   http://localhost:5173/*
   https://votredomaine.com/*
   ```
3. Sauvegarder et attendre 5 minutes (propagation)

##### Carte ne s'affiche pas mais pas d'erreur

**Solution** :
```typescript
// Vérifier que le composant Map est bien rendu
import { Map } from '@/shared/ui/Map'

<Map
  center={{ lat: 48.8566, lng: 2.3522 }}
  zoom={12}
  apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
/>
```

---

### 4. Sentry (Monitoring) - Optionnel

#### `VITE_SENTRY_DSN`

**Description** : Data Source Name de Sentry pour le monitoring des erreurs en production.

**Format** :
```env
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

**⚠️ Optionnel** : Si non configuré, les erreurs seront uniquement loggées dans la console.

#### 📝 Obtenir un DSN Sentry

##### Étape 1 : Créer un compte Sentry

1. Aller sur https://sentry.io
2. Créer un compte (gratuit jusqu'à 5000 événements/mois)
3. Créer une organisation

##### Étape 2 : Créer un projet

1. Cliquer **Create Project**
2. **Platform** : Choisir `React`
3. **Alert frequency** : Choisir votre préférence
4. **Project name** : `ems-frontend-production`
5. Cliquer **Create Project**

##### Étape 3 : Copier le DSN

Sentry affichera votre DSN :
```
https://abc123def456@o123456.ingest.sentry.io/789012
```

##### Étape 4 : Configuration

```env
# Production uniquement (ne pas activer en dev)
VITE_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/789012
```

#### ✅ Tester Sentry

```typescript
// Déclencher une erreur de test
import * as Sentry from '@sentry/react'

Sentry.captureException(new Error('Test Sentry'))
```

Vérifiez que l'erreur apparaît dans le dashboard Sentry.

#### 🔧 Configuration avancée Sentry

```typescript
// src/app/providers/SentryProvider.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE, // 'development' | 'production'
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

---

## 🔐 Sécurité des Variables d'Environnement

### ⚠️ Variables Publiques (VITE_)

**IMPORTANT** : Toutes les variables `VITE_*` sont **publiques** et exposées dans le bundle JavaScript.

**❌ Ne jamais mettre dans VITE_** :
- Secrets API backend
- Tokens d'authentification
- Clés privées
- Mots de passe
- Tokens de paiement

**✅ OK pour VITE_** :
- URL publiques (API, CDN)
- Clés API publiques (Google Maps, Sentry)
- Configuration UI (thème, langue par défaut)
- Version de l'application

### 🔒 Bonnes Pratiques

#### Développement Local

```env
# .env (développement)
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0-dev
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...._DEV_KEY  # Clé de dev restreinte
VITE_SENTRY_DSN=  # Désactivé en dev
```

#### Staging

```env
# .env.staging
VITE_API_BASE_URL=https://api-staging.votredomaine.com
VITE_APP_VERSION=1.0.0-rc.1
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...._STAGING_KEY
VITE_SENTRY_DSN=https://...@sentry.io/staging
```

#### Production

```env
# .env.production
VITE_API_BASE_URL=https://api.votredomaine.com
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...._PROD_KEY  # Clé restreinte aux domaines prod
VITE_SENTRY_DSN=https://...@sentry.io/production
```

### 🛡️ Protection des Secrets

#### Ne jamais commiter dans Git

```bash
# .gitignore (déjà configuré)
.env
.env.local
.env.production
.env.staging
*.env

# Seuls ces fichiers sont commitables
.env.example
```

#### Utiliser des gestionnaires de secrets

Pour la production :
- ✅ **Vercel** : Variables d'environnement dans le dashboard
- ✅ **Netlify** : Environment variables dans les settings
- ✅ **GitHub Actions** : Secrets dans Settings → Secrets
- ✅ **Docker** : Variables via docker-compose ou orchestrateur
- ✅ **Kubernetes** : ConfigMaps et Secrets

#### Scanner régulièrement

```bash
# Installer git-secrets
brew install git-secrets

# Scanner le repository
git secrets --scan

# Scanner l'historique Git
git secrets --scan-history
```

---

## 🧪 Validation de la Configuration

### Script de Validation

Créez un fichier `scripts/validate-env.ts` :

```typescript
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_VERSION: z.string().regex(/^\d+\.\d+\.\d+/),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional(),
  VITE_SENTRY_DSN: z.string().url().optional()
})

try {
  envSchema.parse(import.meta.env)
  console.log('✅ Configuration valide')
} catch (error) {
  console.error('❌ Configuration invalide:', error)
  process.exit(1)
}
```

### Tests de Configuration

```bash
# Vérifier que toutes les variables sont définies
npm run typecheck

# Tester l'API backend
curl $VITE_API_BASE_URL/health

# Tester Google Maps (si configuré)
curl "https://maps.googleapis.com/maps/api/js?key=$VITE_GOOGLE_MAPS_API_KEY"
```

---

## 📦 Configuration par Environnement

### Développement Local

```bash
# .env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0-dev
# VITE_GOOGLE_MAPS_API_KEY= (optionnel en dev)
# VITE_SENTRY_DSN= (désactivé en dev)
```

**Démarrage** :
```bash
npm run dev
```

### Staging

```bash
# .env.staging
VITE_API_BASE_URL=https://api-staging.votredomaine.com
VITE_APP_VERSION=1.0.0-rc.1
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...._STAGING
VITE_SENTRY_DSN=https://...@sentry.io/staging
```

**Build** :
```bash
npm run build -- --mode staging
```

### Production

```bash
# .env.production
VITE_API_BASE_URL=https://api.votredomaine.com
VITE_APP_VERSION=1.0.0
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...._PROD
VITE_SENTRY_DSN=https://...@sentry.io/production
```

**Build** :
```bash
npm run build -- --mode production
```

---

## 🔧 Dépannage Général

### Variables non chargées

**Symptôme** : `import.meta.env.VITE_API_BASE_URL` retourne `undefined`

**Solutions** :
1. ✅ Vérifier que le fichier `.env` existe à la racine
2. ✅ Vérifier le préfixe `VITE_` (obligatoire)
3. ✅ Redémarrer le serveur de développement
4. ✅ Pas d'espaces autour du `=` : `VITE_API_BASE_URL=http://...`

### Variables pas à jour après modification

**Symptôme** : Changement de `.env` non pris en compte

**Solutions** :
1. ✅ Arrêter le serveur (Ctrl+C)
2. ✅ Redémarrer : `npm run dev`
3. ✅ Vider le cache : `rm -rf node_modules/.vite`

### CORS Errors

**Symptôme** : `Access to fetch at 'http://localhost:3000' has been blocked by CORS`

**Solutions** :
1. ✅ Configurer `API_CORS_ORIGIN` dans le backend :
   ```env
   API_CORS_ORIGIN=http://localhost:5173,http://localhost:3001
   ```
2. ✅ Redémarrer le backend
3. ✅ Vérifier dans Chrome DevTools → Network → Headers

### Build échoue en production

**Symptôme** : `ReferenceError: process is not defined`

**Cause** : Utilisation de `process.env` au lieu de `import.meta.env`

**Solution** :
```typescript
// ❌ Ne fonctionne pas avec Vite
const apiUrl = process.env.VITE_API_BASE_URL

// ✅ Correct pour Vite
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

---

## 📚 Ressources Complémentaires

### Documentation Officielle

- **Vite Env Variables** : https://vitejs.dev/guide/env-and-mode.html
- **Google Maps JavaScript API** : https://developers.google.com/maps/documentation/javascript
- **Sentry for React** : https://docs.sentry.io/platforms/javascript/guides/react
- **Zod Validation** : https://zod.dev

### Outils Utiles

- **Env Validator** : https://www.npmjs.com/package/@t3-oss/env-core
- **Dotenv Vault** : https://www.dotenv.org/docs/security/vault
- **Git Secrets** : https://github.com/awslabs/git-secrets

### Support

Pour toute question sur la configuration :
1. Consulter le [README principal](../README.md)
2. Vérifier les [issues GitHub](https://github.com/Rabiegha/attendee-ems-front/issues)
3. Créer une [nouvelle issue](https://github.com/Rabiegha/attendee-ems-front/issues/new) avec tag `configuration`

---

<div align="center">

**Configuration réussie ? Passez au [développement](../README.md#-démarrage-rapide) !**

[⬆ Retour au README](../README.md)

</div>
