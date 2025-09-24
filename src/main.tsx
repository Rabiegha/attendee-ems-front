import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './styles/tailwind.css'

// MSW disabled - using real API backend
// async function enableMocking() {
//   if (process.env.NODE_ENV === 'development') {
//     const { worker } = await import('./mocks/browser')
//     return worker.start({
//       onUnhandledRequest: 'warn',
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
    </React.StrictMode>,
  )
// })
