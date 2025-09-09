import React from 'react'
import { StoreProvider } from './providers/store-provider'
import { I18nProvider } from './providers/i18n-provider'
import { AbilityProvider } from './providers/ability-provider'
import { RouterProvider } from './providers/router-provider'

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <I18nProvider>
        <AbilityProvider>
          <RouterProvider />
        </AbilityProvider>
      </I18nProvider>
    </StoreProvider>
  )
}
