# 🌐 i18n Audit Report — attendee-ems-front

> Comprehensive audit of all hardcoded French/English strings that need internationalization.
> Generated from a full scan of `src/pages/`, `src/features/`, `src/widgets/`, and `src/shared/ui/`.

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total component files audited | ~120+ |
| Files using `useTranslation` | **8** |
| Files with hardcoded strings needing i18n | **~100+** |
| Translation namespaces defined | 6 (`common`, `events`, `auth`, `attendees`, `signup`, `invitations`) |
| Translation locale folders | `en/`, `fr/` |

**Conclusion:** i18n adoption is at roughly **~7%**. The vast majority of the app contains hardcoded French strings. Even the 8 files that import `useTranslation` still have many hardcoded strings alongside their `t()` calls.

---

## Translation Infrastructure

**Config:** `src/shared/lib/i18n/index.ts`

**Locale files:**
| Namespace | FR | EN |
|-----------|----|----|
| `common` | `locales/fr/common.json` | `locales/en/common.json` |
| `events` | `locales/fr/events.json` | `locales/en/events.json` |
| `auth` | `locales/fr/auth.json` | `locales/en/auth.json` |
| `attendees` | `locales/fr/attendees.json` | `locales/en/attendees.json` |
| `signup` | `locales/fr/signup.json` | `locales/en/signup.json` |
| `invitations` | `locales/fr/invitations.json` | `locales/en/invitations.json` |

---

## 1. `src/pages/` — Page Components

### 1.1 Pages WITH `useTranslation` (but still have hardcoded strings)

#### `Dashboard/index.tsx`
- **i18n:** `useTranslation(['common', 'events', 'auth'])`
- **Remaining hardcoded strings:**
  - `"Bienvenue"`, `"Vous êtes connecté en tant que..."`
  - `"Événements récents"`, `"Voir plus"`, `"Inscriptions récentes"`
  - `"Aucune inscription récente"`
  - `"Approuvé"`, `"En attente"`, `"Refusé"`
  - `"Besoin d'aide ou de permissions supplémentaires ?"`
  - `"Contactez votre administrateur..."`, `"Organisation :"`

#### `Login/index.tsx`
- **i18n:** `useTranslation('auth')`
- **Remaining hardcoded strings:**
  - Zod: `"Invalid email address"`, `"Password must be at least 6 characters"`
  - Placeholders: `"nom@exemple.com"`, `"••••••••"`
  - Many `t()` calls use French fallback defaults like `t('login.success_title', 'Connexion réussie')`

#### `Events/index.tsx`
- **i18n:** `useTranslation(['events', 'common'])`
- **Remaining hardcoded strings (massive):**
  - Filters: `'Statut'`, `'Brouillon'`, `'Publié'`, `'Actif'`, `'Terminé'`, `'Annulé'`, `'Type de lieu'`, `'En ligne'`, `'Physique'`, `'Hybride'`, `"État de l'événement"`, `'À venir'`, `'En cours'`, `'Attribution'`, `'Attribués à moi'`, `'Non attribués'`
  - Sort: `'Créé (plus récent)'`, `'Date (plus proche)'`, `'Nom (A-Z)'`
  - Messages: `"Événements"`, `"Gérez vos événements"`, `"Rechercher des événements..."`, `"Filtrer par tags..."`, `"Tout effacer"`, `"Aucun événement trouvé"`, `"Commencez par créer votre premier événement."`, `"Créer un événement"`, `"Erreur lors du chargement des événements"`, `"Affichage de X à Y sur Z événement(s)"`, `"Par page :"`, `"+X autres"`

#### `Attendees/index.tsx`
- **i18n:** `useTranslation(['attendees', 'common'])`
- **Remaining hardcoded strings:**
  - `"Participants actifs"`, `"Participants supprimés"`
  - `"Gérez les participants inscrits à vos événements"`
  - `"Aucun participant à exporter"`, `"Export de X participant(s) en cours..."`
  - `"X participant(s) exporté(s) avec succès"`
  - `"Erreur lors du chargement/export des participants"`
  - `"Accès aux participants refusé"`, `"Vous n'avez pas les permissions nécessaires..."`

#### `NotFound/index.tsx`
- **i18n:** `useTranslation('common')`
- **Remaining hardcoded strings:**
  - `"La page que vous recherchez n'existe pas."`, `"Tableau de bord"`

---

### 1.2 Pages WITHOUT `useTranslation` (100% hardcoded)

#### `AccessDenied/AccessDenied.tsx`
- `"Accès refusé"`, `"Vous n'avez pas les permissions nécessaires..."`, `"Besoin d'accès ?"`, `"Contactez votre administrateur..."`, `"Retour à l'accueil"`, `"Page précédente"`, `"Si vous pensez qu'il s'agit d'une erreur..."`

#### `Forbidden/index.tsx`
- `"403 - Accès interdit"`, `"Vous n'avez pas les permissions nécessaires..."`

#### `Signup/index.tsx`
- `"Lien d'invitation invalide"`, `"Invitation invalide"`, `"Invitation expirée"`, `"Erreur de sécurité"`, `"Compte déjà activé"`, `"Invitation déjà utilisée"`, `"Finaliser votre inscription"`, `"Complétez votre profil..."`, `"Se connecter"`, `"Demander une nouvelle invitation"`, `"Retour à l'accueil"`, `"Contacter le support"`, `"Validation de votre invitation..."`, full errorMessages map

#### `Users/index.tsx` (~766 lines)
- Column headers: `"Utilisateur"`, `"Rôle"`, `"Statut"`, `"Créé le"`
- Status: `"Actif"`, `"Inactif"`, `"Doit changer mdp"`, `"Non défini"`
- Actions: `"Modifier"`, `"Désactiver"`, `"Restaurer"`, `"Supprimer définitivement"`
- Page: `"Gestion des utilisateurs"`, `"Créez et gérez les comptes utilisateur..."`
- Search: `"Rechercher par nom ou email..."`
- Filters: `"Rôles"`, `"Tous les rôles"`, `"Utilisateurs actifs"`, `"Utilisateurs supprimés"`
- Bulk: `"X sélectionné(s)"`, `"Tout désélectionner"`, `"Actions"`
- Empty: `"Aucun utilisateur supprimé"`, `"Aucun utilisateur trouvé"`
- Bulk actions: `"Désactiver les utilisateurs"`, `"Réactiver les utilisateurs"`
- Toast: `"Rôle mis à jour"`, `"Erreur"`, `"Impossible de mettre à jour le rôle"`, `"Vous ne pouvez pas modifier votre propre rôle"`
- Access: `"Accès aux utilisateurs refusé"`, `"Vous n'avez pas les permissions nécessaires..."`
- Inviter: `"Inviter utilisateur"`

#### `Invitations/index.tsx` (~779 lines)
- `"Inviter un utilisateur"`, `"Envoyez une invitation par email..."`, `"Nouvelle invitation"`, `"Remplissez les informations ci-dessous"`
- Form: `"Adresse email"`, `"L'email est requis"`, `"Organisation"`, `"Sélectionnez d'abord l'organisation..."`, `"Assigner à une organisation existante"`, `"Chargement..."`, `"Sélectionner une organisation"`, `"Créer une nouvelle organisation"`, `"Nom de l'organisation"`, `"Rôle"`, `"Sélectionner un rôle"`
- Button: `"Envoi en cours..."`, `"Création de l'organisation..."`, `"Envoyer l'invitation"`
- Info: `"Comment ça fonctionne"`, `"Email envoyé"`, `"Lien sécurisé"`, `"Compte créé"`, `"Points importants"`
- Validation: `"Champs requis"`, `"Invitation déjà en cours"`, `"Utilisateur déjà membre"`, `"Compte existant détecté"`, `"Email invalide"`
- Access: `"Accès refusé"`, `"Accès aux invitations refusé"`

#### `CreateEvent/index.tsx`
- Step labels: `"Informations"`, `"Lieu & Participants"`, `"Options"`
- `"Créer un événement"`, `"Créez un nouvel événement en quelques étapes"`
- Buttons: `"Annuler"`, `"Précédent"`, `"Suivant"`, `"Créer l'événement"`
- Toast: `"Événement créé avec succès !"`, `"Erreur"`, `"Erreur lors de la création de l'événement"`

#### `EmailManagement/index.tsx`
- `"Gestion des Emails"`, `"Configurez les templates d'emails automatiques..."`
- `"Templates d'emails"`, `"Confirmation d'inscription"`, `"Approbation d'inscription"`, `"Refus d'inscription"`, `"Invitation utilisateur"`
- `"Aperçu"`, `"Objet :"`, `"Aucun template d'email configuré"`
- `"À propos des templates d'emails"`, `"Tester l'envoi d'email"`
- Form: `"Type de template"`, `"Adresse email de destination"`, `"Envoyer"`, `"Envoi..."`
- Various error/success toast messages

#### `EventDetails/index.tsx` (~1324 lines)
- Tab labels: `"Détails"`, `"Inscriptions"`, `"Statistiques"`, `"Équipe"`, `"Types de participants"`, `"Badges"`, `"Sessions"`, `"Formulaire"`, `"Emails"`, `"Impression"`, `"Paramètres"`
- `"S'inscrire"` (default submit button text)
- Tabs: `"Actives"`, `"Supprimées"`
- Error: `"Accès refusé"`, `"Événement non trouvé"`, `"Vous n'avez pas accès à cet événement..."`, `"Retour aux événements"`
- `"CET ÉVÉNEMENT A ÉTÉ SUPPRIMÉ"`, `"Cet événement est conservé dans l'historique..."`
- Many toast messages for CRUD operations

