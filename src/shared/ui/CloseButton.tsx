import React from 'react'

interface CloseButtonProps {
  onClick: () => void
  className?: string
}

export const CloseButton: React.FC<CloseButtonProps> = ({ 
  onClick, 
  className = "absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all duration-200 hover:scale-110 z-10" 
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}