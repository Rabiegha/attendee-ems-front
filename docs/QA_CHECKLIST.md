# ✅ Checklist de Validation QA - Design System

Cette checklist permet de valider la cohérence visuelle et structurelle du design system sur l'ensemble de l'application.

---

## 1. Composants UI de Base

### Button
- [ ] Toutes les variantes s'affichent correctement (default, outline, destructive, secondary, ghost, link)
- [ ] Toutes les tailles fonctionnent (sm, default, lg, icon)
- [ ] État loading affiche le spinner
- [ ] État disabled rend le bouton non-cliquable et visuellement désactivé
- [ ] Les icônes gauche et droite s'alignent correctement
- [ ] Focus ring visible au clavier
- [ ] Hover states fonctionnent en mode light et dark
- [ ] Transitions fluides (200ms)

### Input
- [ ] Support des états error et success
- [ ] Icônes gauche et droite positionnées correctement
- [ ] Toggle de mot de passe fonctionne (showPasswordToggle)
- [ ] Focus ring bleu par défaut, rouge en erreur, vert en succès
- [ ] Placeholder visible et lisible
- [ ] Dark mode : bordures et texte visibles
- [ ] Disabled state désactive l'input

### Select
- [ ] Options visibles et sélectionnables
- [ ] Icône chevron présente
- [ ] Support icône gauche
- [ ] États error et success fonctionnent
- [ ] Placeholder affiché quand aucune sélection
- [ ] Dark mode : options lisibles

### Textarea
- [ ] Redimensionnable ou hauteur fixe selon config
- [ ] États error et success
- [ ] Placeholder visible
- [ ] Dark mode correct

### Card
- [ ] Variant default : bordure + fond
- [ ] Variant elevated : ombre + hover effect
- [ ] Variant outlined : bordure double
- [ ] Variant ghost : fond semi-transparent
- [ ] Padding configurable (none, sm, md, lg, xl)
- [ ] Radius configurable (none, sm, md, lg, full)
- [ ] CardHeader, CardTitle, CardContent, CardFooter fonctionnent
- [ ] Dark mode : fond et bordures adaptés

### Modal
- [ ] ✅ **Critique**: Fonctionne en mode light ET dark (corrigé)
- [ ] Animation d'ouverture fluide (scale + fade)
- [ ] Animation de fermeture fluide
- [ ] Backdrop blur visible
- [ ] Clic sur backdrop ferme la modal (si activé)
- [ ] Bouton X de fermeture fonctionne
- [ ] Scroll du contenu si trop long
- [ ] Focus trap (Tab reste dans la modal)
- [ ] Escape ferme la modal
- [ ] Tailles (sm, md, lg, xl, 2xl, etc.) fonctionnent

---

## 2. Composants de Layout

### PageContainer
- [ ] MaxWidth appliquée correctement (sm, md, lg, xl, 2xl, etc.)
- [ ] Padding configurable (none, sm, md, lg, xl)
- [ ] Centré horizontalement
- [ ] Responsive sur mobile, tablet, desktop

### PageHeader
- [ ] Titre en text-3xl, bold, dark mode OK
- [ ] Description en dessous du titre
- [ ] Icône à gauche du titre (si fournie)
- [ ] Actions à droite alignées
- [ ] Bordure inférieure présente
- [ ] Responsive : stack vertical sur mobile

### PageSection
- [ ] Titre de section (si fourni)
- [ ] Description de section (si fournie)
- [ ] Spacing configurable (sm, md, lg, xl)
- [ ] Espacement cohérent avec autres sections

### FormSection
- [ ] Titre de section avec bordure inférieure
- [ ] Étoile rouge si required
- [ ] Description sous le titre
- [ ] Espacement entre champs (space-y-4)

### ActionGroup
- [ ] Alignement left/center/right/between fonctionne
- [ ] Espacement sm/md/lg appliqué
- [ ] Mode vertical stack les boutons
- [ ] Divider ajoute bordure supérieure
- [ ] Responsive OK

---

