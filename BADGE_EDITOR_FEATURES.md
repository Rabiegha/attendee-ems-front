# Badge Editor — Inventaire des fonctionnalités

## 1. Layout & Navigation

- **Layout 3 panneaux** : Sidebar gauche | Canvas central | Sidebar droite
- **Routes** : `/badges/designer/new` et `/badges/designer/:templateId`
- **Bouton retour** vers la liste des templates
- **Protection ACL** via `ProtectedPage` (requires `read` on `Badge`)
- **Protection des modifications non sauvegardées** :
  - `useBlocker` intercepte la navigation interne
  - `beforeunload` empêche la fermeture du navigateur
  - Modal avec 3 options : Rester / Quitter sans sauvegarder / Sauvegarder & Quitter
- **Modal de confirmation de suppression** pour les templates existants

---

## 2. Gestion des templates

- Champ **nom du template**
- Bouton **Sauvegarder** (raccourci Ctrl+S) — crée ou met à jour via API
- Bouton **Sauvegarder & Quitter** — sauvegarde puis retour à la liste
- Bouton **Supprimer** (mode édition uniquement) — avec modal de confirmation
- **Chargement du template** depuis l'API au montage (éléments, fond, format, images uploadées, paires de symétrie)
- **Suivi de l'état dirty** — basé sur la longueur de l'historique > 1
- **Auto-redirection** après création : navigue vers l'URL d'édition avec le nouvel ID

---

## 3. Sélection du format de badge

- **Page de sélection de format** (`BadgeFormatSelector.tsx`) :
  - Formats de badge prédéfinis : Badge Large (96×268mm), Badge Petit (96×164mm), CR-80 (54×86mm)
  - Formats de papier prédéfinis : A4, A5, A6, A7, Letter US
  - **Format personnalisé** : largeur/hauteur en mm (20–500mm)
  - **Bascule d'orientation** : Portrait / Paysage
  - **Prévisualisation live** des dimensions sélectionnées
- **Dropdown de format dans l'éditeur** pour changer en cours d'édition
- Le changement de format ajuste automatiquement les éléments hors limites

---

## 4. Canvas / Éditeur (BadgeEditor)

### Zoom & Pan
- `react-zoom-pan-pinch` (`TransformWrapper`)
- Zoom molette (step 0.1), plage 0.1x – 5x
- Zoom initial : 0.5x (50%)
- Centré à l'initialisation
- Pan via bouton central de la souris (clic gauche et droit réservés)
- Double-clic zoom désactivé

### Contrôles de zoom
- Boutons Zoom In / Zoom Out (bas de la sidebar gauche)
- Affichage du pourcentage (ex: "50%")

### Arrière-plan
- Upload d'image de fond (accepte tout type d'image)
- Affiché en `background-image: cover, center`
- Prompt "cliquez pour ajouter" quand aucun fond (texte et icône adaptatifs au zoom)

### Sélection rectangulaire (lasso)
- Clic & drag sur zone vide pour tracer un rectangle de sélection
- Sélectionne tous les éléments intersectés
- Shift/Ctrl pour sélection additive

### Guides magnétiques (Snap)
- Seuil de snap : 20px
- Snap aux bords du badge (gauche, droite, haut, bas)
- Snap au centre du badge (horizontal & vertical)
- Snap aux bords des autres éléments
- Snap aux centres des autres éléments
- **Snap bord-à-bord adjacent** (haut-à-bas, gauche-à-droite)
- Lignes guides bleues visuelles pendant le snap
- Contour bleu sur les éléments cibles du snap
- Snap actif pendant le **drag** et le **resize**
- **Shift désactive le snap** pendant drag/resize

### Visuels de sélection
- Contour bleu (4px solid) sur les éléments sélectionnés
- Anneau violet (4px) sur les éléments symétriques liés

---

## 5. Types d'éléments

| Type | Description |
|------|-------------|
| **Texte** | Texte libre ou variables de template (`{{variableName}}`) |
| **QR Code** | Pattern SVG placeholder + label "QR Code" ; label adaptatif au zoom |
| **Image** | Upload et affichage d'images raster (stockées en base64 data URLs) |
| **Forme** ⚠️ | Rectangle, Cercle, Ligne — composant `DesignerToolbox` existant mais **non branché** |

---

## 6. Manipulation des éléments

### Drag (déplacement)
- Implémentation custom (pas de librairie)
- Opacité 0.5 pendant le drag, curseur `move`
- **Drag multi-éléments** : déplacer un élément sélectionné déplace tous les sélectionnés
- Guides magnétiques actifs pendant le drag
- Seuil clic vs drag : 5px
- Bouton central ignoré (réservé au pan)

