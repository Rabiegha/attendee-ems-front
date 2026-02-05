# Section 1 - Vue d'Ensemble du Projet

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md)

---

## 1.1 Présentation Générale

**Attendee EMS** (Event Management System) est une plateforme professionnelle complète de gestion d'événements B2B conçue pour les entreprises organisant des événements récurrents ou ponctuels nécessitant une gestion rigoureuse des participants.

### Problématique Adressée

Les organisateurs d'événements professionnels font face à plusieurs défis :
- Gestion manuelle des inscriptions et participants
- Absence de centralisation des données
- Processus de check-in lent et sujet à erreurs
- Difficulté à suivre la présence en temps réel
- Génération manuelle de badges
- Reporting post-événement chronophage
- Pas d'historique des participants cross-événements

### Solution Apportée

Attendee EMS offre une solution intégrée qui :
- **Centralise** toutes les données événementielles
- **Automatise** les processus d'inscription et de check-in
- **Génère** automatiquement des badges professionnels
- **Suit** en temps réel la présence et les statistiques
- **Unifie** l'historique des participants sur tous les événements
- **Facilite** la communication via invitations et emails
- **Produit** des rapports et analytics détaillés

---

## 1.2 Vision et Objectifs

### Vision Produit

Devenir la plateforme de référence pour la gestion d'événements B2B en offrant :
- Une expérience utilisateur intuitive sur web et mobile
- Une flexibilité maximale pour tous types d'événements
- Une scalabilité permettant de gérer de petits comme de très grands événements
- Une architecture multi-tenant permettant à plusieurs organisations d'utiliser la plateforme de manière isolée

### Objectifs Business

1. **Productivité** : Réduire de 80% le temps de gestion d'un événement
2. **Précision** : Éliminer les erreurs de saisie et doublons
3. **Insights** : Fournir des analytics exploitables en temps réel
4. **Expérience** : Offrir une expérience professionnelle aux participants
5. **Scalabilité** : Supporter des événements de 10 à 10 000+ participants

### Objectifs Techniques

1. **Performance** : Temps de réponse API < 200ms
2. **Disponibilité** : Uptime > 99.5%
3. **Sécurité** : Conformité RGPD, données chiffrées
4. **Maintenance** : Code maintenable, tests automatisés
5. **Évolutivité** : Architecture modulaire permettant l'ajout de features

---

## 1.3 Écosystème Complet

Le projet Attendee EMS est composé de **trois applications interconnectées** formant un écosystème complet :

### 1.3.1 Backend API (attendee-ems-back)

**Technologie** : NestJS 10 + TypeScript 5 + PostgreSQL 16 + Prisma 5

**Rôle** : API REST centrale, cœur métier du système

**Responsabilités** :
- Gestion de la logique métier
- Authentification et autorisation
- Persistance des données
- Génération de badges PDF
- Envoi d'emails
- WebSockets pour temps réel
- API publique pour inscriptions

**Points d'accès** :
- API principale : `https://api.attendee.fr`
- Documentation Swagger : `https://api.attendee.fr/api`
- Health check : `https://api.attendee.fr/health`

### 1.3.2 Frontend Web (attendee-ems-front)

**Technologie** : React 18 + TypeScript + Vite + TailwindCSS

**Rôle** : Interface web d'administration et gestion

**Responsabilités** :
- Interface complète pour organisateurs
- Gestion des événements et participants
- Design et génération de badges
- Tableaux de bord et analytics
- Gestion des utilisateurs et permissions
- Formulaires publics d'inscription

**Points d'accès** :
- Application web : `https://attendee.fr`
- Formulaire public : `https://attendee.fr/public/events/:token`

**Utilisateurs Cibles** :
- Administrateurs d'organisations
- Managers d'événements
- Personnel administratif
- Consultants (accès lecture seule)

### 1.3.3 Application Mobile (attendee-ems-mobile)

**Technologie** : React Native + Expo + TypeScript + NativeWind

**Rôle** : Application mobile pour gestion terrain

