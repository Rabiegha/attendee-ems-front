import React from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  )
}