### Resize (redimensionnement)
- **8 poignées** : nw, n, ne, w, e, sw, s, se
- Poignées mises à l'échelle inverse du zoom (taille visuelle constante)
- **Shift** : maintenir le ratio pendant le resize
- **Alt** : resize symétrique depuis le centre
- Taille minimum : 10px
- Guides magnétiques actifs pendant le resize
- Historique sauvé uniquement à la fin du resize
- QR codes : ratio 1:1 par défaut

### Déplacement au clavier
- Flèches : déplacement de 1px
- Shift + Flèches : déplacement de 10px
- Fonctionne en multi-sélection

### Sélection au clic
- Clic simple : sélectionne un élément
- Shift/Ctrl + clic : toggle l'élément dans/hors de la sélection
- Clic sur le fond : tout désélectionner

---

## 7. Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` | Sauvegarder le template |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+C` | Copier les éléments sélectionnés |
| `Ctrl+V` | Coller (décalage +20px) |
| `Ctrl+D` | Dupliquer les éléments sélectionnés |
| `Ctrl+A` | Sélectionner tous les éléments |
| `Delete` / `Backspace` | Supprimer les éléments sélectionnés |
| `Escape` | Tout désélectionner |
| `Flèches` | Déplacer de 1px |
| `Shift + Flèches` | Déplacer de 10px |
| `Shift` (pendant drag/resize) | Désactiver le snap / Maintenir le ratio (resize) |
| `Alt` (pendant resize) | Resize symétrique depuis le centre |

---

## 8. Historique / Undo-Redo

- **99 entrées max** (tampon circulaire)
- L'historique stocke : éléments (deep clone), arrière-plan, paires de symétrie
- Boutons Undo/Redo dans la sidebar droite (bas)
- **Compteur** affiché : format "X/Y"
- L'historique s'adapte aux suppressions (filtre les IDs supprimés)
- L'historique se réinitialise après une sauvegarde
- Accessible via raccourcis clavier

---

## 9. Presse-papiers

- **Copier** (`Ctrl+C`) : stocke un deep clone des éléments sélectionnés
- **Coller** (`Ctrl+V`) : insère les copies avec décalage +20px, auto-sélectionne les éléments collés

---

## 10. Sidebar droite — Propriétés

### Quand rien n'est sélectionné
- Message "Sélectionnez un élément pour éditer ses propriétés"
- Boutons Undo/Redo + compteur (toujours visibles en bas)

### Propriétés d'un élément unique

#### Position & actions
- **Position** : champs X, Y (numérique, incrémentation avec flèches)
- **Centrer sur le badge** : boutons Centrer Horizontalement / Centrer Verticalement
- **Dupliquer**
- **Supprimer**
- **Symétrie** : Créer / Casser la symétrie

#### Contenu (texte & QR code)
- **Textarea** pour éditer le contenu (avec support des variables `{{var}}`)

#### Styles spécifiques au texte
- **Police** — Google Font Picker :
  - Intégration Google Fonts API (tri par popularité)
  - Polices système en fallback : Arial, Helvetica, Times New Roman, Georgia, Verdana, Courier New, Trebuchet MS, Impact, Tahoma
  - Dropdown avec recherche/filtre
  - Prévisualisation des polices dans leur propre typographie
  - Chargement auto via injection de `<link>`
  - Cache global des polices chargées
- **Taille de police** — slider pliable (8–200px) + input numérique avec ArrowUp/Down
- **Interligne** — slider pliable (0.5–3.0) + input numérique
- **Espacement des lettres** — slider pliable (-5 à 20px) + input numérique
- **Couleur** — color picker + input hex
- **Styles de texte** (barre de boutons segmentés) :
  - **Gras** (fontWeight: bold/normal)
  - **Italique** (fontStyle: italic/normal)
  - **Souligné** (textDecoration: underline/none)
  - **Barré** (textDecoration: line-through/none)
- **Transformation du texte** (barre segmentée) :
  - Normal / MAJUSCULES / minuscules / Capitalize
- **Alignement horizontal** : Gauche / Centre / Droite
- **Alignement vertical** : Haut / Centre / Bas

#### Propriétés communes à tous les types
- **Rotation** — slider pliable (-180° à 180°) + input numérique
- **Opacité** — slider pliable (0–100%) + input numérique
- **Z-Index** — input numérique

### Multi-sélection

- **Compteur** : "N éléments sélectionnés"
- **Outils d'alignement** (6 boutons avec état actif) :
  - Horizontal : Aligner Haut / Centrer Verticalement / Aligner Bas
  - Vertical : Aligner Gauche / Centrer Horizontalement / Aligner Droite
- **Styles groupés** (appliqués à tous les textes/QR codes sélectionnés) :
  - Color picker + input hex
  - Styles texte : Gras, Italique, Souligné, Barré (toggle intelligent)
  - Transformation texte
  - Alignement horizontal et vertical
  - Taille de police slider + input
- **Dupliquer** tous les sélectionnés
- **Supprimer** tous les sélectionnés (avec compteur)