**Responsabilités** :
- Check-in rapide des participants
- Scan de QR codes
- Impression de badges sur site
- Consultation des listes de participants
- Gestion des sessions
- Mode offline avec synchronisation

**Plateformes** :
- iOS 13+
- Android 8+

**Utilisateurs Cibles** :
- Hôtesses d'accueil
- Personnel terrain
- Managers d'événements (mobilité)

---

## 1.4 Utilisateurs Cibles et Personas

### 1.4.1 Hiérarchie des Rôles

Le système implémente **6 rôles utilisateurs** avec permissions distinctes :

#### 🔴 SUPER_ADMIN (Niveau 100)
- **Public** : Développeurs de l'application uniquement
- **Portée** : Cross-tenant (toutes organisations)
- **Cas d'usage** : Maintenance système, configuration plateforme

#### 🟠 ADMIN (Niveau 80)
- **Public** : Directeur/Responsable de l'organisation
- **Portée** : Organisation uniquement
- **Cas d'usage** : Gestion complète de son organisation
- **Limite** : Ne peut pas modifier son propre rôle

#### 🟡 MANAGER (Niveau 60)
- **Public** : Chefs de projet événementiels
- **Portée** : Organisation uniquement
- **Cas d'usage** : Création et gestion d'événements

#### 🔵 VIEWER (Niveau 40)
- **Public** : Consultants, observateurs
- **Portée** : Organisation, lecture seule
- **Cas d'usage** : Consultation des données, reporting

#### 🟣 PARTNER (Niveau 20)
- **Public** : Partenaires externes
- **Portée** : Événements assignés uniquement
- **Cas d'usage** : Accès limité à certains événements

#### 🟢 HOSTESS (Niveau 10)
- **Public** : Personnel d'accueil
- **Portée** : Événements assignés uniquement
- **Cas d'usage** : Check-in des participants uniquement

### 1.4.2 Personas Détaillés

#### Persona 1 : Marie - Responsable Événementiel (ADMIN)
- **Âge** : 35 ans
- **Contexte** : Organise 15-20 événements/an pour son entreprise
- **Besoins** : Vue d'ensemble, contrôle total, analytics
- **Utilisation** : Frontend web quotidiennement

#### Persona 2 : Thomas - Chef de Projet (MANAGER)
- **Âge** : 28 ans
- **Contexte** : Gère 3-5 événements simultanément
- **Besoins** : Création rapide, suivi participants, badges
- **Utilisation** : Frontend web + mobile occasionnellement

#### Persona 3 : Sarah - Hôtesse d'Accueil (HOSTESS)
- **Âge** : 24 ans
- **Contexte** : Accueil participants le jour J
- **Besoins** : Check-in rapide, scan QR codes, impression badges
- **Utilisation** : Application mobile uniquement

---

## 1.5 Périmètre Fonctionnel

### 1.5.1 Fonctionnalités Implémentées (✅ Opérationnelles)

#### Gestion des Organisations (Multi-tenancy)
- Création et configuration d'organisations
- Isolation complète des données
- Personnalisation par organisation
- Gestion des modules et plans

#### Gestion des Utilisateurs
- Création et invitation d'utilisateurs
- Attribution de rôles
- Gestion des permissions
- Profils utilisateurs complets
- Réinitialisation de mot de passe

#### Gestion des Événements
- Création d'événements (physique/online/hybride)
- Configuration complète (dates, lieu, capacité)
- Statuts d'événements (draft, published, archived, etc.)
- Types et secteurs d'activité personnalisables
- Attribution d'utilisateurs aux événements
- Soft delete et restauration
- Tags et catégorisation

#### Gestion des Participants (Attendees)
- Profils participants unifiés (CRM)
- Historique cross-événements
- Champs personnalisables
- Labels et notes
- Import/export Excel
- Déduplication automatique

#### Inscriptions (Registrations)
- Inscription à des événements spécifiques
- Formulaires personnalisables
- Statuts (awaiting, approved, refused, cancelled)
- Types de participants personnalisables
- Gestion des capacités
- API publique d'inscription

