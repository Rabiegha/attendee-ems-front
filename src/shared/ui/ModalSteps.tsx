import React, { useState, useEffect, useRef } from 'react'

/**
 * ModalSteps - Composant pour animer les transitions entre différentes étapes d'un modal
 * 
 * @description
 * Ajoute une animation de swipe fluide lors du changement d'étape dans un modal multi-étapes.
 * L'animation détecte automatiquement la direction (avant/arrière) et applique le slide approprié.
 * La hauteur du conteneur s'adapte de manière fluide à la taille de chaque étape.
 * 
 * @example
 * ```tsx
 * // Exemple 1 : Modal avec étapes booléennes (2 étapes)
 * const [showConfirm, setShowConfirm] = useState(false)
 * 
 * <Modal isOpen={isOpen} onClose={onClose}>
 *   <ModalSteps currentStep={showConfirm ? 1 : 0}>
 *     {!showConfirm ? (
 *       <div>Étape 1 : Sélection</div>
 *     ) : (
 *       <div>Étape 2 : Confirmation</div>
 *     )}
 *   </ModalSteps>
 * </Modal>
 * 
 * // Exemple 2 : Modal avec étapes nommées (4+ étapes)
 * const [step, setStep] = useState<'upload' | 'preview' | 'confirm' | 'success'>('upload')
 * const getStepNumber = (s: typeof step) => ({ upload: 0, preview: 1, confirm: 2, success: 3 }[s])
 * 
 * <Modal isOpen={isOpen} onClose={onClose}>
 *   <ModalSteps currentStep={getStepNumber(step)}>
 *     {step === 'upload' && <div>Upload...</div>}
 *     {step === 'preview' && <div>Preview...</div>}
 *     {step === 'confirm' && <div>Confirm...</div>}
 *     {step === 'success' && <div>Success!</div>}
 *   </ModalSteps>
 * </Modal>
 * ```
 * 
 * @param currentStep - Numéro de l'étape actuelle (commence à 0)
 * @param children - Contenu de l'étape à afficher
 * @param className - Classes CSS additionnelles (optionnel)
 */
interface ModalStepsProps {
  currentStep: number
  children: React.ReactNode
  className?: string
}

export const ModalSteps: React.FC<ModalStepsProps> = ({
  currentStep,
  children,
  className = '',
}) => {
  const [prevStep, setPrevStep] = useState(currentStep)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [containerHeight, setContainerHeight] = useState<number | 'auto'>('auto')
  const prevChildrenRef = useRef(children)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep !== prevStep) {
      // Capturer la hauteur actuelle avant la transition
      if (contentRef.current) {
        setContainerHeight(contentRef.current.offsetHeight)
      }

      setIsTransitioning(true)
      setDirection(currentStep > prevStep ? 'forward' : 'backward')

      const timer = setTimeout(() => {
        setPrevStep(currentStep)
        prevChildrenRef.current = children
        setIsTransitioning(false)
        
        // Après la transition, mesurer la nouvelle hauteur et animer
        setTimeout(() => {
          if (contentRef.current) {
            setContainerHeight(contentRef.current.offsetHeight)
            // Revenir à auto après l'animation pour permettre le redimensionnement
            setTimeout(() => {
              setContainerHeight('auto')
            }, 300)
          }
        }, 50)
      }, 300)

      return () => clearTimeout(timer)
    }
    prevChildrenRef.current = children
    return undefined
  }, [currentStep, prevStep, children])

  // Mettre à jour la hauteur si le contenu change (sans changer d'étape)
  useEffect(() => {
    if (!isTransitioning && containerHeight !== 'auto' && contentRef.current) {
      setContainerHeight(contentRef.current.offsetHeight)
    }
  }, [children, isTransitioning, containerHeight])

  return (
    <div 
      className={`modal-steps-container ${className}`}
      style={{
        height: containerHeight === 'auto' ? 'auto' : `${containerHeight}px`,
        transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      <div className="relative" ref={contentRef}>
        {/* Ancien contenu qui sort */}
        {isTransitioning && (
          <div
            className={`absolute inset-0 modal-step-content ${
              direction === 'forward' ? 'modal-step-exit-left' : 'modal-step-exit-right'
            }`}
            style={{ pointerEvents: 'none' }}
          >
            {prevChildrenRef.current}
          </div>
        )}

        {/* Nouveau contenu qui entre */}
        <div
          className={`modal-step-content ${
            isTransitioning
              ? direction === 'forward'
                ? 'modal-step-enter-right'
                : 'modal-step-enter-left'
              : 'modal-step-visible'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
