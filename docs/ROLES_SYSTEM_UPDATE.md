# Mise à Jour du Système de Rôles - 6 Rôles + SUPER_ADMIN Omniscient

## Modifications Apportées ✅

### 1. **Redéfinition des Rôles (6 rôles)**

**Nouveau système :**
- `SUPER_ADMIN` : Accès global omniscient **sans organisation** (peut créer des orgs)
- `ADMIN` : Gestion complète organisation + équipe + invitations
- `MANAGER` : Gestion événements sans invitations utilisateurs  
- `VIEWER` : Lecture seule tous événements de l'organisation
- `PARTNER` : Lecture seule événements assignés uniquement
- `HOTESSE` : **Nouveau** - Scan QR codes événements assignés uniquement

### 2. **SUPER_ADMIN Omniscient (Principal Changement)**

**Avant :** SUPER_ADMIN avait une organisation
**Maintenant :** SUPER_ADMIN n'appartient à **aucune organisation**

**Modifications techniques :**
- `RoleContext.orgId` → optionnel (`orgId?: string`)
- `sessionSlice.ts` → gestion SUPER_ADMIN sans org
- `ability-provider.tsx` → règles générées même sans orgId
- `rbac-presets.ts` → vérifications orgId pour tous rôles sauf SUPER_ADMIN

### 3. **Nouveau Rôle HOTESSE**

**Permissions spécifiques :**
```typescript
case 'HOTESSE':
  return [
    { action: 'read', subject: 'Organization', conditions: { id: orgId } },
    { action: 'read', subject: 'Event', conditions: { id: { $in: eventIds }, orgId } },
    { action: 'read', subject: 'Attendee', conditions: { eventId: { $in: eventIds }, orgId } },
    { action: 'scan', subject: 'QRCode', conditions: { eventId: { $in: eventIds }, orgId } },
    { action: 'check-in', subject: 'Attendee', conditions: { eventId: { $in: eventIds }, orgId } },
    { action: 'read', subject: 'Badge', conditions: { eventId: { $in: eventIds }, orgId } },
  ]
```

**Usage :** Scan QR codes lors des événements, similaire aux PARTNER mais pour le check-in uniquement.

### 4. **Extensions des Actions et Sujets CASL**

**Nouvelles actions ajoutées :**
```typescript
export type Actions =
  | 'scan'      // Scan QR codes (HOTESSE)
  | 'check-in'  // Check-in attendees (HOTESSE)
  // ... actions existantes
```

**Nouveaux sujets ajoutés :**
```typescript  
export type Subjects =
  | 'QRCode'    // QR code scanning (HOTESSE)
  // ... sujets existants
```

### 5. **Mise à Jour des Mapping de Rôles**

**Labels utilisateurs :**
```typescript
export const ROLE_LABELS: Record<string, string> = {
  'SUPER_ADMIN': 'Super Administrateur',
  'ADMIN': 'Administrateur',
  'MANAGER': 'Manager', 
  'VIEWER': 'Visualiseur',
  'PARTNER': 'Partenaire',
  'HOTESSE': 'Hôtesse d\'accueil',  // 🆕 Nouveau
}
```

### 6. **Formulaires Conditionnels Adaptés**

**CreateUserEnhancedModal :**
- SUPER_ADMIN peut créer des utilisateurs dans n'importe quelle organisation
- Info "Organisation automatique" masquée si pas d'orgId (SUPER_ADMIN)

**EventForm avec PartnerSelect :**
- Sélection PARTNER et HOTESSE pour accès aux événements
- Endpoint `/users?roles=PARTNER,HOTESSE` pour récupérer les utilisateurs éligibles

### 7. **Données de Test Étendues**

**Nouveaux utilisateurs HOTESSE :**
```typescript
{
  id: 'user-hotesse-1',
  email: 'sophie.accueil@ems.com',
  firstName: 'Sophie',
  lastName: 'Dubois',
  roleId: 'role-hotesse',
  eventIds: ['event-1', 'event-2'] // Événements assignés
}
```

**Nouveau rôle dans la liste :**
```typescript
{
  id: 'role-hotesse',
  code: 'HOTESSE',
  name: 'Hôtesse d\'accueil',
  description: 'Scan QR codes et check-in des participants sur événements assignés'
}
```

### 8. **API et Endpoints Mis à Jour**

**Endpoints modifiés :**
- `GET /v1/users?roles=PARTNER,HOTESSE` → Récupère utilisateurs pour sélection événements
- `GET /v1/roles` → Inclut HOTESSE dans les rôles visibles

**Gestion des permissions :**
- Filtrage par organisation pour tous les rôles sauf SUPER_ADMIN
- Validation orgId requis pour ADMIN, MANAGER, VIEWER, PARTNER, HOTESSE

## Architecture du Nouveau Système

### Hiérarchie des Permissions

```
SUPER_ADMIN (omniscient, sans org)
    ↳ Peut tout faire dans toutes les organisations
    ↳ Peut créer des organisations et inviter des utilisateurs

ADMIN (par organisation)  
    ↳ Gestion complète de l'organisation
    ↳ Peut créer/inviter des utilisateurs
    ↳ Accès à tous les événements de l'org

MANAGER (par organisation)
    ↳ Gestion des événements seulement  
    ↳ Pas de gestion d'utilisateurs
    ↳ Accès à tous les événements de l'org

VIEWER (par organisation)
    ↳ Lecture seule sur tous les événements de l'org
    ↳ Aucune modification

PARTNER (événements spécifiques)
    ↳ Lecture seule sur événements assignés uniquement
    ↳ Peut voir les participants de ces événements

HOTESSE (événements spécifiques) 
    ↳ Comme PARTNER mais avec permissions de scan
    ↳ Peut scanner QR codes et faire check-in
    ↳ Idéal pour personnel d'accueil mobile
```

### Cas d'Usage par Rôle

**SUPER_ADMIN :** Administrateur système, peut créer des organisations, superviser toutes les activités

**ADMIN :** Chef d'équipe organisation, gère son équipe et tous les événements  

**MANAGER :** Organisateur d'événements, se concentre sur la logistique événementielle

**VIEWER :** Observateur, analytics, reporting en lecture seule

**PARTNER :** Partenaire externe avec accès limité à certains événements

**HOTESSE :** Personnel d'accueil avec tablette/téléphone pour scanner les entrées

## Impact sur l'UI/UX

- ✅ Formulaires de création d'utilisateurs conditionnels selon le rôle
- ✅ Sélection d'organisations visible seulement pour SUPER_ADMIN  
- ✅ Sélection de partenaires/hôtesses dans les événements
- ✅ Navigation adaptée selon les permissions
- ✅ Messages d'info contextuels selon l'organisation

## Prochaines Étapes Recommandées

1. **Tests E2E :** Tester tous les workflows avec les 6 rôles
2. **Interface Mobile :** Optimiser l'interface HOTESSE pour tablettes/téléphones
3. **QR Code Scanner :** Implémenter la fonctionnalité de scan réelle
4. **Audit Permissions :** Vérifier toutes les pages avec les nouveaux rôles
5. **Documentation :** Mettre à jour la documentation utilisateur

## Statut : ✅ Implémentation Complète

Le système de rôles a été entièrement refondu selon les spécifications :
- ✅ 6 rôles définis et implémentés
- ✅ SUPER_ADMIN omniscient sans organisation  
- ✅ Rôle HOTESSE pour scanning QR codes
- ✅ Formulaires conditionnels fonctionnels
- ✅ Mocks et données de test complètes
- ✅ API et permissions configurées