#### Badges
- Templates de badges personnalisables (HTML/CSS)
- Éditeur visuel de badges (GrapesJS)
- Génération PDF automatique (Puppeteer)
- QR codes uniques par participant
- Stockage sur Cloudflare R2
- Règles de badges par type de participant
- Preview en temps réel

#### Check-in et Présence
- Check-in manuel ou via QR code
- Check-out optionnel
- Historique des visites
- Géolocalisation du check-in
- Tracking en temps réel
- Modes de présence (onsite/online/hybrid)

#### Sessions
- Création de sessions dans un événement
- Gestion de la capacité par session
- Restriction par type de participant
- Scan d'entrée/sortie de session

#### Invitations
- Envoi d'invitations par email
- Tokens sécurisés avec expiration
- Workflow de complétion de compte
- Suivi des statuts (pending, accepted, expired)

#### Emails
- Système centralisé d'envoi (SMTP)
- Templates HTML responsive
- Emails de confirmation d'inscription
- Emails de rappel d'événement
- Emails d'invitation
- Reset de mot de passe

#### Tags
- Système de tags réutilisables
- Attribution aux événements
- Recherche et filtrage par tags
- Statistiques d'utilisation

#### Reporting et Analytics
- Statistiques en temps réel par événement
- Dashboards interactifs
- Export de données (Excel)
- Graphiques et visualisations
- Suivi de présence

### 1.5.2 Contraintes Connues

#### Techniques
- Puppeteer nécessite Chromium installé (environnement Docker configuré)
- Stockage badges sur Cloudflare R2 (configuration requise)
- PostgreSQL requis (pas de support autre DB)
- Node.js 18+ minimum

#### Fonctionnelles
- Pas de paiement en ligne intégré
- Pas de gestion de billetterie
- Pas de live streaming intégré
- Pas de chatbot ou assistant IA
- Pas de marketplace de services

#### Scalabilité
- WebSocket limité à 1000 connexions simultanées (configurable)
- Génération de badges limitée à 50 simultanées (files d'attente)
- Import Excel limité à 5000 lignes

---

## 1.6 Valeur Ajoutée du Système

### Pour les Organisateurs

1. **Gain de Temps** : Automatisation de 80% des tâches répétitives
2. **Réduction d'Erreurs** : Élimination des saisies manuelles
3. **Vision 360°** : Tous les participants et événements centralisés
4. **Professionnalisme** : Badges et communications de qualité
5. **Insights** : Données et tendances exploitables

### Pour les Participants

1. **Inscription Simplifiée** : Formulaires optimisés
2. **Communication Claire** : Emails automatiques et rappels
3. **Check-in Rapide** : QR codes et scan mobile
4. **Expérience Moderne** : Interface professionnelle

### Pour l'Organisation

1. **Multi-tenant** : Une seule instance pour plusieurs clients
2. **Scalable** : Gère 10 à 10 000+ participants
3. **Sécurisé** : RBAC complet, données isolées
4. **Maintenable** : Code structuré, tests automatisés
5. **Évolutif** : Architecture modulaire

---

## 1.7 Métriques de Succès

### KPIs Techniques

- ✅ Temps de réponse API moyen : **< 150ms**
- ✅ Taux de disponibilité : **99.5%+**
- ✅ Couverture de tests : **> 70%**
- ✅ Temps de build : **< 3min**
- ✅ Temps de déploiement : **< 10min**

### KPIs Fonctionnels

- ✅ Temps moyen de création d'événement : **< 5min**
- ✅ Temps moyen de check-in : **< 10sec**
- ✅ Taux de génération badges réussie : **> 99%**
- ✅ Temps de génération d'un badge : **< 5sec**

### KPIs Business

- ✅ Nombre d'organisations actives
- ✅ Nombre d'événements créés/mois
- ✅ Nombre de participants gérés
- ✅ Taux d'adoption de l'app mobile
- ✅ Satisfaction utilisateur (NPS)

---

[▶ Section 2 : Architecture Technique](./02-ARCHITECTURE-TECHNIQUE.md)
