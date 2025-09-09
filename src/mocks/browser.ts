import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Configure MSW for browser environment
export const worker = setupWorker(...handlers)

// Start MSW in development
if (import.meta.env.MODE === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })
}
