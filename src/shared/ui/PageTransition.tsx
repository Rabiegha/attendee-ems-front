import React, { useEffect, useRef } from 'react'

interface PageTransitionProps {
  children: React.ReactNode
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Remove transform after animation to not break position: sticky
    const timer = setTimeout(() => {
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = 'none'
      }
    }, 300) // Match animation duration

    return () => clearTimeout(timer)
  }, [children])

  return (
    <div ref={wrapperRef} className="page-transition-wrapper">
      {children}
    </div>
  )
}
