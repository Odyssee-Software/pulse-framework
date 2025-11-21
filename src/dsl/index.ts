/**
 * Micro-DSL pour bindings déclaratifs DOM-first
 * Permet d'utiliser des attributs :text, :model, :attr, etc.
 * Inspiré de l'approche discutée dans gpt.md
 */

import type { Signal, Computed } from '../types'
import { computed, effect } from '../reactivity'
import { bindProperty, bindEvent } from '../dom'
import { bindEffectToElement } from '../reactivity'

/**
 * Compile une expression simple en fonction
 * Support: chemins de propriétés (user.name), expressions simples
 */
export function compileExpression(expr: string, context: Record<string, any> = {}): () => any {
  // Nettoyer l'expression
  const trimmed = expr.trim()
  
  // Si c'est un chemin de propriété simple (user.name)
  if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
    return () => {
      const parts = trimmed.split('.')
      let value: any = context
      
      for (const part of parts) {
        if (value == null) return undefined
        
        // Si c'est un signal ou computed, l'appeler
        if (typeof value[part] === 'function' && ('subscribe' in value[part] || value[part].isSignal)) {
          value = value[part]()
        } else {
          value = value[part]
        }
      }
      
      return value
    }
  }
  
  // Pour les expressions plus complexes, utiliser une fonction
  try {
    // Créer une fonction qui évalue l'expression dans le contexte
    const contextKeys = Object.keys(context)
    const contextValues = contextKeys.map(key => {
      const val = context[key]
      // Si c'est un signal/computed, retourner un wrapper qui l'appelle
      if (typeof val === 'function' && ('subscribe' in val || val.isSignal)) {
        return () => val()
      }
      // Sinon, retourner la valeur telle quelle (y compris les fonctions normales)
      return val
    })
    
    // Créer la fonction d'évaluation
    const fn = new Function(...contextKeys, `return ${trimmed}`)
    
    return () => {
      // Évaluer les signaux/computed seulement, pas les fonctions normales
      const evaluatedValues = contextValues.map(v => 
        typeof v === 'function' && v.length === 0 && v.name === '' ? v() : v
      )
      return fn(...evaluatedValues)
    }
  } catch (error) {
    console.warn(`Failed to compile expression: ${expr}`, error)
    return () => expr
  }
}

/**
 * Compile une expression et retourne un computed si elle contient des signaux
 */
export function makeComputed(expr: string, context: Record<string, any> = {}): Signal<any> | Computed<any> | (() => any) {
  const fn = compileExpression(expr, context)
  
  // Vérifier si l'expression utilise des signaux
  let hasSignals = false
  try {
    let currentlyTracking = false
    const testFn = computed(() => {
      currentlyTracking = true
      const result = fn()
      currentlyTracking = false
      return result
    })
    
    // Si le computed a des dépendances, c'est qu'il y a des signaux
    const test = testFn()
    if ((testFn as any).deps && (testFn as any).deps.size > 0) {
      hasSignals = true
    }
  } catch (e) {
    // Pas de signaux détectés
  }
  
  return hasSignals ? computed(fn) : fn
}

/**
 * Attache un binding DSL à un élément
 */
