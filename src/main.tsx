import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './styles/tailwind.css'

// MSW enabled for mock API testing (only specific endpoints)
async function enableMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass', // ⚠️ IMPORTANT : Laisse passer les vraies API
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    })
  }
  return Promise.resolve()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
