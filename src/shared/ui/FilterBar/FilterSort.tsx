import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface SortOption {
  value: string
  label: string
}

interface FilterSortProps {
  value: string
  onChange: (value: string) => void
  options: SortOption[]
  className?: string
  placeholder?: string
}

/**
 * FilterSort - Select pour le tri
 */
export const FilterSort: React.FC<FilterSortProps> = ({
  value,
  onChange,
  options,
  className,
  placeholder = 'Trier par...',
}) => {
  return (
    <div className="relative">
      <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
          'bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors duration-200 appearance-none cursor-pointer',
          'min-w-[180px] flex-shrink-0',
          className
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