export function attachBinding(
  node: Element,
  dslType: string,
  expr: string,
  context: Record<string, any> = {}
): () => void {
  
  // :text="expr" - Bind textContent
  if (dslType === 'text') {
    const compute = makeComputed(expr, context)
    return bindEffectToElement(node, () => {
      const value = typeof compute === 'function' ? compute() : compute
      node.textContent = String(value ?? '')
    })
  }
  
  // :attr.name="expr" - Bind attribute
  if (dslType.startsWith('attr.')) {
    const attrName = dslType.split('.')[1]
    const compute = makeComputed(expr, context)
    
    return bindEffectToElement(node, () => {
      const value = typeof compute === 'function' ? compute() : compute
      if (value == null) {
        node.removeAttribute(attrName)
      } else {
        node.setAttribute(attrName, String(value))
      }
    })
  }
  
  // :prop.name="expr" - Bind property
  if (dslType.startsWith('prop.')) {
    const propName = dslType.split('.')[1]
    const compute = makeComputed(expr, context)
    
    return bindEffectToElement(node, () => {
      const value = typeof compute === 'function' ? compute() : compute
      ;(node as any)[propName] = value
    })
  }
  
  // :model="signalName" - Two-way binding
  if (dslType === 'model') {
    // Résoudre le signal depuis le contexte (sans l'appeler)
    const trimmed = expr.trim()
    let signalFn: any
    
    // Gérer les chemins simples (firstName, user.name, etc.)
    if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
      const parts = trimmed.split('.')
      let value: any = context
      
      for (const part of parts) {
        if (value == null) {
          console.warn(`:model cannot resolve path: ${trimmed}`)
          return () => {}
        }
        value = value[part]
      }
      
      signalFn = value
    } else {
      console.warn(`:model only supports simple property paths, got: ${expr}`)
      return () => {}
    }
    
    if (!signalFn || typeof signalFn !== 'function') {
      console.warn(`:model requires a signal, got:`, signalFn)
      return () => {}
    }
    
    // One-way: signal -> DOM
    const cleanup1 = bindEffectToElement(node, () => {
      const value = signalFn()
      ;(node as any).value = value ?? ''
    })
    
    // Reverse: DOM -> signal
    const handler = () => {
      signalFn((node as any).value)
    }
    
    node.addEventListener('input', handler)
    
    return () => {
      cleanup1()
      node.removeEventListener('input', handler)
    }
  }
  
  // :class.name="expr" - Toggle class
  if (dslType.startsWith('class.')) {
    const className = dslType.split('.')[1]
    const compute = makeComputed(expr, context)
    
    return bindEffectToElement(node, () => {
      const value = typeof compute === 'function' ? compute() : compute
      node.classList.toggle(className, !!value)
    })
  }
  
  // :show="expr" - Toggle display
  if (dslType === 'show') {
    const compute = makeComputed(expr, context)
    
    return bindEffectToElement(node, () => {
      const value = typeof compute === 'function' ? compute() : compute
      ;(node as HTMLElement).style.display = value ? '' : 'none'
    })
  }
  
  // :on.event="expr" - Event handler
  if (dslType.startsWith('on.')) {
    const eventName = dslType.split('.')[1]
    const trimmed = expr.trim()
    
    // Résoudre le handler depuis le contexte (sans l'exécuter)
    let handlerFn: any
    
    if (/^[a-zA-Z_$][\w.$]*$/.test(trimmed)) {
      // Chemin simple (submit, user.onClick, etc.)
      const parts = trimmed.split('.')
      let value: any = context
      
      for (const part of parts) {
        if (value == null) {
          console.warn(`:on.${eventName} cannot resolve path: ${trimmed}`)
          return () => {}
        }
        value = value[part]
      }
      
      handlerFn = value
    } else {
      // Expression complexe - utiliser compileExpression et l'évaluer
      const fn = compileExpression(trimmed, context)
      handlerFn = fn();
    }
    
    if (typeof handlerFn !== 'function') {
      console.warn(`:on.${eventName} requires a function, got:`, handlerFn)
      return () => {}
    }
    
    const handler = (event: Event) => {
      handlerFn(event)
    }
    
    return bindEvent(node, eventName, handler)
  }
  
  // Unknown DSL type
  console.warn(`Unknown DSL type: ${dslType}`)
  return () => {}
}

/**
 * Scanne un DOM tree et attache tous les bindings DSL
 * 
 * @param root - L'élément racine à scanner
 * @param context - Le contexte contenant les signaux et données
 * 
 * @example
 * ```typescript
 * const count = signal(0)
 * const context = { count }
 * 
 * // HTML: <div :text="count"></div>
 * scanDSL(document.body, context)
 * ```
 */
export function scanDSL(root: Element = document.body, context: Record<string, any> = {}): () => void {
  const cleanups: (() => void)[] = []
  const nodes = root.querySelectorAll('*')
  
  // Scanner le root lui-même
  const processNode = (node: Element) => {
    const attrs = [...node.attributes]
    
    for (const attr of attrs) {
      if (!attr.name.startsWith(':')) continue
      
      const dslType = attr.name.slice(1)  // "text", "attr.src", "model", etc.
      const expr = attr.value.trim()
      
      try {
        const cleanup = attachBinding(node, dslType, expr, context)
        cleanups.push(cleanup)
        
        // Retirer l'attribut DSL du DOM
        node.removeAttribute(attr.name)
      } catch (error) {
        console.error(`Error attaching DSL binding :${dslType}="${expr}"`, error)
      }
    }
  }
  
  // Traiter le root
  processNode(root)
  
  // Traiter tous les descendants
  nodes.forEach(processNode)
  
  // Retourner une fonction de nettoyage globale
  return () => {
    cleanups.forEach(cleanup => cleanup())
  }
}

/**
 * Helper pour créer un scope DSL avec auto-cleanup
 */
export function createDSLScope(root: Element, context: Record<string, any>) {
  const cleanup = scanDSL(root, context)
  
  return {
    cleanup,
    update: (newContext: Record<string, any>) => {
      cleanup()
      return scanDSL(root, { ...context, ...newContext })
    }
  }
}
