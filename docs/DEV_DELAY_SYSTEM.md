# 🐌 Système de simulation de délai API (Dev)

Ce système permet de simuler des délais réseau pour tester les états de chargement et les skeletons.

## 🎯 Utilisation

### Via l'interface DevTools

Un panneau de contrôle apparaît en bas à droite de l'écran (uniquement en dev) :

1. **Cliquer sur l'icône ⚙️** pour ouvrir le panneau
2. **Activer/Désactiver** le délai avec le switch
3. **Ajuster le délai** avec le slider (0-5000ms)
4. **Utiliser les presets** pour des valeurs rapides :
   - **Subtil** : 500ms
   - **Normal** : 1s
   - **Long** : 2s

### Via le code

Modifier directement le fichier de configuration :

```typescript
// src/app/config/devConfig.ts

export const devConfig = {
  // Activer/désactiver le délai
  enableApiDelay: true,

  // Délai fixe en ms
  apiDelayMs: 1000,

  // Ou utiliser un délai aléatoire
  useRandomDelay: false,
  apiDelayMinMs: 800,
  apiDelayMaxMs: 1500,
}
```

## 📋 Cas d'usage

### Tester les spinners de chargement
```typescript
apiDelayMs: 1000  // 1 seconde suffit pour voir le spinner
```

### Tester les skeletons de tableaux
```typescript
apiDelayMs: 2000  // 2 secondes pour bien voir les skeletons
```

### Simuler une connexion lente
```typescript
useRandomDelay: true
apiDelayMinMs: 1000
apiDelayMaxMs: 3000
```

### Désactiver complètement
```typescript
enableApiDelay: false
```

## 🔧 Fonctionnement technique

Le middleware intercepte toutes les actions RTK Query et ajoute un délai avant leur exécution :

```typescript
// src/app/middleware/apiDelayMiddleware.ts
if (isApiAction && process.env.NODE_ENV === 'development') {
  await delay(getApiDelay())
}
```

## ⚠️ Important

- ✅ **Fonctionne uniquement en développement** (NODE_ENV === 'development')
- ✅ **Désactivé automatiquement en production**
- ✅ **N'affecte pas les vraies performances** de l'API
- ✅ **Logs dans la console** pour voir les délais appliqués

## 🎨 États de chargement disponibles

### Pour les pages
```tsx
<LoadingState message="Chargement..." />
```

### Pour les tableaux
```tsx
<TableLoadingSkeleton rows={5} columns={4} />
```

### Spinner seul
```tsx
<LoadingSpinner size="lg" />
```

### Inline (boutons, etc.)
```tsx
<InlineLoading message="Envoi..." />
```

## 💡 Conseils

- **500ms** : Bon pour tester rapidement sans ralentir le workflow
- **1000ms** : Idéal pour voir tous les états de chargement
- **2000ms+** : Parfait pour tester les skeletons et détecter les bugs de loading
- **Aléatoire** : Simule des conditions réseau réelles et variables
