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
  children?: (
    | RenderTemplate
    | string
    | Signal<string>
    | Computed<string>
    | HTMLElement
  )[]
  events?: Record<string, (event: Event) => void>
}

/**
 * Lie un attribut à un signal en utilisant setAttribute
 */
function bindAttribute(
  element: Element,
  attributeName: string,
  signalOrComputed: Signal | Computed
): () => void {
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
function bindTextContent(
  textNode: Text,
  signalOrComputed: Signal | Computed
): { destroy: () => void; readonly isActive: boolean } {
  // On ne peut pas utiliser bindEffectToElement avec un Text node, donc on utilise effect directement
  return effect(() => {
    const value = signalOrComputed()
    textNode.textContent = String(value ?? '')
  })
}

/**
 * Fonction de rendu déclaratif
 */
function renderFn(template: RenderTemplate): HTMLElement {
  const element = document.createElement(
    typeof template.tag === 'string' ? template.tag : 'div'
  )

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
        const childElement = renderFn(child)
        element.appendChild(childElement)
      }
    })
  }

  return element
}

/**
 * Fonction utilitaire pour créer des templates plus facilement
 */
/// TODO : jsx()
// export function h(
//   tag: string,
//   props : {
//     attributes?: Record<string, string | Signal<string> | Computed<string>>,
//     properties?: Record<string, any | Signal<any> | Computed<any>>,
//     events?: Record<string, any | Signal<any> | Computed<any>>
//   },
//   ...children: (RenderTemplate | string | Signal<string> | Computed<string> | HTMLElement)[]
// ): RenderTemplate {

//   return {
//     tag,
//     attributes: props.attributes,
//     properties: props.properties,
//     events: props.events,
//     children: children.length > 0 ? children : undefined
//   }

// }

/**
 * Fonction pour créer des fragments (conteneurs virtuels)
 */
export function fragment(
  ...children: (
    | RenderTemplate
    | string
    | Signal<string>
    | Computed<string>
    | HTMLElement
  )[]
): DocumentFragment {
  const frag = document.createDocumentFragment()

  console.log(
    '🔍 fragment() called with',
    children.length,
    'children:',
    children
  )

  children.forEach((child, index) => {
    console.log(`  Child ${index}:`, child, 'Type:', typeof child)

    if (typeof child === 'string') {
      console.log(`    → Adding text node: "${child}"`)
      frag.appendChild(document.createTextNode(child))
    } else if (typeof child === 'function') {
      console.log(`    → Adding signal/computed text node`)
      const textNode = document.createTextNode('')
      bindTextContent(textNode, child)
      frag.appendChild(textNode)
    } else if (
      child instanceof HTMLElement ||
      child instanceof DocumentFragment
    ) {
      console.log(`    → Adding HTMLElement/DocumentFragment:`, child)
      frag.appendChild(child)
    } else if (typeof child === 'object' && child.tag) {
      console.log(`    → Rendering RenderTemplate with tag:`, child.tag)
      const element = render(child)
      frag.appendChild(element)
    } else {
      console.warn(`    ⚠️ Child ignored! No matching condition`)
    }
  })

  console.log(
    '✅ Fragment created with',
    frag.childNodes.length,
    'childNodes:',
    frag.childNodes
  )

  return frag
}

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): RenderTemplate {
  // Reconstruire le HTML en insérant les valeurs
  let htmlString = ''
  for (let i = 0; i < strings.length; i++) {
    htmlString += strings[i]
    if (i < values.length) {
      const value = values[i]
      if (typeof value === 'function') {
        // Signal/Computed - on va le gérer spécialement
        htmlString += `__SIGNAL_${i}__`
      } else if (typeof value === 'object' && value?.tag) {
        // RenderTemplate - on va le gérer spécialement
        htmlString += `__TEMPLATE_${i}__`
      } else {
        // Valeur normale
        htmlString += String(value)
      }
    }
  }

  // Parser simple pour convertir HTML en RenderTemplate
  return parseHTMLToTemplate(htmlString, values)
}

/**
 * Parse une chaîne HTML simple en RenderTemplate
 */
