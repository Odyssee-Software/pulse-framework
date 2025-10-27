import type { Signal, Subscriber, Unsubscribe } from '../types'

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
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue
  const subscribers = new Set<Subscriber<T>>()

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
    for (const subscriber of subscribers) {
      subscriber(value)
    }
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

  return signalFn as Signal<T>
}

/**
 * Crée une valeur calculée réactive
 */
export function computed<T>(computeFn: () => T) {
  let value: T
  let isStale = true
  const subscribers = new Set<Subscriber<T>>()
  let dependencies = new Set<Unsubscribe>()

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

  return computedFn as typeof computedFn & { readonly value: T }
}

/**
 * Crée un effet qui s'exécute à chaque changement de ses dépendances
 */
export function effect(effectFn: () => void | (() => void)) {
  let cleanup: (() => void) | null = null
  let isActive = true

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
 */
export function batch(fn: () => void): void {
  fn()
}

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