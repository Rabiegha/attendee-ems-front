# 📋 Configuration des Champs de Formulaire

## Vue d'ensemble

Ce système unifie la gestion des champs entre :
- ✅ Formulaires d'inscription publics
- ✅ Formulaires d'administration
- ✅ Import/Export Excel
- ✅ Validation et stockage en base de données

## 🗂️ Structure des données

### Table `attendees` (Fiche personne - réutilisable)
Informations permanentes de la personne, partagées entre événements :

| Champ | Type | Description | Visible Public | Visible Admin | Dans Table | Export Excel |
|-------|------|-------------|---------------|---------------|------------|-------------|
| `email` | Email | Adresse email | ✅ | ✅ | ✅ | ✅ |
| `first_name` | Texte | Prénom | ✅ | ✅ | ✅ | ✅ |
| `last_name` | Texte | Nom | ✅ | ✅ | ✅ | ✅ |
| `phone` | Téléphone | Numéro de téléphone | ✅ | ✅ | ✅ | ✅ |
| `company` | Texte | Organisation/Entreprise | ✅ | ✅ | ✅ | ✅ |
| `job_title` | Texte | Désignation/Poste | ✅ | ✅ | ✅ | ✅ |
| `country` | Pays | Pays de résidence | ✅ | ✅ | ✅ | ✅ |

### Table `registrations` (Inscription à un événement)
Informations spécifiques à chaque événement :

| Champ | Type | Description | Visible Public | Visible Admin | Dans Table | Export Excel |
|-------|------|-------------|---------------|---------------|------------|-------------|
| `status` | Enum | Statut (awaiting/approved/refused) | ❌ Auto | ✅ | ✅ | ✅ |
| `attendance_type` | Select | Mode (Présentiel/En ligne/Hybride) | ✅ | ✅ | ❌ | ✅ |
| `event_attendee_type_id` | Type | Type de participant (Staff/Partenaire/Invité) | ❌ | ✅ Admin only | ✅ | ✅ |
| `answers` (JSON) | JSON | Champs personnalisés | - | - | - | - |

### Champs personnalisés dans `answers` (JSON)
Stockés dynamiquement :

| Champ | Type | Description | Visible Public | Visible Admin | Dans Table | Export Excel |
|-------|------|-------------|---------------|---------------|------------|-------------|
| `comment` | Textarea | Commentaire libre | ✅ | ✅ | ❌ | ✅ |
| Listes personnalisées | Select | Configurables par événement | ✅ | ✅ | ❌ | ✅ |

## 📊 Alias de colonnes Excel supportés

Pour faciliter l'import, plusieurs noms de colonnes sont acceptés :

```typescript
Email          → email, Email, E-mail, e-mail, mail, Mail
Prénom         → first_name, First Name, Prénom, prénom, prenom, firstname, FirstName
Nom            → last_name, Last Name, Nom, nom, lastname, LastName
Téléphone      → phone, Phone, Téléphone, téléphone, telephone, Tel, tel
Organisation   → company, Company, Organisation, organisation, Entreprise, entreprise, org
Désignation    → job_title, Job Title, Désignation, désignation, Poste, poste, title
Pays           → country, Country, Pays, pays
Type           → attendee_type, Attendee Type, Type, type, participant_type
Mode           → attendance_type, Attendance Type, Mode, mode
Commentaire    → comment, Comment, Commentaire, commentaire, comments, Comments
```

## 🎯 Système de types de participants

### Configuration (déjà existante dans la BDD)

Le système utilise deux tables :
- `AttendeeType` : Types globaux de l'organisation (Staff, Partenaire, Invité, VIP, etc.)
- `EventAttendeeType` : Association type ↔ événement avec capacité optionnelle

### Exemples de types par défaut

```typescript
// Ces types peuvent être créés par chaque organisation
Staff         // Équipe organisatrice
Partenaire    // Entreprises partenaires
Invité        // Invités spéciaux
Participant   // Participants réguliers (valeur par défaut)
VIP           // Personnalités
Presse        // Journalistes
Exposant      // Stand d'exposition
```

### Gestion des types

