import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  className?: string
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  className = '',
  showPageSizeSelector = true,
  pageSizeOptions = [20, 50, 100, 200],
}) => {
  const { t } = useTranslation('common')
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, total)

  const handleFirstPage = () => onPageChange(1)
  const handlePrevPage = () => onPageChange(Math.max(1, currentPage - 1))
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1))
  const handleLastPage = () => onPageChange(totalPages)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1)
      const endPage = Math.min(totalPages - 1, currentPage + 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 transition-colors duration-200 ${className}`}
    >
      {/* Left: Items info */}
      <div className="flex flex-1 items-center justify-between sm:justify-start">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {t('pagination.showing', { from: startItem, to: endItem, total })}
        </div>

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="ml-4 flex items-center space-x-2">
            <label
              htmlFor="pageSize"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {t('pagination.per_page')}
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 appearance-none bg-none text-center"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="hidden sm:flex"
          title={t('pagination.first_page')}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          title={t('pagination.previous_page')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="hidden md:flex items-center space-x-1">
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[2.5rem] px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Current page indicator (mobile) */}
        <div className="md:hidden text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{currentPage}</span> /{' '}
          <span className="font-medium">{totalPages}</span>
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          title={t('pagination.next_page')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
          title={t('pagination.last_page')}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
