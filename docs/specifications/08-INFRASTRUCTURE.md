# Section 8 - Infrastructure et Déploiement

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 7](./07-FONCTIONNALITES.md)

---

## 8.1 Architecture d'Infrastructure

### 8.1.1 Environnements

```
┌──────────────┬─────────────────┬─────────────────────┬───────────────────┐
│ Environment  │ Purpose         │ Hosting             │ Database          │
├──────────────┼─────────────────┼─────────────────────┼───────────────────┤
│ Development  │ Dev local       │ Docker local        │ PostgreSQL local  │
│ Staging      │ Tests pré-prod  │ VPS Debian          │ PostgreSQL VPS    │
│ Production   │ Utilisation     │ Google Cloud / VPS  │ Cloud SQL / VPS   │
└──────────────┴─────────────────┴─────────────────────┴───────────────────┘
```

### 8.1.2 Stack Docker

**Backend (`attendee-ems-back`)** :
```yaml
# docker-compose.prod.yml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: attendee-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - R2_PUBLIC_URL=${R2_PUBLIC_URL}
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    container_name: attendee-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./attendee-ems-front/dist:/var/www/frontend:ro
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Dockerfile Backend (Multi-stage)** :
```dockerfile
# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
```

**Frontend (Vite build)** :
- Build static : `npm run build` → `dist/`
- Servi par NGINX
- Assets optimisés (minification, gzip, cache headers)

---

## 8.2 Base de Données PostgreSQL

### 8.2.1 Schéma Prisma

**Gestion des migrations** :
```bash
# Créer une migration
npx prisma migrate dev --name add_sessions_table

# Appliquer en production
npx prisma migrate deploy

# Reset (DEV ONLY)
npx prisma migrate reset
```

**Versions** :
- PostgreSQL 16.x
- Prisma Client 5.x
- Connexion pooling activé

### 8.2.2 Seeders

**1. Seed Local (développement)** :
```bash
./seed-local.sh
```
Contenu :
- Organisation de test
- Utilisateur SUPER_ADMIN
- Rôles et permissions
- Événement de démo
- 50+ inscriptions test

**2. Seed Production** :
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f seed-production.sql
```
Contenu :
- Rôles système (SUPER_ADMIN → ATTENDEE)
- Permissions système (31 permissions)
- Assignation permissions aux rôles
- Admin initial

**3. Seed Admin (création premier admin)** :
```sql
-- seed-admin.sql
INSERT INTO "User" (id, email, "firstName", "lastName", "passwordHash", "isActive")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  'Super',
  'Admin',
  '$2b$10$...', -- bcrypt hash of 'Admin123!'
  true
);
```

### 8.2.3 Backup et Restauration

**Backup automatique** (cron quotidien) :
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="attendee_ems"

# Backup complet
pg_dump -h localhost -U postgres $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Conserver 30 derniers jours
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

**Restauration** :
```bash
# Décompresser et restaurer
gunzip -c backup_2026-01-15.sql.gz | psql -h localhost -U postgres -d attendee_ems
```

---

## 8.3 NGINX Reverse Proxy

### 8.3.1 Configuration

**`nginx/nginx.conf`** :
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Upstream backend
    upstream backend {
        server backend:3000;
    }

    # HTTP → HTTPS redirect
    server {
        listen 80;
        server_name attendee.example.com;
        return 301 https://$host$request_uri;
    }

    # HTTPS Server
    server {
        listen 443 ssl http2;
        server_name attendee.example.com;

        # SSL Let's Encrypt
        ssl_certificate /etc/letsencrypt/live/attendee.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/attendee.example.com/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Frontend (React SPA)
        location / {
            root /var/www/frontend;
            try_files $uri $uri/ /index.html;
            expires 1h;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket (Socket.IO)
        location /socket.io/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Downloads (fichiers statiques si locaux)
        location /downloads/ {
            alias /var/www/downloads/;
            autoindex off;
            expires 7d;
        }
    }
}
```

### 8.3.2 Let's Encrypt SSL

**Installation Certbot** :
```bash
apt-get install certbot python3-certbot-nginx
```

**Obtenir certificat** :
```bash
certbot --nginx -d attendee.example.com -d www.attendee.example.com
```

**Renouvellement automatique** :
```bash
# Cron job
0 3 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

---

## 8.4 Stockage de Fichiers

### 8.4.1 Cloudflare R2

**Configuration** :
```typescript
// src/modules/storage/r2.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export class R2Service {
  private s3Client: S3Client

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY
      }
    })
  }

  async upload(buffer: Buffer, key: string, contentType: string) {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }))
    
    return `${process.env.R2_PUBLIC_URL}/${key}`
  }
}
```

**Structure des fichiers** :
```
r2-bucket/
├── badges/
│   ├── {orgId}/
│   │   ├── {eventId}/
│   │   │   ├── {registrationId}.pdf
│   │   │   └── {registrationId}.png
├── exports/
│   ├── {orgId}/
│   │   └── attendees_export_{timestamp}.xlsx
└── uploads/
    └── {orgId}/
        └── logo.png
```

