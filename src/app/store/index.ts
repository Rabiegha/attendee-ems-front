import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage
import { combineReducers } from '@reduxjs/toolkit'
import { rootApi } from '@/services/rootApi'
import { sessionSlice } from '@/features/auth/model/sessionSlice'
import { eventsSlice } from '@/features/events/model/eventsSlice'
import { attendeesSlice } from '@/features/attendees/model/attendeesSlice'
import usersSlice from '@/features/users/model/usersSlice'
import { toastReducer } from '@/shared/ui/toast-slice'
import { apiDelayMiddleware } from '../middleware/apiDelayMiddleware'

// Combiner tous les reducers
const rootReducer = combineReducers({
  [rootApi.reducerPath]: rootApi.reducer,
  session: sessionSlice.reducer,
  events: eventsSlice.reducer,
  attendees: attendeesSlice.reducer,
  users: usersSlice,
  toast: toastReducer,
})

// Configuration Redux Persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['session'], // Persister UNIQUEMENT session
  blacklist: [rootApi.reducerPath, 'events', 'attendees', 'users', 'toast'], // Exclure le reste
}

// Wrap le root reducer avec persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(rootApi.middleware),
      // .concat(apiDelayMiddleware), // Désactivé - middleware de délai en dev
  devTools: import.meta.env.MODE !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

// Create persistor pour le provider
export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
