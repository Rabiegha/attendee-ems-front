# Design System - Attendee EMS

## Vue d'ensemble

Ce document décrit le système de design unifié pour l'application Attendee EMS. Tous les composants et pages doivent suivre ces directives pour assurer la cohérence visuelle et structurelle.

## Table des matières

1. [Tokens de Design](#tokens-de-design)
2. [Composants de Base](#composants-de-base)
3. [Composants de Layout](#composants-de-layout)
4. [Tables](#tables)
5. [Typographie](#typographie)
6. [Espacement](#espacement)
7. [Couleurs](#couleurs)
8. [Guidelines](#guidelines)

---

## Tokens de Design

Les tokens de design sont définis dans `src/styles/tokens.css` et fournissent des variables CSS réutilisables.

### Variables CSS Principales

```css
/* Spacing */
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 0.75rem; /* 12px */
--spacing-lg: 1rem; /* 16px */
--spacing-xl: 1.5rem; /* 24px */
--spacing-2xl: 2rem; /* 32px */

/* Typography */
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Heights */
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;

/* Border Radius */
--border-radius-sm: 0.375rem; /* 6px */
--border-radius-md: 0.5rem; /* 8px */
--border-radius-lg: 0.75rem; /* 12px */
--border-radius-xl: 1rem; /* 16px */

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Composants de Base

### Button

**Import:**

```tsx
import { Button } from '@/shared/ui'
```

**Variants:**

- `default` - Bouton primaire (bleu)
- `destructive` - Bouton de suppression (rouge)
- `outline` - Bouton avec bordure
- `secondary` - Bouton secondaire (gris)
- `ghost` - Bouton transparent
- `link` - Lien stylisé

**Tailles:**

- `sm` - Petit (h-9, px-3)
- `default` - Normal (h-10, px-4)
- `lg` - Grand (h-11, px-8)
- `icon` - Icône seule (h-10, w-10)

**Usage:**

```tsx
<Button variant="default" size="default">
  Enregistrer
</Button>

<Button variant="destructive" size="sm" leftIcon={<Trash />}>
  Supprimer
</Button>

<Button variant="outline" loading loadingText="Chargement...">
  Charger
</Button>
```

### Input

**Import:**

```tsx
import { Input } from '@/shared/ui'
```

**Props:**

- `error` - État d'erreur (bordure rouge)
- `success` - État de succès (bordure verte)
- `leftIcon` - Icône à gauche
- `rightIcon` - Icône à droite
- `showPasswordToggle` - Toggle pour mot de passe

**Usage:**

```tsx
<Input
  type="email"
  placeholder="email@example.com"
  leftIcon={<Mail className="h-4 w-4" />}
  error={!!errors.email}
/>

<Input
  type="password"
  showPasswordToggle
/>
```

### Card

**Import:**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/shared/ui'
```

**Variants:**

- `default` - Carte standard
- `elevated` - Carte avec ombre
- `outlined` - Carte avec bordure
- `ghost` - Carte semi-transparente

**Padding:**

- `none` - Pas de padding
- `sm` - Petit (p-4)
- `md` - Normal (p-6)
- `lg` - Grand (p-8)

**Usage:**

```tsx
<Card variant="default" padding="md">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Contenu */}</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Composants de Layout

### PageHeader

Composant standardisé pour l'en-tête des pages.

**Import:**

```tsx
import { PageHeader } from '@/shared/ui'
```

**Usage:**

```tsx
<PageHeader
  title="Gestion des événements"
  description="Créez et gérez vos événements"
  icon={Calendar}
  actions={<Button leftIcon={<Plus />}>Créer un événement</Button>}
/>
```

### PageSection

Composant pour les sections de page avec espacement cohérent.

**Import:**

```tsx
import { PageSection } from '@/shared/ui'
```

**Spacing:**

- `sm` - Compact (space-compact, mb-6)
- `md` - Normal (space-form, mb-8)
- `lg` - Large (space-section, mb-10) **[Par défaut]**
- `xl` - Extra large (space-y-8, mb-12)

**Usage:**

```tsx
<PageSection title="Informations" description="Détails" spacing="lg">
  {/* Contenu */}
</PageSection>
```

### FormSection

Composant pour les sections de formulaire.

**Import:**

```tsx
import { FormSection } from '@/shared/ui'
```

**Usage:**

```tsx
<FormSection
  title="Informations personnelles"
  description="Remplissez vos coordonnées"
  required
>
  <Input label="Nom" />
  <Input label="Prénom" />
</FormSection>
```

---

## Tables

### Composants de Table Unifiés

**Import:**

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  TableLoadingState,
} from '@/shared/ui'
```

**Structure Standard:**

```tsx
<Table>
  <TableHeader>
    <tr>
      <TableHead>Nom</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </tr>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id} clickable selected={isSelected(item.id)}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**États:**

```tsx
// État de chargement
<Table>
  <TableHeader>{/* ... */}</TableHeader>
  <TableBody>
    <TableLoadingState columns={4} rows={5} />
  </TableBody>
</Table>

// État vide
<Table>
  <TableHeader>{/* ... */}</TableHeader>
  <TableBody>
    <TableEmptyState message="Aucune donnée disponible" />
  </TableBody>
</Table>
```

---

## Typographie

### Classes Utilitaires

```css
/* Titres de page */
.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2;
}

.page-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-300 mb-6;
}

/* Titres de section */
.section-title {
  @apply text-xl font-semibold text-gray-900 dark:text-white mb-4;
}

.section-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-3;
}

/* Headings */
.text-heading-lg {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  @apply text-gray-900 dark:text-white;
}

.text-heading-md {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-snug);
  @apply text-gray-900 dark:text-white;
}

.text-heading-sm {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-snug);
  @apply text-gray-900 dark:text-white;
}

/* Corps de texte */
.text-body {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  @apply text-gray-700 dark:text-gray-300;
}

.text-body-sm {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  @apply text-gray-600 dark:text-gray-400;
}

.text-caption {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  @apply text-gray-500 dark:text-gray-500;
}
```

---

## Espacement

### Classes Utilitaires

```css
/* Espacement vertical (space-y) */
.space-section {
  @apply space-y-6; /* Sections de page */
}

.space-form {
  @apply space-y-4; /* Formulaires */
}

.space-compact {
  @apply space-y-2; /* Espacement compact */
}

/* Espacement horizontal (gap) */
.gap-section {
  @apply gap-6;
}

.gap-form {
  @apply gap-4;
}

.gap-compact {
  @apply gap-2;
}
```

### Marges Standard

- **Entre sections:** `mb-6` ou `mb-8`
- **Entre éléments de formulaire:** `mb-4`
- **Entre éléments compacts:** `mb-2`
- **Padding de cards:** `p-6` (md) ou `p-8` (lg)
- **Padding de modals:** `p-6`

---

## Couleurs

### Palette de Couleurs

**Brand (Bleu):**

- `blue-50` à `blue-900` - Couleur principale
- Utiliser `blue-600` pour les actions primaires
- Utiliser `blue-500` pour les états de focus

**Sémantiques:**

- **Succès:** `green-500`, `green-600`
- **Avertissement:** `yellow-500`, `yellow-600`
- **Erreur:** `red-500`, `red-600`, `red-700`
- **Info:** `blue-500`, `blue-600`

**Neutres:**

- `gray-50` à `gray-900` - Couleurs neutres
- Utiliser pour les bordures, arrière-plans, textes

### Mode Sombre

Toujours fournir des variantes dark mode avec la classe `dark:`:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

---

## Guidelines

### 1. Uniformité des Boutons

**✅ À FAIRE:**

- Utiliser les variants standardisés (`default`, `destructive`, `outline`, etc.)
- Utiliser les tailles standardisées (`sm`, `default`, `lg`)
- Utiliser `leftIcon` et `rightIcon` pour les icônes

**❌ À ÉVITER:**

- Créer des styles de boutons personnalisés
- Utiliser des tailles personnalisées
- Ajouter des classes Tailwind directes sur Button

### 2. Uniformité des Tables

**✅ À FAIRE:**

- Utiliser les composants `Table`, `TableHeader`, `TableBody`, etc.
- Utiliser `TableLoadingState` pour le chargement
- Utiliser `TableEmptyState` pour les états vides
- Appliquer `clickable` sur `TableRow` si cliquable

**❌ À ÉVITER:**

- Créer des tables avec `<table>` HTML direct
- Utiliser des styles personnalisés pour les tables
- Créer des états de chargement personnalisés

### 3. Espacement Cohérent

**✅ À FAIRE:**

- Utiliser `space-section` pour les sections de page
- Utiliser `space-form` pour les formulaires
- Utiliser `PageSection` avec le prop `spacing`
- Utiliser les marges standardisées

**❌ À ÉVITER:**

- Utiliser des valeurs d'espacement arbitraires
- Mélanger différents systèmes d'espacement
- Oublier le mode dark

### 4. Typographie Cohérente

**✅ À FAIRE:**

- Utiliser `page-title` et `page-subtitle` pour les pages
- Utiliser `section-title` et `section-subtitle` pour les sections
- Utiliser les classes `text-heading-*` pour les headings
- Utiliser `text-body` et `text-body-sm` pour le contenu

**❌ À ÉVITER:**

- Créer des styles de texte personnalisés
- Utiliser des tailles de police arbitraires
- Oublier les variantes dark mode

### 5. Modales et Dialogues

**✅ À FAIRE:**

- Utiliser le composant `Modal` standardisé
- Spécifier une taille appropriée (`sm`, `md`, `lg`, etc.)
- Utiliser `contentPadding` pour le padding
- Fournir un titre clair

**❌ À ÉVITER:**

- Créer des modales personnalisées
- Utiliser des tailles non standard
- Oublier le bouton de fermeture

### 6. Accessibilité

**✅ À FAIRE:**

- Fournir des labels pour tous les inputs
- Utiliser des contrastes suffisants (vérifier WCAG AA)
- Fournir des états de focus visibles
- Utiliser des attributs ARIA appropriés
- Tester au clavier

**❌ À ÉVITER:**

- Retirer les outlines de focus
- Utiliser des couleurs sans contraste suffisant
- Oublier les labels sur les formulaires

### 7. Responsive Design

**✅ À FAIRE:**

- Tester sur mobile, tablette, desktop
- Utiliser les breakpoints Tailwind (`sm:`, `md:`, `lg:`, etc.)
- Assurer que les tables sont scrollables horizontalement
- Adapter les layouts pour mobile

**❌ À ÉVITER:**

- Fixer des largeurs absolues
- Ignorer les petits écrans
- Créer des layouts non flexibles

### 8. Pas d'Emojis UI

**✅ À FAIRE:**

- Utiliser des icônes Lucide React
- Utiliser du texte clair
- Utiliser des couleurs sémantiques

**❌ À ÉVITER:**

- Utiliser des emojis dans l'interface (✅, ❌, ⚠️, etc.)
- Utiliser des emojis dans les messages d'erreur
- Utiliser des emojis dans les commentaires de code

---

## Exemples de Pages

### Page Standard

```tsx
import { PageContainer, PageHeader, PageSection, Button } from '@/shared/ui'
import { Plus, Calendar } from 'lucide-react'

export const MyPage = () => {
  return (
    <PageContainer maxWidth="7xl" padding="lg">
      <PageHeader
        title="Titre de la page"
        description="Description de la page"
        icon={Calendar}
        actions={<Button leftIcon={<Plus />}>Créer</Button>}
      />

      <PageSection spacing="lg">{/* Contenu */}</PageSection>
    </PageContainer>
  )
}
```

### Formulaire

```tsx
import { FormSection, Input, Button, FormField } from '@/shared/ui'

export const MyForm = () => {
  return (
    <form className="space-form">
      <FormSection title="Informations" required>
        <FormField label="Nom" required error={errors.name?.message}>
          <Input {...register('name')} error={!!errors.name} />
        </FormField>

        <FormField label="Email" required>
          <Input type="email" {...register('email')} />
        </FormField>
      </FormSection>

      <div className="flex gap-3 justify-end">
        <Button variant="outline">Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  )
}
```

---

## Maintenance

### Ajout de Nouveaux Composants

1. Créer le composant dans `src/shared/ui/`
2. Utiliser les design tokens dans `tokens.css`
3. Exporter dans `src/shared/ui/index.ts`
4. Documenter dans ce fichier
5. Créer une story Storybook si pertinent

### Modification de Tokens

1. Modifier `src/styles/tokens.css`
2. Vérifier l'impact sur tous les composants
3. Mettre à jour la documentation
4. Communiquer les changements à l'équipe

---

## Ressources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Lucide React Icons:** https://lucide.dev/
- **Radix UI:** https://www.radix-ui.com/
- **WCAG Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Support

Pour toute question sur le design system, contactez l'équipe de développement front-end.
