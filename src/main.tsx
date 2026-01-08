import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { App } from './app'
import './styles/tailwind.css'

// Initialize Sentry (only if DSN is configured)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD, // Only in production
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.consoleLoggingIntegration({
        levels: ['log', 'info', 'warn', 'error'],
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions for performance
    tracePropagationTargets: ['localhost', /^https:\/\/api\.attendee\.fr/],
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of normal sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Enable Logs
    enableLogs: true,
    
    // Filter out non-critical errors
    beforeSend(event, hint) {
      // Don't send network timeouts in development
      if (event.exception?.values?.[0]?.value?.includes('Network Error')) {
        return null
      }
      return event
    },
  })
  console.log('✅ Sentry initialized for', import.meta.env.MODE)
} else {
  console.log('ℹ️ Sentry disabled (no DSN configured)')
}

// ❌ MSW DISABLED - Using real backend API
// Selon les instructions : "supprimer tous les mock et utiliser la vrai api avec la vrai db"
// async function enableMocking() {
//   if (process.env.NODE_ENV === 'development') {
//     const { worker } = await import('./mocks/browser')
//     return worker.start({
//       onUnhandledRequest: 'bypass',
//       serviceWorker: {
//         url: '/mockServiceWorker.js'
//       }
//     })
//   }
//   return Promise.resolve()
// }

// enableMocking().then(() => {
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
// })
