import type { Meta, StoryObj } from '@storybook/react'
import { ActionGroup } from './ActionGroup'
import { Button } from './Button'
import { Save, X, Trash, Edit } from 'lucide-react'

const meta = {
  title: 'Layout/ActionGroup',
  component: ActionGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionGroup>

export default meta
type Story = StoryObj<typeof meta>

// Alignement à droite (défaut)
export const AlignRight: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="outline">Annuler</Button>
        <Button>Enregistrer</Button>
      </>
    ),
  },
}

// Alignement à gauche
export const AlignLeft: Story = {
  args: {
    align: 'left',
    children: (
      <>
        <Button variant="destructive">Supprimer</Button>
        <Button variant="outline">Modifier</Button>
      </>
    ),
  },
}

// Centré
export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: (
      <>
        <Button variant="outline">Précédent</Button>
        <Button>Suivant</Button>
      </>
    ),
  },
}

// Espacé (between)
export const AlignBetween: Story = {
  args: {
    align: 'between',
    children: (
      <>
        <Button variant="destructive" leftIcon={<Trash className="h-4 w-4" />}>
          Supprimer
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline">Annuler</Button>
          <Button leftIcon={<Save className="h-4 w-4" />}>Enregistrer</Button>
        </div>
      </>
    ),
  },
}

// Avec séparateur (divider)
export const WithDivider: Story = {
  args: {
    align: 'right',
    divider: true,
    children: (
      <>
        <Button variant="outline" leftIcon={<X className="h-4 w-4" />}>
          Annuler
        </Button>
        <Button leftIcon={<Save className="h-4 w-4" />}>
          Enregistrer
        </Button>
      </>
    ),
  },
}

// Espacement small
export const SmallSpacing: Story = {
  args: {
    spacing: 'sm',
    children: (
      <>
        <Button size="sm" variant="outline">Annuler</Button>
        <Button size="sm">OK</Button>
      </>
    ),
  },
}

// Espacement large
export const LargeSpacing: Story = {
  args: {
    spacing: 'lg',
    children: (
      <>
        <Button variant="outline">Annuler</Button>
        <Button>Confirmer</Button>
      </>
    ),
  },
}

// Vertical
export const Vertical: Story = {
  args: {
    vertical: true,
    children: (
      <>
        <Button className="w-full">Action principale</Button>
        <Button variant="outline" className="w-full">Action secondaire</Button>
        <Button variant="ghost" className="w-full">Annuler</Button>
      </>
    ),
  },
}

// Plusieurs boutons
export const MultipleActions: Story = {
  args: {
    align: 'right',
    children: (
      <>
        <Button variant="destructive" leftIcon={<Trash className="h-4 w-4" />}>
          Supprimer
        </Button>
        <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
          Modifier
        </Button>
        <Button variant="outline">Annuler</Button>
        <Button leftIcon={<Save className="h-4 w-4" />}>
          Enregistrer
        </Button>
      </>
    ),
  },
}

// Exemple dans un formulaire
export const InFormExample: Story = {
  render: () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-heading-md mb-4">Créer un événement</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input className="w-full p-2 border rounded" placeholder="Nom de l'événement" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full p-2 border rounded" rows={4} />
        </div>
      </div>

      <ActionGroup align="right" divider>
        <Button variant="outline" leftIcon={<X className="h-4 w-4" />}>
          Annuler
        </Button>
        <Button leftIcon={<Save className="h-4 w-4" />}>
          Créer l'événement
        </Button>
      </ActionGroup>
    </div>
  ),
}
