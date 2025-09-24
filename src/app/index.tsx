import React from 'react'
import { StoreProvider } from './providers/store-provider'
import { I18nProvider } from './providers/i18n-provider'
import { AbilityProvider } from './providers/ability-provider'
import { RouterProvider } from './providers/router-provider'
import { ToastProvider } from './providers/toast-provider'
import { ThemeProvider } from './providers/theme-provider'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <StoreProvider>
        <I18nProvider>
          <AbilityProvider>
            <RouterProvider />
            <ToastProvider />
          </AbilityProvider>
        </I18nProvider>
      </StoreProvider>
    </ThemeProvider>
  )
}
