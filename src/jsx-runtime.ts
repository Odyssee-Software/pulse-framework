/**
 * Runtime JSX pour Pulse Framework
 * Support pour la nouvelle transformation JSX de TypeScript
 */

import { render } from './render'
import type { RenderTemplate } from './render'

/**
 * Fonction JSX principale
 * @param type - Le nom de la balise HTML ou un composant fonctionnel
 * @param props - Les propriétés (peut contenir children)
 * @param children - Enfants passés en argument (JSX transform classique)
 */
export function jsx(
  type: string | Function,
  props: any,
  ...children: any[]
): HTMLElement | DocumentFragment {
  // Si type est une fonction (composant fonctionnel), l'appeler avec les props
  if (typeof type === 'function') {
    // Préparer les props avec les enfants
    const componentProps = {
      ...props,
      children:
        props?.children !== undefined
          ? props.children
          : children.length > 0
            ? children
            : undefined,
    }

    // Appeler le composant fonctionnel
    return type(componentProps)
  }

  // À partir d'ici, type est forcément une string (balise HTML)
  // Séparer les props en attributs, propriétés et événements selon les conventions Pulse
  const attributes: Record<string, any> = {}
  const properties: Record<string, any> = {}
  const events: Record<string, any> = {}

  // Gérer les enfants : priorité à props.children, sinon utiliser ...children
  let finalChildren: any[] = []

  if (props?.children !== undefined) {
    // Les enfants viennent de props.children (nouvelle transformation JSX)
    finalChildren = Array.isArray(props.children)
      ? props.children
      : [props.children]
  } else if (children.length > 0) {
    // Les enfants viennent de ...children (transformation JSX classique)
    finalChildren = children
  }

  Object.entries(props || {}).forEach(([key, value]) => {
    // Ignorer 'children' car déjà géré
    if (key === 'children') {
      return
    }

    if (key.startsWith('on') && typeof value === 'function') {
      // Événements (onClick -> click)
      const eventName = key.slice(2).toLowerCase()
      events[eventName] = value
    } else if (key === 'className') {
      // className devient l'attribut class
      attributes.class = value
    } else if (key === 'htmlFor') {
      // htmlFor devient l'attribut for
      attributes.for = value
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      // Attributs (valeurs primitives)
      attributes[key] = value
    } else {
      // Propriétés (objets, fonctions, signals)
      properties[key] = value
    }
  })

  const template: RenderTemplate = {
    tag: type,
    ...(Object.keys(attributes).length > 0 && { attributes }),
    ...(Object.keys(properties).length > 0 && { properties }),
    ...(Object.keys(events).length > 0 && { events }),
    ...(finalChildren.length > 0 && { children: finalChildren }),
  }

  return render(template)
}

export const jsxs = jsx
export const jsxDEV = jsx

/**
 * Fragment JSX pour les éléments sans wrapper
 * Permet d'utiliser <></> ou <Fragment> en JSX
 */
export function Fragment(props: { children?: any[] }): DocumentFragment {
  const fragment = document.createDocumentFragment()

  if (props?.children) {
    const childrenArray = Array.isArray(props.children)
      ? props.children
      : [props.children]
    childrenArray.forEach(child => {
      if (typeof child === 'string') {
        fragment.appendChild(document.createTextNode(child))
      } else if (child instanceof Node) {
        fragment.appendChild(child)
      } else if (child && typeof child === 'object' && 'tag' in child) {
        // RenderTemplate
        fragment.appendChild(render(child))
      }
    })
  }

  return fragment
}
