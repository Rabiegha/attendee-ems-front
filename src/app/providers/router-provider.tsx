import React from 'react'
import { RouterProvider as ReactRouterProvider } from 'react-router-dom'
import { router } from '@/app/routes'

interface RouterProviderProps {
  children?: React.ReactNode
}

export const RouterProvider: React.FC<RouterProviderProps> = () => {
  return <ReactRouterProvider router={router} />
}