#### `ChangePassword/index.tsx` (~296 lines)
- Zod: `"Mot de passe actuel requis"`, `"Le nouveau mot de passe doit contenir au moins 8 caractères"`, `"Le mot de passe doit contenir..."`, `"Les mots de passe ne correspondent pas"`
- `"Changement de mot de passe requis"`, `"Pour des raisons de sécurité..."`
- Form: `"Mot de passe actuel"`, `"Nouveau mot de passe"`, `"Confirmer le nouveau mot de passe"`
- Toast: `"Mot de passe mis à jour !"`, `"Redirection en cours..."`, `"Mot de passe incorrect"`, `"Erreur"`

#### `Reports/index.tsx` (~758 lines)
- All chart labels, report titles, and data labels are hardcoded French

#### `Printing/PrintingPage.tsx`
- `"Gestion des imprimantes"`, `"Vue d'ensemble des clients d'impression..."`
- `"X client(s) connecté(s)"`, `"Aucun client connecté"`, `"Actualiser"`
- `"Aucune imprimante détectée"`, `"Connectez le client d'impression EMS..."`
- `"X imprimante(s) disponible(s)"`, `"Défaut"`, `"Prête"`, `"Erreur / Hors ligne"`, `"Appareil inconnu"`

#### `RequestPasswordReset/index.tsx` (~235 lines)
- Zod: `"Adresse email invalide"`
- `"Email envoyé !"`, `"Si un compte existe avec cette adresse..."`, `"Vérifiez votre boîte de réception"`, `"Le lien de réinitialisation est valable pendant 1 heure"`
- Buttons: `"Retour à la connexion"`, `"Renvoyer un email"`
- `"Mot de passe oublié ?"`, `"Entrez votre email pour recevoir un lien..."`
- Form: `"Adresse email"`, placeholder `"vous@exemple.com"`

#### `ResetPassword/index.tsx` (~447 lines)
- Zod validation messages in French (password rules)
- `"Token de réinitialisation manquant"`, `"Validation du lien"`, `"Veuillez patienter..."`
- Password strength: `"Faible"`, `"Moyen"`, `"Fort"`
- All form labels and messages

#### `PublicRegistration/index.tsx` (~677 lines)
- Public-facing registration form — all labels, messages, validation, toasts in French

#### `PrivacyPolicy/index.tsx` (~210 lines)
- Entire page is hardcoded legal French text (privacy policy)

#### `AttendeeTypes/index.tsx` (~707 lines)
- Tabs: `"Types actifs"`, `"Types désactivés"`
- Form: `"Couleur de fond"`, `"Couleur de texte"`, `"Utilisation"`
- Toast: `"Type de participant créé avec succès"`, `"Erreur lors de la création du type"`, `"Couleur mise à jour"`
- `"Cliquer pour modifier"`

#### `AttendeeDetail/index.tsx` (~418 lines)
- `"Erreur lors du chargement"`, `"Impossible de charger les détails du participant."`
- `"Retour aux participants"`, `"Profil détaillé et historique de participation"`, `"Retour"`

#### `CompleteInvitation/index.tsx` (~487 lines)
- Zod: `"Le prénom est requis"`, `"Le nom est requis"`, `"Le mot de passe est requis"`, `"Le mot de passe doit contenir au moins 8 caractères"`, `"Les mots de passe ne correspondent pas"`
- `"Complétez votre inscription"`, `"Créez votre mot de passe..."`
- `"Vérification de votre invitation..."`
- Password strength: `"Faible"`, `"Moyen"`, `"Fort"`, `"Très fort"`

#### `PrintClientDownload/index.tsx`
- `"Client d'Impression"`, `"Téléchargez le client d'impression automatique..."`
- `"Windows"`, `"macOS"`, `"Télécharger"`

#### `ApplicationDownload/index.tsx`
- `"Application Mobile"`, `"Téléchargez l'application Android..."`
- `"Scanner pour télécharger"`, `"Instructions d'installation"`, `"Fonctionnalités principales"`, `"Compatibilité"`
- Feature list and installation step strings

#### `RolePermissionsAdmin/RolePermissionsAdmin.tsx` (~894 lines)
- `"Système"`, `"Votre rôle"`, `"Protégé"`
- `"X permissions • Niveau Y"`, `"Supprimer ce rôle"`
- All permission category labels and descriptions

#### `BadgeDesigner/BadgeDesignerPage.tsx` (~1663 lines)
- All badge designer UI labels (toolbar, fields, properties panel, etc.)

