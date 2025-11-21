import type { Signal, Subscriber, Unsubscribe } from '../types'
import { registerNode, GraphRegistry } from '../debug'
import { schedule } from '../scheduler'

let currentEffect: (() => void) | null = null
const effectStack: (() => void)[] = []

// Gestion de la mémoire pour éviter les fuites
const nodeBindings = new WeakMap<Element, Set<() => void>>()
const cleanupRegistry = new FinalizationRegistry((cleanup: () => void) => {
  cleanup()
})

/**
 * Crée un signal réactif
 */
export function signal<T>(initialValue: T, debugName?: string): Signal<T> {
  let value = initialValue
  const subscribers = new Set<Subscriber<T>>()
  const scheduledNotifications = new Set<Subscriber<T>>()
  let isNotifying = false

  function signalFn(): T
  function signalFn(newValue: T): void
  function signalFn(newValue?: T): T | void {
    if (arguments.length === 0) {
      // Lecture - enregistrer l'effet courant comme dépendance
      if (currentEffect) {
        subscribers.add(currentEffect)
      }
      return value
    } else {
      // Écriture - notifier les abonnés si la valeur change
      if (!Object.is(value, newValue)) {
        value = newValue!
        notifySubscribers()
      }
    }
  }

  function notifySubscribers(): void {
    if (isNotifying) return
    
    // Planifier la notification des subscribers
    for (const subscriber of subscribers) {
      scheduledNotifications.add(subscriber)
    }
    
    schedule(() => {
      if (isNotifying) return
      isNotifying = true
      
      try {
        const toNotify = [...scheduledNotifications]
        scheduledNotifications.clear()
        
        for (const subscriber of toNotify) {
          subscriber(value)
        }
      } finally {
        isNotifying = false
      }
    })
  }

  function subscribe(subscriber: Subscriber<T>): Unsubscribe {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  Object.defineProperty(signalFn, 'value', {
    get: () => value,
    enumerable: true,
    configurable: false,
  })

  signalFn.subscribe = subscribe
  
  // Instrumentation debug
  if (GraphRegistry.enabled) {
    const node = signalFn as any
    node.isSignal = true
    node.value = value
    node.subs = subscribers
    registerNode(node, 'signal', debugName)
  }

  return signalFn as Signal<T>
}

/**
 * Crée une valeur calculée réactive
 */
export function computed<T>(computeFn: () => T, debugName?: string) {
  let value: T
  let isStale = true
  const subscribers = new Set<Subscriber<T>>()
  let dependencies = new Set<Unsubscribe>()
  const deps = new Set<any>()

  function computedFn(): T {
    if (currentEffect) {
      subscribers.add(currentEffect)
    }

    if (isStale) {
      // Nettoyer les anciennes dépendances
      for (const unsubscribe of dependencies) {
        unsubscribe()
      }
      dependencies.clear()
      deps.clear()

      // Calculer la nouvelle valeur et enregistrer les dépendances
      const previousEffect = currentEffect
      currentEffect = invalidate
      
      try {
        value = computeFn()
        isStale = false
      } finally {
        currentEffect = previousEffect
      }
    }

    return value
  }

  function invalidate(): void {
    if (!isStale) {
      isStale = true
      for (const subscriber of subscribers) {
        subscriber(value)
      }
    }
  }

  function subscribe(subscriber: Subscriber<T>): Unsubscribe {
    subscribers.add(subscriber)
    return () => subscribers.delete(subscriber)
  }

  Object.defineProperty(computedFn, 'value', {
    get: () => computedFn(),
    enumerable: true,
    configurable: false,
  })

  computedFn.subscribe = subscribe
  
  // Instrumentation debug
  if (GraphRegistry.enabled) {
    const node = computedFn as any
    node.dirty = isStale
    node.deps = deps
    node.subs = subscribers
    node.fn = computeFn
    registerNode(node, 'computed', debugName)
  }

  return computedFn as typeof computedFn & { readonly value: T }
}

/**
 * Crée un effet qui s'exécute à chaque changement de ses dépendances
 */
export function effect(effectFn: () => void | (() => void), debugName?: string) {
  let cleanup: (() => void) | null = null
  let isActive = true
  const deps = new Set<any>()

  function runEffect(): void {
    if (!isActive) return

    // Nettoyer l'effet précédent
    if (cleanup) {
      cleanup()
      cleanup = null
    }

    // Exécuter l'effet
    const previousEffect = currentEffect
    currentEffect = runEffect
    effectStack.push(runEffect)

    try {
      const result = effectFn()
      if (typeof result === 'function') {
        cleanup = result
      }
    } finally {
      effectStack.pop()
      currentEffect = previousEffect
    }
  }

  function destroy(): void {
    isActive = false
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }
  
  // Instrumentation debug
  if (GraphRegistry.enabled) {
    const node = runEffect as any
    node.deps = deps
    node.subs = new Set()
    node.fn = effectFn
    registerNode(node, 'effect', debugName)
  }

  // Exécuter l'effet immédiatement
  runEffect()

  return {
    destroy,
    get isActive() {
      return isActive
    },
  }
}

/**
 * Execute une fonction en batch pour éviter les mises à jour multiples
 * Utilise le scheduler pour regrouper automatiquement les updates
 */
export { batch, flush } from '../scheduler'

/**
 * Lie un effet à un élément DOM avec gestion automatique de la mémoire
 */
export function bindEffectToElement(
  element: Element,
  effectFn: () => void | (() => void)
): () => void {
  const elementRef = new WeakRef(element)
  let cleanup: (() => void) | null = null
  let isActive = true

  function runEffect(): void {
    const el = elementRef.deref()
    if (!el || !isActive) {
      // L'élément a été collecté ou l'effet désactivé
      return
    }

    // Nettoyer l'effet précédent
    if (cleanup) {
      cleanup()
      cleanup = null
    }

    // Exécuter l'effet
    const previousEffect = currentEffect
    currentEffect = runEffect
    effectStack.push(runEffect)

    try {
      const result = effectFn()
      if (typeof result === 'function') {
        cleanup = result
      }
    } finally {
      effectStack.pop()
      currentEffect = previousEffect
    }
  }

  function destroy(): void {
    isActive = false
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    
    // Retirer ce binding de l'élément s'il existe encore
    const el = elementRef.deref()
    if (el && nodeBindings.has(el)) {
      nodeBindings.get(el)?.delete(runEffect)
    }
  }

  // Enregistrer ce binding sur l'élément
  if (!nodeBindings.has(element)) {
    nodeBindings.set(element, new Set())
  }
  nodeBindings.get(element)!.add(runEffect)

  // Enregistrer le nettoyage automatique
  cleanupRegistry.register(element, destroy)

  // Exécuter l'effet immédiatement
  runEffect()

  return destroy
}