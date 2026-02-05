# Section 5 - Application Mobile

[◀ Retour au sommaire](../../CAHIER_DES_CHARGES.md) | [◀ Section 4](./04-FRONTEND-WEB.md) | [▶ Section 6](./06-SECURITE.md)

---

## 5.1 Vue d'Ensemble

**Framework** : React Native + Expo SDK 52  
**Plateformes** : iOS 13+ | Android 8+  
**Utilisateurs cibles** : Hôtesses, Personnel terrain, Managers mobiles

### Cas d'Usage Principaux

1. **Check-in rapide** des participants sur site
2. **Scan de QR codes** pour validation
3. **Impression de badges** de secours
4. **Consultation des listes** de participants
5. **Gestion des sessions** (entrée/sortie)
6. **Mode offline** avec synchronisation

---

## 5.2 Écrans Principaux

### 5.2.1 Authentification

#### LoginScreen
- Formulaire email/password
- Remember me
- Gestion erreurs connexion
- Auto-login si credentials sauvegardés

#### OnboardingScreen
- Présentation app (première utilisation)
- Permissions requises (caméra, stockage)

### 5.2.2 Liste des Événements

#### EventsListScreen
- **Événements à venir**
  - Liste cards avec image, nom, dates
  - Badge nombre de participants
  - Statut de l'événement
  - Pull-to-refresh

- **Événements passés** (onglet séparé)
  - Historique
  - Accès lecture seule

- **Filtrage**
  - Par statut
  - Par date
  - Recherche par nom

### 5.2.3 Détails d'un Événement (Bottom Tab Navigation)

**Navigation flottante avec 5 onglets :**

#### 1. Participants Tab (Dashboard)
- **Vue d'ensemble**
  - Statistiques (total, présents, absents)
  - Graphiques de check-in
  - Liste des derniers check-in
  
- **Liste des participants**
  - Recherche rapide
  - Filtres (statut, type, présence)
  - Pull-to-refresh
  - Swipeable rows avec actions :
    - Swipe gauche : Check-in
    - Swipe droite : Imprimer badge

- **Détails participant** (modal)
  - Infos complètes
  - Badge preview
  - Historique de présence
  - Actions (check-in, check-out, badge)

#### 2. Ajouts Tab
- **Ajouter un participant**
  - Formulaire rapide
  - Champs essentiels
  - Type de participant
  - Inscription instantanée

- **Import rapide**
  - Scan carte de visite (OCR)
  - Import depuis contacts

#### 3. Scan Tab (Central, proéminent)
- **Caméra QR Code**
  - Scan en temps réel
  - Feedback visuel et sonore
  - Vibration au succès
  - Affichage infos participant post-scan
  - Actions rapides (check-in/out, badge)

- **Historique des scans**
  - Liste des derniers scans
  - Statuts

#### 4. Imprimer Tab
- **Configuration impression**
  - Sélection imprimante Bluetooth
  - Paramètres d'impression
  - Queue d'impression

- **Impression en masse**
  - Sélection multiple
  - Preview avant impression
  - Suivi de la progression

#### 5. Menu Tab
- **Paramètres**
  - Profil utilisateur
  - Mode sombre/clair
  - Langue
  - Notifications
  
- **À propos**
  - Version de l'app
  - Licences
  - Support

- **Déconnexion**

### 5.2.4 Sessions (Top Tabs dans événement)

#### SessionsListScreen
- Liste des sessions de l'événement
- Statut (à venir, en cours, terminée)
- Capacité et participants

#### SessionDetailScreen
- Détails de la session
- Scan entrée/sortie
- Liste des présents
- Statistiques temps réel

---

## 5.3 Navigation

### Structure

```
AppNavigator (Root)
├── AuthNavigator (Not authenticated)
│   └── LoginScreen
│
└── MainNavigator (Authenticated)
    ├── EventsListScreen (Stack)
    │
    └── EventInnerNavigator (Selected event)
        └── Bottom Tab Navigator (Floating)
            ├── ParticipantsTab
            ├── AjoutsTab
            ├── ScanTab (Central)
            ├── ImprimerTab
            └── MenuTab
```

### Bottom Tab Flottante