---

## 2. `src/widgets/` — Widget Components

#### `Header/index.tsx`
- **i18n:** `useTranslation('common')`
- **Remaining hardcoded:** `'Utilisateur'` (fallback)

#### `Sidebar/index.tsx`
- **i18n:** `useTranslation('common')` — ✅ Fully translated via `t()` keys

#### `StatsCards/index.tsx`
- **No i18n**
- Hardcoded: `"Événements"`, `"Gérer les événements"`, `"Participants"`, `"Voir tous les participants"`, `"Créer un événement"`, `"Nouvel événement"`, `"Inviter utilisateur"`, `"Ajouter un membre"`, `"X actifs"`, `"X total"`

#### `layouts/AuthLayout.tsx`, `layouts/RootLayout.tsx`
- Structural layouts — minimal hardcoded text expected

---

## 3. `src/features/` — Feature UI Components

### 3.1 `features/registrations/ui/` (17 files — NO `useTranslation`)

#### `RegistrationsTable.tsx` (largest)
- Status labels: `'Approuvé'`, `'Refusé'`, `'Annulé'` (repeated in multiple status maps)
- Filter labels: `'Approuvés'`, `'Refusés'`, `'Annulés'`, `'Enregistrés'`
- Capacity: `'Capacité atteinte'`, `"L'événement est complet. Impossible d'approuver ce participant."`
- Toast: `'Génération du badge en cours...'`, `'Utilisateur non connecté'`, `"Impossible de générer le badge automatiquement"`, `"Impossible d'obtenir l'URL du badge"`, `"Badge de X ajouté à la file d'impression"`, `"Erreur lors de l'impression du badge"`, `"Vous devez être connecté pour télécharger un badge"`, `"Erreur lors du téléchargement du badge"`
- Tooltips: `title="Télécharger PDF"`, `title="Télécharger Image"`

#### `AddParticipantForm.tsx`
- Toast: `'Email requis'`, `"L'adresse email est obligatoire"`, `"Une erreur est survenue"`, `"Données invalides"`, `"L'événement est complet"`, `"L'événement n'accepte plus d'inscriptions"`, `"Erreur d'inscription"`
- Status: `"Approuvé"`, `"Refusé"`, `"Annulé"`

#### `ImportExcelModal.tsx` (largest modal, ~1150 lines)
- Column mapping French names: `'prénom'`, `'téléphone'`, `'entreprise'`, `'société'`, `'présence'`
- Toast errors: `'Format de fichier non supporté...'`, `'Le fichier Excel ne contient aucune feuille'`, `'Le fichier Excel est vide'`, `'Impossible de lire le fichier Excel'`, `'Aucune donnée à importer'`, `'Aucune ligne sélectionnée pour l\'import'`, `'Erreur lors du téléchargement du modèle'`, `'Fonctionnalité en cours de développement'`
- Status options: `'Approuvé'`, `'Refusé'`, `'Annulé'`, `'Présent'`, `'Présentiel'`
- UI: `"Sélectionnées"`, `"Capacité dépassée"`, `"Aucune colonne standard détectée"`, `"Ignorés / Erreurs"`, import result summary text
- Error mapping: `'Événement complet'`, `'Déjà inscrit'`, `'Précédemment refusé'`
- Title: `"Importer des inscriptions (Excel)"`
- Help text with hardcoded column name documentation

#### `BadgePreviewModal.tsx`
- Title: `"Aperçu du Badge"`
- Buttons: `'Téléchargement...'` / `'Télécharger PDF'`, `'Télécharger Image'`
- Error: `'Erreur de chargement du badge'`, `'Aucun template de badge n\'a été configuré...'`, `"Erreur inconnue"`
- `"Aucun template de badge configuré"`, `"Créez d'abord un template dans la section Badges"`

#### `BadgeDownloadModal.tsx`
- `"Choisissez le format de téléchargement :"`, `"Téléchargement..."`
- Toast: `"Badge téléchargé en format..."`, `"Erreur lors du téléchargement du badge"`

#### `QrCodeModal.tsx`
- Title: `"QR Code Check-in"`
- `"Scannez ce QR Code avec l'application mobile..."`, `"Chargement..."`
- Buttons: `'Téléchargement...'` / `'Télécharger PNG'`
- Error: `'Erreur de chargement du QR Code'`, `'Erreur lors du téléchargement du QR Code'`

#### `BulkActionsModal.tsx`
- Title: `"Actions groupées (X)"`
- Action descriptions: `'Télécharger les inscriptions au format Excel'`, `'Enregistrer l\'arrivée des participants'`, `'Annuler l\'enregistrement d\'arrivée'`

