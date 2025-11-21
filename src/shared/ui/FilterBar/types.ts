/**
 * Types pour le système de filtres
 */

export type FilterType = 'checkbox' | 'radio' | 'date-range' | 'select'

export interface FilterOption {
  value: string
  label: string
  count?: number
  disabled?: boolean
}

export interface FilterConfig {
  label: string
  type: FilterType
  options: FilterOption[]
  placeholder?: string
  multiple?: boolean // Pour les selects
}

export interface FilterConfigs {
  [key: string]: FilterConfig
}

export interface FilterValues {
  [key: string]: string | string[] | null | undefined | { from?: string; to?: string }
}

export interface FilterBarProps {
  children: React.ReactNode
  resultCount?: number
  resultLabel?: string
  className?: string
  onReset?: () => void
  showResetButton?: boolean
  onRefresh?: () => void
  showRefreshButton?: boolean
}