#### Créer un type personnalisé (API)
```bash
POST /attendee-types
{
  "code": "sponsor",
  "name": "Sponsor",
  "color_hex": "#FFD700",
  "text_color_hex": "#000000",
  "icon": "star"
}
```

#### Assigner un type à un événement
```bash
POST /events/:eventId/attendee-types
{
  "attendee_type_id": "uuid-du-type",
  "capacity": 50  // Optionnel
}
```

## 🔄 Utilisation dans le code

### Frontend - Obtenir les champs pour un formulaire

```typescript
import { 
  getPublicFormFields, 
  getAdminFormFields,
  createCustomSelectField 
} from '@/features/registrations/config/formFields.config'

// Formulaire public
const publicFields = getPublicFormFields()

// Formulaire admin
const adminFields = getAdminFormFields()

// Ajouter une liste personnalisée
const customField = createCustomSelectField(
  'secteur_activite',
  'Secteur d\'activité',
  [
    { value: 'tech', label: 'Technologie' },
    { value: 'sante', label: 'Santé' },
    { value: 'finance', label: 'Finance' },
  ]
)
```

### Backend - Import Excel automatique

Le backend détecte automatiquement les colonnes grâce aux alias :

```typescript
// Fichier Excel avec colonnes en français
prénom | nom | entreprise | téléphone | email
Jean   | Dupont | ACME Corp | 0612345678 | jean@acme.com

// ✅ Automatiquement mappé vers :
first_name: "Jean"
last_name: "Dupont"
company: "ACME Corp"
phone: "0612345678"
email: "jean@acme.com"
```

### Champs personnalisés dans Excel

Toute colonne non reconnue est stockée dans `answers` :

```typescript
// Fichier Excel
email | nom | prénom | secteur_activite | budget
...   | ... | ...    | Technologie      | 10000€

// ✅ Résultat :
{
  attendee: {
    email: "...",
    first_name: "...",
    last_name: "..."
  },
  registration: {
    answers: {
      secteur_activite: "Technologie",
      budget: "10000€"
    }
  }
}
```

## 🎨 Créer un formulaire dynamique

```typescript
import { STANDARD_FORM_FIELDS } from '@/features/registrations/config/formFields.config'

function RegistrationForm() {
  return (
    <form>
      {STANDARD_FORM_FIELDS
        .filter(field => field.visibleInPublicForm)
        .map(field => (
          <FormField 
            key={field.key}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
          />
        ))
      }
    </form>
  )
}
```

## 📤 Export Excel

Les en-têtes de colonnes utilisent les labels configurés :

```typescript
import { getExportFields } from '@/features/registrations/config/formFields.config'

const headers = getExportFields().map(field => field.label)
// → ["Email", "Prénom", "Nom", "Téléphone", "Organisation", ...]
```

## ⚠️ Important

### Champs réservés aux admins
- **Type de participant** : Ne doit PAS être visible dans le formulaire public
- Les participants s'inscrivent avec le type par défaut "Participant"
- Les admins peuvent changer le type via Excel ou interface admin

### Stockage des données
- **Champs standard** → Colonnes dédiées dans `attendees` et `registrations`
- **Champs personnalisés** → JSON `answers` dans `registrations`
- **Avantage** : Flexibilité totale sans migration de schéma

### Validation
- Email : Format valide + unique par organisation
- Téléphone : Format international recommandé
- Champs requis : Configurables par champ

## 🚀 Prochaines étapes

1. ✅ Configuration centralisée créée
2. ✅ Backend mis à jour avec alias complets
3. ⏳ Créer l'UI de gestion des types de participants
4. ⏳ Créer le constructeur de formulaire dynamique
5. ⏳ Ajouter la validation côté frontend
6. ⏳ Implémenter l'export Excel avec en-têtes français

## 📝 Notes techniques

- Les types de participants sont gérés via les tables existantes `AttendeeType` et `EventAttendeeType`
- Le champ `answers` (JSON) permet d'ajouter des champs personnalisés sans modifier le schéma
- Les alias de colonnes Excel permettent d'importer des fichiers avec différents formats
- Le système est extensible : ajoutez simplement un nouveau champ dans `STANDARD_FORM_FIELDS`
