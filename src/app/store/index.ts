import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from '@/features/auth/api/authApi'
import { signupApi } from '@/features/auth/api/signupApi'
import { eventsApi } from '@/features/events/api/eventsApi'
import { attendeesApi } from '@/features/attendees/api/attendeesApi'
import { invitationsApi } from '@/features/invitations/api/invitationsApi'
import { usersApi } from '@/features/users/api/usersApi'
import { sessionSlice } from '@/features/auth/model/sessionSlice'
import { eventsSlice } from '@/features/events/model/eventsSlice'
import { attendeesSlice } from '@/features/attendees/model/attendeesSlice'
import { toastReducer } from '@/shared/ui/toast-slice'

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [signupApi.reducerPath]: signupApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [attendeesApi.reducerPath]: attendeesApi.reducer,
    [invitationsApi.reducerPath]: invitationsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    
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
          'usersApi/executeQuery/fulfilled',
          'usersApi/executeMutation/fulfilled',
          'signupApi/executeQuery/fulfilled',
          'signupApi/executeMutation/fulfilled',
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
          'usersApi',
          'authApi',
          'signupApi',
        ],
      },
    })
      .concat(authApi.middleware)
      .concat(signupApi.middleware)
      .concat(eventsApi.middleware)
      .concat(attendeesApi.middleware)
      .concat(invitationsApi.middleware)
      .concat(usersApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