function parseHTMLToTemplate(html: string, values: any[]): RenderTemplate {
  // Nettoyer le HTML (supprimer les commentaires et espaces excessifs)
  let trimmed = html
    .trim()
    .replace(/<!--[\s\S]*?-->/g, '') // Supprimer les commentaires HTML
    .replace(/\s+/g, ' ') // Normaliser les espaces

  // Si c'est juste du texte (pas d'éléments HTML)
  if (!trimmed.includes('<')) {
    return {
      tag: 'span',
      properties: {
        textContent: processTextContent(trimmed, values),
      },
    }
  }

  // Parser un élément unique
  const tagMatch = trimmed.match(/^<(\w+)([^>]*)>/)
  if (!tagMatch) {
    // Texte simple
    return {
      tag: 'span',
      properties: {
        textContent: processTextContent(trimmed, values),
      },
    }
  }

  const tagName = tagMatch[1]
  const attributesString = tagMatch[2]

  // Méthode plus robuste pour extraire le contenu
  const openTag = tagMatch[0] // La balise complète trouvée
  const closeTag = `</${tagName}>`

  // Chercher le contenu en comptant les balises ouvrantes/fermantes
  let content = ''
  let openIndex = trimmed.indexOf(openTag) + openTag.length
  let depth = 1
  let currentIndex = openIndex

  while (depth > 0 && currentIndex < trimmed.length) {
    const nextOpen = trimmed.indexOf(`<${tagName}`, currentIndex)
    const nextClose = trimmed.indexOf(closeTag, currentIndex)

    if (nextClose === -1) {
      // Pas de balise fermante trouvée
      break
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      // Balise ouvrante trouvée avant la fermante
      depth++
      currentIndex = nextOpen + tagName.length + 1
    } else {
      // Balise fermante trouvée
      depth--
      if (depth === 0) {
        content = trimmed.substring(openIndex, nextClose)
      }
      currentIndex = nextClose + closeTag.length
    }
  }

  // Parser les attributs
  const attributes: Record<string, any> = {}
  const properties: Record<string, any> = {}
  const events: Record<string, any> = {}

  if (attributesString) {
    const attrMatches = [
      ...attributesString.matchAll(/(\w+)=["']([^"']*?)["']/g),
    ]
    for (const match of attrMatches) {
      const [, name, value] = match

      // Gérer les signals/computed dans les attributs
      const signalMatch = value.match(/__SIGNAL_(\d+)__/)
      if (signalMatch) {
        const signalIndex = parseInt(signalMatch[1])
        if (name.startsWith('on')) {
          // Event handler
          events[name.slice(2).toLowerCase()] = values[signalIndex]
        } else {
          // Attribut ou propriété réactive
          if (
            [
              'value',
              'checked',
              'selected',
              'disabled',
              'textContent',
              'innerHTML',
            ].includes(name)
          ) {
            properties[name] = values[signalIndex]
          } else {
            attributes[name] = values[signalIndex]
          }
        }
      } else {
        // Attribut statique
        attributes[name] = value
      }
    }
  }

  // Parser les enfants de façon plus sûre
  const children = content ? parseChildrenSafe(content, values) : undefined

  return {
    tag: tagName,
    ...(Object.keys(attributes).length > 0 && { attributes }),
    ...(Object.keys(properties).length > 0 && { properties }),
    ...(Object.keys(events).length > 0 && { events }),
    ...(children && children.length > 0 && { children }),
  }
}

/**
 * Parse le contenu enfant d'un élément de façon sécurisée
 */
