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
import { CreateEventPage } from '@/pages/CreateEvent'
import { Attendees } from '@/pages/Attendees'
import { AttendeeDetail } from '@/pages/AttendeeDetail'
import { UsersPage } from '@/pages/Users'
import { AttendeeTypesPage } from '@/pages/AttendeeTypes'
import { RolePermissionsAdmin } from '@/pages/RolePermissionsAdmin'
import { ChangePasswordPage } from '@/pages/ChangePassword'
import { LoginPage } from '@/pages/Login'
import { SignupPage } from '@/pages/Signup'
import { RequestPasswordResetPage } from '@/pages/RequestPasswordReset'
import { ResetPasswordPage } from '@/pages/ResetPassword'
import { InvitationsPage } from '@/pages/Invitations'
import { CompleteInvitationPage } from '@/pages/CompleteInvitation'
import { OrganizationsPage } from '@/features/organizations/pages'
import { ForbiddenPage } from '@/pages/Forbidden'
import { NotFoundPage } from '@/pages/NotFound'
import PublicRegistration from '@/pages/PublicRegistration'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicy'
import { BadgeDesigner } from '@/pages/BadgeDesigner'
import { BadgeDesignerPage } from '@/pages/BadgeDesigner/BadgeDesignerPage'
import { ApplicationDownloadPage } from '@/pages/ApplicationDownload'
import { PrintClientDownloadPage } from '@/pages/PrintClientDownload'
import { ReportsPage } from '@/pages/Reports'
import { EmailManagementPage } from '@/pages/EmailManagement'

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
            path: 'create',
            element: (
              <GuardedRoute action="create" subject="Event">
                <CreateEventPage />
              </GuardedRoute>
            ),
          },
          {
            path: ':id',
            element: <EventDetailsWithGuard />,
          },
        ],
      },
      {
        path: 'attendees',
        children: [
          {
            index: true,
            element: (
              <GuardedRoute action="read" subject="Attendee">
                <Attendees />
              </GuardedRoute>
            ),
          },
          {
            path: ':id',
            element: (
              <GuardedRoute action="read" subject="Attendee">
                <AttendeeDetail />
              </GuardedRoute>
            ),
          },
        ],
      },
      {
        path: 'users',
        element: (
          <GuardedRoute action="read" subject="User">
            <UsersPage />
          </GuardedRoute>
        ),
      },
      {
        path: 'attendee-types',
        element: (
          <GuardedRoute action="read" subject="Organization">
            <AttendeeTypesPage />
          </GuardedRoute>
        ),
      },
      {
        path: 'roles-permissions',
        element: (
          <GuardedRoute action="manage" subject="Role">
            <RolePermissionsAdmin />
          </GuardedRoute>
        ),
      },
      {
        path: 'invitations',
        element: (
          <GuardedRoute action="create" subject="Invitation">
            <InvitationsPage />
          </GuardedRoute>
        ),
      },
      {
        path: 'organizations',
        element: (
          <GuardedRoute action="read" subject="Organization">
            <OrganizationsPage />
          </GuardedRoute>
        ),
      },
      {
        path: 'badges',
        children: [
          {
            index: true,
            element: (
              <GuardedRoute action="manage" subject="Badge">
                <BadgeDesigner />
              </GuardedRoute>
            ),
          },
          {
            path: 'designer/:templateId',
            element: (
              <GuardedRoute action="manage" subject="Badge">
                <BadgeDesignerPage />
              </GuardedRoute>
            ),
          },
        ],
      },
      {
        path: 'application',
        element: <ApplicationDownloadPage />,
      },
      {
        path: 'print-client',
        element: <PrintClientDownloadPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'email',
        element: (
          <GuardedRoute action="read" subject="Email">
            <EmailManagementPage />
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
      {
        path: 'request-password-reset',
        element: <RequestPasswordResetPage />,
      },
      {
        path: 'reset-password/:token',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '/signup/:token',
    element: <SignupPage />,
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
  },
  {
    path: '/complete-invitation/:token',
    element: <CompleteInvitationPage />,
  },
  {
    path: '/register/:token',
    element: <PublicRegistration />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicyPage />,
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
