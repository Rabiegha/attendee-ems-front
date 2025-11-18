import React from 'react'
import { cn } from '@/shared/lib/utils'

export interface TabItem {
  id: string
  label: string
  count?: number
  disabled?: boolean
}

interface TabsProps {
  items: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  actions?: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  className,
  actions,
}) => {
  return (
    <div
      className={cn('dark:border-gray-700 flex items-center justify-between', className)}
    >
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => !item.disabled && onTabChange(item.id)}
            disabled={item.disabled}
            className={cn(
              'group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              {
                'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400':
                  activeTab === item.id,
                'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600':
                  activeTab !== item.id && !item.disabled,
                'border-transparent text-gray-300 cursor-not-allowed dark:text-gray-600':
                  item.disabled,
              }
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  'ml-2 py-0.5 px-2 rounded-full text-xs font-medium transition-colors duration-200',
                  {
                    'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300':
                      activeTab === item.id,
                    'bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700':
                      activeTab !== item.id && !item.disabled,
                    'bg-gray-50 text-gray-300 dark:bg-gray-900 dark:text-gray-600':
                      item.disabled,
                  }
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>
      {actions && (
        <div className="flex items-center gap-2 -mb-px pb-2">
          {actions}
        </div>
      )}
    </div>
  )
}
