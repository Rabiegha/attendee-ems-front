# Form Builder System - Documentation

## 📋 Vue d'ensemble

Le système Form Builder permet de créer et gérer dynamiquement les formulaires d'inscription aux événements avec un mapping automatique vers la base de données.

## 🏗️ Architecture

### Composants principaux

```
FormBuilder/
├── FormFieldLibrary.tsx    # Bibliothèque de champs prédéfinis
├── FormBuilder.tsx          # Interface de construction du formulaire
├── FieldPickerModal.tsx     # Modal de sélection de champs
└── index.ts                 # Exports
```

### Types de champs

Chaque champ possède trois options de stockage :

1. **`attendeeField`** → Colonne dédiée dans la table `attendees`
   - Exemples : `first_name`, `last_name`, `email`, `phone`, `company`, `job_title`, `country`
   - Données réutilisables entre événements
   - Indexées et optimisées pour la recherche

2. **`registrationField`** → Colonne dédiée dans la table `registrations`
   - Exemples : `attendee_type`, `attendance_type`
   - Données spécifiques à l'événement
   - Relations avec EventAttendeeType

3. **`storeInAnswers`** → Stockage JSON dans `registrations.answers`
   - Pour champs personnalisés uniques
   - Flexibilité maximale sans migration de schéma
   - Recherche moins performante

## 📚 Champs prédéfinis

### Identity (Identité)

| Champ | Label | Type | Mapping | Obligatoire |
|-------|-------|------|---------|-------------|
| `first_name` | Prénom | text | `attendees.first_name` | ✓ |
| `last_name` | Nom | text | `attendees.last_name` | ✓ |

### Contact

| Champ | Label | Type | Mapping | Validation |
|-------|-------|------|---------|------------|
| `email` | Email | email | `attendees.email` | Email valide |
| `phone` | Téléphone | tel | `attendees.phone` | - |

### Professional (Professionnel)

| Champ | Label | Type | Mapping |
|-------|-------|------|---------|
| `company` | Organisation | text | `attendees.company` |
| `job_title` | Poste | text | `attendees.job_title` |
| `country` | Pays | text | `attendees.country` |

### Event (Événement)

| Champ | Label | Type | Mapping | Visibilité |
|-------|-------|------|---------|------------|
| `attendee_type` | Type de participant | select | `registrations.attendee_type` | Admin uniquement |
| `attendance_type` | Mode de participation | select | `registrations.attendance_type` | Public |

### Custom (Personnalisé)

| Champ | Label | Type | Mapping |
|-------|-------|------|---------|
| `comment` | Commentaire | textarea | `registrations.answers` |

## 🎯 Utilisation

### 1. Importer le FormBuilder

```tsx
import { FormBuilder, type FormField } from '@/features/events/components/FormBuilder'

function EventSettingsPage() {
  const [formFields, setFormFields] = useState<FormField[]>([])
  
  return (
    <FormBuilder
      fields={formFields}
      onChange={setFormFields}
    />
  )
}
```

### 2. Ajouter des champs

L'interface propose un bouton **"Ajouter un champ"** qui ouvre une modal avec :
- 10 champs prédéfinis organisés par catégorie
- Recherche par nom, clé ou description
- Filtrage par catégorie
- Badges indiquant le mapping de chaque champ

### 3. Configurer les champs

Pour chaque champ ajouté, vous pouvez :
- **Réorganiser** : Glisser-déposer pour changer l'ordre
- **Rendre obligatoire/optionnel** : Icône Settings
- **Masquer/Afficher** : Icône Eye/EyeOff
- **Supprimer** : Icône Trash2

### 4. Sauvegarder la configuration

```tsx
// Sauvegarder dans EventSetting.registration_fields
const saveFormConfiguration = async () => {
  await updateEventSetting({
    eventId,
    data: {
      registration_fields: formFields
    }
  })
}
```

## 🔄 Flux de données

### Création d'inscription

```mermaid
FormPreview
  ↓ Soumission
FormData collectée
  ↓ Mapping automatique
{
  attendee: {
    first_name: "Jean",
    last_name: "Dupont",
    email: "jean@example.com",
    phone: "+33612345678",
    company: "TechCorp"
  },
  attendance_type: "onsite",
  answers: {
    comment: "Je souhaite participer à l'atelier"
  }
}
  ↓ API
Backend upsert attendee + create registration
```

### Import Excel

```mermaid
Fichier Excel
  ↓ Lecture colonnes
findValue() cherche avec aliases
  ↓ Mapping colonnes → champs
{
  "Prénom" → first_name,
  "téléphone" → phone,
  "Organisation" → company
}
  ↓ Pour chaque ligne
Upsert attendee + Create registration
```

## 🌍 Aliases Excel supportés

Le système reconnaît automatiquement les variations de noms de colonnes :

