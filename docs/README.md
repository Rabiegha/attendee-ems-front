# 📚 Documentation EMS

Ce dossier contient toute la documentation technique et utilisateur du système Event Management System (EMS).

## 📋 Index des documents

### 🔧 Documentation technique

| Document                                                   | Description                                                                                                       | Mise à jour |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| [`TABLE_PATTERN.md`](./TABLE_PATTERN.md)                   | **Pattern standard pour les tableaux** - Architecture, onglets, sélection, bulk actions, sticky headers          | 08/01/2026  |
| [`TABLES_INVENTORY.md`](./TABLES_INVENTORY.md)             | **Inventaire des tableaux** - Liste complète des DataTables avec leur configuration et status                    | 08/01/2026  |
| [`DATATABLE_GUIDE.md`](./DATATABLE_GUIDE.md)               | **Guide complet DataTable** - Tutoriel avec exemples pratiques et résolution de problèmes                        | 08/01/2026  |
| [`COMPONENT_LIBRARY.md`](./COMPONENT_LIBRARY.md)           | **Bibliothèque de composants** - DataTable, BulkActions, et tous les composants réutilisables                    | 08/01/2026  |
| [`TEST_ACCOUNTS.md`](./TEST_ACCOUNTS.md)                   | **Comptes de test multi-organisations** - Liste complète des comptes disponibles pour tester les permissions RBAC | 24/09/2025  |
| [`ATTENDEES_ARCHITECTURE.md`](./ATTENDEES_ARCHITECTURE.md) | Architecture du système Attendees/Registrations avec CRM intégré                                                  | -           |
| [`USER_CREATION_WORKFLOW.md`](./USER_CREATION_WORKFLOW.md) | Workflow sécurisé de création d'utilisateur par invitation                                                        | -           |
| [`LOGOUT_CACHE_FIX.md`](./LOGOUT_CACHE_FIX.md)             | Fix critique - Nettoyage cache RTK Query à la déconnexion                                                         | -           |
| [`MULTI_SELECT_IMPLEMENTATION.md`](./MULTI_SELECT_IMPLEMENTATION.md) | Documentation historique sélection multiple (voir TABLE_PATTERN.md pour pattern actuel)          | Archivé     |

### 🐛 Documentation des corrections

| Document                                                               | Description                            | Statut    |
| ---------------------------------------------------------------------- | -------------------------------------- | --------- |
| [`DASHBOARD_ACCESS_FIX.md`](./DASHBOARD_ACCESS_FIX.md)                 | Correction accès dashboard après login | ✅ Résolu |
| [`EVENT_ACCESS_SOLUTION.md`](./EVENT_ACCESS_SOLUTION.md)               | Solution d'accès aux événements        | ✅ Résolu |
| [`EVENT_LIST_ACCESS_FIX.md`](./EVENT_LIST_ACCESS_FIX.md)               | Fix liste des événements               | ✅ Résolu |
| [`SUPER_ADMIN_EVENT_ACCESS_FIX.md`](./SUPER_ADMIN_EVENT_ACCESS_FIX.md) | Correction accès super admin           | ✅ Résolu |

## Environnement de test

### Accès aux comptes de test

```bash
# Via l'interface (développement uniquement)
# Bouton " Comptes test" en bas à droite de l'écran de login

# Via la documentation
# Voir TEST_ACCOUNTS.md pour la liste complète
```

### Base de données de test

```bash
# Connexion TablePlus
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: ems
```

### Reset environnement de test

```bash
# Backend - Reset complet des données de test
cd attendee-ems-back
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000003-create-demo-users.js
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000002-create-demo-roles.js
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000001-create-demo-organizations.js

# Recréer les données
docker-compose exec api npx sequelize-cli db:migrate
```

## 📁 Structure des documents

```
docs/
├── README.md                           # Ce fichier
├── TEST_ACCOUNTS.md                    #  Comptes de test (PRINCIPAL)
├── ATTENDEES_ARCHITECTURE.md          # Architecture système
├── USER_CREATION_WORKFLOW.md          # Workflow création utilisateur
├── LOGOUT_CACHE_FIX.md               # Fix critique cache RTK Query
├── DASHBOARD_ACCESS_FIX.md           # Fix accès dashboard
├── EVENT_ACCESS_SOLUTION.md          # Solution accès événements
├── EVENT_LIST_ACCESS_FIX.md          # Fix liste événements
└── SUPER_ADMIN_EVENT_ACCESS_FIX.md   # Fix super admin
```

## 🔄 Processus de mise à jour

### Ajout de nouveaux comptes de test

1. **Backend** : Modifier `migrations/20240201000003-create-demo-users.js`
2. **Frontend** : Mettre à jour `src/shared/ui/TestAccountsModal.tsx`
3. **Documentation** : Mettre à jour `TEST_ACCOUNTS.md`

### Ajout de nouvelles organisations

1. **Backend** : Modifier `migrations/20240201000001-create-demo-organizations.js`
2. **Backend** : Modifier `migrations/20240201000002-create-demo-roles.js`
3. **Frontend** : Mettre à jour le composant `TestAccountsModal`
4. **Documentation** : Mettre à jour la documentation

## 🏷️ Conventions de nommage

### Comptes de test

- **Email** : `[role]@[org-short].test`
- **Mot de passe** : `[Context][Role]#2024`
- **Exemple** : `admin@techstart.test` / `TechAdmin#2024`

### Documents

- **Fixes** : `[COMPONENT]_[ISSUE]_FIX.md`
- **Architecture** : `[COMPONENT]_ARCHITECTURE.md`
- **Workflows** : `[PROCESS]_WORKFLOW.md`

## 🎯 Objectifs de la documentation

- **Faciliter les tests** avec des comptes prêts à l'emploi
- **Documenter les corrections** pour éviter les régressions
- **Standardiser les workflows** de développement
- **Accélérer l'onboarding** des nouveaux développeurs

---

**Dernière mise à jour :** 24 septembre 2025  
**Responsable :** Documentation automatisée EMS
