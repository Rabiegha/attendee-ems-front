import React, { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/utils'

interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  delay?: number
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'slide-right'
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  delay = 0,
  animation = 'fade-in',
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-500 ease-out'

    if (!isVisible) {
      switch (animation) {
        case 'fade-in':
          return `${baseClasses} opacity-0`
        case 'slide-up':
          return `${baseClasses} opacity-0 translate-y-2`
        case 'scale-in':
          return `${baseClasses} opacity-0 scale-98`
        case 'slide-right':
          return `${baseClasses} opacity-0 -translate-x-2`
        default:
          return `${baseClasses} opacity-0`
      }
    }

    switch (animation) {
      case 'fade-in':
        return `${baseClasses} opacity-100`
      case 'slide-up':
        return `${baseClasses} opacity-100 translate-y-0`
      case 'scale-in':
        return `${baseClasses} opacity-100 scale-100`
      case 'slide-right':
        return `${baseClasses} opacity-100 translate-x-0`
      default:
        return `${baseClasses} opacity-100`
    }
  }

  return <div className={cn(getAnimationClasses(), className)}>{children}</div>
}

export default AnimatedContainer