```typescript
email: ['email', 'Email', 'E-mail', 'mail', 'Mail']
prénom: ['first_name', 'Prénom', 'prénom', 'prenom', 'firstname']
nom: ['last_name', 'Nom', 'nom', 'lastname']
téléphone: ['phone', 'Téléphone', 'téléphone', 'telephone', 'Tel']
organisation: ['company', 'Organisation', 'organisation', 'Entreprise']
poste: ['job_title', 'Désignation', 'désignation', 'Poste']
pays: ['country', 'Pays', 'pays']
```

## 🎨 Interface utilisateur

### FormBuilder

Affiche la liste des champs configurés avec :
- Icône représentative du type de champ
- Nom et propriétés du champ
- Badges de statut (Obligatoire, Masqué)
- Badge de stockage (Participant, Inscription, Personnalisé)
- Actions rapides (Visibilité, Obligatoire, Supprimer)
- Drag handle pour réorganiser

### FieldPickerModal

Modal en plein écran avec :
- Barre de recherche
- Onglets de catégories avec compteurs
- Grille de champs avec icônes et descriptions
- Badges de mapping pour chaque champ
- Footer avec astuce sur le mapping automatique

### FormPreview

Aperçu en temps réel du formulaire public avec :
- Header avec détails de l'événement
- Champs dynamiques générés à partir de la configuration
- Mode test pour tester la soumission
- Message de confirmation après soumission

## 🔧 Personnalisation

### Créer un champ personnalisé

```tsx
import { createCustomField } from '@/features/events/components/FormBuilder'

const customField = createCustomField('text', 'Numéro de badge')
// Résultat :
{
  id: 'custom_1730044800000',
  key: 'numero_de_badge',
  label: 'Numéro de badge',
  type: 'text',
  storeInAnswers: true,
  // ... autres propriétés par défaut
}
```

### Ajouter un nouveau champ prédéfini

Modifier `FormFieldLibrary.tsx` :

```tsx
export const PREDEFINED_FIELDS: PredefinedFieldTemplate[] = [
  // ... champs existants
  {
    id: 'dietary',
    key: 'dietary_restrictions',
    label: 'Restrictions alimentaires',
    placeholder: 'Allergies, régime spécial...',
    type: 'textarea',
    icon: UtensilsCrossed,
    category: 'custom',
    description: 'Régime alimentaire et allergies',
    required: false,
    storeInAnswers: true,
    visibleInPublicForm: true,
    visibleInAdminForm: true,
    visibleInAttendeeTable: false,
    visibleInExport: true,
  },
]
```

## 📊 Badges de stockage

Les badges colorés indiquent où chaque champ est stocké :

| Badge | Couleur | Signification |
|-------|---------|---------------|
| **Participant** | Bleu | Stocké dans `attendees` (réutilisable) |
| **Inscription** | Violet | Stocké dans `registrations` (événement) |
| **Personnalisé** | Gris | Stocké dans `answers` JSON (flexible) |

## 🚀 Prochaines étapes

- [ ] API pour sauvegarder/charger la configuration dans EventSetting
- [ ] Gestion des AttendeeType (interface CRUD)
- [ ] Export Excel avec en-têtes configurables
- [ ] Validation conditionnelle (champs dépendants)
- [ ] Traductions multilingues des formulaires
- [ ] Templates de formulaires prédéfinis

## 💡 Bonnes pratiques

1. **Privilégier les champs prédéfinis** : Mapping automatique vers colonnes dédiées
2. **Limiter les champs personnalisés** : Performance de recherche réduite
3. **Marquer les champs essentiels comme obligatoires** : Email, Nom, Prénom
4. **Tester en mode test** : Vérifier le formulaire avant publication
5. **Conserver la cohérence** : Mêmes champs pour événements similaires

## 🐛 Dépannage

### Les champs Excel ne sont pas reconnus

- Vérifier que les noms de colonnes correspondent aux aliases supportés
- Ajouter des aliases dans `EXCEL_COLUMN_ALIASES` si nécessaire
- Vérifier la casse et les accents

### Les données vont dans answers au lieu des colonnes

- Vérifier que le champ a bien `attendeeField` ou `registrationField` défini
- S'assurer que le nom de colonne Excel correspond exactement

### Le formulaire ne soumet pas

- Activer le "Mode Test" dans FormPreview
- Vérifier que l'email est présent (champ obligatoire)
- Consulter la console pour les erreurs de validation

## 📝 Exemples

### Configuration simple

```typescript
const simpleForm: FormField[] = [
  getFieldById('first_name'),
  getFieldById('last_name'),
  getFieldById('email'),
  getFieldById('attendance_type'),
]
```

### Configuration complète

```typescript
const completeForm: FormField[] = [
  getFieldById('first_name'),
  getFieldById('last_name'),
  getFieldById('email'),
  getFieldById('phone'),
  getFieldById('company'),
  getFieldById('job_title'),
  getFieldById('country'),
  getFieldById('attendee_type'), // Admin uniquement
  getFieldById('attendance_type'),
  getFieldById('comment'),
]
```