**Design** :
- Fond noir/gris foncé semi-transparent
- Coins arrondis
- Ombre portée
- Bouton central Scan agrandi et vert
- Icônes colorées

```tsx
<Tab.Navigator
  screenOptions={{
    tabBarStyle: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      borderRadius: 20,
      backgroundColor: '#1a1a1a',
      borderTopWidth: 0,
      elevation: 5
    }
  }}
>
  <Tab.Screen name="Participants" />
  <Tab.Screen name="Ajouts" />
  <Tab.Screen
    name="Scan"
    options={{
      tabBarIcon: ({ focused }) => (
        <ScanIconLarge focused={focused} />
      ),
      tabBarButton: (props) => (
        <CentralTabButton {...props} />
      )
    }}
  />
  <Tab.Screen name="Imprimer" />
  <Tab.Screen name="Menu" />
</Tab.Navigator>
```

---

## 5.4 Fonctionnalités Spécifiques Mobile

### 5.4.1 Scan QR Code

**Implémentation** : expo-camera + expo-barcode-scanner

```typescript
import { Camera, BarCodeScanner } from 'expo-camera'

function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')
    })()
  }, [])

  const handleBarCodeScanned = ({ type, data }) => {
    // data contient l'ID de registration
    fetchRegistrationAndCheckIn(data)
  }

  return (
    <BarCodeScanner
      onBarCodeScanned={handleBarCodeScanned}
      style={StyleSheet.absoluteFillObject}
    />
  )
}
```

**Flow** :
1. Ouverture caméra
2. Détection QR code automatique
3. Extraction de l'ID registration
4. Requête API pour récupérer détails
5. Affichage modal avec infos participant
6. Actions disponibles (check-in, check-out, badge)
7. Feedback visuel + vibration

### 5.4.2 Swipeable Rows

**Implémentation** : react-native-gesture-handler

```tsx
import { Swipeable } from 'react-native-gesture-handler'

function ParticipantRow({ participant }) {
  const renderLeftActions = () => (
    <CheckInButton onPress={() => checkIn(participant.id)} />
  )

  const renderRightActions = () => (
    <PrintBadgeButton onPress={() => printBadge(participant.id)} />
  )

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <ParticipantCard participant={participant} />
    </Swipeable>
  )
}
```

### 5.4.3 Mode Offline

**Stratégie** :
- **Redux Persist** : Sauvegarde state Redux dans AsyncStorage
- **Queue de requêtes** : Stockage des actions offline
- **Synchronisation automatique** au retour online

```typescript
// Détection connectivité
import NetInfo from '@react-native-community/netinfo'

const unsubscribe = NetInfo.addEventListener(state => {
  if (state.isConnected) {
    syncOfflineQueue()
  }
})

// Queue d'actions offline
const offlineQueue = []

async function checkInOffline(registrationId) {
  offlineQueue.push({
    type: 'CHECK_IN',
    registrationId,
    timestamp: Date.now()
  })
  await AsyncStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
}

async function syncOfflineQueue() {
  const queue = JSON.parse(await AsyncStorage.getItem('offlineQueue'))
  
  for (const action of queue) {
    try {
      await executeAction(action)
    } catch (error) {
      console.error('Sync failed:', action, error)
    }
  }
  
  await AsyncStorage.removeItem('offlineQueue')
}
```

### 5.4.4 Impression Bluetooth

**Implémentation** : expo-print + react-native-bluetooth-escpos-printer

```typescript
import * as Print from 'expo-print'
import { BluetoothManager } from 'react-native-bluetooth-escpos-printer'

async function printBadge(registrationId) {
  // Récupérer badge PDF URL
  const badge = await fetchBadge(registrationId)
  
  // Chercher imprimantes Bluetooth
  const printers = await BluetoothManager.list()
  
  // Connecter à l'imprimante
  await BluetoothManager.connect(printers[0].address)
  
  // Imprimer
  await Print.printAsync({
    uri: badge.pdfUrl,
    printerUrl: printers[0].address
  })
}
```

---

## 5.5 Gestion de l'État (Redux Toolkit)

### Slices Principaux

#### authSlice
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

// Actions
login(credentials)
logout()
refreshToken()
```

#### eventsSlice
```typescript
interface EventsState {
  events: Event[]
  selectedEvent: Event | null
  loading: boolean
}

