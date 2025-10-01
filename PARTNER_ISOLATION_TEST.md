# Test d'Isolation des Permissions Partenaires

Ce document explique comment tester l'isolation des événements entre différents partenaires de la même organisation.

## 🎯 Objectif du Test

Vérifier que chaque partenaire ne voit que les événements qui lui sont spécifiquement assignés, plus les événements partagés, tout en étant dans la même organisation.

## 🏢 Configuration de Test - Creative Agency (org-2)

### 👥 Partenaires Configurés

#### 1. Partenaire Tech (`tech@creative.com`)
- **Rôle** : `PARTNER_TECH`
- **Événements accessibles** :
  - `event-tech-1` : Workshop React Native
  - `event-tech-2` : Conférence DevOps & Cloud
  - `event-shared-1` : Creative & Tech Summit (partagé)

#### 2. Partenaire Design (`design@creative.com`)
- **Rôle** : `PARTNER_DESIGN`
- **Événements accessibles** :
  - `event-design-1` : Atelier UX Design Thinking
  - `event-design-2` : Masterclass UI Animation
  - `event-shared-1` : Creative & Tech Summit (partagé)

### 📅 Événements Créés

#### Événements Tech (visibles par Partenaire Tech uniquement)
1. **Workshop React Native**
   - ID: `event-tech-1`
   - Date: 15 novembre 2024
   - Lieu: Creative Agency - Salle Tech

2. **Conférence DevOps & Cloud**
   - ID: `event-tech-2`
   - Date: 5 décembre 2024
   - Lieu: Creative Agency - Auditorium

#### Événements Design (visibles par Partenaire Design uniquement)
1. **Atelier UX Design Thinking**
   - ID: `event-design-1`
   - Date: 20 novembre 2024
   - Lieu: Creative Agency - Studio Design

2. **Masterclass UI Animation**
   - ID: `event-design-2`
   - Date: 10 décembre 2024
   - Lieu: Creative Agency - Lab Animation

#### Événement Partagé (visible par les deux partenaires)
1. **Creative & Tech Summit**
   - ID: `event-shared-1`
   - Date: 15 décembre 2024
   - Lieu: Creative Agency - Grand Amphithéâtre

##  Procédure de Test

### Étape 1: Test Partenaire Tech
1. Se connecter avec `tech@creative.com` / `demo123`
2. Naviguer vers la page Événements
3. **Résultat attendu** : Voir uniquement 3 événements
   - Workshop React Native
   - Conférence DevOps & Cloud
   - Creative & Tech Summit

### Étape 2: Test Partenaire Design
1. Se déconnecter
2. Se connecter avec `design@creative.com` / `demo123`
3. Naviguer vers la page Événements
4. **Résultat attendu** : Voir uniquement 3 événements
   - Atelier UX Design Thinking
   - Masterclass UI Animation
   - Creative & Tech Summit

### Étape 3: Test Admin (contrôle)
1. Se déconnecter
2. Se connecter avec `admin@creative.com` / `demo123`
3. Naviguer vers la page Événements
4. **Résultat attendu** : Voir tous les 5 événements de l'organisation

## 🔧 Implémentation Technique

### Filtrage au niveau API
```typescript
// Dans GET /events
const currentUser = users.find(u => u.id === payload.userId)

if (currentUser) {
  // Filtrer par organisation
  filteredEvents = mockEvents.filter(event => event.org_id === currentUser.orgId)
  
  // Filtrage spécifique pour les partenaires avec eventIds
  if (currentUser.eventIds && currentUser.eventIds.length > 0) {
    filteredEvents = filteredEvents.filter(event => 
      currentUser.eventIds.includes(event.id)
    )
  }
}
```

### Structure des Données Utilisateur
```typescript
{
  id: 'user-2-partner-tech',
  email: 'tech@creative.com',
  role: { code: 'PARTNER_TECH', ... },
  eventIds: ['event-tech-1', 'event-tech-2', 'event-shared-1']
}
```

## ✅ Points de Validation

### Isolation Correcte
- ✅ Partenaire Tech ne voit pas les événements Design
- ✅ Partenaire Design ne voit pas les événements Tech
- ✅ Les deux voient l'événement partagé
- ✅ Admin voit tous les événements

### Sécurité
- ✅ Tentative d'accès direct à un événement non autorisé retourne 404
- ✅ Les URLs d'événements non autorisés sont inaccessibles
- ✅ Filtrage basé sur l'organisation ET les permissions spécifiques

### UX/UI
- ✅ Pas d'indication qu'il existe d'autres événements
- ✅ Navigation fluide entre événements autorisés
- ✅ Pas d'erreurs visibles côté utilisateur

## 🚨 Cas d'Erreur à Tester

1. **Accès direct par URL**
   - Essayer d'accéder à `/events/event-design-1` en tant que Partenaire Tech
   - Attendu: Erreur 404 ou redirection

2. **Manipulation token**
   - Token invalide ou expiré
   - Attendu: Retour aux événements publics ou déconnexion

3. **Changement de rôle**
   - Utilisateur dont les permissions changent en cours de session
   - Attendu: Mise à jour des événements visibles

## 🎉 Résultat Final

Ce système permet de créer des **espaces de collaboration cloisonnés** au sein d'une même organisation, où :
- Chaque partenaire a son domaine d'expertise
- Des événements peuvent être partagés entre équipes
- La sécurité est assurée au niveau API
- L'expérience utilisateur reste fluide et naturelle

Cette approche respecte parfaitement l'architecture **feature-sliced** et les principes RBAC définis dans vos instructions.
