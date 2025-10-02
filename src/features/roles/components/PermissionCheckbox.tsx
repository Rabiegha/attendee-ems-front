import React from 'react'
import type { Permission, Role } from '../types'

interface PermissionCheckboxProps {
  permission: Permission
  role: Role
  isGranted: boolean
  onChange: (permissionId: string, granted: boolean) => void
  isLoading?: boolean
  disabled?: boolean
}

export const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  permission,
  isGranted,
  onChange,
  isLoading = false,
  disabled = false
}) => {
  const handleChange = (checked: boolean) => {
    if (!disabled && !isLoading) {
      onChange(permission.id, checked)
    }
  }

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200 ${
      isGranted 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-700/50' 
        : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
    } ${isLoading ? 'opacity-60' : ''}`}>
      <input
        type="checkbox"
        checked={isGranted}
        onChange={(e) => handleChange(e.target.checked)}
        disabled={disabled || isLoading}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <label className={`text-sm font-medium cursor-pointer ${
            isGranted 
              ? 'text-green-900 dark:text-green-100' 
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {permission.name}
          </label>
          
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
            isGranted
              ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {permission.code}
          </span>
        </div>
        
        <p className={`text-xs mt-1 ${
          isGranted 
            ? 'text-green-700 dark:text-green-300' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {permission.description}
        </p>
      </div>
      
      {isLoading && (
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}