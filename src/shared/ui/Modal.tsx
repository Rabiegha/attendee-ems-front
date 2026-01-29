import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'

const modalVariants = cva('modal-content', {
  variants: {
    size: {
      sm: 'w-full max-w-sm mx-4',
      md: 'w-full max-w-md mx-4',
      lg: 'w-full max-w-lg mx-4 sm:mx-6',
      xl: 'w-full max-w-xl mx-4 sm:mx-6',
      '2xl': 'w-full max-w-2xl mx-4 sm:mx-6 md:mx-8',
      '3xl': 'w-full max-w-3xl mx-4 sm:mx-6 md:mx-8',
      '4xl': 'w-full max-w-4xl mx-4 sm:mx-6 md:mx-8 lg:mx-10',
      '5xl': 'w-full max-w-5xl mx-4 sm:mx-6 md:mx-8 lg:mx-10',
      full: 'w-full max-w-full mx-4 sm:mx-6 md:mx-8',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
})

interface ModalProps extends VariantProps<typeof modalVariants> {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  className?: string
  contentPadding?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'lg',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className,
  contentPadding = true,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  
  // Utiliser useRef pour éviter les re-renders en boucle
  const onCloseRef = useRef(onClose)
  
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

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
          onCloseRef.current()
        }
      }, 210) // 200ms animation + 10ms marge
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOpen, isClosing])

  const handleClose = () => {
    setIsClosing(true)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose()
    }
  }

  if (!shouldRender) return null

  return createPortal(
    <div className="modal-base">
      {/* Backdrop moderne avec blur plus intense */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300 ease-out',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleBackdropClick}
      />

      {/* Modal avec support light/dark mode */}
      <div
        className={cn(
          modalVariants({ size: maxWidth }),
          'relative bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform max-h-[90vh] overflow-hidden',
          isVisible
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-95 translate-y-8 opacity-0',
          className
        )}
      >
        {/* Header optionnel simplifié */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white pr-2">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex-shrink-0 touch-target"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Contenu avec scroll */}
        <div
          className={cn(
            'overflow-y-auto',
            'max-h-[calc(90vh-80px)] sm:max-h-[calc(90vh-100px)]',
            contentPadding && 'p-4 sm:p-5 md:p-6'
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal
