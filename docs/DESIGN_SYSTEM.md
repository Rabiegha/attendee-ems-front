# 🎨 DESIGN SYSTEM - ATTENDEE EMS

## Vue d'ensemble

Notre design system assure la **cohérence visuelle** et l'**expérience utilisateur unifiée** à travers toute l'application. Il est basé sur :

- ✅ **Tokens centralisés** dans `src/styles/tokens.css`
- ✅ **Composants unifiés** dans `src/shared/ui/`
- ✅ **Variants standardisés** avec `class-variance-authority`
- ✅ **Dark mode universel** avec persistance
- ✅ **Documentation Storybook** complète

## 🏗️ Architecture

```
src/
├── styles/
│   ├── tokens.css         # Design tokens centralisés
│   └── tailwind.css       # Configuration Tailwind + imports
├── shared/ui/             # Composants du design system
│   ├── Button.tsx         # Boutons avec variants
│   ├── Input.tsx          # Champs de saisie
│   ├── Select.tsx         # Sélecteurs uniformes
│   ├── Card.tsx           # Cartes avec structure sémantique
│   ├── Modal.tsx          # Modals avec système unifié
│   └── *.stories.tsx      # Documentation Storybook
```

## 🎨 Tokens de Design

### Couleurs

Toutes les couleurs suivent un système unifié :

```css
/* Brand Colors */
--color-brand-600: 37 99 235; /* Bleu principal */
--color-brand-700: 29 78 216; /* Bleu foncé */

/* Neutral Colors */
--color-neutral-50: 249 250 251; /* Fond clair */
--color-neutral-800: 31 41 55; /* Fond sombre */
--color-neutral-200: 229 231 235; /* Bordure claire */
--color-neutral-700: 55 65 81; /* Bordure sombre */

/* Semantic Colors */
--color-success-600: 22 163 74; /* Vert succès */
--color-error-600: 220 38 38; /* Rouge erreur */
--color-warning-600: 217 119 6; /* Orange avertissement */
```

### Espacement

Système d'espacement cohérent :

```css
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 0.75rem; /* 12px */
--spacing-lg: 1rem; /* 16px */
--spacing-xl: 1.5rem; /* 24px */
--spacing-2xl: 2rem; /* 32px */
```

### Typography

Échelle typographique standardisée :

```css
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
```

## 🧩 Composants

### Button

```tsx
import { Button } from '@/shared/ui'

// Variants disponibles
<Button variant="default">Primaire</Button>
<Button variant="outline">Secondaire</Button>
<Button variant="ghost">Discret</Button>
<Button variant="destructive">Dangereux</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grand</Button>
```

### Input

```tsx
import { Input } from '@/shared/ui'
;<Input
  placeholder="Saisissez votre texte"
  error={!!errors.field}
  leftIcon={<Mail className="h-4 w-4" />}
/>
```

### Select

```tsx
import { Select, SelectOption } from '@/shared/ui'
;<Select placeholder="Choisissez une option">
  <SelectOption value="1">Option 1</SelectOption>
  <SelectOption value="2">Option 2</SelectOption>
</Select>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui'
;<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
</Card>
```

### Modal

```tsx
import { Modal } from '@/shared/ui'
;<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Titre de la modal"
  maxWidth="2xl"
>
  Contenu de la modal
</Modal>
```

## 🌙 Dark Mode

**RÈGLE ABSOLUE** : Tous les composants **DOIVENT** supporter le dark mode.

### Classes obligatoires

```tsx
// ✅ BON
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200">

// ❌ MAUVAIS
<div className="bg-white text-gray-900">
```

### Patterns standardisés

```css
/* Backgrounds */
bg-white dark:bg-gray-800
bg-gray-50 dark:bg-gray-900

/* Text */
text-gray-900 dark:text-white         /* Titres */
text-gray-600 dark:text-gray-300      /* Corps */
text-gray-400 dark:text-gray-500      /* Metadata */

/* Borders */
border-gray-200 dark:border-gray-700

/* Hover states */
hover:bg-gray-100 dark:hover:bg-gray-700

/* Transitions OBLIGATOIRES */
transition-colors duration-200
```

## 📋 Guidelines d'usage

### 1. Hiérarchie visuelle

```tsx
// Titres
<h1 className="text-heading-lg">Titre principal</h1>
<h2 className="text-heading-md">Titre section</h2>
<h3 className="text-heading-sm">Titre sous-section</h3>

// Corps de texte
<p className="text-body">Texte principal</p>
<p className="text-body-sm">Texte secondaire</p>
```

### 2. Espacement cohérent

```tsx
// Marges entre sections
<div className="space-y-6">      <!-- 24px -->

// Marges entre éléments
<div className="space-y-4">      <!-- 16px -->

// Marges entre textes
<div className="space-y-2">      <!-- 8px -->
```

### 3. États interactifs

```tsx
// Boutons
<Button
  disabled={isLoading}
  loading={isLoading}
  loadingText="Chargement..."
>

// Inputs avec validation
<Input
  error={!!errors.field}
  success={isValid}
/>
```

### 4. Modals uniformes

```tsx
// Structure standard
<Modal title="Titre" maxWidth="lg">
  <form className="space-y-6">
    {/* Champs */}

    {/* Actions en bas */}
    <div className="flex items-center justify-end space-x-3 pt-6 border-t">
      <Button variant="outline">Annuler</Button>
      <Button type="submit">Confirmer</Button>
    </div>
  </form>
</Modal>
```

## 🚫 Anti-patterns à éviter

### ❌ Styles inline ou personnalisés

```tsx
// MAUVAIS
<div style={{ backgroundColor: '#ffffff', padding: '20px' }}>

// BON
<Card variant="default" padding="lg">
```

### ❌ Classes Tailwind directes pour les composants

```tsx
// MAUVAIS
<button className="px-4 py-2 bg-blue-600 text-white rounded">

// BON
<Button variant="default">
```

### ❌ Oubli du dark mode

```tsx
// MAUVAIS
<div className="bg-white border-gray-200">

// BON
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-200">
```

### ❌ Incohérence de padding dans les modals

```tsx
// MAUVAIS
<Modal>
  <div className="p-4">  <!-- Padding personnalisé -->

// BON
<Modal contentPadding={true}>  <!-- Padding uniforme -->
```

## Testing

### Checklist qualité

- [ ] **Dark mode** : Tester les deux modes
- [ ] **Responsive** : Mobile, tablet, desktop
- [ ] **Accessibilité** : Navigation clavier, screen readers
- [ ] **États** : Loading, error, success, disabled
- [ ] **Hover/Focus** : États interactifs fonctionnels
- [ ] **Animations** : Transitions fluides (200ms)

### Validation Storybook

Tous les composants doivent avoir :

- ✅ Story par défaut
- ✅ Variants (si applicable)
- ✅ États (loading, error, etc.)
- ✅ Dark mode story
- ✅ Documentation des props

## 🎯 Objectifs

1. **Consistance** : Apparence et comportement unifiés
2. **Maintenabilité** : Un seul endroit pour chaque pattern
3. **Performance** : Composants optimisés et réutilisables
4. **Accessibilité** : Support complet WCAG 2.1
5. **Developer Experience** : API simple et TypeScript strict

---

**💡 Principe fondamental** : Chaque nouveau composant ou modification **DOIT** respecter ce design system pour garantir la cohérence de l'application B2B.
