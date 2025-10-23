import { setupWorker } from 'msw/browser'
import { publicHandlers } from './handlers/public.handlers'
import { eventsHandlers } from './handlers/events.handlers'
import { registrationsHandlers } from './handlers/registrations.handlers'
import { attendeesHandlers } from './handlers/attendees.handlers'

// Configure MSW for browser environment
// ⚠️ N'intercepte QUE les endpoints mock (events, attendees, registrations)
// Les autres API (auth, users, organizations, roles, etc.) passent au vrai backend
export const worker = setupWorker(
  ...publicHandlers,
  ...eventsHandlers,
  ...registrationsHandlers,
  ...attendeesHandlers
)