#### `BulkStatusChangeModal.tsx`
- Title: `"Changer le statut"`
- Status options: `'Approuvé'`, `'Refusé'`, `'Annulé'`

#### `BulkStatusConfirmationModal.tsx`
- Title: `"${statusLabel} les inscriptions"`
- `"L'email de confirmation sera envoyé selon les paramètres configurés..."`

#### `BulkAttendeeTypeChangeModal.tsx`
- Title: `"Changer le type de participant"`
- `'Aucun'` (no-type option)

#### `EditRegistrationModal.tsx`
- Title: `"Modifier l'inscription"`

#### `ApprovalConfirmationModal.tsx`
- Title: `"Approuver l'inscription"`
- `"L'email sera envoyé selon les paramètres configurés..."`

#### `RejectionConfirmationModal.tsx`
- Title: `"Refuser l'inscription"`

#### `RestoreRegistrationModal.tsx`
- Title: `"Restaurer l'inscription"`

#### `PermanentDeleteRegistrationModal.tsx`
- Title: `"Supprimer définitivement"`

#### `DeleteConfirmModal.tsx`
- Confirmation dialog strings

#### `BulkConfirmationModal.tsx`
- Generic confirmation modal (receives title/message as props)

---

### 3.2 `features/events/ui/` (10 files — NO `useTranslation`)

#### `EventForm.tsx`
- Labels: `"Nom de l'événement"`, placeholder `"Conférence Tech 2024"`
- Button: `"Créer l'événement"` / `"Mettre à jour"`

#### `EditEventModal.tsx`
- Title: `"Modifier l'événement"`
- Toast: `'Événement modifié !'`, `"L'événement X a été mis à jour avec succès."`, `"Une erreur est survenue lors de la modification..."`

#### `DeleteEventModal.tsx`
- Title: `"Supprimer l'événement"`
- `"Êtes-vous sûr de vouloir supprimer l'événement..."`
- Toast: `'Événement supprimé !'`, `"L'événement X a été supprimé avec succès."`, `"Une erreur est survenue lors de la suppression..."`

#### `EventList.tsx`
- `"Aucun événement trouvé"`
- Status labels: `'Publié'`, `'Annulé'`, `'Reporté'`, `'Archivé'`
- Note: has `useTranslation` commented out

#### `FormBuilder.tsx` (~500 lines)
- Field types: `'Téléphone'`
- Default fields: `'Prénom'`, `'Téléphone'`
- Tooltips: `"Annuler (Ctrl+Z)"`, `"Rétablir (Ctrl+Y)"`, `"Supprimer le champ"`
- `"Aucun champ configuré"`

#### `FormPreview.tsx`
- Toast: `'Email requis'`, `"L'adresse email est obligatoire"`, `'Erreur configuration'`, `"L'événement n'a pas de token public"`, `"Une erreur est survenue lors de l'inscription"`, `"Erreur d'inscription"`
- `"L'événement est complet"`, `"L'événement n'accepte plus d'inscriptions"`
- `"Inscription à l'événement"`, `"Événement annulé"`, `"Événement terminé"`, `"Aucun champ configuré"`

#### `EmbedCodeGenerator.tsx`
- `"Code d'intégration"`, `"Instructions d'intégration :"`, `"Vous pouvez également partager ce lien directement..."`
- Toast: `'Erreur'`, `'Impossible de copier le code'`

#### `PartnerSelect.tsx`
- `"Chargement des partenaires..."`, `"Erreur lors du chargement des partenaires"`
- `searchPlaceholder="Rechercher un partenaire par nom ou email..."`, `emptyMessage="Aucun partenaire trouvé dans votre organisation"`

#### `ImportRegistrationsModal.tsx`
- Import wizard strings (similar to ImportExcelModal)

#### `RegistrationsList.tsx`
- Registration list display strings

---

### 3.3 `features/users/ui/` (7 files — NO `useTranslation`)

#### `CreateUserModal.tsx`
- Label: `"Prénom"`, `"Téléphone (optionnel)"`
- Error: `"Une erreur est survenue lors de la création de l'utilisateur"`, `'Erreur de création'`

#### `CreateUserEnhancedModal.tsx`
- Labels: `"Prénom"`, `"Téléphone (optionnel)"`
- Loading: `"Création de l'organisation..."`, `"Création de l'utilisateur..."`, `"Chargement..."`, `"Chargement des rôles..."`
- Buttons: `"Créer l'organisation et l'utilisateur"`, `"Créer l'utilisateur"`
- Error: `"Erreur lors de la création de l'organisation"`, `"Erreur de création"`, `"Erreur de création d'organisation"`, `"Une erreur est survenue lors de la création de l'utilisateur"`

#### `EditUserModal.tsx`
- Title: `"Modifier l'utilisateur"`
- Labels: `"Prénom"`, `"Téléphone"`

