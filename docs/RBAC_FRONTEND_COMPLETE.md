# ✅ Frontend RBAC - Gestion des Rôles & Permissions

**Statut**: ✅ **TERMINÉ**  
**Date**: 13 janvier 2026  
**Framework**: React + TypeScript + Redux Toolkit + @dnd-kit

---

## 📋 Vue d'ensemble

Frontend React complet pour la gestion des rôles et permissions avec fonctionnalité drag-and-drop pour réorganiser la hiérarchie. Intégré avec le backend hexagonal RBAC Admin.

---

## 🗂️ Structure des fichiers

```
src/features/roles/
├── api/
│   └── rbacAdminApi.ts          # Redux RTK Query API (272 lignes)
├── components/
│   ├── RolesDragList.tsx        # Drag & drop list (203 lignes)
│   ├── PermissionsModal.tsx     # Modal assignation permissions (313 lignes)
│   └── RoleFormModal.tsx        # Modal création/édition rôle (176 lignes)
├── pages/
│   └── RolesManagement.tsx      # Page principale (320 lignes)
├── types/
│   └── index.ts                 # Types existants (legacy)
└── index.ts                     # Exports
```

**Total**: ~1,284 lignes de code frontend

---

## 🔌 API Redux RTK Query

### Fichier: `api/rbacAdminApi.ts`

**Types définis:**
```typescript
- Permission
- RolePermission
- RoleWithDetails (avec role_permissions inclus)
- CreateRoleDto
- UpdateRoleDto
- AssignPermissionsDto
- UserWithRole
- AssignRoleToUserDto
- TenantUserRole
- ReorderRolesDto
```

**Endpoints (11):**

| Hook | Méthode | Endpoint | Description |
|------|---------|----------|-------------|
| `useGetRbacRolesQuery` | GET | `/rbac/roles/:orgId` | Liste rôles avec permissions |
| `useCreateRbacRoleMutation` | POST | `/rbac/roles` | Créer nouveau rôle |
| `useUpdateRbacRoleMutation` | PUT | `/rbac/roles/:roleId` | Mettre à jour rôle |
| `useDeleteRbacRoleMutation` | DELETE | `/rbac/roles/:roleId` | Supprimer rôle |
| `useGetAllPermissionsQuery` | GET | `/rbac/permissions` | Liste toutes permissions |
| `useGetRolePermissionsQuery` | GET | `/rbac/roles/:roleId/permissions` | Permissions d'un rôle |
| `useAssignPermissionsMutation` | PUT | `/rbac/roles/:roleId/permissions` | Assigner permissions (REPLACE) |
| `useGetOrgUsersWithRolesQuery` | GET | `/rbac/orgs/:orgId/users` | Users avec rôles |
| `useAssignRoleToUserMutation` | POST | `/rbac/users/assign-role` | Assigner rôle à user |
| `useUnassignRoleFromUserMutation` | DELETE | `/rbac/users/:userId/orgs/:orgId/role` | Retirer rôle |
| `useReorderRolesMutation` | PUT | `/rbac/orgs/:orgId/roles/reorder` | Drag & drop |
| `useGetNextRankQuery` | GET | `/rbac/orgs/:orgId/roles/next-rank` | Prochain rank |

**Cache Tags:**
- `RbacRole` - Invalidé lors des mutations de rôles
- `RbacPermission` - Pour les permissions système
- `RbacUserRole` - Pour les assignations user-role
- `Policy` - Invalidé pour forcer refresh CASL après modifications

---

## 🎨 Composants React

### 1. RolesDragList

**Fichier**: `components/RolesDragList.tsx`  
**Lignes**: 203

**Fonctionnalités:**
- ✅ Liste des rôles avec drag & drop (@dnd-kit)
- ✅ Affichage hiérarchique (rank)
- ✅ Badge "Verrouillé" pour rôles système
- ✅ Icône cadenas pour rôles verrouillés (non draggables)
- ✅ Affichage: nom, code, niveau, rang, nombre de permissions
- ✅ Actions: Éditer, Supprimer, Gérer permissions
- ✅ Drag handle avec GripVertical icon
- ✅ Visual feedback pendant drag (opacity, shadow)

