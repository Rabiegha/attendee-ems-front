import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className,
  disabled = false,
}) => {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
          'h-11 sm:h-10', // Taller on mobile for better touch
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
          'placeholder-gray-500 dark:placeholder-gray-400',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 touch-target"
          title="Effacer la recherche"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
