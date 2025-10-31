# ModalSteps

Composant pour animer les transitions entre différentes étapes d'un modal.

## 🎯 Fonctionnalités

- ✨ Animation de swipe fluide entre les étapes
- 📏 Transition de hauteur smooth et automatique
- 🎨 Détection automatique de la direction (avant/arrière)
- 🔄 Double rendu pour une transition sans coupure
- 📦 Réutilisable dans n'importe quel modal
- 🎭 Animation CSS performante (300ms)

## 📖 Utilisation

### Exemple basique (2 étapes)

```tsx
import { Modal, ModalSteps } from '@/shared/ui'

const MyModal = () => {
  const [selectedItem, setSelectedItem] = useState(null)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mon modal">
      <ModalSteps currentStep={selectedItem ? 1 : 0}>
        {!selectedItem ? (
          <div>
            <h3>Sélectionnez un élément</h3>
            <button onClick={() => setSelectedItem('item1')}>Item 1</button>
          </div>
        ) : (
          <div>
            <h3>Confirmation</h3>
            <p>Vous avez sélectionné : {selectedItem}</p>
            <button onClick={() => setSelectedItem(null)}>Retour</button>
          </div>
        )}
      </ModalSteps>
    </Modal>
  )
}
```

### Exemple avancé (4+ étapes)

```tsx
import { Modal, ModalSteps } from '@/shared/ui'

type Step = 'upload' | 'preview' | 'confirm' | 'success'

const ImportModal = () => {
  const [step, setStep] = useState<Step>('upload')

  // Helper pour mapper les étapes aux numéros
  const getStepNumber = (s: Step): number => {
    const map = { upload: 0, preview: 1, confirm: 2, success: 3 }
    return map[s]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import de données">
      <ModalSteps currentStep={getStepNumber(step)}>
        <div className="space-y-6">
          {step === 'upload' && (
            <div>
              <h3>Télécharger un fichier</h3>
              <button onClick={() => setStep('preview')}>Suivant</button>
            </div>
          )}

          {step === 'preview' && (
            <div>
              <h3>Aperçu des données</h3>
              <button onClick={() => setStep('upload')}>Retour</button>
              <button onClick={() => setStep('confirm')}>Confirmer</button>
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <h3>Confirmer l'import</h3>
              <button onClick={() => setStep('preview')}>Retour</button>
              <button onClick={() => setStep('success')}>Importer</button>
            </div>
          )}

          {step === 'success' && (
            <div>
              <h3>Import terminé !</h3>
              <button onClick={onClose}>Fermer</button>
            </div>
          )}
        </div>
      </ModalSteps>
    </Modal>
  )
}
```

## 🎨 Direction de l'animation

L'animation détecte automatiquement la direction :

- **Forward** (0 → 1) : L'ancien contenu glisse vers la gauche, le nouveau entre par la droite
- **Backward** (1 → 0) : L'ancien contenu glisse vers la droite, le nouveau entre par la gauche

## ⚙️ Props

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| `currentStep` | `number` | ✅ | Numéro de l'étape actuelle (commence à 0) |
| `children` | `ReactNode` | ✅ | Contenu de l'étape à afficher |
| `className` | `string` | ❌ | Classes CSS additionnelles |

## 💡 Bonnes pratiques

1. **Toujours mapper les étapes nommées à des numéros** :
   ```tsx
   // ❌ Éviter
   <ModalSteps currentStep={step}>
   
   // ✅ Recommandé
   <ModalSteps currentStep={getStepNumber(step)}>
   ```

2. **Utiliser des nombres consécutifs** (0, 1, 2, 3...) pour des animations fluides

3. **Garder le contenu dans un wrapper** pour éviter les problèmes de layout :
   ```tsx
   <ModalSteps currentStep={step}>
     <div className="space-y-6">
       {/* Votre contenu ici */}
     </div>
   </ModalSteps>
   ```

## 🎬 Animation technique

- **Durée** : 300ms
- **Timing** : `cubic-bezier(0.4, 0, 0.2, 1)`
- **Méthode** : Double rendu avec `position: absolute` pour superposer l'ancien et le nouveau contenu
- **Hauteur** : Mesurée dynamiquement et animée avec une transition CSS fluide
- **Classes CSS** : Définies dans `src/styles/tailwind.css`

## ✨ Caractéristiques avancées

### Transition de hauteur automatique

Le composant mesure automatiquement la hauteur de chaque étape et applique une transition fluide lors du changement. Cela évite les sauts brutaux quand les étapes ont des tailles différentes.

```tsx
// Pas besoin de gérer manuellement la hauteur !
<ModalSteps currentStep={step}>
  {step === 0 && <div style={{ height: '200px' }}>Petite étape</div>}
  {step === 1 && <div style={{ height: '600px' }}>Grande étape</div>}
</ModalSteps>
// ✨ La transition de 200px à 600px sera fluide automatiquement
```

## 📝 Exemples dans le projet

- `EventActionsModal.tsx` - Modal avec 2 étapes (sélection → confirmation)
- `ImportExcelModal.tsx` - Modal avec 4 étapes (upload → preview → conflicts → success)