**Props:**
```typescript
interface RolesDragListProps {
  roles: RoleWithDetails[]
  onReorder: (orderedRoleIds: string[]) => void
  onEdit?: (role: RoleWithDetails) => void
  onDelete?: (role: RoleWithDetails) => void
  onManagePermissions?: (role: RoleWithDetails) => void
}
```

**Utilisation @dnd-kit:**
```typescript
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
```

**Gestion du drag:**
```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event
  if (!over || active.id === over.id) return
  
  const newOrder = arrayMove(roles, oldIndex, newIndex)
  onReorder(newOrder.map(r => r.id))
}
```

---

### 2. PermissionsModal

**Fichier**: `components/PermissionsModal.tsx`  
**Lignes**: 313

**Fonctionnalités:**
- ✅ Modal fullscreen responsive
- ✅ Recherche en temps réel (nom, code, scope, description)
- ✅ Groupement par scope (Organization, Event, User, etc.)
- ✅ Sélection par scope (tout cocher/décocher)
- ✅ Compteurs: X/Y permissions sélectionnées
- ✅ Checkbox avec état intermédiaire (someSelected)
- ✅ Détection des modifications (hasChanges)
- ✅ Mode REPLACE (remplace toutes les permissions)

**Props:**
```typescript
interface PermissionsModalProps {
  role: RoleWithDetails
  allPermissions: Permission[]
  onSave: (permissionIds: string[]) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}
```

**Algorithme groupement:**
```typescript
const permissionsByScope = useMemo(() => {
  const groups: Record<string, Permission[]> = {}
  allPermissions.forEach(perm => {
    if (!groups[perm.scope]) groups[perm.scope] = []
    groups[perm.scope].push(perm)
  })
  return groups
}, [allPermissions])
```

**UI Sections:**
1. **Header** - Titre + compteur + bouton fermer
2. **Search** - Input avec icône loupe
3. **Body** - Liste scrollable par scope
4. **Footer** - Indicateur modifications + boutons Annuler/Enregistrer

---

### 3. RoleFormModal

**Fichier**: `components/RoleFormModal.tsx`  
**Lignes**: 176

**Fonctionnalités:**
- ✅ Mode création ET édition (détecté via `role` prop)
- ✅ Formulaire avec validation
- ✅ Champs: code, name, level, rank
- ✅ Code non modifiable en mode édition
- ✅ Auto-fill rank avec `nextRank` API
- ✅ Placeholders informatifs
- ✅ Calcul auto level/rank si non fournis

**Props:**
```typescript
interface RoleFormModalProps {
  role?: RoleWithDetails // Si présent = édition
  orgId: string
  onSave: (data: {
    code: string
    name: string
    level?: number
    rank?: number
  }) => Promise<void>
  onClose: () => void
  isLoading?: boolean
  nextRank?: number
}
```

**Validation:**
```typescript
const isValid = code.trim() && name.trim()
```