#### `DeleteUserModal.tsx`
- Title: `"Désactiver cet utilisateur"`

#### `RestoreUserModal.tsx`
- Title: `"Restaurer cet utilisateur"`

#### `PermanentDeleteUserModal.tsx`
- Title: `"Supprimer définitivement"`

#### `UserCredentialsModal.tsx`
- Credential display strings

---

### 3.4 `features/attendees/ui/` (6 files — only `AttendeeFilters.tsx` uses `useTranslation`)

#### `AttendeeFilters.tsx`
- **i18n:** `useTranslation('attendees')` — partially translated

#### `AttendeeTable.tsx`
- `emptyMessage="Aucun participant trouvé"`
- `"Aucun"` (no-type label)
- Tooltips: `"Restaurer"`, `"Supprimer définitivement"`
- Bulk actions: `title: 'Supprimer les participants'`, `title: 'Restaurer les participants'`, `title: 'Suppression définitive'`
- Toast: `"X participant(s) exporté(s)"`, `"X participant(s) supprimé(s)"`, `"X participant(s) restauré(s)"`, `"X participant(s) supprimé(s) définitivement"`, `"Erreur lors de l'export"`, `"Erreur lors de la suppression"`, `"Erreur lors de la restauration"`, `"Erreur lors de la suppression définitive"`

#### `EditAttendeeModal.tsx`
- Title: `"Modifier le participant"`

#### `DeleteAttendeeModal.tsx`
- Toast: success/error messages for deletion
- `'Erreur de suppression'`, `'Une erreur est survenue lors de la suppression du participant. Veuillez réessayer.'`

#### `RestoreAttendeeModal.tsx`
- `"Restaurer l'accès à toutes ses données"`

#### `PermanentDeleteAttendeeModal.tsx`
- `"Supprimer définitivement ce participant"`, `"Supprimer toutes ses inscriptions"`, `"Supprimer toutes ses statistiques"`, `"Supprimer son historique complet"`, `"Supprimer définitivement"`
#### `BulkActionsModal.tsx`
- `title="Actions groupées (X)"`
- `description: 'Télécharger les participants au format Excel'`

---

### 3.5 `features/attendee-types/ui/` (5 files — NO `useTranslation`)

#### `CreateAttendeeTypeModal.tsx`
- Title: `"Créer un nouveau type de participant"`
- `"Aperçu :"`, Button: `"Création..."` / `"Créer"`

#### `EditAttendeeTypeModal.tsx`
- Title: `"Modifier le type de participant"`
- `"Aperçu :"`

#### `DeleteAttendeeTypeModal.tsx`
- Title: `"Supprimer définitivement le type"`, `"Attention !"`

#### `DeactivateAttendeeTypeModal.tsx`
- Title: `"Désactiver le type de participant"`
- `"Le type X sera désactivé et n'apparaîtra plus dans les listes actives."`

#### `RestoreAttendeeTypeModal.tsx`
- Title: `"Restaurer le type de participant"`

---

### 3.6 `features/auth/ui/` (2 files — NO `useTranslation`)

#### `SignupForm.tsx`
- Zod validation (all French):
  - `'Le prénom doit contenir au moins 2 caractères'`, `'Le prénom ne peut pas dépasser 50 caractères'`, `'Le prénom ne peut contenir que des lettres'`
  - `'Le nom doit contenir au moins 2 caractères'`, `'Le nom ne peut pas dépasser 50 caractères'`
  - `'Le mot de passe doit contenir au moins 8 caractères'`, `'...au moins une minuscule'`, `'...au moins une majuscule'`, `'...au moins un chiffre'`, `'...au moins un caractère spécial'`
  - `'Numéro de téléphone français invalide'`
  - `"Vous devez accepter les conditions d'utilisation"`
  - `'Les mots de passe ne correspondent pas'`
- Password strength: `'Très faible'`, `'Faible'`, `'Moyen'`, `'Fort'`, `'Très fort'`

#### `TokenInfo.tsx`
- Labels for invitation info display (email, org, role, expiry)
- Date formatting hardcoded to `'fr-FR'`

---

### 3.7 `features/tags/ui/` (4 files — NO `useTranslation`)

#### `TagInput.tsx`, `TagMultiSelect.tsx`, `TagFilterInput.tsx`, `TagStats.tsx`
- Minimal hardcoded text (mostly receive labels as props)

---

### 3.8 `features/organizations/` (3 files — NO `useTranslation`)

#### `OrganizationsPage.tsx`
- Title: `"Organisations"`, `'Gestion des Organisations'` / `'Mon Organisation'`
- Access: `"Accès aux organisations refusé"`
- Error: `"Erreur lors du chargement des organisations"`, `'Une erreur inconnue est survenue'`, `"Une erreur est survenue lors de la création de l'organisation."`, `'Erreur de création'`
- Empty: `'Aucune organisation trouvée'`, `'Aucune organisation associée'`

