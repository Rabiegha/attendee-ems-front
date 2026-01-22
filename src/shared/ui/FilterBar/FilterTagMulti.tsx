import React from 'react'
import { TagMultiSelect } from '@/features/tags'

interface FilterTagMultiProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

/**
 * FilterTagMulti - Wrapper pour le TagMultiSelect
 * Permet de filtrer par plusieurs tags dans le FilterBar
 */
export const FilterTagMulti: React.FC<FilterTagMultiProps> = ({
  value,
  onChange,
  placeholder = 'Filtrer par tags...',
  className,
}) => {
  return (
    <div className={className}>
      <TagMultiSelect
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}
