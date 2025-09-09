import React, { Suspense } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/shared/lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

const I18nFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<I18nFallback />}>
        {children}
      </Suspense>
    </I18nextProvider>
  )
}
