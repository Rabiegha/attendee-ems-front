# 🔐 Système d'Accès aux Événements - Solution

## 🎯 Problème Résolu

**Objectif** : Permettre à tous les utilisateurs d'accéder aux événements qu'ils peuvent voir dans les listes, tout en limitant leurs actions selon leurs permissions.

**Avant** : Les utilisateurs voyaient des événements dans les listes mais recevaient une erreur 403 en cliquant dessus.

**Après** : Les utilisateurs peuvent accéder à tous les événements visibles, avec des limitations d'actions basées sur leurs permissions.

## 🛠️ Architecture de la Solution

### 1. EventGuard - Guard Spécialisé

**Fichier** : `src/shared/acl/guards/EventGuard.tsx`

```typescript
// Logique hiérarchique d'accès
1. Super Admin / Org Admin → Accès direct
2. Autres rôles → Vérification eventIds
3. Fallback → Évaluation CASL complexe
```

**Avantages** :
- ✅ **Performance** : Vérification rapide pour les admins
- ✅ **Sécurité** : Double vérification (eventIds + CASL)
- ✅ **Flexibilité** : Support de toutes les actions (read, update, delete)
- ✅ **Debug** : Logs détaillés pour comprendre les décisions

### 2. Integration dans le Routeur

**Fichier** : `src/app/routes/index.tsx`

```typescript
// Composant wrapper intelligent
const EventDetailsWithGuard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <Navigate to="/events" replace />
  }
  
  return (
    <EventGuard eventId={id} action="read">
      <EventDetails />
    </EventGuard>
  )
}
```

**Bénéfices** :
- ✅ **Type Safety** : Validation ID d'événement
- ✅ **UX Fluide** : Redirection intelligente si ID manquant
- ✅ **Lisibilité** : Logique claire et séparée

### 3. Permissions Granulaires dans EventDetails

**Fichier** : `src/pages/EventDetails/index.tsx`

```typescript
// Boutons conditionnels avec Can
<Can do="update" on="Event" data={event}>
  <Button>Éditer</Button>
</Can>

<Can do="read" on="Attendee" data={{ eventId: event.id }}>
  <Button>Gérer les participants</Button>
</Can>

<Can do="export" on="Attendee" data={{ eventId: event.id }}>
  <Button>Exporter</Button>
</Can>
```

**Résultat** :
- ✅ **Accès Lecture** : Tous peuvent voir les détails et participants
- ✅ **Actions Limitées** : Seuls les utilisateurs autorisés voient les boutons d'action
- ✅ **UX Cohérente** : Pas de boutons non-fonctionnels

## 📊 Matrice d'Accès

| Rôle | Voir Événements | Accéder Détails | Éditer | Exporter | Gérer Participants |
|------|----------------|----------------|--------|----------|-------------------|
| **SUPER_ADMIN** | Tous | ✅ Tous | ✅ Tous | ✅ Tous | ✅ Tous |
| **ORG_ADMIN** | Organisation | ✅ Tous | ✅ Org | ✅ Org | ✅ Org |
| **DEVELOPER** | EventIds | ✅ EventIds | ❌ | ❌ | 📝 Limité |
| **GRAPHIC_DESIGNER** | EventIds | ✅ EventIds | ❌ | ❌ | 📝 Limité |
| **JOURNALIST** | EventIds | ✅ EventIds | ❌ | ✅ Reports | 👁️ Lecture |
| **EDITOR** | EventIds | ✅ EventIds | ❌ | ✅ Reports | 👁️ Lecture |

**Légende** :
- ✅ Accès complet
- 👁️ Lecture seule
- 📝 Actions limitées (créer, inviter)
- ❌ Aucun accès

## 🧪 Tests de Validation

### Scénario 1 : Utilisateur Spécialisé
1. **Se connecter** avec `claudia@choyou.com` (Graphiste)
2. **Voir** 3 événements dans la liste
3. **Cliquer** sur n'importe quel événement → ✅ **Accès autorisé**
4. **Vérifier** que boutons Éditer/Supprimer sont **cachés**
5. **Vérifier** que création participants est **disponible**

### Scénario 2 : Admin Organisation
1. **Se connecter** avec `fred@choyou.com` (Admin Choyou)
2. **Voir** tous les événements Choyou
3. **Accéder** à n'importe quel événement → ✅ **Accès autorisé**
4. **Vérifier** que **tous les boutons** sont disponibles

### Scénario 3 : Super Admin
1. **Se connecter** avec `corentin@kistler.com`
2. **Voir** **tous** les événements (toutes organisations)
3. **Accéder** à n'importe quel événement → ✅ **Accès autorisé**
4. **Vérifier** accès **global** à toutes les actions

## 🔍 Debugging

### Logs de Debug
```javascript
// Dans la console du navigateur
// ✅ Succès
"Admin access granted for user claudia@choyou.com to event choyou-design-1"

// ✅ Via eventIds
"Event access granted for user rabie@choyou.com to event choyou-dev-1 (in authorized list)"

// ❌ Refusé
"Access denied for user alessandro@itforbusiness.com to event choyou-design-1"
```

### Vérifications Manuelles
```typescript
// Dans la console du navigateur
// Vérifier l'utilisateur connecté
window.store.getState().session.user

// Vérifier les eventIds
window.store.getState().session.user.eventIds

// Vérifier les permissions CASL
window.store.getState().session.rules
```

## 📈 Améliorations Futures

1. **Cache des Permissions** : Mettre en cache les résultats CASL
2. **Audit Trail** : Logger les accès pour audit sécurité
3. **Permissions Temporaires** : Support d'accès limité dans le temps
4. **Notifications** : Alerter en cas d'accès refusé avec raison

---

**Status** : ✅ **IMPLÉMENTÉ** - Accès événements granulaire fonctionnel
**Test** : ✅ **VALIDÉ** - Tous les scénarios utilisateur testés
**Sécurité** : ✅ **CONFORME** - Respect du principe de moindre privilège