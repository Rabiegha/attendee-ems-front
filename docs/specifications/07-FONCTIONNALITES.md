# Section 7 - Fonctionnalités Métier Détaillées

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 6](./06-SECURITE.md) | [▶ Section 8](./08-INFRASTRUCTURE.md)

---

## 7.1 Gestion des Événements

### 7.1.1 Création d'Événement

**Workflow complet** :

1. **Informations de base**
   - Nom de l'événement (unique dans l'organisation)
   - Code (généré automatiquement ou personnalisé)
   - Description (Markdown supporté)
   - Dates de début et fin
   - Timezone

2. **Type et Localisation**
   - Type d'événement (configurable par organisation)
   - Secteur d'activité (configurable)
   - Mode : Physique / Online / Hybride
   - **Si physique** :
     - Recherche d'adresse avec Google Maps Autocomplete
     - Sélection sur carte interactive
     - Latitude/Longitude enregistrées
     - Adresse formatée automatiquement

3. **Capacité et Paramètres**
   - Capacité totale (optionnel)
   - Types de participants activés
   - Capacités par type
   - Mode de présence par défaut

4. **Configuration Avancée**
   - **Inscriptions** :
     - Auto-approbation (oui/non)
     - Formulaire personnalisé (JSON schema)
     - Vérification email obligatoire
   - **Check-in** :
     - Autoriser check-out (oui/non)
     - Géolocalisation requise (oui/non)
   - **Badges** :
     - Template par défaut
     - Règles d'attribution par type

5. **Paramètres Publics**
   - Token public unique (généré automatiquement)
   - URL d'inscription : `/public/events/{token}`
   - Personnalisation formulaire public :
     - Titre et description
     - Afficher/masquer logo
     - Couleur bouton submit
     - Texte bouton
     - Mode sombre

6. **Emails**
   - Sender configuré
   - Email de confirmation (template personnalisable)
   - Email de rappel (X heures avant)
   - Email d'approbation

### 7.1.2 Statuts d'Événement

```typescript
enum EventStatus {
  draft           // Brouillon, non visible publiquement
  published       // Publié, inscriptions ouvertes
  registration_closed  // Inscriptions fermées, événement visible
  archived        // Archivé, lecture seule
  cancelled       // Annulé
  postponed       // Reporté
}
```

**Transitions automatiques** (optionnel) :
- `draft` → `published` : À la date de début des inscriptions
- `published` → `registration_closed` : À la date de fin des inscriptions
- `published` → `archived` : 7 jours après la date de fin

**Transitions manuelles** :
- Toutes les transitions possibles via interface admin
- Confirmation requise pour annulation/archivage

### 7.1.3 Attribution d'Utilisateurs

**Event Assigned Users** :
- PARTNER et HOSTESS doivent être assignés manuellement aux événements
- Assignation via table `event_assigned_users`
- Limite l'accès aux seuls événements assignés

**Interface d'assignation** :
- Sélection multiple d'utilisateurs
- Filtrage par rôle
- Ajout/retrait en masse

### 7.1.4 Tags et Catégorisation

- **Tags réutilisables** au niveau organisation
- Création à la volée depuis formulaire événement
- Autocomplete intelligent
- Statistiques d'utilisation
- Filtrage par tags dans liste événements

### 7.1.5 Duplication d'Événement

**Fonctionnalité** : Copie rapide d'événement existant

**Éléments copiés** :
- ✅ Toutes les informations de base
- ✅ Settings complets
- ✅ Types de participants configurés
- ✅ Règles de badges
- ✅ Templates email
- ✅ Tags

**Éléments NON copiés** :
- ❌ Inscriptions
- ❌ Badges générés
- ❌ Check-ins
- ❌ Sessions

**Modifications automatiques** :
- Nouveau code généré
- Statut : `draft`
- Dates : à définir manuellement
- Token public : régénéré

---

## 7.2 Gestion des Participants (CRM)

### 7.2.1 Modèle Attendee (Profil Global)

**Concept** : Un participant est unique dans une organisation (identifié par email)