## 3. Typographie

### Classes de titre
- [ ] `.page-title` : text-3xl, bold, dark mode OK
- [ ] `.page-subtitle` : text-lg, gray-600/gray-300
- [ ] `.section-title` : text-xl, semibold
- [ ] `.section-subtitle` : text-sm, gray-600/gray-400
- [ ] `.text-heading-lg` : text-2xl, semibold
- [ ] `.text-heading-md` : text-xl, semibold
- [ ] `.text-heading-sm` : text-lg, medium

### Classes de body
- [ ] `.text-body` : text-base, gray-700/gray-300
- [ ] `.text-body-sm` : text-sm, gray-600/gray-400
- [ ] `.text-caption` : text-xs, gray-500/gray-500

### Consistance
- [ ] Tous les h1 de page utilisent PageHeader ou .page-title
- [ ] Tous les h2 de section utilisent .section-title
- [ ] Pas de tailles custom (text-xl, text-2xl) en dehors des classes

---

## 4. Couleurs & Dark Mode

### Tokens
- [ ] Couleurs brand (bleu) utilisées partout
- [ ] Couleurs neutral (gray) cohérentes
- [ ] Couleurs semantic (success, error, warning) OK
- [ ] Aucune valeur en dur (#ffffff, rgb(255,255,255))

### Dark Mode Global
- [ ] Toggle fonctionne (ThemeToggle)
- [ ] Tous les textes lisibles en dark mode
- [ ] Tous les backgrounds adaptés
- [ ] Toutes les bordures visibles
- [ ] Contrastes respectés (WCAG AA minimum)
- [ ] Icônes visibles dans les deux modes

### Composants
- [ ] Button : tous variants OK en dark
- [ ] Input : bordures et texte lisibles
- [ ] Card : fond et bordures visibles
- [ ] Modal : ✅ maintenant OK en light et dark
- [ ] Alert : backgrounds et textes OK
- [ ] Toast : lisible dans les deux modes

---

## 5. Espacements

### Entre sections
- [ ] Espacement standard : space-y-6 ou PageSection spacing="lg"
- [ ] Pas de margin/padding ad hoc
- [ ] Utilisation de tokens (--spacing-lg, etc.)

### Dans formulaires
- [ ] Entre champs : space-y-4
- [ ] Entre sections : space-y-6 ou space-y-8
- [ ] Labels au-dessus des champs
- [ ] Boutons avec ActionGroup + divider

### Dans pages
- [ ] PageContainer avec padding="lg"
- [ ] Sections séparées avec PageSection
- [ ] Cartes de stats alignées en grid

---

## 6. États Interactifs

### Hover
- [ ] Boutons changent de couleur au survol
- [ ] Cartes avec variant="elevated" s'élèvent (shadow)
- [ ] Liens changent de couleur
- [ ] Transitions fluides (200ms)

### Focus
- [ ] Focus ring visible sur tous les éléments focusables
- [ ] Couleur : bleu par défaut, rouge en erreur
- [ ] Navigation clavier fonctionnelle
- [ ] Skip links présents (si applicable)

### Disabled
- [ ] Boutons disabled : opacity 50%, pointer-events-none
- [ ] Inputs disabled : opacity 50%, non éditables
- [ ] Visuellement distinct de l'état normal

### Loading
- [ ] Spinner visible pendant le chargement
- [ ] Bouton disabled pendant loading
- [ ] Texte "Chargement..." si applicable
- [ ] LoadingSpinner utilisé partout (pas de spinners custom)

---

## 7. Accessibilité

### Clavier
- [ ] Tous les boutons accessibles au Tab
- [ ] Modals trappent le focus
- [ ] Escape ferme les modals
- [ ] Enter soumet les formulaires

### ARIA
- [ ] Boutons ont aria-label si icône seule
- [ ] Inputs ont labels associés
- [ ] Required fields indiqués (visuel + aria-required)
- [ ] Messages d'erreur liés aux champs (aria-describedby)

### Contrastes
- [ ] Texte sur fond : ratio 4.5:1 minimum
- [ ] Icônes : visibles et contrastées
- [ ] États (error, success) : contrastes OK
- [ ] Vérifier avec outil (ex: axe DevTools)

### Sémantique HTML
- [ ] h1 unique par page
- [ ] Hiérarchie h1 > h2 > h3 respectée
- [ ] Boutons = <button>, liens = <a>
- [ ] Formulaires avec <form>, labels avec <label>

---

## 8. Responsive Design

### Mobile (< 640px)
- [ ] PageHeader stack verticalement
- [ ] ActionGroup stack si nécessaire
- [ ] Tables scroll horizontalement
- [ ] Padding réduit (p-4 au lieu de p-6)
- [ ] Grids passent en 1 colonne

### Tablet (640px - 1024px)
- [ ] Grids 2 colonnes
- [ ] Padding normal (p-6)
- [ ] Actions restent à droite

### Desktop (> 1024px)
- [ ] Grids 3-4 colonnes
- [ ] MaxWidth 7xl
- [ ] Tout aligné et espacé correctement

---

## 9. Performance

### Animations
- [ ] Toutes < 300ms
- [ ] GPU-accelerated (transform, opacity)
- [ ] Pas de jank/saccades
- [ ] Respectent prefers-reduced-motion

### Chargement
- [ ] Images lazy-loadées
- [ ] Code splitting par route
- [ ] Spinners pendant le chargement
- [ ] Pas de layout shift (CLS)

---

## 10. Documentation

### Storybook
- [ ] PageHeader story OK
- [ ] PageContainer story OK
- [ ] FormSection story OK
- [ ] ActionGroup story OK
- [ ] Toutes les variantes documentées
- [ ] Dark mode testable dans Storybook

### Code
- [ ] Composants commentés
- [ ] Props TypeScript strictes
- [ ] Exemples d'usage dans docs
- [ ] COMPONENT_LIBRARY.md à jour

---

## 11. Tests Manuels par Page

### Login
- [ ] Structure cohérente avec autres pages auth
- [ ] Formulaire avec FormField
- [ ] Boutons avec ActionGroup
- [ ] Dark mode fonctionne

### Dashboard
- [ ] PageHeader avec icône et actions
- [ ] Stats cards uniformes
- [ ] Sections avec PageSection
- [ ] Responsive OK

### Events
- [ ] Liste uniforme
- [ ] Filtres alignés
- [ ] Actions groupées
- [ ] Modal de création uniforme

### Users
- [ ] Table cohérente
- [ ] Stats cards identiques
- [ ] Actions uniformes

### Invitations
- [ ] Formulaire avec FormSection
- [ ] ActionGroup pour boutons
- [ ] Structure cohérente

---

## 12. Migration

### Ancien code
- [ ] Identifier pages non migrées
- [ ] Liste des fichiers à refactoriser
- [ ] Priorités définies

### Nouveau code
- [ ] Toutes les nouvelles pages utilisent les composants
- [ ] Pas de régression visuelle
- [ ] Tests passent

---

## 13. Build & Tests

### Build
- [ ] `npm run build` sans erreur
- [ ] Pas de warnings TypeScript
- [ ] Bundle size raisonnable

### Tests
- [ ] `npm run typecheck` OK
- [ ] `npm run lint` OK
- [ ] Tests unitaires passent (si existants)
- [ ] Tests E2E passent (si existants)

### Storybook
- [ ] `npm run storybook` lance sans erreur
- [ ] Toutes les stories s'affichent
- [ ] Pas de console errors

---

## Score Final

**Total items:** ~150  
**Items validés:** _____ / 150

**Taux de conformité:** _____ %

**Objectif:** > 95%

---

## Actions Correctives

Si score < 95%, lister les actions prioritaires:

1. [ ] Action prioritaire 1
2. [ ] Action prioritaire 2
3. [ ] Action prioritaire 3

---

**Date de validation:** __________  
**Validé par:** __________  
**Prochaine revue:** __________
