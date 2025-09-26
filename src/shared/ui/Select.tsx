import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const selectVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500/20 focus:border-blue-500',
        error: 'border-red-500 dark:border-red-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500/20 focus:border-red-500',
        success: 'border-green-500 dark:border-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-green-500/20 focus:border-green-500'
      },
      size: {
        sm: 'h-8 text-xs',
        default: 'h-10 text-sm',
        lg: 'h-12 text-base'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

interface SelectProps 
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  placeholder?: string
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, children, error, success, placeholder, leftIcon, rightIcon, ...props }, ref) => {
    const variantToUse = error ? 'error' : success ? 'success' : variant

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          className={cn(
            selectVariants({ variant: variantToUse, size, className }),
            'appearance-none pr-10',
            leftIcon && 'pl-10'
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {rightIcon && (
          <div className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {rightIcon}
          </div>
        )}
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = 'Select'

// Option component pour cohérence
interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2',
          className
        )}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectOption.displayName = 'SelectOption'

export { Select, SelectOption, type SelectProps }