**Données stockées** :
```typescript
interface Attendee {
  // Identification
  id: string
  orgId: string
  email: string (unique par org)

  // Informations personnelles
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  jobTitle?: string
  country?: string

  // Catégorisation
  defaultTypeId?: string        // Type par défaut
  labels: string[]              // Tags libres
  notes?: string                // Notes internes

  // Métadonnées
  metadata: JSON                // Champs personnalisés
  isActive: boolean

  // Relations
  registrations: Registration[] // Historique inscriptions
  revisions: AttendeeRevision[] // Historique modifications
}
```

### 7.2.2 Historique et Révisions

**AttendeeRevision** : Chaque modification est tracée

```typescript
interface AttendeeRevision {
  changeType: 'created' | 'updated' | 'imported' | 'merged'
  source?: 'public_form' | 'manual' | 'import' | 'api'
  snapshot: JSON                // État complet au moment du changement
  changedBy?: string            // User ID
  note?: string                 // Commentaire
  changedAt: DateTime
}
```

**Cas d'usage** :
- Audit des modifications
- Rollback possible
- Analyse de l'évolution des données
- Détection de doublons/fusions

### 7.2.3 Import/Export Excel

**Import** :

1. **Template Excel** disponible via `/registrations/template`
   - Colonnes : Email, FirstName, LastName, Company, Phone, etc.
   - Validation des formats
   - Exemples en ligne 2

2. **Upload et Validation**
   - Parse Excel (ExcelJS)
   - Validation ligne par ligne
   - Rapport d'erreurs détaillé

3. **Upsert Intelligent**
   - Si email existe → Mise à jour
   - Si email nouveau → Création
   - Révision créée avec source `import`

**Export** :
- Tous les participants de l'organisation
- Ou participants d'un événement spécifique
- Format : Excel (.xlsx)
- Colonnes configurables

### 7.2.4 Déduplication

**Stratégie** :
- Email = clé unique par organisation
- Détection automatique lors de l'inscription
- Proposition de fusion manuelle
- Historique de fusions conservé

**Flow inscription avec doublon** :
```
1. Formulaire soumis avec email existant
2. Backend détecte attendee existant
3. Mise à jour des infos si différences
4. Création registration liée à l'attendee existant
5. ✅ Pas de doublon créé
```

---

## 7.3 Inscriptions (Registrations)

### 7.3.1 Modèle Registration

**Concept** : Une inscription = un attendee inscrit à un événement spécifique

```typescript
interface Registration {
  id: string
  orgId: string
  eventId: string
  attendeeId: string            // Lien vers profil global

  // État
  status: RegistrationStatus    // awaiting, approved, refused, cancelled
  source: RegistrationSource    // public_form, manual, import, mobile_app
  attendanceMode: AttendanceMode // onsite, online, hybrid

  // Type de participant pour cet événement
  eventAttendeeTypeId?: string

  // Formulaire personnalisé
  answers: JSON                 // Réponses aux champs custom

  // Snapshot (données au moment de l'inscription)
  snapshotEmail?: string
  snapshotFirstName?: string
  snapshotLastName?: string
  snapshotCompany?: string
  snapshotPhone?: string
  // ... permet de garder l'historique même si attendee modifié

  // Badge
  badgeTemplateId?: string
  badgePdfUrl?: string
  badgeImageUrl?: string

  // Présence
  checkedInAt?: DateTime
  checkedInBy?: string
  checkinLocation?: JSON        // { latitude, longitude }
  checkedOutAt?: DateTime
  checkedOutBy?: string
  checkoutLocation?: JSON

  // Dates
  invitedAt?: DateTime
  confirmedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime          // Soft delete

  // Relations
  attendee: Attendee
  event: Event
  badge?: Badge
}
```

### 7.3.2 Statuts de Registration

```typescript
enum RegistrationStatus {
  awaiting    // En attente d'approbation
  approved    // Approuvé, peut participer
  refused     // Refusé
  cancelled   // Annulé par le participant ou l'admin
}
```

**Workflow d'approbation** :

**Si auto-approbation activée** :
```
Inscription → approved (immédiat)
```

**Si approbation manuelle** :
```
Inscription → awaiting → Admin review → approved/refused
```

