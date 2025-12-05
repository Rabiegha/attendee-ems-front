import type { Meta, StoryObj } from '@storybook/react'
import { FormSection } from './FormSection'
import { Input } from './Input'
import { Select, SelectOption } from './Select'
import { Textarea } from './Textarea'
import { FormField } from './FormField'

const meta = {
  title: 'Forms/FormSection',
  component: FormSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

// Section basique
export const Default: Story = {
  args: {
    children: (
      <>
        <FormField label="Nom" required>
          <Input placeholder="Entrez votre nom" />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" placeholder="exemple@email.com" />
        </FormField>
      </>
    ),
  },
}

// Avec titre
export const WithTitle: Story = {
  args: {
    title: 'Informations personnelles',
    children: (
      <>
        <FormField label="Prénom" required>
          <Input placeholder="John" />
        </FormField>
        <FormField label="Nom" required>
          <Input placeholder="Doe" />
        </FormField>
      </>
    ),
  },
}

// Avec titre et description
export const WithTitleAndDescription: Story = {
  args: {
    title: 'Informations de contact',
    description: 'Ces informations seront utilisées pour vous contacter',
    children: (
      <>
        <FormField label="Email" required>
          <Input type="email" placeholder="exemple@email.com" />
        </FormField>
        <FormField label="Téléphone">
          <Input type="tel" placeholder="+33 6 12 34 56 78" />
        </FormField>
      </>
    ),
  },
}

// Section requise
export const RequiredSection: Story = {
  args: {
    title: 'Informations obligatoires',
    description: 'Tous les champs de cette section sont obligatoires',
    required: true,
    children: (
      <>
        <FormField label="Nom de l'événement" required>
          <Input placeholder="Conférence annuelle 2025" />
        </FormField>
        <FormField label="Date de début" required>
          <Input type="date" />
        </FormField>
        <FormField label="Lieu" required>
          <Input placeholder="Paris, France" />
        </FormField>
      </>
    ),
  },
}

// Formulaire complet avec plusieurs sections
export const MultiSectionForm: Story = {
  args: { children: null },
  render: () => (
    <form className="space-y-8">
      <FormSection
        title="Informations de base"
        description="Informations principales de l'événement"
        required
      >
        <FormField label="Nom" required>
          <Input placeholder="Nom de l'événement" />
        </FormField>
        <FormField label="Type">
          <Select placeholder="Sélectionnez un type">
            <SelectOption value="conference">Conférence</SelectOption>
            <SelectOption value="workshop">Atelier</SelectOption>
            <SelectOption value="webinar">Webinaire</SelectOption>
          </Select>
        </FormField>
      </FormSection>

      <FormSection title="Description" description="Décrivez votre événement">
        <FormField label="Description courte">
          <Input placeholder="Une ligne de description" />
        </FormField>
        <FormField label="Description complète">
          <Textarea rows={6} placeholder="Description détaillée..." />
        </FormField>
      </FormSection>

      <FormSection title="Paramètres avancés">
        <FormField label="Capacité maximale">
          <Input type="number" placeholder="100" />
        </FormField>
        <FormField label="Inscription requise">
          <Select>
            <SelectOption value="yes">Oui</SelectOption>
            <SelectOption value="no">Non</SelectOption>
          </Select>
        </FormField>
      </FormSection>
    </form>
  ),
}
