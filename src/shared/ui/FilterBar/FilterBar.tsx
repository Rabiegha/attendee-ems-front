import React from 'react'
import { RotateCcw, RefreshCw } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '../Button'
import type { FilterBarProps } from './types'

/**
 * FilterBar - Conteneur pour les composants de recherche et filtres
 * 
 * @example
 * <FilterBar resultCount={42} resultLabel="événement">
 *   <SearchInput value={search} onChange={setSearch} />
 *   <FilterButton filters={...} />
 *   <FilterTag value={tag} onChange={setTag} />
 * </FilterBar>
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  children,
  resultCount,
  resultLabel = 'résultat',
  className,
  onReset,
  showResetButton = true,
  onRefresh,
  showRefreshButton = false,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Barre de filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 transition-colors duration-200">
        <div className="flex items-center gap-3">
          {/* Conteneur des filtres - prend toute la largeur */}
          <div className="flex-1 flex items-center gap-3">
            {children}
          </div>

          {/* Bouton refresh */}
          {showRefreshButton && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-10 flex-shrink-0"
              title="Rafraîchir la liste"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Rafraîchir</span>
            </Button>
          )}
        </div>
      </div>

      {/* Compteur de résultats en bas avec lien de réinitialisation */}
      {resultCount !== undefined && (
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 px-1">
          <div className="flex items-center">
            <span className="font-medium">{resultCount}</span>
            <span className="ml-1">
              {resultLabel}{resultCount > 1 ? 's' : ''} trouvé{resultCount > 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Lien de réinitialisation subtile */}
          {showResetButton && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
              title="Réinitialiser les filtres"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