**Submit:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await onSave({
    code,
    name,
    level: level ? parseInt(level, 10) : undefined,
    rank: rank ? parseInt(rank, 10) : undefined,
  })
}
```

---

## 📄 Page principale

### RolesManagement

**Fichier**: `pages/RolesManagement.tsx`  
**Lignes**: 320

**Fonctionnalités:**
- ✅ Récupération orgId depuis URL params
- ✅ Chargement des rôles et permissions
- ✅ 3 cartes statistiques (total rôles, verrouillés, permissions)
- ✅ Bouton "Nouveau rôle"
- ✅ Gestion complète du cycle de vie (CRUD + drag & drop)
- ✅ Affichage erreurs et loading states
- ✅ Modals conditionnelles

**URL Route:**
```
/rbac/:orgId
```

**Exemple:**
```
http://localhost:5173/rbac/org-uuid-123
```

**Queries utilisées:**
```typescript
const { data: roles, isLoading, error } = useGetRbacRolesQuery(orgId)
const { data: allPermissions } = useGetAllPermissionsQuery()
const { data: nextRankData } = useGetNextRankQuery(orgId)
```

**Mutations utilisées:**
```typescript
const [createRole] = useCreateRbacRoleMutation()
const [updateRole] = useUpdateRbacRoleMutation()
const [deleteRole] = useDeleteRbacRoleMutation()
const [assignPermissions] = useAssignPermissionsMutation()
const [reorderRoles] = useReorderRolesMutation()
```

**Handlers principaux:**
```typescript
handleCreateRole(data)      // Créer nouveau rôle
handleUpdateRole(data)       // Mettre à jour rôle existant
handleDeleteRole(role)       // Supprimer rôle (avec confirmation)
handleManagePermissions(role) // Ouvrir modal permissions
handleSavePermissions(ids)   // Enregistrer permissions (mode REPLACE)
handleReorder(ids)           // Drag & drop réorganisation
```

**UI Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│   🛡️ Gestion des Rôles & Permissions    [+ Nouveau] │
│   Description                                       │
├─────────────────────────────────────────────────────┤
│ Stats Cards                                         │
│   [Total: 5]  [Verrouillés: 2]  [Permissions: 42]  │
├─────────────────────────────────────────────────────┤
│ Hiérarchie des rôles                                │
│   ℹ️ Réorganisation en cours...                     │
│   ┌───────────────────────────────────────────┐    │
│   │ 🔒 super_admin                            │    │
│   │ Niveau: 0 | Rang: 0 | 42 permissions      │    │
│   │                          [🛡️] [✏️] [🗑️]    │    │
│   ├───────────────────────────────────────────┤    │
│   │ 🔒 org_admin                              │    │
│   │ Niveau: 100 | Rang: 1 | 38 permissions    │    │
│   │                          [🛡️] [✏️] [🗑️]    │    │
│   ├───────────────────────────────────────────┤    │
│   │ ⣿ project_manager  (draggable)            │    │
│   │ Niveau: 300 | Rang: 2 | 15 permissions    │    │
│   │                          [🛡️] [✏️] [🗑️]    │    │
│   └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de données

### Création de rôle

```mermaid
User → Click "Nouveau rôle"
  → setShowRoleFormModal(true)
    → RoleFormModal rendered
      → User fills: code, name, level?, rank?
        → Submit
          → handleCreateRole(data)
            → createRole({ orgId, ...data }).unwrap()
              → POST /rbac/roles
                → Backend validates & creates
                  → Response: RoleWithDetails
                    → Redux cache invalidated [RbacRole, ORG-{orgId}]
                      → useGetRbacRolesQuery refetch
                        → UI updates with new role
                          → Modal closes
```

### Assignation de permissions

```mermaid
User → Click icône 🛡️ sur un rôle
  → handleManagePermissions(role)
    → setSelectedRole(role)
    → setShowPermissionsModal(true)
      → PermissionsModal rendered
        → Display current permissions (checked)
        → User toggles checkboxes
          → selectedIds state updated
            → Click "Enregistrer"
              → handleSavePermissions(Array.from(selectedIds))
                → assignPermissions({ roleId, permissionIds }).unwrap()
                  → PUT /rbac/roles/:roleId/permissions
                    → Backend deletes all + inserts new (TRANSACTION)
                      → Response: RoleWithDetails with updated permissions
                        → Redux cache invalidated [RbacRole, Policy]
                          → useGetRbacRolesQuery refetch
                          → CASL abilities refresh
                            → UI updates
                              → Modal closes
```

### Drag & Drop réorganisation

```mermaid
User → Drags role to new position
  → handleDragEnd(event)
    → Calculate newIndex
      → arrayMove(roles, oldIndex, newIndex)
        → newOrder = reordered roles
          → onReorder(newOrder.map(r => r.id))
            → handleReorder(orderedRoleIds)
              → reorderRoles({ orgId, orderedRoleIds }).unwrap()
                → PUT /rbac/orgs/:orgId/roles/reorder
                  → Backend validates hierarchy constraint
                    → If locked roles above non-locked: OK
                    → Else: 400 BadRequest
                      → Transaction: update all ranks
                        → Response: RoleWithDetails[] with new ranks
                          → Redux cache invalidated [RbacRole, ORG-{orgId}]
                            → useGetRbacRolesQuery refetch
                              → UI updates with new order
