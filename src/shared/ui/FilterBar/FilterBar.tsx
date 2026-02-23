import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  resultLabel,
  className,
  onReset,
  showResetButton = true,
  onRefresh,
  showRefreshButton = false,
}) => {
  const { t } = useTranslation('common')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshClick = async () => {
    if (!onRefresh || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await Promise.resolve(onRefresh())
      // Garder l'animation visible au moins 500ms pour que l'utilisateur la voie
      await new Promise(resolve => setTimeout(resolve, 500))
    } finally {
      setIsRefreshing(false)
    }
  }

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
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="h-10 flex-shrink-0"
              title={t('table.refresh_list')}
              leftIcon={
                <RefreshCw 
                  className={cn(
                    "h-4 w-4",
                    isRefreshing && "animate-spin"
                  )} 
                />
              }
            >
              <span className="hidden sm:inline">
                {isRefreshing ? t('app.refreshing') : t('app.refresh')}
              </span>
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
              {resultLabel || t('table.result')}{resultCount > 1 ? 's' : ''} {resultCount > 1 ? t('table.found_many') : t('table.found_one')}
            </span>
          </div>
          
          {/* Lien de réinitialisation subtile */}
          {showResetButton && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
              title={t('table.reset_filters')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('app.reset')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
