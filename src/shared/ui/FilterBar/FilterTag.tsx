import React from 'react'
import { TagFilterInput } from '@/features/tags'

interface FilterTagProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * FilterTag - Wrapper pour le TagFilterInput existant
 * Permet de filtrer par tags dans le FilterBar
 */
export const FilterTag: React.FC<FilterTagProps> = ({
  value,
  onChange,
  placeholder = 'Filtrer par tag...',
  className,
}) => {
  return (
    <div className={className}>
      <TagFilterInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}