```

---

## 🛣️ Routing

### Configuration

**Fichier**: `src/app/routes/index.tsx`

```typescript
{
  path: 'rbac/:orgId',
  element: (
    <GuardedRoute action="manage" subject="Role">
      <RolesManagement />
    </GuardedRoute>
  ),
}
```

**Guard**: `GuardedRoute` avec permission `manage` sur `Role`

**URL Exemples:**
```
/rbac/cm5a1b2c3d4e5f6g7h8i9j0k    ← UUID organisation
/rbac/org-test-123                ← Code organisation
```

---

## 🏷️ Redux Tags

### Ajout dans rootApi.ts

```typescript
tagTypes: [
  // ... existing tags
  'RbacRole',       // Roles RBAC Admin
  'RbacPermission', // Permissions système
  'RbacUserRole',   // Assignations user-role
]
```

### Stratégie de cache

**Invalidation automatique:**
- Création rôle → invalide `RbacRole:ORG-{orgId}`
- Update rôle → invalide `RbacRole:{roleId}`
- Delete rôle → invalide `RbacRole:ORG-{orgId}`
- Reorder → invalide `RbacRole:ORG-{orgId}`
- Assign permissions → invalide `RbacRole:{roleId}` + `Policy`
- Assign role to user → invalide `RbacUserRole:ORG-{orgId}` + `Policy`

**Policy invalidation** → Force CASL abilities refresh

---

## 🎨 Styles Tailwind

**Theme:**
- Light mode: `bg-white`, `text-gray-900`, `border-gray-200`
- Dark mode: `dark:bg-gray-800`, `dark:text-white`, `dark:border-gray-700`

**Colors:**
- Primary: `indigo-600` (boutons principaux)
- Locked: `amber-500` (rôles verrouillés)
- Success: `green-600`
- Danger: `red-600`
- Secondary: `gray-500`

**Components:**
- Modals: `fixed inset-0 bg-black/50` backdrop
- Cards: `rounded-xl shadow-sm border`
- Buttons: `px-4 py-2 rounded-lg hover:... transition-colors`
- Inputs: `focus:ring-2 focus:ring-indigo-500`

---

## 📊 Features détaillées

### 1. Drag & Drop

**Librairie**: `@dnd-kit/core` + `@dnd-kit/sortable`

**Configuration:**
```typescript
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  })
)
```

**Collision Detection**: `closestCenter`

**Strategy**: `verticalListSortingStrategy`

**Disabled pour rôles verrouillés:**
```typescript
<button
  {...listeners}
  disabled={role.is_locked}
>
  {role.is_locked ? <Lock /> : <GripVertical />}
