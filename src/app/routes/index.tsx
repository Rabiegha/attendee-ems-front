import { createBrowserRouter, Navigate, useParams } from 'react-router-dom'
import { GuardedRoute } from '@/shared/acl/guards/GuardedRoute'
import { EventGuard } from '@/shared/acl/guards/EventGuard'
import { SmartRedirect } from '@/shared/ui/SmartRedirect'

// Layouts
import { RootLayout } from '@/widgets/layouts/RootLayout'
import { AuthLayout } from '@/widgets/layouts/AuthLayout'

// Pages
import { Dashboard } from '@/pages/Dashboard'
import { EventsPage } from '@/pages/Events'
import { EventDetails } from '@/pages/EventDetails'
import { Attendees } from '@/pages/Attendees'
import { LoginPage } from '@/pages/Login'
import { ForbiddenPage } from '@/pages/Forbidden'
import { NotFoundPage } from '@/pages/NotFound'

// Component wrapper pour EventDetails avec guard spécialisé
const EventDetailsWithGuard: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  
  if (!id) {
    return <Navigate to="/events" replace />
  }
  
  return (
    <EventGuard eventId={id} action="read">
      <EventDetails />
    </EventGuard>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <SmartRedirect />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'events',
        children: [
          {
            index: true,
            element: (
              <GuardedRoute action="read" subject="Event">
                <EventsPage />
              </GuardedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <EventDetailsWithGuard />
            ),
          },
        ],
      },
      {
        path: 'attendees',
        element: (
          <GuardedRoute action="read" subject="Attendee">
            <Attendees />
          </GuardedRoute>
        ),
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
