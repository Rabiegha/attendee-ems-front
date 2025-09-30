# 🎨 SYSTÈME DE COULEURS - ATTENDEE EMS

## Couleurs de Statut Améliorées (Dark Mode Optimisé)

### 🔴 Couleurs d'Erreur / Destructive
```css
/* Light Mode */
--error: 0 84.2% 60.2%;           /* Rouge vif pour contraste */
--error-foreground: 210 40% 98%;  /* Blanc pour texte */
--error-bg: 0 93% 94%;            /* Rouge très clair pour fond */

/* Dark Mode */
--error: 0 84.2% 70%;             /* Rouge plus clair pour visibilité */
--error-foreground: 210 40% 98%;  /* Blanc pour texte */
--error-bg: 0 63% 15%;            /* Rouge très sombre pour fond */
```

### ✅ Couleurs de Succès
```css
/* Utiliser green-400 en dark mode pour meilleur contraste */
text-green-700 dark:text-green-300
border-green-500 dark:border-green-400
```

### ⚠️ Couleurs d'Avertissement
```css
/* Utiliser yellow-400 en dark mode pour meilleur contraste */
text-yellow-700 dark:text-yellow-300  
border-yellow-500 dark:border-yellow-400
```

### ℹ️ Couleurs d'Information
```css
/* Utiliser blue-400 en dark mode pour meilleur contraste */
text-blue-700 dark:text-blue-300
border-blue-500 dark:border-blue-400
```

## Usage dans les Composants

### Alert Component
```tsx
// ✅ BON - Utilise les nouvelles couleurs error
<Alert variant="destructive" />

// Classes appliquées automatiquement :
// border-error/50 text-error dark:border-error [&>svg]:text-error bg-error-bg dark:bg-error-bg
```

### Button Component  
```tsx
// ✅ BON - Couleurs destructive améliorées
<Button variant="destructive" />

// Classes appliquées :
// bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400
```

### Classes Utilitaires Recommandées

#### Texte d'Erreur
```css
.text-error-light { @apply text-red-600; }
.text-error-dark { @apply dark:text-red-400; }
.text-error { @apply text-red-600 dark:text-red-400; }
```

#### Fond d'Erreur
```css
.bg-error-light { @apply bg-red-50; }
.bg-error-dark { @apply dark:bg-red-950/20; }
.bg-error { @apply bg-red-50 dark:bg-red-950/20; }
```

#### Bordure d'Erreur  
```css
.border-error-light { @apply border-red-500; }
.border-error-dark { @apply dark:border-red-400; }
.border-error { @apply border-red-500 dark:border-red-400; }
```

## Principes de Contraste

### Light Mode
- **Texte d'erreur** : Rouge 600 sur blanc (AA+ compliant)
- **Fond d'erreur** : Rouge 50 avec bordure rouge 500
- **Boutons destructifs** : Rouge 600 avec hover rouge 700

### Dark Mode  
- **Texte d'erreur** : Rouge 400 sur gris sombre (AA+ compliant) 
- **Fond d'erreur** : Rouge 950/20 avec bordure rouge 400
- **Boutons destructifs** : Rouge 500 avec hover rouge 400

## Application Future

Toutes les nouvelles fonctionnalités doivent utiliser ce système de couleurs :

1. **Toast notifications** → Variantes error avec ces couleurs
2. **Form validation** → Classes text-error et border-error  
3. **Modals de confirmation** → Boutons destructive cohérents
4. **Status badges** → Couleurs sémantiques uniformes

## Tests de Contraste

- ✅ **WCAG AA** : Ratio de contraste minimum 4.5:1
- ✅ **WCAG AAA** : Ratio de contraste minimum 7:1  
- ✅ **Tests effectués** avec Chrome DevTools et WebAIM

---
*Dernière mise à jour : 30 septembre 2025*