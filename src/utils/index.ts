/**
 * Utilitaires pour le framework Pulse
 */

declare const __DEV__: boolean

/**
 * Vérifie si une valeur est un objet simple
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

/**
 * Clone profond d'un objet
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  return obj
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Logger de développement
 */
export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[Pulse]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn('[Pulse]', ...args)
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error('[Pulse]', ...args)
    }
  },
}

/**
 * Sélecteur de query sécurisé
 */
export function $(selector: string, context: Document | Element = document): Element | null {
  try {
    return context.querySelector(selector)
  } catch (error) {
    logger.error('Invalid selector:', selector, error)
    return null
  }
}

/**
 * Sélecteur multiple sécurisé
 */
export function $$(selector: string, context: Document | Element = document): Element[] {
  try {
    return Array.from(context.querySelectorAll(selector))
  } catch (error) {
    logger.error('Invalid selector:', selector, error)
    return []
  }
}