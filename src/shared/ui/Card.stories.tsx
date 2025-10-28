import type { Meta, StoryObj } from '@storybook/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card'
import { Button } from './Button'
import { Badge } from 'lucide-react'

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'ghost'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'xl'],
    },
    radius: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg', 'full'],
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    padding: 'md',
    radius: 'md',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Titre de la carte</CardTitle>
        <CardDescription>
          Description de la carte avec des détails supplémentaires.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Contenu principal de la carte avec des informations importantes.</p>
      </CardContent>
      <CardFooter>
        <Button variant="default">Action primaire</Button>
        <Button variant="outline">Action secondaire</Button>
      </CardFooter>
    </Card>
  ),
}

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    radius: 'md',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Carte élevée</CardTitle>
        <CardDescription>
          Cette carte a une ombre plus prononcée et un effet de survol.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Idéale pour les éléments interactifs ou important à mettre en avant.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'lg',
    radius: 'lg',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Carte avec bordure</CardTitle>
        <CardDescription>
          Style outlined avec bordure épaisse et fond transparent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Parfaite pour les contenus secondaires ou les zones de contenu
          spéciales.
        </p>
      </CardContent>
    </Card>
  ),
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    padding: 'md',
    radius: 'lg',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Carte fantôme</CardTitle>
        <CardDescription>
          Style subtle avec fond semi-transparent et bordure légère.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Utilisée pour les éléments de support ou les informations
          contextuelles.
        </p>
      </CardContent>
    </Card>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Différents paddings</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {(['sm', 'md', 'lg'] as const).map((padding) => (
          <Card key={padding} variant="default" padding={padding}>
            <CardTitle>Padding {padding}</CardTitle>
            <CardContent>
              <p>Contenu avec padding {padding}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-xl font-semibold">Différents radius</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['sm', 'md', 'lg', 'full'] as const).map((radius) => (
          <Card key={radius} variant="elevated" padding="md" radius={radius}>
            <CardTitle>Radius {radius}</CardTitle>
            <CardContent>
              <p>Avec radius {radius}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div className="dark space-y-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Mode sombre</CardTitle>
          <CardDescription>
            Tous les composants supportent automatiquement le mode sombre.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Le design system assure une cohérence parfaite entre les modes.</p>
        </CardContent>
        <CardFooter>
          <Button>Bouton principal</Button>
          <Button variant="outline">Bouton secondaire</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}

export const InteractiveCard: Story = {
  render: () => (
    <Card
      variant="elevated"
      className="cursor-pointer hover:shadow-xl transition-shadow duration-200"
    >
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Badge className="h-5 w-5 text-blue-600" />
          <CardTitle>Carte interactive</CardTitle>
        </div>
        <CardDescription>
          Cliquez pour découvrir les interactions possibles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          Cette carte réagit au survol et au clic grâce aux classes Tailwind.
        </p>
      </CardContent>
    </Card>
  ),
}