**Avantages** :
- Compatibilité S3 API
- CDN intégré (Cloudflare)
- Coûts très bas (pas d'egress fees)
- Durabilité 99.999999999%

---

## 8.5 Déploiement

### 8.5.1 Processus de Déploiement Manuel

**Backend** :
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Déploiement backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Restart service
pm2 restart attendee-backend

echo "✅ Déploiement terminé"
```

**Frontend** :
```bash
#!/bin/bash
# deploy-front.sh

set -e

echo "🚀 Déploiement frontend..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build
npm run build

# Copy to NGINX
rm -rf /var/www/frontend/*
cp -r dist/* /var/www/frontend/

# Reload NGINX
systemctl reload nginx

echo "✅ Déploiement terminé"
```

### 8.5.2 Variables d'Environnement

**Backend `.env`** :
```env
# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://attendee.example.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/attendee_ems?schema=public

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_REFRESH_SECRET=your_refresh_secret_change_this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key
R2_BUCKET_NAME=attendee-ems-bucket
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Email
EMAIL_ENABLED=true
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@attendee.fr
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@attendee.fr
SMTP_FROM_NAME=Attendee EMS

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Frontend `.env`** :
```env
VITE_API_URL=https://attendee.example.com/api
VITE_WS_URL=wss://attendee.example.com
VITE_PUBLIC_FORM_URL=https://attendee.example.com/public
```

### 8.5.3 PM2 Process Manager

**Configuration `ecosystem.config.js`** :
```javascript
module.exports = {
  apps: [{
    name: 'attendee-backend',
    script: 'dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
}
```

**Commandes** :
```bash
# Start
pm2 start ecosystem.config.js

# Restart
pm2 restart attendee-backend

# Logs
pm2 logs attendee-backend

# Status
pm2 status

# Monitoring
pm2 monit
```

---

## 8.6 Monitoring et Logs

### 8.6.1 Sentry (Error Tracking)

**Installation** :
```bash
npm install @sentry/node @sentry/tracing
```

**Configuration** :
```typescript
// main.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true })
  ]
})

// Exception filter
@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception)
    // ... handle exception
  }
}
```

### 8.6.2 Logs Structurés

**Winston Logger** :
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})
```

### 8.6.3 Health Checks

**Endpoint de santé** :
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  }

  @Get('db')
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return { database: 'ok' }
    } catch (error) {
      throw new ServiceUnavailableException('Database unavailable')
    }
  }
}
```

**Monitoring externe** :
- UptimeRobot : ping toutes les 5 minutes
- Alertes email si down

---

## 8.7 Sécurité Infrastructure

### 8.7.1 Firewall (UFW)

```bash
# Autoriser SSH
ufw allow 22/tcp

# Autoriser HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Deny all other inbound
ufw default deny incoming
ufw default allow outgoing

# Enable firewall
ufw enable
```

### 8.7.2 Fail2Ban (Protection Bruteforce)

**Configuration** :
```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 600
```

### 8.7.3 Mises à Jour Automatiques

**Unattended Upgrades** :
```bash
apt-get install unattended-upgrades

# Configure auto updates
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 8.8 CI/CD (Optionnel)

### 8.8.1 GitHub Actions

**`.github/workflows/deploy.yml`** :
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./attendee-ems-back
        run: npm ci
      
      - name: Run tests
        working-directory: ./attendee-ems-back
        run: npm test
      
      - name: Build
        working-directory: ./attendee-ems-back
        run: npm run build
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/attendee-ems-back
            git pull
            npm ci
            npx prisma migrate deploy
            npm run build
            pm2 restart attendee-backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./attendee-ems-front
        run: npm ci
      
      - name: Build
        working-directory: ./attendee-ems-front
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "attendee-ems-front/dist/*"
          target: "/var/www/frontend/"
          strip_components: 2
      
      - name: Reload NGINX
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: systemctl reload nginx
```

---

## 8.9 Scaling et Performance

### 8.9.1 Stratégies de Scaling

**Horizontal Scaling (Backend)** :
- PM2 Cluster Mode : plusieurs instances Node.js
- Load Balancer : NGINX upstream avec plusieurs backends
- Sessions JWT : stateless, pas de session server-side

**Vertical Scaling** :
- Augmenter RAM/CPU du VPS
- Optimiser queries Prisma
- Caching avec Redis (futur)

### 8.9.2 Optimisations Performance

**Database** :
- Indexes sur colonnes fréquemment requêtées
- Connection pooling
- Pagination systématique (limit/offset)

**API** :
- Response compression (gzip)
- ETags pour cache HTTP
- Rate limiting (protection DDoS)

**Frontend** :
- Code splitting (Vite)
- Lazy loading des routes
- Image optimization
- Service Worker (PWA)

---

## 8.10 Disaster Recovery

### 8.10.1 Plan de Sauvegarde

**Quotidien** :
- Backup PostgreSQL complet
- Upload vers Cloudflare R2
- Rétention : 30 jours

**Hebdomadaire** :
- Backup complet serveur (snapshots VPS)
- Rétention : 8 semaines

**Mensuel** :
- Archive long terme sur stockage externe
- Rétention : 12 mois

### 8.10.2 Procédure de Restauration

1. **Restaurer base de données**
   ```bash
   psql -h localhost -U postgres -d attendee_ems < backup_latest.sql
   ```

2. **Restaurer code**
   ```bash
   git clone https://github.com/org/attendee-ems-back.git
   git checkout <commit-hash>
   npm ci
   npm run build
   ```

3. **Restaurer fichiers R2**
   - Les fichiers R2 ne sont pas affectés (stockage séparé)

4. **Restart services**
   ```bash
   pm2 restart all
   systemctl restart nginx
   ```

### 8.10.3 RTO et RPO

- **RTO (Recovery Time Objective)** : < 4 heures
- **RPO (Recovery Point Objective)** : < 24 heures (backup quotidien)

---

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md)

---

**🎉 Fin du Cahier des Charges Technique**
