# 🧪 COMPTES DE TEST - EMS

## 📋 Vue d'ensemble

Ce document recense tous les comptes de test disponibles pour tester les fonctionnalités et permissions du système EMS. Ces comptes sont créés automatiquement via les migrations de base de données.

## 🏢 Organisations disponibles

| Organisation | Slug | Secteur | Timezone |
|-------------|------|---------|----------|
| Acme Corp | `acme-corp` | Généraliste | UTC |
| TechStart Innovate | `techstart-innovate` | Startup Tech | Europe/Paris |
| Global Events Corp | `global-events-corp` | Événementiel | America/New_York |
| Université Paris Digital | `universite-paris-digital` | Éducation | Europe/Paris |
| MedConf International | `medconf-international` | Médical | Europe/London |
| Sports & Wellness Hub | `sports-wellness-hub` | Sport | Australia/Sydney |

## 👥 Comptes de test par organisation

### 🏢 ACME CORP (Organisation principale)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@acme.test` | `Admin#12345` | `org_admin` | Compte admin original |
| `super.admin@ems.test` | `SuperAdmin#2024` | `org_admin` | Super administrateur |

**Cas d'usage :** Tests des fonctionnalités d'administration, gestion multi-organisations

---

### 💻 TECHSTART INNOVATE (Startup Tech)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@techstart.test` | `TechAdmin#2024` | `org_admin` | Administrateur startup |
| `manager@techstart.test` | `TechManager#2024` | `org_manager` | Manager événements |
| `dev@techstart.test` | `DevEvent#2024` | `event_manager` | Développeur organisateur |

**Cas d'usage :** Tests hiérarchie des permissions, gestion événements tech, workflows startup

---

### 🌍 GLOBAL EVENTS CORP (Événementiel International)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@globalevents.test` | `GlobalAdmin#2024` | `org_admin` | Admin événementiel |
| `coordinator@globalevents.test` | `EventCoord#2024` | `event_manager` | Coordinateur événements |
| `checkin@globalevents.test` | `CheckIn#2024` | `checkin_staff` | Personnel accueil |

**Cas d'usage :** Tests workflow événementiel, gestion participants, check-in/check-out

---

### 🎓 UNIVERSITÉ PARIS DIGITAL (Éducation)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@univ-paris.test` | `UnivAdmin#2024` | `org_admin` | Administrateur université |
| `prof@univ-paris.test` | `ProfEvent#2024` | `event_manager` | Professeur organisateur |
| `etudiant@univ-paris.test` | `Student#2024` | `readonly` | Étudiant lecture seule |

**Cas d'usage :** Tests permissions restrictives, accès lecture seule, hiérarchie éducative

---

### 🏥 MEDCONF INTERNATIONAL (Conférences Médicales)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@medconf.test` | `MedAdmin#2024` | `org_admin` | Admin conférences médicales |
| `doctor@medconf.test` | `DocEvent#2024` | `event_manager` | Médecin organisateur |
| `nurse@medconf.test` | `NurseStaff#2024` | `checkin_staff` | Personnel soignant |

**Cas d'usage :** Tests secteur spécialisé, workflow médical, gestion participants professionnels

---

### 🏃‍♂️ SPORTS & WELLNESS HUB (Centre Sportif)

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@sportshub.test` | `SportAdmin#2024` | `org_admin` | Admin centre sportif |
| `coach@sportshub.test` | `CoachEvent#2024` | `event_manager` | Coach organisateur |
| `partner@sportshub.test` | `Partner#2024` | `partner` | Partenaire commercial |

**Cas d'usage :** Tests rôle partenaire, accès limité, collaboration externe

## 🔑 Matrice des rôles et permissions

| Rôle | Permissions principales | Organisations avec ce rôle |
|------|------------------------|---------------------------|
| `super_admin` | Accès complet multi-orgs | *Disponible mais non assigné* |
| `org_admin` | Administration complète org | Toutes les organisations |
| `org_manager` | Gestion événements + users | TechStart |
| `event_manager` | Création/gestion événements | TechStart, Global Events, Université, MedConf, Sports Hub |
| `checkin_staff` | Check-in participants | Global Events, MedConf |
| `partner` | Accès limité événements | Sports Hub |
| `readonly` | Consultation uniquement | Université |

## 🧪 Scénarios de test recommandés

### 1. **Test d'isolation des organisations**
- Se connecter avec `admin@techstart.test`
- Vérifier qu'on ne voit QUE les données de TechStart Innovate
- Tenter d'accéder aux données d'autres organisations

### 2. **Test hiérarchie des permissions**
```
org_admin > org_manager > event_manager > checkin_staff > partner > readonly
```
- Tester avec différents rôles de TechStart
- Vérifier les restrictions d'accès progressives

### 3. **Test accès lecture seule**
- Se connecter avec `etudiant@univ-paris.test`
- Vérifier impossibilité de créer/modifier/supprimer
- Confirmer accès en lecture aux événements de l'université

### 4. **Test rôle partenaire**
- Se connecter avec `partner@sportshub.test`
- Vérifier accès limité aux événements partenaires
- Tester restrictions sur données sensibles

### 5. **Test workflow événementiel complet**
- **Admin** : `admin@globalevents.test` crée événement
- **Coordinator** : `coordinator@globalevents.test` configure
- **Staff** : `checkin@globalevents.test` gère les participants

## 🚀 Utilisation pour les développeurs

### Connexion rapide
```bash
# Frontend sur http://localhost:5173
# Utiliser n'importe quel compte de la liste ci-dessus

# Exemple de test rapide
Email: admin@techstart.test
Password: TechAdmin#2024
```

### Variables d'environnement recommandées
```bash
# .env.local pour les tests
VITE_DEFAULT_TEST_EMAIL=admin@techstart.test
VITE_DEFAULT_TEST_PASSWORD=TechAdmin#2024
VITE_ENABLE_TEST_DATA=true
```

### Reset des données de test
```bash
# Backend
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000003-create-demo-users.js
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000002-create-demo-roles.js
docker-compose exec api npx sequelize-cli db:migrate:undo --name 20240201000001-create-demo-organizations.js

# Recréer
docker-compose exec api npx sequelize-cli db:migrate
```

## 📊 Vérification avec TablePlus

**Connexion base de données :**
- **Host :** localhost
- **Port :** 5432
- **User :** postgres
- **Password :** postgres
- **Database :** ems

**Requêtes utiles :**
```sql
-- Voir tous les utilisateurs par organisation
SELECT 
  u.email, 
  o.name as organization, 
  r.name as role 
FROM users u 
JOIN organizations o ON u.org_id = o.id 
JOIN roles r ON u.role_id = r.id 
ORDER BY o.name, r.name;

-- Compter les utilisateurs par organisation
SELECT 
  o.name, 
  COUNT(u.id) as user_count 
FROM organizations o 
LEFT JOIN users u ON o.id = u.org_id 
GROUP BY o.name;
```

## ⚠️ Notes importantes

1. **Mots de passe temporaires** : Tous les mots de passe suivent le format `[Contexte]#2024`
2. **Données de test uniquement** : Ces comptes sont pour le développement/test uniquement
3. **Isolation garantie** : Chaque organisation est complètement isolée des autres
4. **Permissions RBAC** : Testez toujours avec différents rôles pour valider les permissions

## 🔄 Mise à jour

Ce document doit être mis à jour à chaque ajout/modification des données de test.

**Dernière mise à jour :** 24 septembre 2025
**Version migrations :** 20240201000003