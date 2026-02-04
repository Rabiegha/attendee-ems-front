# Responsive Design Documentation

## Vue d'ensemble

Ce projet utilise une approche **mobile-first** pour le design responsive, garantissant une expérience utilisateur optimale sur tous les appareils, du smartphone au grand écran desktop.

## Breakpoints

Les breakpoints sont définis dans `tailwind.config.ts` et suivent une approche mobile-first :

```typescript
screens: {
  'xs': '475px',     // Extra small devices (large phones)
  'sm': '640px',     // Small tablets / Mobile landscape
  'md': '768px',     // Tablets
  'lg': '1024px',    // Laptops / Small desktops
  'xl': '1280px',    // Desktops
  '2xl': '1536px',   // Large desktops
}
```

### Usage des breakpoints

```tsx
// Classe par défaut pour mobile, puis override pour desktop
<div className="p-4 md:p-6 lg:p-8">

// Masquer sur mobile, afficher sur desktop
<div className="hidden lg:block">

// Afficher sur mobile uniquement
<div className="block lg:hidden">
```

## Variables CSS Responsives

Les variables CSS sont définies dans `src/styles/tokens.css` :

```css
/* Spacing responsive */
--page-padding: 1rem;        /* Mobile */
--page-padding-md: 2rem;     /* Tablet */
--page-padding-lg: 2.5rem;   /* Laptop */

/* Touch targets */
--touch-target-min: 44px;           /* Apple HIG */
--touch-target-comfortable: 48px;   /* Material Design */

/* Navigation */
--header-height: 64px;              /* Mobile */
--header-height-md: 69px;           /* Desktop */
--sidebar-width: 256px;             /* Desktop expanded */
--sidebar-width-collapsed: 64px;    /* Desktop collapsed */
--sidebar-width-mobile: 280px;      /* Mobile overlay */
```

## Composants Responsives

### Navigation

#### Header
- **Mobile/Tablet** : Menu burger qui ouvre la sidebar en overlay
- **Desktop** : Logo, organisation, utilisateur, thème et logout visibles
- Hauteur adaptative : 57px (mobile) → 64px (desktop)

```tsx
<Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
```

#### Sidebar
- **Mobile/Tablet** : Overlay fullscreen avec backdrop
- **Desktop** : Sidebar fixe, collapsible (256px ↔ 64px)
- Fermeture automatique après navigation sur mobile

```tsx
<Sidebar
  isOpen={isSidebarOpen}
  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
  isMobileMenuOpen={isMobileMenuOpen}
  onMobileMenuClose={() => setIsMobileMenuOpen(false)}
/>
```

### Layouts

#### PageContainer
Padding adaptatif selon la taille d'écran :

```tsx
<PageContainer maxWidth="7xl" padding="lg">
  {/* p-4 sm:p-6 md:p-8 */}
</PageContainer>
```

#### PageHeader
- Titre responsive : `text-xl sm:text-2xl md:text-3xl`
- Actions wrappent sur mobile
- Badge et description s'adaptent

```tsx
<PageHeader
  title="Événements"
  description="Gérez vos événements"
  icon={Calendar}
  actions={<Button>Créer</Button>}
/>
```

### Tables (DataTable)

#### Fonctionnalités responsives
1. **Scroll horizontal** : Tableau scrollable sur mobile avec padding adaptatif
2. **Padding des cellules** : `px-3 sm:px-4 md:px-6`
3. **Pagination responsive** :
   - Boutons avec touch targets (44px min)
   - Numéros de page cachés sur très petit écran
   - Info compacte sur mobile
4. **Toolbar responsive** :
   - Boutons texte abrégé sur mobile
   - Layout vertical sur mobile, horizontal sur desktop

```tsx
<DataTable
  columns={columns}
  data={data}
  enablePagination
  enableRowSelection
  bulkActions={bulkActions}
/>
```

### Modals

#### Sizing responsive
```tsx
const modalVariants = {
  lg: 'w-full max-w-lg mx-4 sm:mx-6'
}
```

- Marges adaptatives : `mx-4` (mobile) → `mx-6` (desktop)
- Padding du contenu : `p-4 sm:p-5 md:p-6`
- Hauteur maximale : `max-h-[calc(90vh-80px)]`

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Créer un événement"
  maxWidth="xl"
>
  {/* Content */}
</Modal>
```

### Forms

#### Input
- Hauteur responsive : `h-11 sm:h-10` (plus grand sur mobile pour le touch)
- Touch targets pour boutons : `touch-target` class (44px min)

```tsx
<Input
  label="Email"
  type="email"
  placeholder="exemple@email.com"
/>
```

#### Select
- Même hauteur responsive que Input
- Dropdown optimisé pour mobile

```tsx
<Select placeholder="Sélectionner...">
  <option value="1">Option 1</option>
</Select>
```

#### Tabs
- Scroll horizontal sur mobile : `overflow-x-auto scrollbar-hide`
- Touch targets pour les onglets
- Actions wrappent sur mobile

```tsx
<Tabs
  items={tabItems}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  actions={<Button size="sm">Action</Button>}
/>
```

### Cards

Padding adaptatif :
```tsx
<Card padding="md">
  {/* p-4 sm:p-5 md:p-6 */}
</Card>
```

## Utility Classes Responsives

### Spacing
```css
/* Padding responsive */
.p-responsive     /* p-4 md:p-6 lg:p-8 */
.px-responsive    /* px-4 md:px-6 lg:px-8 */
.py-responsive    /* py-4 md:py-6 lg:py-8 */

