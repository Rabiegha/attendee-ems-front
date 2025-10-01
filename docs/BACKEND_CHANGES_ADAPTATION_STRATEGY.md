# 📋 DOCUMENTATION CHANGES BACKEND - SESSION 30/09/2025

## ⚠️ CHANGEMENTS BACKEND NON PUSHÉS

**Important** : Ces modifications ont été faites localement pour les tests mais ne sont PAS dans le repo backend. Il faudra s'adapter aux vrais développements du collègue backend.

---

## 🔧 MODIFICATIONS APPORTÉES LOCALEMENT

### 1. **Configuration Environnement**
```bash
# Fichier: attendee-ems-back/.env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ems
JWT_SECRET=your-super-secret-jwt-key-for-development-only
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
BCRYPT_ROUNDS=10
PORT=3001
```

### 2. **Configuration Dotenv dans main.ts**
```typescript
// Fichier: src/main.ts
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // ⭐ Ajouté pour charger les variables d'env
  
  const app = await NestFactory.create(AppModule);
  // ... reste du code
}
```

### 3. **Correction Controller Roles**
```typescript
// Fichier: src/modules/roles/roles.controller.ts
@Controller() // ⭐ Retiré 'roles' pour éviter /v1/roles/roles
export class RolesController {
  @Get()
  @UseGuards(JwtAuthGuard, OrgScopeGuard, PermissionsGuard)
  @Permissions('roles.read')
  async findAll(@Request() req) {
    const orgId = req.user.org_id;
    return this.rolesService.findAll(orgId);
  }
}
```

---

## 🎯 STRATÉGIE D'ADAPTATION FUTURE

### **Scénarios Possibles du Développeur Backend**

#### **Scénario 1 : API CreateUser Différente**
```typescript
// Si le backend change le DTO de création utilisateur
// Frontend devra s'adapter à ces structures possibles :

// Option A : Avec first_name/last_name
interface CreateUserDto {
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  password?: string; // Optionnel si généré côté backend
}

// Option B : Sans noms (minimaliste)
interface CreateUserDto {
  email: string;
  role_id: string;
}

// Option C : Avec génération backend complète
interface CreateUserDto {
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  send_email?: boolean; // Backend envoie email automatiquement
}
```

#### **Scénario 2 : Endpoint Roles Différent**
```typescript
// Si l'endpoint change de structure :

// Option A : Avec préfixe
GET /v1/roles/roles 

// Option B : Avec paramètres
GET /v1/roles?org_id=xxx

// Option C : Nested dans organizations
GET /v1/organizations/me/roles
```

#### **Scénario 3 : Workflow Création Utilisateur**
```typescript
// Option A : Backend génère mot de passe + envoie email
POST /v1/users → { user, emailSent: boolean }

// Option B : Système d'invitation avec token
POST /v1/users/invite → { invitationToken, expiresAt }

// Option C : Deux étapes (create + activate)
POST /v1/users → { user, activationRequired: true }
POST /v1/users/:id/activate
```

---

## 🛠️ CODE FRONTEND ADAPTABLE

### **Mapper Génériques Préparés**
```typescript
// Fichier: src/features/users/dpo/user.adapters.ts

// Adapter générique pour différents formats backend
export const adaptCreateUserRequest = (
  formData: CreateUserFormData,
  backendFormat: 'v1' | 'v2' | 'v3'
) => {
  switch (backendFormat) {
    case 'v1': // Format actuel
      return {
        email: formData.email,
        password: generateTemporaryPassword(),
        role_id: formData.roleId,
        is_active: true,
      };
      
    case 'v2': // Format avec noms
      return {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role_id: formData.roleId,
      };
      
    case 'v3': // Format avec invitation
      return {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role_id: formData.roleId,
        send_invitation_email: true,
      };
  }
};
```

### **API Endpoints Configurables**
```typescript
// Fichier: src/features/users/api/usersApi.config.ts

export const API_CONFIG = {
  endpoints: {
    roles: '/v1/roles', // ⭐ Facilement modifiable
    createUser: '/v1/users',
    login: '/v1/auth/login',
  },
  
  // Flags pour s'adapter aux fonctionnalités backend
  features: {
    backendGeneratesPassword: false, // ⭐ À changer selon backend
    backendSendsEmail: false,
    requiresFirstNameLastName: true,
  }
};
```

---

## 📦 ACTIONS PRÉPARATOIRES

### **1. Tests MSW Flexibles**
```typescript
// Fichier: src/mocks/handlers.ts
// Garder les handlers MSW pour tous les scénarios possibles

export const handlers = [
  // Handler actuel
  http.get('/v1/roles', rolesHandler),
  
  // Handlers alternatifs préparés
  http.get('/v1/roles/roles', rolesHandler), // Au cas où
  http.get('/v1/organizations/me/roles', rolesHandler), // Nested
  
  // Différents formats de création
  http.post('/v1/users', createUserV1Handler),
  http.post('/v1/users/invite', createUserInviteHandler),
];
```

### **2. Types TypeScript Flexibles**
```typescript
// Fichier: src/shared/types/api.ts

// Types union pour s'adapter
export type CreateUserResponse = 
  | { user: User; temporaryPassword: string } // Version actuelle
  | { user: User; invitationSent: boolean }   // Version email
  | { user: User; activationRequired: boolean }; // Version 2-étapes

export type RolesEndpoint = 
  | '/v1/roles'
  | '/v1/roles/roles' 
  | '/v1/organizations/me/roles';
```

### **3. Configuration d'Environnement**
```typescript
// Fichier: src/app/config/api.config.ts

export const getApiConfig = () => ({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  endpoints: {
    roles: import.meta.env.VITE_ROLES_ENDPOINT || '/v1/roles',
    createUser: import.meta.env.VITE_CREATE_USER_ENDPOINT || '/v1/users',
  },
  features: {
    backendGeneratesPassword: import.meta.env.VITE_BACKEND_GENERATES_PASSWORD === 'true',
  }
});
```

---

## 🔄 PLAN D'ACTION LORS DES CHANGEMENTS BACKEND

### **Étapes à Suivre :**

1. **📋 Analyser les changements du collègue**
   - Regarder les nouveaux DTOs
   - Tester les endpoints modifiés
   - Identifier les breaking changes

2. **🔧 Adapter les mappers**
   - Modifier `mapCreateUserWithGeneratedPasswordFormToDto`
   - Ajuster les types TypeScript
   - Mettre à jour la configuration API

3. ** Mettre à jour les mocks MSW**
   - Adapter les handlers aux nouvelles structures
   - Tester en mode développement

4. **✅ Validation**
   - Tests avec le vrai backend
   - Vérifier tous les cas d'usage
   - S'assurer que l'UX reste cohérente

---

## 📝 RÉSUMÉ POUR LE FUTUR

**✅ Frontend Prêt à s'Adapter :**
- Code modulaire et configurable
- Mappers génériques préparés  
- Types TypeScript flexibles
- Configuration d'environnement
- Tests MSW alternatifs

**⚠️ Points d'Attention :**
- L'endpoint `/v1/roles` pourrait changer
- Le DTO de création utilisateur évoluera sûrement
- Le workflow mot de passe pourrait être géré côté backend
- L'envoi d'email pourrait devenir automatique

**🎯 Prêt pour tous les scénarios !**