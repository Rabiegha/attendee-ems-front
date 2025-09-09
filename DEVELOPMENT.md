# 🚀 Guide de Développement Frontend sans Backend

## ✅ Configuration MSW Active

Votre projet est configuré avec Mock Service Worker (MSW) pour simuler un backend complet.

## 🎯 Connexion Test

**URL :** http://localhost:5174/login
**Identifiants :**
- Email: `admin@example.com`
- Password: `password`

## 📊 Données de Test Disponibles

### Utilisateurs
- **Admin User** (ORG_ADMIN) - Accès complet à l'organisation

### Événements Mock
- **Conférence Tech 2024** - 150/200 participants
- **Workshop React** - 25/30 participants

### Participants Mock
- **5 participants** avec différents statuts (confirmed, checked_in, pending, etc.)
- Données réalistes (entreprises, postes, téléphones)

## 🛠 APIs Mockées Disponibles

### Authentification
- `POST /auth/login` - Connexion
- `GET /auth/me` - Profil utilisateur
- `GET /auth/policy` - Permissions RBAC

### Événements
- `GET /events` - Liste des événements
- `GET /events/:id` - Détail d'un événement

### Participants
- `GET /attendees` - Liste des participants
- `GET /attendees/:id` - Détail d'un participant
- `POST /attendees/export` - Export CSV

## 🎨 Fonctionnalités à Développer

### Phase 1 - UI Core
- [ ] Page de connexion
- [ ] Dashboard principal
- [ ] Navigation et sidebar
- [ ] Layout responsive

### Phase 2 - Gestion Événements
- [x] Liste des événements (avec filtres et permissions)
- [ ] Création d'événement
- [ ] Édition d'événement
- [x] Détails d'événement

### Phase 3 - Gestion Participants
- [ ] Liste des participants
- [ ] Filtres et recherche
- [ ] Check-in interface
- [ ] Export de données

### Phase 4 - Permissions & UX
- [ ] Guards de routes
- [ ] Interface conditionnelle selon rôles
- [ ] Notifications toast
- [ ] Loading states

## 🔧 Commandes Utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Storybook
npm run storybook

# Build de production
npm run build
```

## 📝 Notes Importantes

1. **MSW intercepte automatiquement** les requêtes API
2. **Données persistées** uniquement en mémoire (rechargement = reset)
3. **Permissions RBAC** fonctionnelles avec les mocks
4. **TypeScript strict** - toutes les APIs sont typées
5. **Hot reload** actif pour un développement rapide

## 🐛 Corrections Apportées

✅ **Problème CASL résolu** - Les hooks `useCan` et `useCannot` ont été corrigés pour fonctionner correctement avec l'API CASL

✅ **Composant Can mis à jour** - Interface de permissions conditionnelles fonctionnelle

✅ **Page de test des permissions** - `/src/pages/PermissionsTest/index.tsx` pour valider les autorisations

✅ **Affichage double corrigé** - Suppression de la duplication dans `main.tsx` qui causait le rendu double de l'application

✅ **Redirection auth améliorée** - `RootLayout` redirige maintenant proprement vers `/auth/login` au lieu d'afficher directement la page

✅ **Page Événements globale** - Nouvelle page `/events` avec liste complète, filtres avancés et gestion des permissions par rôle

## 🎯 Prochaines Étapes

1. **Testez la connexion** avec les identifiants fournis (`admin@example.com` / `password`)
2. **Vérifiez les permissions** en navigant vers la page de test
3. **Explorez les pages existantes** (Dashboard, Attendees, Events)
4. **Développez les composants manquants**
5. **Ajoutez des données mock** si nécessaire
6. **Testez différents rôles** en modifiant les mocks

## 🔧 URLs Utiles

- **Application:** http://localhost:5174/
- **Login:** http://localhost:5174/login  
- **Test Permissions:** http://localhost:5174/permissions-test (après connexion)

---

**Votre environnement est prêt !** 🎉
Les erreurs CASL sont corrigées, vous pouvez développer votre frontend complet sans backend.
