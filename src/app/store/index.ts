import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from '@/features/auth/api/authApi'
import { eventsApi } from '@/features/events/api/eventsApi'
import { attendeesApi } from '@/features/attendees/api/attendeesApi'
import { invitationsApi } from '@/features/invitations/api/invitationsApi'
import { sessionSlice } from '@/features/auth/model/sessionSlice'
import { eventsSlice } from '@/features/events/model/eventsSlice'
import { attendeesSlice } from '@/features/attendees/model/attendeesSlice'
import { toastReducer } from '@/shared/ui/toast-slice'

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [attendeesApi.reducerPath]: attendeesApi.reducer,
    [invitationsApi.reducerPath]: invitationsApi.reducer,
    
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
          'eventsApi/executeQuery/fulfilled',
          'eventsApi/executeMutation/fulfilled',
          'attendeesApi/executeQuery/fulfilled',
          'attendeesApi/executeMutation/fulfilled',
        ],
        ignoredActionsPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.baseQueryMeta',
          'payload.fulfilledTimeStamp',
        ],
        ignoredPaths: [
          // Ignore RTK Query state paths with dates
          'eventsApi',
          'attendeesApi',
          'authApi',
        ],
      },
    })
      .concat(authApi.middleware)
      .concat(eventsApi.middleware)
      .concat(attendeesApi.middleware)
      .concat(invitationsApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
