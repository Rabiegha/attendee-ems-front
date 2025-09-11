import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'lg',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen && !isClosing) {
      // Modal s'ouvre
      setShouldRender(true)
      setIsClosing(false)
      // Délai court pour permettre le render, puis déclencher l'animation d'entrée
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10)
      return () => clearTimeout(timer)
    } else if (!isOpen || isClosing) {
      // Modal se ferme - d'abord déclencher l'animation de sortie
      setIsVisible(false)
      // Puis après l'animation, démonter le composant ET appeler onClose
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
        if (isClosing) {
          onClose()
        }
      }, 210) // 200ms animation + 10ms marge
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen, isClosing, onClose])

  const handleClose = () => {
    setIsClosing(true)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose()
    }
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  }

  if (!shouldRender) return null

  return createPortal(
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "transition-all duration-200 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Backdrop avec fade */}
      <div 
        className={cn(
          "absolute inset-0 bg-black transition-opacity duration-200 ease-out",
          isVisible ? "bg-opacity-50" : "bg-opacity-0"
        )}
        onClick={handleBackdropClick}
      />
      
      {/* Modal avec slide + scale */}
      <div 
        className={cn(
          "relative bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden",
          "transition-all duration-200 ease-out transform",
          maxWidthClasses[maxWidth],
          isVisible 
            ? "scale-100 translate-y-0 opacity-100" 
            : "scale-95 translate-y-4 opacity-0",
          className
        )}
      >
        {/* Header optionnel */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b">
            {title && (
              <h2 className="text-2xl font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
