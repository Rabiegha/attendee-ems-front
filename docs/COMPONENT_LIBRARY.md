# 🎨 Component Library - Attendee EMS

## 📋 Table des matières

1. [Layout Components](#layout-components)
2. [Form Components](#form-components)
3. [Display Components](#display-components)
4. [Feedback Components](#feedback-components)
5. [Utility Components](#utility-components)

---

## Layout Components

### PageContainer

Conteneur de page standardisé avec largeur max configurable et padding uniforme.

**Props:**
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'` (default: '7xl')
- `padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'` (default: 'lg')
- `className?: string`

**Usage:**
```tsx
<PageContainer maxWidth="7xl" padding="lg">
  <PageHeader title="Mon titre" />
  {/* Content */}
</PageContainer>
```

---

### PageHeader

En-tête de page avec titre, description optionnelle, icône et actions.

**Props:**
- `title: string` - Titre principal (required)
- `description?: string` - Description sous le titre
- `icon?: LucideIcon` - Icône à gauche du titre
- `actions?: React.ReactNode` - Boutons ou actions à droite
- `className?: string`

**Usage:**
```tsx
<PageHeader 
  title="Gestion des événements"
  description="Créez et gérez vos événements"
  icon={Calendar}
  actions={<Button>Créer un événement</Button>}
/>
```

---

### PageSection

Section de page avec titre optionnel et espacement cohérent.

**Props:**
- `title?: string`
- `description?: string`
- `spacing?: 'sm' | 'md' | 'lg' | 'xl'` (default: 'lg')
- `className?: string`

**Usage:**
```tsx
<PageSection title="Événements récents" description="Vos 5 derniers événements">
  <EventList events={events} />
</PageSection>
```

---

### FormSection

Section de formulaire avec titre, description et indicateur de champs requis.

**Props:**
- `title?: string`
- `description?: string`
- `required?: boolean` - Affiche une étoile rouge si true
- `className?: string`

**Usage:**
```tsx
<FormSection 
  title="Informations personnelles" 
  description="Remplissez vos coordonnées"
  required
>
  <Input label="Nom" required />
  <Input label="Prénom" required />
</FormSection>
```

---

### ActionGroup

Groupe d'actions (boutons) avec alignement et espacement configurables.

**Props:**
- `align?: 'left' | 'center' | 'right' | 'between' | 'around'` (default: 'right')
- `spacing?: 'sm' | 'md' | 'lg'` (default: 'md')
- `vertical?: boolean` - Empile verticalement les actions
- `divider?: boolean` - Ajoute une bordure supérieure
- `className?: string`

**Usage:**
```tsx
<ActionGroup align="right" spacing="md" divider>
  <Button variant="outline" onClick={onCancel}>Annuler</Button>
  <Button onClick={onSave}>Enregistrer</Button>
</ActionGroup>
```

---

## Form Components

### Button

Bouton avec variantes, tailles, états de chargement et icônes.

**Props:**
- `variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'`
- `size?: 'default' | 'sm' | 'lg' | 'icon'`
- `loading?: boolean` - Affiche un spinner
- `loadingText?: string` - Texte pendant le chargement
- `leftIcon?: React.ReactNode`
- `rightIcon?: React.ReactNode`
- `asChild?: boolean` - Utilise Slot de Radix UI

**Usage:**
```tsx
<Button variant="default" size="lg" loading={isLoading}>
  Enregistrer
</Button>

<Button variant="outline" leftIcon={<Plus className="h-4 w-4" />}>
  Créer
</Button>
```

---

### Input

Champ de saisie avec support d'icônes, états d'erreur/succès, et toggle de mot de passe.

**Props:**
- `error?: boolean`
- `success?: boolean`
- `leftIcon?: React.ReactNode`
- `rightIcon?: React.ReactNode`
- `showPasswordToggle?: boolean` - Active le bouton œil pour les passwords

**Usage:**
```tsx
<Input 
  type="email"
  placeholder="exemple@email.com"
  leftIcon={<Mail className="h-4 w-4" />}
  error={!!errors.email}
/>

<Input 
  type="password"
  showPasswordToggle
  placeholder="Mot de passe"
/>
```

---

### Select

Sélecteur avec variantes d'état et support d'icônes.

**Props:**
- `variant?: 'default' | 'error' | 'success'`
- `size?: 'sm' | 'default' | 'lg'`
- `error?: boolean`
- `success?: boolean`
- `leftIcon?: React.ReactNode`
- `placeholder?: string`

**Usage:**
```tsx
<Select placeholder="Sélectionnez un rôle" error={!!errors.role}>
  <SelectOption value="admin">Administrateur</SelectOption>
  <SelectOption value="manager">Manager</SelectOption>
</Select>
```

---

### Textarea

Zone de texte multi-lignes avec les mêmes états que Input.

**Props:**
- `error?: boolean`
- `success?: boolean`
- `rows?: number` (default: 4)

**Usage:**
```tsx
<Textarea 
  placeholder="Description de l'événement..."
  rows={6}
  error={!!errors.description}
/>
```

---

### FormField

Wrapper de champ de formulaire avec label et message d'erreur.

**Props:**
- `label?: string`
- `error?: string`
- `required?: boolean`
- `children: React.ReactNode`

**Usage:**
```tsx
<FormField label="Email" error={errors.email?.message} required>
  <Input type="email" {...register('email')} />
</FormField>
```

---

## Display Components

### Card

Carte avec variantes, padding et radius configurables.

**Props:**
- `variant?: 'default' | 'elevated' | 'outlined' | 'ghost'`
- `padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'`
- `radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'`

**Sub-components:**
- `CardHeader` - En-tête de carte
- `CardTitle` - Titre de carte (h3)
- `CardDescription` - Description sous le titre
- `CardContent` - Contenu principal
- `CardFooter` - Pied de carte avec bordure supérieure

**Usage:**
```tsx
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

### Modal

Modal avec backdrop, animations et support light/dark mode.

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `title?: string`
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'`
- `showCloseButton?: boolean` (default: true)
- `closeOnBackdropClick?: boolean` (default: true)
- `contentPadding?: boolean` (default: true)

**Usage:**
```tsx
<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Créer un événement"
  maxWidth="2xl"
>
  <form onSubmit={handleSubmit}>
    {/* Form content */}
    <ActionGroup divider>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Annuler
      </Button>
      <Button type="submit">Créer</Button>
    </ActionGroup>
  </form>
</Modal>
```

---

## Feedback Components

### Alert

Messages d'alerte avec variantes de type.

**Props:**
- `variant?: 'info' | 'success' | 'warning' | 'error'`
- `title?: string`
- `children: React.ReactNode`

**Usage:**
```tsx
<Alert variant="success" title="Succès">
  L'événement a été créé avec succès.
</Alert>
```

---

### Toast

Notifications toast (via hook useToast).

**Usage:**
```tsx
const { success, error, info, warning } = useToast()

// Dans un handler
success('Enregistré!', 'Vos modifications ont été enregistrées.')
error('Erreur', 'Une erreur est survenue.')
```

---

### LoadingSpinner

Indicateur de chargement simple.

**Props:**
- `size?: 'sm' | 'md' | 'lg'`
- `className?: string`

**Usage:**
```tsx
{isLoading && <LoadingSpinner size="lg" />}
```

---

## Utility Components

### ThemeToggle

Bouton pour basculer entre mode clair et sombre.

**Usage:**
```tsx
<ThemeToggle />
```

---

### AnimatedContainer

Conteneur avec animations d'entrée/sortie.

**Props:**
- `children: React.ReactNode`
- `delay?: number` (default: 0)
- `className?: string`

**Usage:**
```tsx
<AnimatedContainer delay={200}>
  <Card>...</Card>
</AnimatedContainer>
```

---

## Typography Classes

### Headings
- `.page-title` - Titre de page principal (text-3xl, bold)
- `.page-subtitle` - Sous-titre de page (text-lg)
- `.section-title` - Titre de section (text-xl, semibold)
- `.section-subtitle` - Sous-titre de section (text-sm)
- `.text-heading-lg` - Heading large (text-2xl, semibold)
- `.text-heading-md` - Heading medium (text-xl, semibold)
- `.text-heading-sm` - Heading small (text-lg, medium)

### Body Text
- `.text-body` - Corps de texte standard (text-base)
- `.text-body-sm` - Corps de texte petit (text-sm)
- `.text-caption` - Texte de légende (text-xs)

**Toutes les classes de typography incluent automatiquement les variantes dark mode.**

---

## Best Practices

### 1. Cohérence visuelle
- ✅ Utilisez TOUJOURS les composants du design system
- ✅ Préférez les classes de typography (`.page-title`) aux classes Tailwind directes
- ❌ N'utilisez pas de styles inline ou de valeurs en dur

### 2. Dark mode
- ✅ Tous les composants supportent automatiquement le dark mode
- ✅ Les classes de typography incluent les variantes dark
- ❌ Ne forcez jamais un seul mode (light ou dark)

### 3. Espacement
- ✅ Utilisez `PageSection` pour l'espacement entre sections
- ✅ Utilisez `space-y-4` ou `space-y-6` dans les conteneurs
- ❌ Évitez les marges personnalisées (préférez les gaps et space-y)

### 4. Actions
- ✅ Groupez les boutons avec `ActionGroup`
- ✅ Placez les actions principales à droite
- ✅ Utilisez `divider={true}` dans les formulaires

### 5. Formulaires
- ✅ Utilisez `FormSection` pour grouper les champs
- ✅ Utilisez `FormField` pour chaque champ avec label
- ✅ Utilisez `ActionGroup` pour les boutons de soumission
- ❌ N'oubliez pas les attributs `required` et les messages d'erreur

---

## Migration depuis l'ancien code

### Titres de page
```tsx
// ❌ Avant
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
  Mon titre
</h1>

// ✅ Après
<PageHeader title="Mon titre" />
// OU
<h1 className="page-title">Mon titre</h1>
```

### Structure de page
```tsx
// ❌ Avant
<div className="p-6 space-y-6">
  <h1 className="text-2xl">...</h1>
  <div className="bg-white p-6 rounded">...</div>
</div>

// ✅ Après
<PageContainer padding="lg">
  <PageHeader title="..." />
  <PageSection>
    <Card>...</Card>
  </PageSection>
</PageContainer>
```

### Formulaires
```tsx
// ❌ Avant
<form className="space-y-4">
  <div>
    <label>Email</label>
    <input type="email" />
  </div>
  <div className="flex justify-end space-x-3">
    <button>Annuler</button>
    <button>Valider</button>
  </div>
</form>

// ✅ Après
<form className="space-y-6">
  <FormSection title="Informations">
    <FormField label="Email" required>
      <Input type="email" />
    </FormField>
  </FormSection>
  
  <ActionGroup divider>
    <Button variant="outline">Annuler</Button>
    <Button type="submit">Valider</Button>
  </ActionGroup>
</form>
```

---

**Dernière mise à jour:** Octobre 2025  
**Version:** 1.0.0
