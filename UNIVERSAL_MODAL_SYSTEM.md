# 🎯 Système de Modal Universel

## ✅ **Problématique résolue**

**Avant** : Prolifération de modals spécifiques
- `OrganizationCreatedModal`
- `CreateOrganizationModal` 
- `CreateUserEnhancedModal`
- `UserCredentialsModal`
- `TestAccountsModal`
- `SuccessModal`, `ErrorModal`, `UserExistsModal`...

**Maintenant** : **UN SEUL** système centralisé
- `UniversalModal` + `useUniversalModal`

## 🚀 **Utilisation simple**

### Import
```tsx
import { UniversalModal, useUniversalModal } from '@/shared/ui';
```

### Hook dans votre composant
```tsx
const {
  modalState,
  hideModal,
  showSuccess,
  showError,
  showWarning,
  showConfirmation,
  showOrganizationCreated,
  showInvitationSent,
} = useUniversalModal();
```

### Affichage du modal
```tsx
// À la fin de votre JSX
{modalState.config && (
  <UniversalModal
    isOpen={modalState.isOpen}
    onClose={hideModal}
    config={modalState.config}
  />
)}
```

## 📋 **Types de modals disponibles**

### 1. **Modals basiques**
```tsx
// Succès
showSuccess('Succès !', 'Opération réussie.');

// Erreur
showError('Erreur', 'Quelque chose s\'est mal passé.');

// Avertissement
showWarning('Attention', 'Veuillez vérifier vos données.');

// Information
showInfo('Information', 'Voici une information importante.');
```

### 2. **Modal de confirmation**
```tsx
showConfirmation(
  'Supprimer l\'élément ?',
  'Cette action est irréversible.',
  () => {
    // Action de confirmation
    deleteItem();
  },
  () => {
    // Action d'annulation (optionnel)
    console.log('Annulé');
  }
);
```

### 3. **Modals spécialisés**
```tsx
// Organisation créée
showOrganizationCreated(
  'ACME Corp',
  'acme-corp',
  () => navigate('/organizations') // Optionnel
);

// Invitation envoyée
showInvitationSent(
  'user@example.com',
  'ACME Corp', // Optionnel
  () => resetForm() // Optionnel
);
```

## 🎨 **Design cohérent automatique**

- ✅ **Icônes** : Automatiques selon le type
- ✅ **Couleurs** : Thème cohérent (success=vert, error=rouge, etc.)
- ✅ **Layout** : Centré, responsive, backdrop
- ✅ **Animations** : Smooth open/close
- ✅ **Accessibilité** : Support clavier, focus management

## 🔄 **Migration des anciens modals**

### Avant
```tsx
const [errorModal, setErrorModal] = useState({
  isOpen: false,
  title: '',
  message: ''
});

// Plus tard...
setErrorModal({
  isOpen: true,
  title: 'Erreur',
  message: 'Problème survenu'
});

// JSX
<ErrorModal
  isOpen={errorModal.isOpen}
  onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
  title={errorModal.title}
  message={errorModal.message}
/>
```

### Maintenant
```tsx
const { modalState, hideModal, showError } = useUniversalModal();

// Plus tard...
showError('Erreur', 'Problème survenu');

// JSX
{modalState.config && (
  <UniversalModal
    isOpen={modalState.isOpen}
    onClose={hideModal}
    config={modalState.config}
  />
)}
```

## 📈 **Avantages**

1. **DRY** : Plus de duplication de code
2. **Cohérence** : Design uniforme partout
3. **Maintenabilité** : Un seul endroit à modifier
4. **Performance** : Moins de composants React
5. **Productivité** : API simple, rapide à utiliser

## 🎯 **Prochaines étapes**

1. **Migrer progressivement** les anciens modals
2. **Ajouter de nouveaux types** au besoin
3. **Étendre les actions** (tertiary button, etc.)
4. **Animations avancées** si nécessaire

---

**Objectif atteint** : Plus jamais 150 popups différentes ! 🎉