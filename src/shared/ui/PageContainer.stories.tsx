import type { Meta, StoryObj } from '@storybook/react'
import { PageContainer } from './PageContainer'
import { PageHeader } from './PageHeader'
import { PageSection } from './PageSection'
import { Card, CardContent } from './Card'
import { Calendar } from 'lucide-react'

const meta = {
  title: 'Layout/PageContainer',
  component: PageContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageContainer>

export default meta
type Story = StoryObj<typeof meta>

// Page simple
export const Default: Story = {
  args: {
    children: (
      <>
        <PageHeader 
          title="Ma Page" 
          description="Description de la page"
          icon={Calendar}
        />
        <PageSection>
          <Card>
            <CardContent>
              <p>Contenu de la page</p>
            </CardContent>
          </Card>
        </PageSection>
      </>
    ),
  },
}

// Avec largeur maximale large (7xl)
export const MaxWidth7xl: Story = {
  args: {
    maxWidth: '7xl',
    children: (
      <>
        <PageHeader title="Largeur maximale 7xl" />
        <div className="bg-blue-100 dark:bg-blue-900 p-8 rounded">
          <p className="text-center">Contenu avec max-width: 7xl</p>
        </div>
      </>
    ),
  },
}

// Avec largeur maximale medium (lg)
export const MaxWidthLg: Story = {
  args: {
    maxWidth: 'lg',
    children: (
      <>
        <PageHeader title="Largeur maximale lg" />
        <div className="bg-green-100 dark:bg-green-900 p-8 rounded">
          <p className="text-center">Contenu avec max-width: lg</p>
        </div>
      </>
    ),
  },
}

// Sans padding
export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="bg-red-100 dark:bg-red-900 p-8">
        <PageHeader title="Sans padding" />
        <p>Le container n'a pas de padding</p>
      </div>
    ),
  },
}

// Padding small
export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <>
        <PageHeader title="Padding small" />
        <div className="bg-purple-100 dark:bg-purple-900 p-8 rounded">
          <p>Padding: sm (16px)</p>
        </div>
      </>
    ),
  },
}

// Page complète exemple
export const FullPageExample: Story = {
  args: {
    maxWidth: '7xl',
    padding: 'lg',
    children: (
      <>
        <PageHeader 
          title="Dashboard"
          description="Vue d'ensemble de votre organisation"
          icon={Calendar}
        />
        
        <PageSection spacing="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-heading-sm">Événements</h3>
                <p className="text-3xl font-bold mt-2">42</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-heading-sm">Participants</h3>
                <p className="text-3xl font-bold mt-2">1,234</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-heading-sm">Utilisateurs</h3>
                <p className="text-3xl font-bold mt-2">18</p>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        <PageSection title="Événements récents" spacing="lg">
          <Card>
            <CardContent className="p-6">
              <p className="text-body">Liste des événements...</p>
            </CardContent>
          </Card>
        </PageSection>
      </>
    ),
  },
}