---

## 11. Sidebar gauche

- **Bouton retour** (vers la liste des templates)
- **Titre** : "Éditeur de Badges"
- **Sélecteur de format** dropdown (groupé : Badges / Papier, avec option custom)
- **Affichage des dimensions** (largeur × hauteur mm)
- **Section gestion du template** :
  - Champ nom du template
  - Bouton Sauvegarder
  - Bouton Sauvegarder & Quitter
  - Bouton Supprimer (mode édition)
- **Section éléments** — boutons d'ajout :
  - Ajouter Texte
  - Ajouter QR Code
  - Ajouter/Changer l'image de fond
- **Section variables** — boutons d'insertion rapide :
  - `{{firstName}}` — Prénom
  - `{{lastName}}` — Nom
  - `{{company}}` — Entreprise
  - `{{jobTitle}}` — Poste
  - `{{email}}` — Email
  - `{{eventName}}` — Événement
  - `{{attendeeType}}` — Type de participant
- **Contrôles de zoom** (fixés en bas) : Zoom Out / pourcentage / Zoom In

---

## 12. Système de symétrie

- **Symétrie centrale** (réflexion point 180° par le centre du badge)
- **Créer la symétrie** : clone les éléments sélectionnés en miroir avec +180° de rotation
- **Casser la symétrie** : délie les éléments (les deux restent)
- **Comportement lié** : déplacer/redimensionner le parent met à jour automatiquement le clone (et inversement)
- **Retour visuel** : anneau violet sur le partenaire symétrique quand l'un est sélectionné
- **Preview fantôme** pendant le drag : affiche la position du clone en temps réel (opacité 70%)
- **Persistance** : sauvegardée dans l'historique et les données du template
- **Suppression en cascade** : supprimer un élément de la paire supprime les deux

---

## 13. Prévisualisation (BadgePreviewModal)

- Overlay modal avec prévisualisation du badge
- Remplace les placeholders `{{variable}}` par des données d'exemple
- Panel de données de prévisualisation avec toutes les valeurs de variables
- **Bouton Download PNG** ⚠️ — **TODO, non implémenté**
- **Bouton Imprimer** (`window.print()`)
- Bouton Fermer

---

## 14. Composants non branchés

| Composant | Description | État |
|-----------|-------------|------|
| `DesignerToolbox` | Outils formes : Rectangle, Cercle, Ligne | ⚠️ Non connecté à la page principale |
| `VariablesPanel` (standalone) | Panel avancé avec catégories (Attendee/Event/Organization), mode preview | ⚠️ Non connecté à la page principale |

---

## 15. Persistance des données

- Templates sauvegardés via API REST (RTK Query mutations)
- Données du template : éléments, fond (base64), format, images uploadées (Map base64), paires de symétrie
- Variables auto-extraites du contenu des éléments à la sauvegarde
- Code de génération HTML/CSS existe mais est bypassé (strings vides envoyés ; le backend génère depuis `template_data`)

---

## 16. Dark Mode

- Support complet du dark mode sur tous les panneaux et contrôles via classes Tailwind `dark:`

---

## 17. Internationalisation (i18n)

- Utilise `react-i18next` avec namespace `badges`
- ⚠️ **De nombreux labels sont encore codés en dur en français** (couverture partielle)

---

## 18. Pistes d'amélioration

### Priorité haute
- [ ] **Panel de calques** — liste des éléments avec drag-to-reorder, visibilité, verrouillage
- [ ] **Brancher les Shapes** — Rectangle, Cercle, Ligne (composant existant)
- [ ] **Export PNG/PDF fonctionnel** — bouton Download PNG actuellement TODO
- [ ] **Grille & Règles** — grille optionnelle + règles graduées en mm

### Priorité moyenne
- [ ] **Verrouillage d'éléments** — empêcher déplacement/resize accidentel
- [ ] **Groupement d'éléments** — Ctrl+G, persiste contrairement à la multi-sélection
- [ ] **Distribution égale** — espacement égal entre éléments en multi-sélection
- [ ] **Copier/Coller le style** — appliquer le style d'un texte à un autre
- [ ] **Bordures et ombres** — border + box-shadow dans les propriétés d'éléments
- [ ] **Prévisualisation avec données réelles** — sélectionner un vrai participant

### Priorité basse
- [ ] **Modal des raccourcis** — `?` ou `Ctrl+/` pour lister tous les raccourcis
- [ ] **Zoom to fit** — recentrer et zoomer pour voir le badge entier
- [ ] **Rotation libre à la souris** — handle de rotation visuel (style Canva/Figma)
- [ ] **Guides personnalisés** — guides fixes posés par l'utilisateur
- [ ] **Templates prédéfinis** — 3-4 designs de badges prêts à l'emploi
- [ ] **I18n complète** — finaliser la traduction de tous les labels
