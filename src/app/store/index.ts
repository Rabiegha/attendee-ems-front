import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { rootApi } from '@/services/rootApi'
import { sessionSlice } from '@/features/auth/model/sessionSlice'
import { eventsSlice } from '@/features/events/model/eventsSlice'
import { attendeesSlice } from '@/features/attendees/model/attendeesSlice'
import { toastReducer } from '@/shared/ui/toast-slice'

export const store = configureStore({
  reducer: {
    // RTK Query API unique
    [rootApi.reducerPath]: rootApi.reducer,
    
    // UI state slices
    session: sessionSlice.reducer,
    events: eventsSlice.reducer,
    attendees: attendeesSlice.reducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          // Ignore RTK Query actions with dates
          'rootApi/executeQuery/fulfilled',
          'rootApi/executeMutation/fulfilled',
        ],
        ignoredActionsPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.baseQueryMeta',
          'payload.fulfilledTimeStamp',
        ],
        ignoredPaths: [
          // Ignore RTK Query state paths with dates
          'rootApi',
        ],
      },
    })
      .concat(rootApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
