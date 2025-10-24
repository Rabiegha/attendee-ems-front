import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app'
import './styles/tailwind.css'

// ❌ MSW DISABLED - Using real backend API
// ⚠️ Selon les instructions : "supprimer tous les mock et utiliser la vrai api avec la vrai db"
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
    </React.StrictMode>,
  )
// })