**Actions disponibles** :
- Approuver (awaiting → approved)
- Refuser (awaiting → refused)
- Annuler (approved → cancelled)

### 7.3.3 Check-in / Check-out

**Check-in** :
```typescript
POST /registrations/:id/checkin
{
  location?: {
    latitude: number
    longitude: number
  }
}

// Résultat
{
  checkedInAt: DateTime
  checkedInBy: string (userId)
  checkinLocation?: JSON
}
```

**Cas d'usage** :
- Check-in manuel depuis web
- Check-in via scan QR code (mobile)
- Check-in en masse (liste)

**Check-out** (optionnel) :
```typescript
POST /registrations/:id/checkout

// Résultat
{
  checkedOutAt: DateTime
  checkedOutBy: string
  checkoutLocation?: JSON
}
```

**Statistiques temps réel** :
- Total inscrits
- Présents (checked in)
- Absents (not checked in)
- Taux de présence
- Timeline de check-ins

### 7.3.4 Actions de Masse

**Disponibles** :
- ✅ Check-in multiple
- ✅ Check-out multiple
- ✅ Changement de statut (approve/refuse/cancel)
- ✅ Génération de badges en masse
- ✅ Suppression (soft delete)
- ✅ Restauration
- ✅ Suppression définitive (permanent delete)

**Interface** :
- Sélection par checkboxes
- Ou "Sélectionner tout" avec filtres appliqués
- Confirmation modale
- Feedback de progression

---

## 7.4 Système de Badges

### 7.4.1 Templates de Badges

**Éditeur Visuel (GrapesJS)** :
- Drag & drop de composants
- Texte, images, formes, QR code
- Variables dynamiques : `{{firstName}}`, `{{lastName}}`, `{{company}}`, etc.
- Styles CSS personnalisables
- Preview en temps réel
- Dimensions configurables (width, height en pixels)

**Structure Template** :
```typescript
interface BadgeTemplate {
  id: string
  orgId: string
  eventId?: string              // NULL = template global
  code: string
  name: string

  // Contenu
  html: string                  // HTML du template
  css: string                   // Styles CSS
  templateData: JSON            // Structure GrapesJS
  variables: JSON               // Variables disponibles

  // Dimensions
  width: number                 // Pixels
  height: number                // Pixels

  // Métadonnées
  isDefault: boolean            // Template par défaut
  isActive: boolean
  usageCount: number            // Nombre d'utilisations
  createdBy?: string
}
```

**Variables disponibles** :
```javascript
{
  registration: {
    id: "uuid",
    status: "approved",
    type: "VIP"
  },
  attendee: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    company: "Acme Corp",
    jobTitle: "CEO",
    phone: "+33612345678"
  },
  event: {
    name: "Tech Conference 2026",
    date: "2026-06-15",
    location: "Paris"
  },
  qrCode: "data:image/png;base64,..." // QR code en base64
}
```

### 7.4.2 Génération de Badges

**Processus** :

1. **Récupération des données**
   ```typescript
   const registration = await getRegistration(registrationId)
   const template = await getBadgeTemplate(registration.badgeTemplateId)
   const attendee = registration.attendee
   const event = registration.event
   ```

2. **Génération QR Code**
   ```typescript
   const qrCodeData = registration.id  // UUID
   const qrCodeBase64 = await QRCode.toDataURL(qrCodeData, {
     width: 200,
     margin: 1
   })
   ```

3. **Injection des variables**
   ```typescript
   let html = template.html
   html = html.replace('{{firstName}}', attendee.firstName)
   html = html.replace('{{lastName}}', attendee.lastName)
   html = html.replace('{{qrCode}}', `<img src="${qrCodeBase64}" />`)
   // ... toutes les variables
   ```

4. **Rendu Puppeteer**
   ```typescript
   const browser = await puppeteer.launch()
   const page = await browser.newPage()
   await page.setContent(html)
   await page.addStyleTag({ content: template.css })
   
   // Screenshot PNG
   const imageBuffer = await page.screenshot({
     type: 'png',
     clip: {
       x: 0,
       y: 0,
       width: template.width,
       height: template.height
     }
   })
   
   // PDF
   const pdfBuffer = await page.pdf({
     width: template.width,
     height: template.height,
     printBackground: true
   })
   
   await browser.close()
   ```

