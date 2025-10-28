import type { Meta, StoryObj } from '@storybook/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Button } from './Button'
import { ToastContainer, type Toast } from './Toast'
import { toastReducer } from './toast-slice'
import { useState } from 'react'

// Mock store pour Storybook
const mockStore = configureStore({
  reducer: {
    toast: toastReducer,
  },
})

const meta: Meta<typeof ToastContainer> = {
  title: 'UI/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <div style={{ padding: '20px' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ToastContainer>

// Composant de démonstration
const ToastDemo = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addMockToast = (
    type: Toast['type'],
    title: string,
    message?: string
  ) => {
    const newToast: Toast = {
      id: `toast-${Date.now()}`,
      type,
      title,
      duration: 5000,
    }
    if (message) {
      newToast.message = message
    }
    setToasts((prev) => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Test des Toasts</h3>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() =>
            addMockToast(
              'success',
              'Succès !',
              'Opération réalisée avec succès.'
            )
          }
        >
          Toast Succès
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addMockToast('error', 'Erreur !', 'Une erreur est survenue.')
          }
        >
          Toast Erreur
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addMockToast(
              'warning',
              'Attention !',
              'Veuillez vérifier vos données.'
            )
          }
        >
          Toast Warning
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addMockToast(
              'info',
              'Information',
              'Nouvelle fonctionnalité disponible !'
            )
          }
        >
          Toast Info
        </Button>

        <Button
          variant="outline"
          onClick={() => addMockToast('success', 'Toast sans message')}
        >
          Sans Message
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            addMockToast(
              'info',
              'Toast avec action',
              "Cliquez sur l'action pour plus d'infos."
            )
          }
        >
          Avec Action
        </Button>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export const Interactive: Story = {
  render: () => <ToastDemo />,
}

export const SuccessToast: Story = {
  args: {
    toasts: [
      {
        id: 'success-1',
        type: 'success',
        title: 'Événement créé !',
        message: 'L\'événement "Conférence Tech 2024" a été créé avec succès.',
        duration: 5000,
      },
    ],
    onRemove: () => {},
  },
}

export const ErrorToast: Story = {
  args: {
    toasts: [
      {
        id: 'error-1',
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Impossible de se connecter au serveur. Veuillez réessayer.',
        duration: 5000,
      },
    ],
    onRemove: () => {},
  },
}

export const MultipleToasts: Story = {
  args: {
    toasts: [
      {
        id: 'toast-1',
        type: 'success',
        title: 'Opération réussie',
        message: 'Les données ont été sauvegardées.',
        duration: 5000,
      },
      {
        id: 'toast-2',
        type: 'warning',
        title: 'Attention',
        message: 'Certains champs sont manquants.',
        duration: 5000,
      },
      {
        id: 'toast-3',
        type: 'info',
        title: 'Nouvelle fonctionnalité',
        message: 'Découvrez les nouvelles options disponibles !',
        duration: 5000,
      },
    ],
    onRemove: () => {},
  },
}