// Actions (Thunks)
fetchEvents()
selectEvent(eventId)
```

#### participantsSlice
```typescript
interface ParticipantsState {
  participants: Registration[]
  filters: ParticipantFilters
  stats: EventStats
}

// Actions
fetchParticipants(eventId)
checkInParticipant(id)
checkOutParticipant(id)
```

### Configuration Redux Persist

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import { persistStore, persistReducer } from 'redux-persist'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'events'] // Slices à persister
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
```

---

## 5.6 Styling (NativeWind)

### Configuration TailwindCSS pour RN

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './App.tsx',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#16a34a',
          secondary: '#6b7280'
        }
      }
    }
  },
  plugins: []
}
```

### Utilisation

```tsx
import { View, Text } from 'react-native'

function EventCard({ event }) {
  return (
    <View className="bg-white rounded-lg p-4 shadow-md">
      <Text className="text-lg font-bold text-gray-900">
        {event.name}
      </Text>
      <Text className="text-sm text-gray-500">
        {formatDate(event.startAt)}
      </Text>
    </View>
  )
}
```

### Système de Thème

```typescript
// theme/tokens.ts
export const tokens = {
  colors: {
    brand: {
      green: '#16a34a',
      darkGreen: '#15803d'
    },
    neutral: {
      50: '#f9fafb',
      900: '#111827'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16
  }
}

// ThemeProvider
import { ThemeProvider } from './ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  )
}
```

---

## 5.7 API Client (Axios)

### Configuration avec Intercepteurs

```typescript
// api/axiosClient.ts
import axios from 'axios'
import { store } from '../store'
import { refreshToken, logout } from '../store/auth.slice'

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'mobile'
  }
})

// Intercepteur de requête (ajout token)
axiosClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse (gestion 401)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await store.dispatch(refreshToken())
        return axiosClient(originalRequest)
      } catch (refreshError) {
        store.dispatch(logout())
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
```

### Services API

```typescript
// api/events.service.ts
import axiosClient from './axiosClient'

export const eventsService = {
  getEvents: () => axiosClient.get('/events'),
  
  getEventById: (id: string) => 
    axiosClient.get(`/events/${id}`),
  
  getEventStats: (eventId: string) =>
    axiosClient.get(`/events/${eventId}/stats`)
}

// api/registrations.service.ts
export const registrationsService = {
  getRegistrations: (eventId: string, filters: any) =>
    axiosClient.get(`/registrations/events/${eventId}/registrations`, {
      params: filters
    }),
  
  checkIn: (registrationId: string, location?: Location) =>
    axiosClient.post(`/registrations/${registrationId}/checkin`, {
      location
    }),
  
  generateBadge: (registrationId: string) =>
    axiosClient.post(`/registrations/${registrationId}/generate-badge`)
}
```

---

## 5.8 Permissions Natives

### Gestion des Permissions

```typescript
import * as Camera from 'expo-camera'
import * as Location from 'expo-location'

async function requestPermissions() {
  // Caméra (pour scan QR)
  const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync()
  
  // Localisation (pour check-in avec géolocalisation)
  const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
  
  return {
    camera: cameraStatus === 'granted',
    location: locationStatus === 'granted'
  }
}

// Utilisation
useEffect(() => {
  (async () => {
    const permissions = await requestPermissions()
    if (!permissions.camera) {
      Alert.alert(
        'Permission requise',
        'L\'accès à la caméra est nécessaire pour scanner les QR codes.'
      )
    }
  })()
}, [])
```

---

## 5.9 Optimisations Mobile

### 5.9.1 Performance

```tsx
// Listes virtualisées
import { FlatList } from 'react-native'

<FlatList
  data={participants}
  renderItem={({ item }) => <ParticipantRow participant={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

### 5.9.2 Images Optimisées

```tsx
import { Image } from 'expo-image'

<Image
  source={{ uri: event.imageUrl }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### 5.9.3 Animations

```tsx
import Animated, {
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated'

function AnimatedCard() {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed ? 0.95 : 1) }]
  }))

  return (
    <Animated.View style={animatedStyle}>
      <Card />
    </Animated.View>
  )
}
```

---

[▶ Section 6 : Sécurité et Authentification](./06-SECURITE.md)
