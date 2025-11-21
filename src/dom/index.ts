import type { 
  Signal, 
  Computed, 
  ElementBinding, 
  EventBinding, 
  ConditionalBinding,
  ListBinding,
  AttributeValue 
} from '../types'
import { effect, bindEffectToElement } from '../reactivity'

/**
 * Lie une propriété d'élément à un signal
 */
export function bindProperty(
  element: Element,
  property: string,
  signalOrComputed: Signal | Computed,
  transform?: (value: any) => any
): () => void {
  
  const binding: ElementBinding = {
    element,
    property,
    signal: signalOrComputed,
    transform,
  }

  return bindEffectToElement(element, () => {
    const value = binding.signal()
    const transformedValue = binding.transform 
      ? binding.transform(value)
      : value

    if (property === 'textContent') {
      element.textContent = String(transformedValue ?? '')
    } else if (property === 'innerHTML') {
      element.innerHTML = String(transformedValue ?? '')
    } else if (property.startsWith('data-')) {
      const attr = property
      if (transformedValue == null) {
        element.removeAttribute(attr)
      } else {
        element.setAttribute(attr, String(transformedValue))
      }
    } else if (property === 'class') {
      updateClassList(element, transformedValue)
    } else if (property === 'style') {
      updateStyle(element, transformedValue)
    } else {
      // Propriété standard
      ;(element as any)[property] = transformedValue
    }
  })
}

/**
 * Lie un événement à un handler
 */
export function bindEvent(
  element: Element,
  event: string,
  handler: (event: Event) => void
): () => void {
  element.addEventListener(event, handler)
  
  return () => {
    element.removeEventListener(event, handler)
  }
}

/**
 * Rendu conditionnel
 */
export function bindConditional(
  element: Element,
  condition: Signal<boolean> | Computed<boolean>,
  template: DocumentFragment
): () => void {
  const placeholder = document.createComment('conditional')
  const parent = element.parentNode
  
  if (!parent) {
    throw new Error('Element must be in the DOM to use conditional binding')
  }

  parent.insertBefore(placeholder, element)
  
  let currentElement: Element | null = null

  const cleanup = effect(() => {
    const isVisible = condition()
    
    if (isVisible && !currentElement) {
      // Afficher l'élément
      const clonedNode = template.cloneNode(true) as DocumentFragment
      currentElement = clonedNode.firstElementChild as Element
      if (currentElement) {
        parent.insertBefore(currentElement, placeholder.nextSibling)
      }
    } else if (!isVisible && currentElement) {
      // Cacher l'élément
      parent.removeChild(currentElement)
      currentElement = null
    }
  })

  return cleanup.destroy
}

/**
 * Rendu de liste
 */
export function bindList<T>(
  container: Element,
  items: Signal<T[]> | Computed<T[]>,
  template: (item: T, index: number) => DocumentFragment,
  keyFn?: (item: T, index: number) => string | number
): () => void {
  const placeholder = document.createComment('list')
  container.appendChild(placeholder)
  
  let renderedItems: { key: string | number; element: Element }[] = []

  const cleanup = effect(() => {
    const currentItems = items()
    const newRenderedItems: { key: string | number; element: Element }[] = []
    
    // Créer un map des éléments existants par clé
    const existingByKey = new Map<string | number, Element>()
    for (const item of renderedItems) {
      existingByKey.set(item.key, item.element)
    }

    // Traiter chaque nouvel élément
    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i]
      const key = keyFn ? keyFn(item, i) : i
      
      let element = existingByKey.get(key)
      
      if (!element) {
        // Créer un nouvel élément
        const fragment = template(item, i)
        element = fragment.firstElementChild as Element
        if (element) {
          container.insertBefore(element, placeholder)
        }
      }
      
      if (element) {
        newRenderedItems.push({ key, element })
        existingByKey.delete(key)
      }
    }

    // Supprimer les éléments qui ne sont plus nécessaires
    for (const element of existingByKey.values()) {
      if (element.parentNode === container) {
        container.removeChild(element)
      }
    }

    renderedItems = newRenderedItems
  })

  return cleanup.destroy
}

/**
 * Mise à jour des classes CSS
 */
function updateClassList(element: Element, value: AttributeValue): void {
  if (typeof value === 'string') {
    element.className = value
  } else if (Array.isArray(value)) {
    element.className = value.filter(Boolean).join(' ')
  } else if (value && typeof value === 'object') {
    const classes: string[] = []
    for (const [className, isActive] of Object.entries(value)) {
      if (isActive) {
        classes.push(className)
      }
    }
    element.className = classes.join(' ')
  } else {
    element.className = ''
  }
}

/**
 * Mise à jour des styles
 */
function updateStyle(element: Element, value: AttributeValue): void {
  const htmlElement = element as HTMLElement
  
  if (typeof value === 'string') {
    htmlElement.style.cssText = value
  } else if (value && typeof value === 'object') {
    // Réinitialiser tous les styles inline
    htmlElement.style.cssText = ''
    
    // Appliquer les nouveaux styles
    for (const [property, styleValue] of Object.entries(value)) {
      if (styleValue != null) {
        htmlElement.style.setProperty(
          property.replace(/([A-Z])/g, '-$1').toLowerCase(),
          String(styleValue)
        )
      }
    }
  } else {
    htmlElement.style.cssText = ''
  }
}