#### `CreateOrganizationModal.tsx`
- `"Créez une nouvelle organisation"`

#### `OrganizationForm.tsx`
- Default: `submitLabel = "Créer l'organisation"`

---

### 3.9 `features/roles/` (2 component files + types — NO `useTranslation`)

#### `RoleCreationModal.tsx`
- Title: `"Créer un nouveau rôle"`
- Button: `'Création...'` / `'Créer le rôle'`
- Toast: `'Rôle créé avec succès'`, `'Erreur lors de la création du rôle'`

#### `RoleEditModal.tsx`
- Title: `"Modifier le rôle"`
- Toast: `'Rôle modifié avec succès'`, `'Erreur lors de la modification du rôle'`

#### `types/index.ts`
- Permission category labels: `'Événements'`, `'Paramètres'`

---

## 4. `src/shared/ui/` — Shared UI Components

### Components WITH hardcoded French defaults

#### `DataTable/DataTable.tsx` (~1141 lines)
- Default prop: `emptyMessage = 'Aucune donnée disponible'`
- Default prop: `itemType = 'éléments'`
- Tooltip: `title="Glisser pour réorganiser"`, `title="Maj+Clic pour sélectionner une plage"`
- Pagination text: `"X sur Y ligne(s) sélectionnée(s)"`, `"Affichage de X à Y sur Z résultats"`, `"Par page :"`

#### `DataTable/columns.tsx`
- `aria-label="Sélectionner tout"`, `aria-label="Sélectionner la ligne"`
- `title="Maj+Clic pour sélectionner une plage"`
- Header: `"Actions"`

#### `FilterBar/FilterBar.tsx`
- `'Rafraîchissement...'`, `'Rafraîchir'`
- Default: `resultLabel = 'résultat'`, text `'trouvé'` / `'trouvés'`
- `'Réinitialiser'`, `title='Réinitialiser les filtres'`

#### `FilterBar/FilterPopover.tsx`
- `"Filtres avancés"`
- `"Réinitialiser"`, `"Appliquer"`

#### `FilterBar/FilterSort.tsx`
- Default: `placeholder = 'Trier par...'`

#### `SearchInput.tsx`
- Default: `placeholder = 'Rechercher...'`

#### `MultiSelect.tsx`
- Defaults: `placeholder = 'Sélectionner des éléments...'`, `searchPlaceholder = 'Rechercher...'`, `emptyMessage = 'Aucun élément trouvé'`
- `"X / Y sélectionné"`

#### `BulkActions.tsx`
- Default: `itemType = 'éléments'`
- `"X sélectionné(s)"`, `"Tout désélectionner"`
- Default delete: `label: 'Supprimer'`, `confirmMessage: 'Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ?...'`

#### `BulkConfirmationModal.tsx`
- Default labels: `'Confirmer'`, `'Retour'`

#### `Pagination.tsx`
- `"Affichage de X à Y sur Z résultats"`
- `"Par page :"` (label)
- Tooltips: `"Première page"`, `"Page précédente"`, `"Page suivante"`, `"Dernière page"`

#### `DemoLoginPanel.tsx`
- `'Connexion réussie'`, `'Erreur de connexion'`, `'Impossible de se connecter avec ce compte de démo'`
- `'Connexion...'` / `'Se connecter'`
- `"Tous les comptes utilisent le mot de passe..."`

#### `UserInfo.tsx`
- `"Aucun utilisateur connecté"`, `'Non défini'`, `'Non disponible'`
- Labels: `"ID:"`, `"Email:"`, `"Nom:"`, `"Rôle:"`, `"Organisation:"`, `"Org ID:"`
- `"Permissions accordées"`, `"Gérer organisation"`, `'Chargement...'`

#### `GooglePlacesAutocomplete.tsx`
- Default: `placeholder = 'Rechercher une adresse...'`

### Components WITHOUT hardcoded text (props-only)

The following shared components receive all user-facing text via props and have **no hardcoded strings** to translate:
- `Modal.tsx`, `UniversalModal.tsx`, `ModalSteps.tsx`
- `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Checkbox.tsx`
- `Select.tsx` (placeholder is a prop)
- `Card.tsx`, `PageContainer.tsx`, `PageHeader.tsx`, `PageSection.tsx`
- `FormField.tsx`, `FormSection.tsx`
- `ActionGroup.tsx` (structural only)
- `Alert.tsx`, `Badge.tsx`, `Skeleton.tsx`, `SkeletonLayouts.tsx`
- `TableSelector.tsx` (labels come from options props)
- `Toast.tsx` (receives title/message from callers)
- `Tabs.tsx`, `ThemeToggle.tsx`, `CloseButton.tsx`
- `LanguageSwitcher.tsx` (already i18n-aware)
- `LoadingSpinner.tsx`, `AnimatedContainer.tsx`, `PageTransition.tsx`, `SmartRedirect.tsx`

