import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
  isLight: boolean
  isSystem: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
}) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage ou utiliser defaultTheme
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (newTheme: Theme) => {
      root.classList.remove('light', 'dark')

      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        return systemTheme
      } else {
        root.classList.add(newTheme)
        return newTheme
      }
    }

    applyTheme(theme)

    // Sauvegarder dans localStorage
    localStorage.setItem('theme', theme)

    // Écouter les changements de préférence système si mode system
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        applyTheme('system')
      }

      mediaQuery.addEventListener('change', handleChange)
      
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    
    // Pas de cleanup nécessaire pour les autres modes
    return undefined
  }, [theme])

  const setThemeWithTransition = (newTheme: Theme) => {
    // Ajouter une transition fluide
    const root = document.documentElement
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease'
    
    setTheme(newTheme)
    
    // Retirer la transition après l'animation
    setTimeout(() => {
      root.style.transition = ''
    }, 300)
  }

  const getCurrentTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const value: ThemeContextType = {
    theme,
    setTheme: setThemeWithTransition,
    isDark: getCurrentTheme() === 'dark',
    isLight: getCurrentTheme() === 'light',
    isSystem: theme === 'system',
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}