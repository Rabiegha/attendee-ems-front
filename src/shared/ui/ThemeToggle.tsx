import React from 'react'
import { useThemeContext } from '@/app/providers/theme-provider'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/utils'

// Icônes SVG pour les différents modes
const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const SystemIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'default',
  className
}) => {
  const { theme, setTheme } = useThemeContext()

  if (variant === 'button') {
    const cycleTheme = () => {
      const themes: Array<typeof theme> = ['light', 'dark', 'system']
      const currentIndex = themes.indexOf(theme)
      const nextIndex = (currentIndex + 1) % themes.length
      const nextTheme = themes[nextIndex]
      if (nextTheme) {
        setTheme(nextTheme)
      }
    }

    const getIcon = () => {
      switch (theme) {
        case 'light':
          return <SunIcon className="h-4 w-4" />
        case 'dark':
          return <MoonIcon className="h-4 w-4" />
        case 'system':
          return <SystemIcon className="h-4 w-4" />
        default:
          return <SunIcon className="h-4 w-4" />
      }
    }

    const getTooltip = () => {
      switch (theme) {
        case 'light':
          return 'Mode clair'
        case 'dark':
          return 'Mode sombre'
        case 'system':
          return 'Mode système'
        default:
          return 'Changer le thème'
      }
    }

    return (
      <Button
        variant="ghost"
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'icon'}
        onClick={cycleTheme}
        className={cn('transition-all duration-200', className)}
        title={getTooltip()}
      >
        {getIcon()}
      </Button>
    )
  }

  // Mode dropdown pour plus d'options
  return (
    <div className={cn('flex items-center space-x-1 p-1 bg-muted/50 rounded-lg', className)}>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-8 w-8 p-0"
        title="Mode clair"
      >
        <SunIcon className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-8 w-8 p-0"
        title="Mode sombre"
      >
        <MoonIcon className="h-4 w-4" />
      </Button>
      
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="h-8 w-8 p-0"
        title="Mode système"
      >
        <SystemIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}