import { signal, bindProperty } from 'pulse-framework'
import type { Signal } from 'pulse-framework'
import { createElement, createSection, createButton, createControlsGrid } from '../utils/dom'

export interface ConditionalComponentOptions {
  initialVisible?: boolean
  initialAnimated?: boolean
  onVisibilityChange?: (visible: boolean) => void
  onAnimationChange?: (animated: boolean) => void
}

export function createConditionalComponent(options: ConditionalComponentOptions = {}): HTMLElement {
  const { 
    initialVisible = true, 
    initialAnimated = false,
    onVisibilityChange,
    onAnimationChange 
  } = options

  // États locaux du composant
  const isVisible = signal(initialVisible)
  const isAnimated = signal(initialAnimated)

  const section = createSection('Affichage Conditionnel')

  // Gestionnaires d'événements
  const toggleVisibility = () => {
    isVisible(!isVisible())
    onVisibilityChange?.(isVisible())
  }

  const toggleAnimation = () => {
    isAnimated(!isAnimated())
    onAnimationChange?.(isAnimated())
  }

  // Contrôles
  const controls = createControlsGrid(
    createButton('Toggle Visibilité', { 
      icon: 'eye',
      onClick: toggleVisibility,
      attributes: { 'data-toggle-visibility': '' }
    }),
    createButton('Toggle Animation', { 
      icon: 'activity',
      variant: 'secondary', 
      onClick: toggleAnimation,
      attributes: { 'data-toggle-animation': '' }
    })
  )

  // Contenu conditionnel
  const conditionalContent = createElement('div', {
    className: 'conditional-content',
    attributes: { 'data-conditional-content': '' },
    children: [
      createElement('h3', { textContent: 'Contenu conditionnel visible !' }),
      createElement('p', { textContent: 'Ce contenu s\'affiche et se cache dynamiquement.' })
    ],
    style: {
      display: initialVisible ? 'block' : 'none'
    }
  })

  // Binding réactif pour la visibilité et l'animation
  const updateContent = () => {
    const visible = isVisible()
    const animated = isAnimated()
    
    conditionalContent.style.display = visible ? 'block' : 'none'
    
    if (animated && visible) {
      conditionalContent.style.animation = 'pulse 2s infinite'
    } else {
      conditionalContent.style.animation = ''
    }
  }

  // Bindings réactifs
  isVisible.subscribe(updateContent)
  isAnimated.subscribe(updateContent)

  section.appendChild(controls)
  section.appendChild(conditionalContent)

  return section
}