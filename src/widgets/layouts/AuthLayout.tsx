import React from 'react'
import { Outlet } from 'react-router-dom'

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Event Management System
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos événements et participants en toute simplicité
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