/* Gap responsive */
.gap-responsive   /* gap-4 md:gap-6 lg:gap-8 */
```

### Typography
```css
.text-responsive-sm   /* text-sm sm:text-base */
.text-responsive-base /* text-base sm:text-lg */
.text-responsive-lg   /* text-lg sm:text-xl md:text-2xl */
```

### Grids
```css
.responsive-grid-auto  /* grid-cols-1 sm:2 lg:3 xl:4 */
.responsive-grid-2     /* grid-cols-1 md:grid-cols-2 */
.responsive-grid-3     /* grid-cols-1 md:2 lg:3 */
```

### Visibility
```css
.mobile-only      /* block md:hidden */
.tablet-up        /* hidden md:block */
.desktop-only     /* hidden lg:block */

/* Alternatives */
.hidden-mobile    /* md:block hidden */
.visible-mobile   /* md:hidden block */
```

### Touch Targets
```css
.touch-target               /* min-h-[44px] min-w-[44px] */
.touch-target-comfortable   /* min-h-[48px] min-w-[48px] */
```

## Best Practices

### 1. Mobile-First
Toujours commencer par le design mobile et ajouter les styles pour les plus grands écrans :

```tsx
// ✅ Bon
<div className="p-4 md:p-6 lg:p-8">

// ❌ Éviter
<div className="p-8 md:p-6 sm:p-4">
```

### 2. Touch Targets
Tous les éléments interactifs doivent avoir au minimum 44px de hauteur/largeur :

```tsx
// ✅ Bon
<button className="p-2 touch-target">

// ❌ Éviter
<button className="p-1">  // Trop petit pour le touch
```

### 3. Overflow Prevention
Toujours prévenir les débordements horizontaux :

```tsx
// ✅ Bon
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
  <table className="min-w-full">

// ❌ Éviter
<div>
  <table className="w-[1200px]">  // Largeur fixe trop grande
```

### 4. Responsive Images
```tsx
// ✅ Bon
<img 
  src="/logo.png" 
  alt="Logo"
  className="h-7 sm:h-8 w-auto"
/>
```

### 5. Flexbox et Grid
Privilégier les layouts flexibles :

```tsx
// ✅ Bon - Flex wrap responsive
<div className="flex flex-col md:flex-row gap-4">

// ✅ Bon - Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 6. Typography
Utiliser des tailles de texte responsives :

```tsx
// ✅ Bon
<h1 className="text-xl sm:text-2xl md:text-3xl">

// ✅ Bon - Avec utility class
<h1 className="text-responsive-xl">
```

### 7. Spacing
Réduire l'espacement sur mobile :

```tsx
// ✅ Bon
<div className="space-y-4 md:space-y-6 lg:space-y-8">

// ✅ Bon - Avec utility class
<div className="space-responsive">
```

## Testing Responsive

### Breakpoints à tester

1. **Mobile Portrait** : 320px - 475px
   - iPhone SE, petits smartphones
   - Vérifier la lisibilité et les touch targets

2. **Mobile Landscape / Phablets** : 475px - 640px
   - Grands smartphones
   - Menu burger fonctionnel

3. **Small Tablets** : 640px - 768px
   - iPad Mini, petites tablettes
   - Navigation hybride

4. **Tablets** : 768px - 1024px
   - iPad, tablettes standard
   - Transition vers desktop

5. **Laptops** : 1024px - 1280px
   - MacBook, petits laptops
   - Layout desktop complet

6. **Desktops** : 1280px - 1536px
   - Écrans desktop standard
   - Densité d'information optimale

7. **Large Desktops** : >1536px
   - Grands écrans 4K
   - Utilisation de max-width

### Checklist de test

- [ ] Navigation fonctionne (burger menu sur mobile)
- [ ] Tous les textes sont lisibles
- [ ] Pas de scroll horizontal non intentionnel
- [ ] Touch targets respectés (44px min)
- [ ] Images responsive (pas de déformation)
- [ ] Tables scrollent horizontalement si nécessaire
- [ ] Modals s'affichent correctement
- [ ] Forms sont utilisables
- [ ] Spacing approprié pour chaque breakpoint
- [ ] Dark mode fonctionne à tous les breakpoints

## Outils de développement

### Chrome DevTools
1. Ouvrir DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Tester différents devices :
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad Air (820px)
   - iPad Pro (1024px)

### Commandes utiles

```bash
# Démarrer le serveur de dev
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## Dépannage

### Problème : Scroll horizontal sur mobile
**Solution** : Vérifier les largeurs fixes, ajouter `overflow-x-hidden` au parent

### Problème : Texte trop petit sur mobile
**Solution** : Utiliser des classes responsive `text-sm sm:text-base`

### Problème : Boutons trop petits
**Solution** : Ajouter `touch-target` ou `touch-target-comfortable`

### Problème : Modal dépasse l'écran
**Solution** : Vérifier `max-h-[90vh]` et padding adaptatif

## Ressources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Guidelines](https://material.io/design)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## Maintenance

### Ajouter un nouveau composant responsive

1. Commencer par le design mobile
2. Utiliser les utility classes existantes
3. Ajouter les breakpoints progressivement
4. Tester sur tous les appareils
5. Vérifier les touch targets
6. Valider l'accessibilité

### Mettre à jour un composant existant

1. Identifier les problèmes responsive
2. Appliquer les patterns de ce document
3. Tester les changements
4. Documenter les modifications si nécessaire
