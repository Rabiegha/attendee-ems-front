import React from 'react'
import { MultiSelect, MultiSelectOption } from '../../../shared/ui/MultiSelect'
import { useGetPartnersForEventsQuery } from '../../users/api/usersApi'

interface PartnerSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  className?: string
}

export const PartnerSelect: React.FC<PartnerSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const {
    data: partners = [],
    isLoading,
    error,
  } = useGetPartnersForEventsQuery()

  // Debug logs
  console.log('[PartnerSelect] Partners data:', partners)
  console.log('[PartnerSelect] isLoading:', isLoading)
  console.log('[PartnerSelect] error:', error)

  // Convertir les partenaires en options pour MultiSelect
  const partnerOptions: MultiSelectOption[] = Array.isArray(partners)
    ? partners.map((partner) => ({
        id: partner.id,
        label: `${partner.first_name} ${partner.last_name}`,
        subLabel: partner.email,
      }))
    : []

  console.log('[PartnerSelect] partnerOptions:', partnerOptions)

  if (isLoading) {
    return (
      <div
        className={`min-h-[42px] border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 ${className}`}
      >
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          Chargement des partenaires...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-[42px] border border-red-300 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-900/20 ${className}`}
      >
        <div className="text-sm text-red-600 dark:text-red-400">
          Erreur lors du chargement des partenaires
        </div>
      </div>
    )
  }

  return (
    <MultiSelect
      options={partnerOptions}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder="Sélectionner les partenaires autorisés..."
      searchPlaceholder="Rechercher un partenaire par nom ou email..."
      emptyMessage="Aucun partenaire trouvé dans votre organisation"
      maxSelections={50} // Limite définie dans le schéma de validation
      className={className}
    />
  )
}
