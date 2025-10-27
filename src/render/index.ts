/**
 * Système de rendu déclaratif pour Pulse Framework
 */

import type { Signal, Computed } from '../types'
import { bindProperty, bindEvent } from '../dom'
import { bindEffectToElement, effect } from '../reactivity'

export interface RenderTemplate {
  tag: string
  attributes?: Record<string, string | Signal<string> | Computed<string>>
  properties?: Record<string, any | Signal<any> | Computed<any>>
  children?: (RenderTemplate | string | Signal<string> | Computed<string> | HTMLElement)[]
  events?: Record<string, (event: Event) => void>
}

/**
 * Lie un attribut à un signal en utilisant setAttribute
 */
function bindAttribute(element: Element, attributeName: string, signalOrComputed: Signal | Computed): () => void {
  return bindEffectToElement(element, () => {
    const value = signalOrComputed()
    if (value == null) {
      element.removeAttribute(attributeName)
    } else {
      element.setAttribute(attributeName, String(value))
    }
  })
}

/**
 * Lie le contenu textuel d'un nœud de texte à un signal
 */
function bindTextContent(textNode: Text, signalOrComputed: Signal | Computed): { destroy: () => void; readonly isActive: boolean } {
  // On ne peut pas utiliser bindEffectToElement avec un Text node, donc on utilise effect directement
  return effect(() => {
    const value = signalOrComputed()
    textNode.textContent = String(value ?? '')
  })
}

/**
 * Fonction de rendu déclaratif
 */
export function render(template: RenderTemplate): HTMLElement {
  const element = document.createElement(template.tag)

  // Gérer les attributs
  if (template.attributes) {
    Object.entries(template.attributes).forEach(([key, value]) => {
      if (typeof value === 'function') {
        // C'est un signal ou computed
        bindAttribute(element, key, value)
      } else {
        // Valeur statique
        element.setAttribute(key, String(value))
      }
    })
  }

  // Gérer les propriétés
  if (template.properties) {
    Object.entries(template.properties).forEach(([key, value]) => {
      if (typeof value === 'function') {
        // C'est un signal ou computed
        bindProperty(element, key, value)
      } else {
        // Valeur statique
        ;(element as any)[key] = value
      }
    })
  }

  // Gérer les événements
  if (template.events) {
    Object.entries(template.events).forEach(([eventName, handler]) => {
      bindEvent(element, eventName, handler)
    })
  }

  // Gérer les enfants
  if (template.children) {
    template.children.forEach(child => {
      if (typeof child === 'string') {
        // Texte statique
        element.appendChild(document.createTextNode(child))
      } else if (typeof child === 'function') {
        // Signal ou computed qui retourne du texte
        const textNode = document.createTextNode('')
        bindTextContent(textNode, child)
        element.appendChild(textNode)
      } else if (child instanceof HTMLElement) {
        // Élément DOM existant
        element.appendChild(child)
      } else if (typeof child === 'object' && child.tag) {
        // Template enfant - récursion
        const childElement = render(child)
        element.appendChild(childElement)
      }
    })
  }

  return element
}

/**
 * Fonction utilitaire pour créer des templates plus facilement
 */
export function h(
  tag: string,
  props?: {
    attributes?: Record<string, string | Signal<string> | Computed<string>>
    properties?: Record<string, any | Signal<any> | Computed<any>>
    events?: Record<string, (event: Event) => void>
  },
  ...children: (RenderTemplate | string | Signal<string> | Computed<string> | HTMLElement)[]
): RenderTemplate {
  return {
    tag,
    attributes: props?.attributes,
    properties: props?.properties,
    events: props?.events,
    children: children.length > 0 ? children : undefined
  }
}

/**
 * Fonction pour créer des fragments (conteneurs virtuels)
 */
export function fragment(...children: (RenderTemplate | string | Signal<string> | Computed<string> | HTMLElement)[]): DocumentFragment {
  const frag = document.createDocumentFragment()
  
  children.forEach(child => {
    if (typeof child === 'string') {
      frag.appendChild(document.createTextNode(child))
    } else if (typeof child === 'function') {
      const textNode = document.createTextNode('')
      bindTextContent(textNode, child)
      frag.appendChild(textNode)
    } else if (child instanceof HTMLElement) {
      frag.appendChild(child)
    } else if (typeof child === 'object' && child.tag) {
      const element = render(child)
      frag.appendChild(element)
    }
  })
  
  return frag
}