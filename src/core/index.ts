import type { Signal, Computed } from '../types'
import { signal, computed, effect } from '../reactivity'
import { bindProperty, bindEvent, bindConditional, bindList } from '../dom'
import { $, $$, logger } from '../utils'

/**
 * API principale du framework Pulse
 */
export class PulseApp {
  private cleanupFunctions: (() => void)[] = []

  constructor(private rootElement?: Element) {}

  /**
   * Crée un signal
   */
  signal<T>(initialValue: T): Signal<T> {
    return signal(initialValue)
  }

  /**
   * Crée une valeur calculée
   */
  computed<T>(computeFn: () => T): Computed<T> {
    return computed(computeFn)
  }

  /**
   * Crée un effet
   */
  effect(effectFn: () => void | (() => void)) {
    const effectCleanup = effect(effectFn)
    this.cleanupFunctions.push(effectCleanup.destroy)
    return effectCleanup
  }

  /**
   * Lie une propriété d'élément
   */
  bind(
    selector: string | Element,
    property: string,
    signalOrComputed: Signal | Computed,
    transform?: (value: any) => any
  ): this {
    const element = typeof selector === 'string' 
      ? $(selector, this.rootElement)
      : selector

    if (!element) {
      logger.warn(`Element not found for selector: ${selector}`)
      return this
    }

    const cleanup = bindProperty(element, property, signalOrComputed, transform)
    this.cleanupFunctions.push(cleanup)
    return this
  }

  /**
   * Lie un événement
   */
  on(
    selector: string | Element,
    event: string,
    handler: (event: Event) => void
  ): this {
    const element = typeof selector === 'string'
      ? $(selector, this.rootElement)
      : selector

    if (!element) {
      logger.warn(`Element not found for selector: ${selector}`)
      return this
    }

    const cleanup = bindEvent(element, event, handler)
    this.cleanupFunctions.push(cleanup)
    return this
  }

  /**
   * Rendu conditionnel
   */
  if(
    selector: string | Element,
    condition: Signal<boolean> | Computed<boolean>,
    template: string | DocumentFragment
  ): this {
    const element = typeof selector === 'string'
      ? $(selector, this.rootElement)
      : selector

    if (!element) {
      logger.warn(`Element not found for selector: ${selector}`)
      return this
    }

    const templateFragment = typeof template === 'string'
      ? this.createTemplateFromString(template)
      : template

    const cleanup = bindConditional(element, condition, templateFragment)
    this.cleanupFunctions.push(cleanup)
    return this
  }

  /**
   * Rendu de liste
   */
  list<T>(
    selector: string | Element,
    items: Signal<T[]> | Computed<T[]>,
    template: string | ((item: T, index: number) => DocumentFragment),
    keyFn?: (item: T, index: number) => string | number
  ): this {
    const container = typeof selector === 'string'
      ? $(selector, this.rootElement)
      : selector

    if (!container) {
      logger.warn(`Container not found for selector: ${selector}`)
      return this
    }

    const templateFn = typeof template === 'string'
      ? (item: T, _index: number) => this.createTemplateFromString(
          template.replace(/\{\{(\w+)\}\}/g, (_, key) => (item as any)[key])
        )
      : template

    const cleanup = bindList(container, items, templateFn, keyFn)
    this.cleanupFunctions.push(cleanup)
    return this
  }

  /**
   * Sélectionne un élément
   */
  select(selector: string): Element | null {
    return $(selector, this.rootElement)
  }

  /**
   * Sélectionne plusieurs éléments
   */
  selectAll(selector: string): Element[] {
    return $$(selector, this.rootElement)
  }

  /**
   * Nettoie tous les bindings
   */
  destroy(): void {
    for (const cleanup of this.cleanupFunctions) {
      cleanup()
    }
    this.cleanupFunctions = []
  }

  /**
   * Crée un fragment de template à partir d'une string HTML
   */
  private createTemplateFromString(html: string): DocumentFragment {
    const template = document.createElement('template')
    template.innerHTML = html.trim()
    return template.content.cloneNode(true) as DocumentFragment
  }
}

/**
 * Crée une nouvelle application Pulse
 */
export function createApp(rootSelector?: string | Element): PulseApp {
  const rootElement = typeof rootSelector === 'string'
    ? $(rootSelector)
    : rootSelector

  return new PulseApp(rootElement || undefined)
}

// Réexporter les fonctions utilitaires
export { signal, computed, effect, bindEffectToElement } from '../reactivity'
export { bindProperty, bindEvent, bindConditional, bindList } from '../dom'
export * from '../utils'