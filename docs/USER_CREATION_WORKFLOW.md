# 🔐 WORKFLOW DE CRÉATION D'UTILISATEUR - SPÉCIFICATION COMPLÈTE

## ⚠️ RÈGLE FONDAMENTALE
**AUCUN UTILISATEUR NE PEUT SE CRÉER UN COMPTE DIRECTEMENT**  
→ Seuls les administrateurs peuvent créer des comptes via le système d'invitation

---

## 📋 ÉTAPES DU WORKFLOW COMPLET

### 1. 🎯 INVITATION PAR UN ADMINISTRATEUR

**Qui peut inviter :**
- **SUPER_ADMIN** : Peut inviter dans n'importe quelle organisation
- **ORG_ADMIN** : Peut inviter dans son organisation uniquement
- **ORG_MANAGER** : Peut inviter dans son organisation (rôles inférieurs uniquement)

**Données obligatoires :**
- ✅ **Email** (unique, validation format)
- ✅ **Rôle** (ORG_ADMIN, ORG_MANAGER, EVENT_MANAGER, CHECKIN_STAFF, PARTNER, READONLY)
- ✅ **Organisation** (automatique si ORG_MANAGER, sélectionnable si SUPER_ADMIN)
- 🔄 **Événements** (optionnel, selon le rôle)

### 2. 🗄️ CRÉATION USER EN BASE DE DONNÉES

**Lors de l'envoi d'invitation, créer immédiatement :**

```sql
INSERT INTO users (
  id,
  email,
  org_id,
  role_id,
  is_active,          -- FALSE (compte non activé)
  profile_completed,  -- FALSE (profil incomplet)
  invitation_id,      -- UUID de l'invitation
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'user@example.com',
  'org-123',
  'role-456',
  false,              -- ⚠️ IMPORTANT : FALSE
  false,              -- ⚠️ IMPORTANT : FALSE
  'invitation-uuid',  -- ⚠️ LIEN CRITIQUE
  NOW(),
  NOW()
);
```

**État initial du user :**
- 🔴 `isActive: false` → Ne peut pas se connecter
- 🔴 `profileCompleted: false` → Profil incomplet
- 🔗 `invitationId` → Lien vers l'invitation (token)
- 📧 Email, rôle, org définis mais compte inutilisable

### 3. 📧 ENVOI EMAIL D'INVITATION

**Contenu de l'email :**
- Lien : `https://app.domain.com/signup/{invitation-token}`
- Instructions pour compléter le profil
- Expiration du lien (ex: 7 jours)

### 4. 🌐 PAGE DE SIGNUP (/signup/:token)

**Validations de sécurité :**
```typescript
// 1. Vérifier token valide et non expiré
const invitation = await getInvitationByToken(token)
if (!invitation || invitation.isExpired) {
  return redirect('/error?type=invalid-token')
}

// 2. Vérifier correspondance email
if (userEmail !== invitation.email) {
  return redirect('/error?type=email-mismatch')
}

// 3. Vérifier user existe et non activé
const user = await getUserByInvitationId(invitation.id)
if (!user || user.isActive) {
  return redirect('/error?type=user-not-found')
}
```

**Formulaire de complétion :**
- ✅ Email (pré-rempli, non modifiable)
- ✅ Prénom
- ✅ Nom
- ✅ Mot de passe (validation forte)
- ✅ Confirmation mot de passe
- 🔄 Photo de profil (optionnel)
- 🔄 Téléphone (optionnel)

### 5. ✅ ACTIVATION DU COMPTE

**Après validation du formulaire :**
```sql
UPDATE users SET
  first_name = 'John',
  last_name = 'Doe',
  password_hash = bcrypt_hash('password123'),
  phone = '+33123456789',
  avatar_url = 'https://...',
  is_active = true,           -- ✅ ACTIVATION
  profile_completed = true,   -- ✅ PROFIL COMPLET
  email_verified_at = NOW(),
  updated_at = NOW()
WHERE invitation_id = 'invitation-uuid';

-- Marquer l'invitation comme utilisée
UPDATE invitations SET
  status = 'accepted',
  accepted_at = NOW()
WHERE id = 'invitation-uuid';
```

---

## 🛡️ SÉCURITÉS IMPLÉMENTÉES

### Protection Anti-Fraude
- 🔐 **Token unique** par invitation (UUID v4)
- ⏰ **Expiration automatique** (7 jours)
- 📧 **Vérification email** obligatoire
- 🚫 **Pas de création directe** de compte

### Validation Backend
- ✅ Invitation valide et non expirée
- ✅ Email correspond à l'invitation
- ✅ User existe en DB avec bon invitationId
- ✅ Compte non déjà activé
- ✅ Mot de passe conforme aux règles

### Gestion des Erreurs
- ❌ Token invalide/expiré → Page d'erreur + lien contact
- ❌ Email incorrect → Page d'erreur sécurisée
- ❌ Compte déjà activé → Redirection login
- ❌ Invitation déjà utilisée → Page d'information

---

## 🔄 ÉTATS POSSIBLES D'UN USER

| État | isActive | profileCompleted | Peut se connecter | Actions possibles |
|------|----------|------------------|-------------------|-------------------|
| **Invité** | `false` | `false` | ❌ Non | Compléter profil via token |
| **Actif** | `true` | `true` | ✅ Oui | Utilisation normale |
| **Suspendu** | `false` | `true` | ❌ Non | Attendre réactivation admin |

---

## 📋 IMPLÉMENTATION TECHNIQUE

### Base de Données
```sql
-- Table users (ajouts nécessaires)
ALTER TABLE users ADD COLUMN invitation_id UUID REFERENCES invitations(id);
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN profile_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;

-- Index pour performance
CREATE INDEX idx_users_invitation_id ON users(invitation_id);
CREATE INDEX idx_users_active_completed ON users(is_active, profile_completed);
```

### API Endpoints
```typescript
// Création d'invitation (existant, à modifier)
POST /api/invitations
// → Crée invitation + user en DB (inactive)

// Page de signup
GET /api/signup/:token
// → Valide token, retourne info invitation

// Complétion profil
POST /api/signup/:token
// → Active le compte, marque invitation acceptée

// Validation token (AJAX)
GET /api/invitations/:token/validate
// → Vérifie validité sans révéler d'info
```

### Components React
```
src/pages/
  Signup/
    index.tsx           -- Page principale /signup/:token
    SignupForm.tsx      -- Formulaire de complétion
    TokenValidator.tsx  -- Validation côté client

src/features/auth/
  api/
    signupApi.ts       -- RTK Query pour signup
  types/
    signup.types.ts    -- Types TypeScript
```

---

## 🎯 PROCHAINES ÉTAPES D'IMPLÉMENTATION

1. **Modifier l'API d'invitation actuelle** pour créer le user en DB
2. **Créer la page /signup/:token** avec validations
3. **Implémenter la complétion de profil** 
4. **Ajouter la gestion d'erreurs** complète
5. **Tester le workflow complet** end-to-end
6. **Ajouter monitoring** et logs de sécurité

---

**🔒 PRINCIPE CLÉS :**
- Un seul point d'entrée : invitation par admin
- Validation multi-niveau (token, email, user)
- Compte inutilisable jusqu'à complétion
- Sécurité maximale contre les créations frauduleuses