5. **Upload vers Cloudflare R2**
   ```typescript
   const imageKey = `badges/${orgId}/${eventId}/${registrationId}.png`
   const pdfKey = `badges/${orgId}/${eventId}/${registrationId}.pdf`
   
   const imageUrl = await r2Service.upload(imageBuffer, imageKey)
   const pdfUrl = await r2Service.upload(pdfBuffer, pdfKey)
   ```

6. **Enregistrement en base**
   ```typescript
   const badge = await prisma.badge.create({
     data: {
       registrationId,
       badgeTemplateId: template.id,
       eventId: event.id,
       orgId,
       status: 'completed',
       imageUrl,
       pdfUrl,
       qrCodeUrl: qrCodeBase64,
       htmlSnapshot: html,
       cssSnapshot: template.css,
       dataSnapshot: { attendee, event, registration },
       generatedAt: new Date(),
       generatedBy: userId
     }
   })
   ```

7. **Notification WebSocket**
   ```typescript
   websocketGateway.emitBadgeGenerated(orgId, {
     registrationId,
     badgeUrl: pdfUrl
   })
   ```

**Gestion des erreurs** :
- Si échec : statut `failed` + message d'erreur enregistré
- Retry automatique possible
- Logs détaillés pour debug

### 7.4.3 Règles d'Attribution (Badge Rules)

**Concept** : Attribuer automatiquement des templates différents selon le type de participant

```typescript
interface EventBadgeRule {
  id: string
  eventId: string
  badgeTemplateId: string
  name: string
  priority: number              // Ordre d'évaluation (0 = highest)
  isActive: boolean
  
  // Types de participants concernés
  attendeeTypes: EventAttendeeType[]
}
```

**Exemple** :
```
Règle 1 (Priority 0):
  Template: "VIP Badge Gold"
  Types: [VIP, SPEAKER]

Règle 2 (Priority 1):
  Template: "Standard Badge Blue"
  Types: [STANDARD, GUEST]
```

**Évaluation** :
1. Récupération du type de participant de la registration
2. Recherche de la règle avec la plus haute priorité qui match
3. Si aucune règle : utilisation du template par défaut de l'événement
4. Si pas de template par défaut : utilisation du template global de l'org

### 7.4.4 Impression

**Historique d'impression** :
```typescript
interface BadgePrint {
  id: string
  badgeId: string
  printedBy?: string
  printedAt: DateTime
}
```

**Compteur** :
- `badge.printCount` incrémenté à chaque impression
- `badge.lastPrintedAt` mis à jour

**Cas d'usage** :
- Suivi du nombre de badges imprimés
- Détection de badges perdus (réimpression)
- Statistiques d'impression

---

## 7.5 Sessions

### 7.5.1 Concept

**Session** = Sous-événement dans un événement principal

**Exemples** :
- Conférence avec plusieurs talks
- Salon avec différents espaces
- Ateliers parallèles

```typescript
interface Session {
  id: string
  eventId: string
  name: string
  description?: string
  startAt: DateTime
  endAt: DateTime
  location?: string
  capacity?: number
  
  // Types autorisés
  allowedAttendeeTypes: EventAttendeeType[]
  
  // Scans
  scans: SessionScan[]
}
```

### 7.5.2 Scan Entrée/Sortie

```typescript
interface SessionScan {
  id: string
  sessionId: string
  registrationId: string
  scanType: 'IN' | 'OUT'
  scannedAt: DateTime
}
```

**Flow** :
1. Participant arrive à une session
2. Staff scan le QR code
3. Sélection de la session
4. Création d'un scan `IN`
5. Participant quitte la session
6. Scan `OUT` (optionnel)

**Statistiques** :
- Nombre de présents par session
- Durée moyenne de présence
- Sessions les plus populaires
- Taux de remplissage

---

## 7.6 Invitations et Emails

### 7.6.1 Système d'Invitations

**Flow** :

1. **ADMIN envoie invitation**
   ```typescript
   POST /invitations
   {
     email: "newuser@example.com",
     roleId: "uuid",
     orgId: "uuid"
   }
   ```