### Storybook files (`.stories.tsx`)

- `ActionGroup.stories.tsx`: Hardcoded French text in examples (`"Annuler"`, `"Enregistrer"`, `"Supprimer"`, `"Modifier"`, `"Précédent"`, `"Suivant"`, `"Confirmer"`, `"Créer un événement"`, `"Nom de l'événement"`)
- Other `.stories.tsx` files: Similar hardcoded demo text — **lower priority** (not user-facing in production)

---

## 5. Common Hardcoded String Patterns

These patterns repeat across many files and should have shared translation keys:

| Pattern | Occurrences | Suggested namespace key |
|---------|-------------|-------------------------|
| `"Erreur"` / `"Erreur de..."` | 30+ files | `common:error` |
| `"Chargement..."` | 15+ files | `common:loading` |
| `"Annuler"` | 10+ files | `common:cancel` |
| `"Confirmer"` | 10+ files | `common:confirm` |
| `"Retour"` | 10+ files | `common:back` |
| `"Supprimer"` / `"Supprimer définitivement"` | 15+ files | `common:delete` / `common:deletePermanently` |
| `"Modifier"` | 10+ files | `common:edit` |
| `"Restaurer"` | 8+ files | `common:restore` |
| `"Approuvé"` / `"Refusé"` / `"Annulé"` | 10+ files | `common:status.approved` etc. |
| `"Aucun X trouvé"` | 15+ files | `common:noResults` |
| `"Rechercher..."` | 10+ files | `common:search` |
| `"Accès refusé/interdit"` | 8+ files | `common:accessDenied` |
| `"X sélectionné(s)"` | 5+ files | `common:selectedCount` |
| `"Affichage de X à Y sur Z"` | 3+ files | `common:pagination.showing` |
| `"Par page :"` | 3+ files | `common:pagination.perPage` |
| `"Télécharger"` / `"Téléchargement..."` | 8+ files | `common:download` / `common:downloading` |
| `"Créer"` / `"Création..."` | 10+ files | `common:create` / `common:creating` |
| `"Envoyer"` / `"Envoi..."` | 5+ files | `common:send` / `common:sending` |
| Zod validation (password, email, name) | 8+ files | `validation:*` (new namespace) |
| Password strength labels | 4 files | `common:passwordStrength.*` |

---

## 6. Recommended Implementation Priority

### Phase 1 — Shared infrastructure (highest impact)
1. Add shared keys to `common.json` for recurring strings (error, loading, cancel, confirm, etc.)
2. Translate `DataTable`, `FilterBar`, `Pagination`, `BulkActions`, `MultiSelect`, `SearchInput` — these propagate to all pages
3. Add a `validation` namespace for Zod/form validation messages

### Phase 2 — High-traffic pages
4. `Users/index.tsx` — Admin page, heavily used
5. `EventDetails/index.tsx` — Core page, 1324 lines
6. `Events/index.tsx` — Main listing page
7. `Attendees/index.tsx` + `AttendeeTable.tsx`
8. `Invitations/index.tsx`
9. `Dashboard/index.tsx` — Landing page

### Phase 3 — Feature modals
10. `features/registrations/ui/*` — 17 modal/component files
11. `features/events/ui/*` — 10 files
12. `features/users/ui/*` — 7 files
13. `features/attendees/ui/*` — 6 files
14. `features/attendee-types/ui/*` — 5 files

### Phase 4 — Remaining pages
15. Auth pages (Login, Signup, ChangePassword, ResetPassword, etc.)
16. `Reports/index.tsx`, `BadgeDesigner`, `RolePermissionsAdmin`
17. `PublicRegistration`, `PrivacyPolicy`
18. `features/organizations/*`, `features/roles/*`

### Phase 5 — Polish
19. Storybook files (low priority)
20. `DemoLoginPanel`, `UserInfo`, `RolePermissionsTest` (dev/debug components)

---

## 7. New Namespaces to Create

| Namespace | Purpose |
|-----------|---------|
| `validation` | Zod/form validation messages (password rules, required fields, email format) |
| `users` | User management page and modals |
| `registrations` | Registration management, status labels, bulk actions |
| `roles` | Role creation/editing |
| `organizations` | Organization management |
| `badges` | Badge designer and preview |
| `printing` | Print client and queue management |
| `reports` | Report page labels |

---

*Report generated by comprehensive scan of `attendee-ems-front/src/`. ~120+ component files audited across pages, features, widgets, and shared UI.*
