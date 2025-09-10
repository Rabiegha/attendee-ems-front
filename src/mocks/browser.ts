import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Configure MSW for browser environment
export const worker = setupWorker(...handlers)