</button>
```

---

### 2. Recherche permissions

**Recherche en temps réel:**
```typescript
const filteredPermissions = useMemo(() => {
  if (!searchTerm) return allPermissions
  
  const term = searchTerm.toLowerCase()
  return allPermissions.filter(p =>
    p.name.toLowerCase().includes(term) ||
    p.code.toLowerCase().includes(term) ||
    p.scope.toLowerCase().includes(term) ||
    p.description?.toLowerCase().includes(term)
  )
}, [allPermissions, searchTerm])
```

**Debouncing**: Non (React useMemo suffit pour performances)

---

### 3. Validation hiérarchie

**Client-side**: Aucune (laissé au backend)

**Server-side**: Backend valide que rôles verrouillés restent au-dessus

**Error handling:**
```typescript
try {
  await reorderRoles({ orgId, orderedRoleIds }).unwrap()
} catch (error: any) {
  if (error?.data?.message?.includes('Locked roles')) {
    alert('Les rôles verrouillés doivent rester au-dessus')
  }
}
```

---

### 4. Gestion des erreurs

**Loading states:**
- `isLoading` → Spinner fullscreen
- `creating` → "Enregistrement..." bouton disabled
- `updating` → "Mise à jour..." bouton disabled
- `deleting` → Pas de UI spécial (rapide)

**Error display:**
```typescript
if (rolesError) {
  return (
    <div className="text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p>{error?.data?.message || 'Erreur inconnue'}</p>
    </div>
  )
}
```

---

## ✅ Checklist fonctionnalités

### CRUD Rôles
- [x] Liste des rôles avec tri par rank
- [x] Création de rôle (modal avec formulaire)
- [x] Édition de rôle (name, level, rank)
- [x] Suppression de rôle (avec confirmation)
- [x] Affichage détails (code, name, level, rank, locked)
- [x] Compteur permissions par rôle

### Permissions
- [x] Liste toutes permissions système
- [x] Groupement par scope
- [x] Recherche permissions
- [x] Sélection individuelle
- [x] Sélection par scope (tout/rien)
- [x] Mode REPLACE (remplace toutes)
- [x] Compteur sélectionnées
- [x] Détection modifications

### Drag & Drop
- [x] Réorganisation visuelle
- [x] Drag handle (GripVertical)
- [x] Locked roles non draggables
- [x] Visual feedback (opacity, shadow)
- [x] Validation hiérarchie backend
- [x] Gestion erreurs contraintes

### UX
- [x] Dark mode complet
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Confirmation suppression
- [x] Toasts notifications (via Policy invalidation)
- [x] Guards permission

---

## 🚀 Prochaines améliorations

### Court terme
- [ ] Assignation rôles aux users (UI)
- [ ] Page liste users avec leurs rôles
- [ ] Bulk operations (sélection multiple)
- [ ] Export/Import rôles (JSON)

### Moyen terme
- [ ] Historique modifications
- [ ] Audit log des permissions
- [ ] Templates de rôles
- [ ] Duplication de rôle

### Long terme
- [ ] Permissions conditionnelles (scope event, org)
- [ ] Permissions temporaires (expiration)
- [ ] Workflow approbation modifications
- [ ] Graphe visualisation hiérarchie

---

## 🧪 Tests

### Tests unitaires recommandés

```typescript
// RolesDragList.test.tsx
- Renders roles list
- Shows locked badge for system roles
- Disables drag for locked roles
- Calls onReorder with correct order
- Renders action buttons conditionally

// PermissionsModal.test.tsx
- Groups permissions by scope
- Filters by search term
- Toggles individual permissions
- Toggles scope (select all/none)
- Detects changes correctly
- Calls onSave with selected IDs

// RoleFormModal.test.tsx
- Renders in create mode
- Renders in edit mode
- Disables code input in edit mode
- Auto-fills nextRank in create mode
- Validates required fields
- Submits correct data

// RolesManagement.test.tsx
- Fetches roles on mount
- Opens create modal on button click
- Opens edit modal on edit button
- Opens permissions modal on manage button
- Deletes role with confirmation
- Reorders roles on drag end
```

### Tests E2E recommandés

```typescript
// roles-management.spec.ts
test('Create new role', async ({ page }) => {
  await page.goto('/rbac/org-123')
  await page.click('text=Nouveau rôle')
  await page.fill('input[placeholder*="code"]', 'test_role')
  await page.fill('input[placeholder*="Nom"]', 'Test Role')
  await page.click('text=Créer')
  await expect(page.locator('text=Test Role')).toBeVisible()
})

test('Drag and drop reorder', async ({ page }) => {
  await page.goto('/rbac/org-123')
  const role1 = page.locator('[data-role-id="role-1"]')
  const role3 = page.locator('[data-role-id="role-3"]')
  await role1.dragTo(role3)
  // Vérifier ordre mis à jour
})
```

---

## 📚 Ressources

**Documentation:**
- [@dnd-kit/core](https://docs.dndkit.com/)
- [Redux Toolkit Query](https://redux-toolkit.js.org/rtk-query/overview)
- [React Router v6](https://reactrouter.com/)

**Code backend correspondant:**
- `/docs/refactor/STEP_4_IMPLEMENTATION_COMPLETE.md`

---

## 🎉 Conclusion

✅ **Frontend React complet et prêt à l'emploi**

Le système de gestion des rôles et permissions frontend est entièrement implémenté avec:
- Interface intuitive avec drag & drop
- Intégration complète avec backend hexagonal
- Gestion des états (loading, erreurs)
- Dark mode
- Guards de permission
- Cache Redux optimisé

**Prêt pour déploiement** après tests E2E.

---

**Auteur**: GitHub Copilot  
**Date**: 13 janvier 2026  
**Framework**: React 18 + TypeScript + Tailwind CSS
