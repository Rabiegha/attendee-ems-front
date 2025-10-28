import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage ou utiliser 'system' par défaut
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system'
    }
    return 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (newTheme: Theme) => {
      root.classList.remove('light', 'dark')

      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
        return systemTheme
      } else {
        root.classList.add(newTheme)
        return newTheme
      }
    }

    const appliedTheme = applyTheme(theme)

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

  return {
    theme,
    setTheme: setThemeWithTransition,
    // Helpers pour vérifier le thème actuel
    isDark:
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLight:
      theme === 'light' ||
      (theme === 'system' &&
        !window.matchMedia('(prefers-color-scheme: dark)').matches),
    isSystem: theme === 'system',
  }
}
