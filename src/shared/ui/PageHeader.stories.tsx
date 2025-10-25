import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from './PageHeader'
import { Button } from './Button'
import { Calendar, Users, Plus, Settings } from 'lucide-react'

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Titre principal de la page',
    },
    description: {
      control: 'text',
      description: 'Description sous le titre',
    },
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

// Story de base
export const Default: Story = {
  args: {
    title: 'Gestion des événements',
  },
}

// Avec description
export const WithDescription: Story = {
  args: {
    title: 'Gestion des événements',
    description: 'Créez et gérez vos événements professionnels',
  },
}

// Avec icône
export const WithIcon: Story = {
  args: {
    title: 'Dashboard',
    description: 'Vue d\'ensemble de votre organisation',
    icon: Calendar,
  },
}

// Avec action simple
export const WithSingleAction: Story = {
  args: {
    title: 'Événements',
    description: 'Liste de tous vos événements',
    icon: Calendar,
    actions: <Button leftIcon={<Plus className="h-4 w-4" />}>Créer un événement</Button>,
  },
}

// Avec plusieurs actions
export const WithMultipleActions: Story = {
  args: {
    title: 'Utilisateurs',
    description: 'Gérez les utilisateurs de votre organisation',
    icon: Users,
    actions: (
      <div className="flex items-center gap-3">
        <Button variant="outline" leftIcon={<Settings className="h-4 w-4" />}>
          Paramètres
        </Button>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Inviter
        </Button>
      </div>
    ),
  },
}

// Sans description
export const TitleOnly: Story = {
  args: {
    title: 'Page simple',
  },
}

// Titre long
export const LongTitle: Story = {
  args: {
    title: 'Gestion des événements et des participants pour votre organisation',
    description: 'Une description qui explique en détail les fonctionnalités disponibles sur cette page',
    icon: Calendar,
    actions: <Button>Action</Button>,
  },
}