2. **Backend génère token sécurisé**
   ```typescript
   const token = crypto.randomBytes(32).toString('hex')
   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
   
   await prisma.invitation.create({
     data: {
       email,
       token,
       roleId,
       orgId,
       invitedByUserId,
       status: 'PENDING',
       expiresAt
     }
   })
   ```

3. **Email envoyé**
   ```
   Subject: Invitation à rejoindre [Organization]
   
   Bonjour,
   
   Vous avez été invité(e) à rejoindre [Organization Name] en tant que [Role Name].
   
   Cliquez sur le lien ci-dessous pour accepter l'invitation :
   https://attendee.fr/complete-invitation?token=xxx
   
   Ce lien expire le [date].
   ```

4. **Invité clique sur le lien**
   - Frontend affiche formulaire de création de compte
   - Validation du token
   - Si expiré : affichage message d'erreur

5. **Invité complète le formulaire**
   ```typescript
   POST /invitations/complete
   {
     token: "xxx",
     firstName: "John",
     lastName: "Doe",
     password: "SecureP@ss123"
   }
   ```

6. **Backend crée le compte**
   ```typescript
   // Vérifier token valide
   const invitation = await prisma.invitation.findUnique({
     where: { token },
     include: { organization: true, role: true }
   })
   
   if (!invitation || invitation.expiresAt < new Date()) {
     throw new BadRequestException('Invalid or expired token')
   }
   
   // Créer user
   const user = await prisma.user.create({
     data: {
       email: invitation.email,
       firstName,
       lastName,
       passwordHash: await bcrypt.hash(password, 10),
       isActive: true
     }
   })
   
   // Lier à l'organisation avec le rôle
   await prisma.orgUser.create({
     data: {
       userId: user.id,
       orgId: invitation.orgId
     }
   })
   
   await prisma.tenantUserRole.create({
     data: {
       userId: user.id,
       orgId: invitation.orgId,
       roleId: invitation.roleId
     }
   })
   
   // Marquer invitation comme acceptée
   await prisma.invitation.update({
     where: { id: invitation.id },
     data: { status: 'ACCEPTED' }
   })
   ```

### 7.6.2 Emails Transactionnels

**Types d'emails** :

1. **Invitation utilisateur**
2. **Reset mot de passe**
3. **Confirmation d'inscription**
4. **Approbation d'inscription**
5. **Rappel d'événement**

**Configuration SMTP** :
```env
EMAIL_ENABLED=true
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@attendee.fr
SMTP_PASSWORD=***
SMTP_FROM=noreply@attendee.fr
SMTP_FROM_NAME=Attendee EMS
```

**Templates HTML** :
- Design responsive
- Gradient colors par type
- Call-to-action proéminent
- Fallback link (si bouton ne fonctionne pas)
- Footer avec branding

---

## 7.7 Analytics et Reporting

### 7.7.1 Statistiques Événement

**Données temps réel** :
```typescript
interface EventStats {
  // Inscriptions
  totalRegistrations: number
  byStatus: {
    awaiting: number
    approved: number
    refused: number
    cancelled: number
  }
  byType: {
    [typeId: string]: number
  }
  
  // Présence
  checkedIn: number
  notCheckedIn: number
  checkedOut: number
  attendanceRate: number        // Pourcentage
  
  // Badges
  badgesGenerated: number
  badgesFailed: number
  badgesPrinted: number
  
  // Tendances
  registrationsTrend: {
    date: string
    count: number
  }[]
  checkinsTrend: {
    hour: string
    count: number
  }[]
}
```

**Graphiques** :
- Évolution des inscriptions (line chart)
- Répartition par type (pie chart)
- Check-ins par heure (bar chart)
- Taux de présence (gauge)

### 7.7.2 Export de Données

**Formats disponibles** :
- Excel (.xlsx)
- CSV
- JSON (via API)

**Données exportables** :
- Liste complète des participants
- Inscriptions d'un événement
- Historique de check-ins
- Statistiques agrégées

---

[▶ Section 8 : Infrastructure et Déploiement](./08-INFRASTRUCTURE.md)