function parseChildrenSafe(
  content: string,
  values: any[]
): (RenderTemplate | string | any)[] {
  const children: (RenderTemplate | string | any)[] = []

  if (!content.trim()) {
    return children
  }

  // Nettoyer le contenu (supprimer commentaires et normaliser)
  let cleaned = content
    .replace(/<!--[\s\S]*?-->/g, '') // Supprimer les commentaires
    .trim()

  // Si le contenu ne contient pas de balises HTML, c'est du texte simple
  if (!cleaned.includes('<')) {
    const processed = processTextContent(cleaned, values)
    if (processed) {
      children.push(processed)
    }
    return children
  }

  // Parser plus robuste pour éviter la récursion infinie
  let remaining = cleaned
  let safetyCounter = 0
  const MAX_ITERATIONS = 1000 // Limite de sécurité plus haute

  while (remaining.length > 0 && safetyCounter < MAX_ITERATIONS) {
    safetyCounter++

    // Chercher la prochaine balise ouvrante
    const tagStart = remaining.indexOf('<')

    if (tagStart === -1) {
      // Plus de balises, le reste est du texte
      const processed = processTextContent(remaining, values)
      if (processed) {
        children.push(processed)
      }
      break
    }

    // S'il y a du texte avant la balise
    if (tagStart > 0) {
      const textBefore = remaining.substring(0, tagStart)
      const processed = processTextContent(textBefore, values)
      if (processed) {
        children.push(processed)
      }
    }

    // Extraire le nom de la balise
    const tagMatch = remaining.substring(tagStart).match(/^<(\w+)([^>]*?)>/)
    if (!tagMatch) {
      // Balise malformée, avancer d'un caractère
      remaining = remaining.substring(tagStart + 1)
      continue
    }

    const tagName = tagMatch[1]
    const fullOpenTag = tagMatch[0]

    // Vérifier si c'est une balise auto-fermante
    if (
      fullOpenTag.endsWith('/>') ||
      ['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName)
    ) {
      // Balise auto-fermante
      try {
        const selfClosingTemplate = parseHTMLToTemplate(
          fullOpenTag.replace('/>', '>'),
          values
        )
        children.push(selfClosingTemplate)
      } catch (error) {
        console.warn('Erreur lors du parsing balise auto-fermante:', error)
      }
      remaining = remaining.substring(tagStart + fullOpenTag.length)
      continue
    }

    // Chercher la balise fermante correspondante avec comptage de profondeur
    const closeTag = `</${tagName}>`
    let depth = 1
    let searchIndex = tagStart + fullOpenTag.length
    let closeIndex = -1

    while (depth > 0 && searchIndex < remaining.length) {
      const nextOpen = remaining.indexOf(`<${tagName}`, searchIndex)
      const nextClose = remaining.indexOf(closeTag, searchIndex)

      if (nextClose === -1) {
        // Pas de balise fermante trouvée
        break
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Vérifier que c'est bien une balise ouvrante (pas juste un texte qui contient le nom)
        const openMatch = remaining
          .substring(nextOpen)
          .match(/^<(\w+)([^>]*?)>/)
        if (openMatch && openMatch[1] === tagName) {
          depth++
          searchIndex = nextOpen + openMatch[0].length
        } else {
          searchIndex = nextOpen + 1
        }
      } else {
        depth--
        if (depth === 0) {
          closeIndex = nextClose
        }
        searchIndex = nextClose + closeTag.length
      }
    }

    if (closeIndex === -1) {
      // Pas de balise fermante, traiter comme du texte
      const processed = processTextContent(
        remaining.substring(tagStart),
        values
      )
      if (processed) {
        children.push(processed)
      }
      break
    }

    // Extraire l'élément complet
    const elementEnd = closeIndex + closeTag.length
    const elementHTML = remaining.substring(tagStart, elementEnd)

    // Parser cet élément (récursion contrôlée)
    try {
      const childTemplate = parseHTMLToTemplate(elementHTML, values)
      children.push(childTemplate)
    } catch (error) {
      // En cas d'erreur, traiter comme du texte
      console.warn('Erreur lors du parsing HTML:', error)
      const processed = processTextContent(elementHTML, values)
      if (processed) {
        children.push(processed)
      }
    }

    // Continuer avec le reste
    remaining = remaining.substring(elementEnd)
  }

  if (safetyCounter >= MAX_ITERATIONS) {
    console.warn('Limite de sécurité atteinte lors du parsing HTML')
  }

  return children
}

/**
 * Traiter le contenu texte qui peut contenir des signals
 */
function processTextContent(text: string, values: any[]): string | any {
  // Vérifier s'il y a des signals dans le texte
  const signalMatch = text.match(/__SIGNAL_(\d+)__/)
  if (signalMatch) {
    const signalIndex = parseInt(signalMatch[1])
    return values[signalIndex]
  }

  // Vérifier s'il y a des templates dans le texte
  const templateMatch = text.match(/__TEMPLATE_(\d+)__/)
  if (templateMatch) {
    const templateIndex = parseInt(templateMatch[1])
    return values[templateIndex]
  }

  return text
}

/**
 * Wrapper pour Fragment compatible avec JSX runtime
 * Accepte props.children et appelle fragment() avec spread
 */
function FragmentComponent(props?: { children?: any }): DocumentFragment {
  console.log('🔍 FragmentComponent called with props:', props)

  if (!props || !props.children) {
    console.log('  → No children, returning empty fragment')
    return document.createDocumentFragment()
  }

  // Convertir children en array si nécessaire
  const childrenArray = Array.isArray(props.children)
    ? props.children
    : [props.children]

  console.log('  → Calling fragment() with', childrenArray.length, 'children')

  // Appeler fragment() avec spread
  return fragment(...childrenArray)
}

export const render = Object.assign(renderFn, {
  // h,
  fragment: FragmentComponent,
  html,
})

// Export aussi fragment pour usage direct
export { fragment as fragmentSpread }
