# 🚀 Déploiement Multi-Environnement

## Environnements

### 🧪 VPS Staging (attendee.fr)
- **URL**: https://attendee.fr
- **API**: https://api.attendee.fr
- **Monitoring**: Sentry ✅
- **Usage**: Tests, démos, développement

### ☁️ Google Cloud Production (à venir)
- **URL**: https://app.attendee.fr (ou attendee.fr)
- **API**: https://api-prod.attendee.fr
- **Monitoring**: Google Cloud Logging ✅
- **Usage**: Production clients réels

---

## 🔨 Build & Deploy

### Build pour VPS (avec Sentry)
```bash
npm run build:vps
```

### Build pour Google Cloud (sans Sentry)
```bash
npm run build:gcloud
```

### Déployer sur VPS
```bash
npm run build:vps
ssh root@51.75.252.74
/opt/ems-attendee/deploy-front.sh
```

---

## ⚙️ Configuration

### VPS (.env.production.vps)
- Sentry activé
- API: api.attendee.fr

### Google Cloud (.env.production.gcloud)
- Sentry désactivé (utilise Google Cloud Logging)
- API: api-prod.attendee.fr

---

## 📊 Monitoring

### VPS
- **Frontend**: Sentry (erreurs JS, performance, session replay)
- **Backend**: Google Cloud Logging (après migration)

### Google Cloud
- **Frontend**: Google Cloud Error Reporting
- **Backend**: Google Cloud Logging

---

## 🔐 Secrets

⚠️ **Les fichiers `.env.production.vps` et `.env.production.gcloud` ne sont PAS commités !**

### Setup Initial

1. Copier les templates :
```bash
cp .env.production.vps.example .env.production.vps
cp .env.production.gcloud.example .env.production.gcloud
```

2. Remplir les vraies valeurs (DSN Sentry, etc.)

Les fichiers suivants sont gitignorés :
- `.env.production` (généré automatiquement)
- `.env.production.vps` (contient DSN Sentry - secret !)
- `.env.production.gcloud` (peut contenir secrets GCloud)

Les fichiers suivants sont commités :
- `.env.production.vps.example` (template sans secrets)
- `.env.production.gcloud.example` (template sans secrets)
