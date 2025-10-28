# 🔄 Guide de Synchronisation API ↔ Frontend

## 📝 **Problème Récurrent**

Ce projet a un problème systémique de **désynchronisation entre les noms de champs API et Frontend**. Cette documentation centralise tous les mappings corrects pour éviter les erreurs récurrentes.

---

## 🎯 **Règles de Nommage**

### Backend API (NestJS + Prisma)

- **Convention** : `snake_case` (base de données PostgreSQL)
- **Exemples** : `first_name`, `created_at`, `start_at`, `org_id`

### Frontend (React + TypeScript)

- **DTO** : `snake_case` (correspond exactement à l'API)
- **DPO** : `camelCase` (pour l'utilisation côté React)
- **Mappers** : Transformation automatique DTO → DPO

---

## 📊 **ATTENDEES - Mappings Officiels**

### Structure API Réelle (AttendeeDTO)

```typescript
{
  "id": "uuid",
  "org_id": "uuid",
  "default_type_id": "uuid | null",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string | null",
  "company": "string | null",
  "job_title": "string | null",
  "country": "string | null",
  "metadata": "object | null",
  "labels": "array",
  "notes": "string | null",
  "is_active": "boolean",
  "created_at": "string (ISO)",
  "updated_at": "string (ISO)"
}
```

### Paramètres de Requête (ListAttendeesDto)

```typescript
{
  pageSize: number,     // ✅ Correct
  sortBy: 'created_at' | 'updated_at' | 'email' | 'last_name',
  sortDir: 'asc' | 'desc'  // ✅ Correct (pas sortOrder!)
}
```

### Frontend DPO (Usage React)

```typescript
interface AttendeeDPO {
  id: string
  firstName: string // ← first_name
  lastName: string // ← last_name
  email: string
  phone?: string
  company?: string
  jobTitle?: string // ← job_title
  country?: string
  orgId: string // ← org_id
  registrationDate: string // ← created_at
  metadata?: Record<string, any>
  labels?: string[]
  isActive: boolean // ← is_active
  createdAt: string // ← created_at
  updatedAt: string // ← updated_at

  // Computed
  displayName: string // firstName + lastName
  canCheckIn: boolean // isActive
}
```

---

## 📅 **EVENTS - Mappings Officiels**

### Structure API Réelle (EventDTO)

```typescript
{
  "id": "uuid",
  "org_id": "uuid",
  "code": "string",
  "name": "string",
  "description": "string | null",
  "start_at": "string (ISO)",    // ⚠️ PAS startDate!
  "end_at": "string (ISO)",      // ⚠️ PAS endDate!
  "timezone": "string",
  "status": "'draft' | 'published' | 'archived'",
  "capacity": "number | null",
  "location_type": "'physical' | 'online' | 'hybrid'",
  "address_formatted": "string | null",
  "org_activity_sector_id": "uuid | null",
  "org_event_type_id": "uuid | null",
  "created_at": "string (ISO)",
  "updated_at": "string (ISO)",
  "created_by": "uuid | null"
}
```

### Paramètres de Requête (ListEventsDto)

```typescript
{
  limit: number,           // ✅ Correct (pas pageSize!)
  sortBy: 'name' | 'start_at' | 'created_at',  // ⚠️ start_at PAS startDate!
  sortOrder: 'asc' | 'desc'  // ✅ Correct
}
```

### Frontend DPO (Usage React)

```typescript
interface EventDPO {
  id: string
  name: string
  code: string
  description?: string
  startDate: string // ← start_at
  endDate: string // ← end_at
  timezone: string
  status: 'draft' | 'published' | 'archived'
  capacity?: number
  locationType: string // ← location_type
  orgId: string // ← org_id
  createdAt: string // ← created_at
  updatedAt: string // ← updated_at
}
```

---

## ⚠️ **ERREURS COMMUNES À ÉVITER**

### ❌ Erreurs Fréquentes

```typescript
// ATTENDEES
limit: 10,                    // ❌ N'existe pas! Utiliser pageSize
sortBy: 'email',             // ❌ Uniquement pour recherche
sortOrder: 'desc'            // ❌ Utiliser sortDir pour attendees

// EVENTS
pageSize: 10,                // ❌ N'existe pas! Utiliser limit
sortBy: 'startDate',         // ❌ Utiliser 'start_at'
sortDir: 'desc'              // ❌ Utiliser sortOrder pour events
```

### ✅ Versions Correctes

```typescript
// ATTENDEES
useGetAttendeesQuery({
  pageSize: 10, // ✅
  sortBy: 'created_at', // ✅
  sortDir: 'desc', // ✅
})

// EVENTS
useGetEventsQuery({
  limit: 5, // ✅
  sortBy: 'start_at', // ✅
  sortOrder: 'asc', // ✅
})
```

---

## 🔧 **PROCESS DE VÉRIFICATION**

### 1. Vérifier l'API Réelle

```bash
# Test API pour voir la vraie structure
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/attendees?pageSize=1" | jq '.data[0]'
```

### 2. Vérifier le DTO Backend

```typescript
// Toujours checker le fichier DTO du backend
// attendee-ems-back/src/modules/*/dto/*.dto.ts
```

### 3. Synchroniser le Frontend

```typescript
// 1. Mettre à jour le DTO frontend (snake_case)
// 2. Mettre à jour le DPO frontend (camelCase)
// 3. Mettre à jour le mapper DTO→DPO
// 4. Mettre à jour les interfaces de paramètres
```

### 4. Tester les Requêtes

```typescript
// Test manuel des requêtes avec les vrais paramètres
console.log('API Request:', {
  pageSize: 10, // ✅ Pour attendees
  limit: 5, // ✅ Pour events
  sortBy: 'start_at', // ✅ Champ DB réel
})
```

---

## 📋 **CHECKLIST DE DÉVELOPPEMENT**

Avant chaque nouvelle feature impliquant une API :

- [ ] 🔍 **Vérifier la structure API réelle** avec un appel test
- [ ] 📝 **Documenter les champs** dans cette doc si nouveaux
- [ ] 🔄 **Créer/Mettre à jour le DTO** (snake_case)
- [ ] 🎨 **Créer/Mettre à jour le DPO** (camelCase)
- [ ] 🔀 **Créer/Mettre à jour le mapper** DTO↔DPO
- [ ] 🧪 **Tester la requête** avec les vrais paramètres
- [ ] ✅ **Valider TypeScript** (pas d'erreurs de types)

---

## 🚨 **CONTACT EN CAS DE PROBLÈME**

Si vous trouvez des incohérences dans cette documentation :

1. **Vérifiez l'API réelle** en premier
2. **Mettez à jour cette doc** avec les vraies valeurs
3. **Commitez les changements** pour l'équipe

> **Règle d'or** : L'API fait foi, pas la documentation !

---

**Dernière mise à jour** : 28 octobre 2025  
**Version** : 1.0  
**Auteur** : GitHub Copilot
