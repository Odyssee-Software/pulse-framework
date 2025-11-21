import type { Signal, Computed } from '../types'
import { signal, computed, effect } from '../reactivity'
import { bindProperty, bindEvent, bindConditional, bindList } from '../dom'
import { $, $$, logger } from '../utils'
import { scanDSL } from '../dsl'

/**
 * Gestionnaire de scope d'application Pulse
 * Permet d'isoler les signaux et bindings pour éviter les collisions
 * Idéal pour les SPAs avec routing où chaque route/fragment a son propre scope
 * 
 * @example
 * ```typescript
 * // Route 1
 * const app1 = createApp('#view1')
 * const { count } = app1.setup(() => ({
 *   count: signal(0)
 * }))
 * app1.mount() // Scan DSL automatique
 * 
 * // Route 2 - pas de collision avec Route 1 !
 * const app2 = createApp('#view2')
 * const { count } = app2.setup(() => ({
 *   count: signal(100)
 * }))
 * app2.mount()
 * 
 * // Cleanup lors du changement de route
 * app1.unmount()
 * ```
 */
export class PulseApp {
  private cleanupFunctions: (() => void)[] = []
  private scope: Record<string, any> = {}
  private _isMounted = false

  constructor(private rootElement?: Element) {}

  /**
   * Configure le scope de l'app avec une fonction setup
   * Similaire à Vue Composition API
   */
  setup<T extends Record<string, any>>(setupFn: () => T): T {
    this.scope = setupFn()
    return this.scope as T
  }

  /**
   * Monte l'application et scan le DSL automatiquement
   */
  mount(element?: Element): this {
    if (this._isMounted) {
      logger.warn('App already mounted')
      return this
    }

    const root = element || this.rootElement
    if (!root) {
      logger.error('No root element provided for mount')
      return this
    }

    this.rootElement = root
    
    // Scanner le DSL avec le scope
    if (Object.keys(this.scope).length > 0) {
      const cleanup = scanDSL(root, this.scope)
      this.cleanupFunctions.push(cleanup)
    }

    this._isMounted = true
    return this
  }

  /**
   * Démonte l'application et nettoie tous les bindings
   * Essentiel pour éviter les memory leaks lors des changements de route
   */
  unmount(): void {
    this.destroy()
    this._isMounted = false
  }

  /**
   * Accède au scope de l'app (signaux, computed, handlers)
   */
  getScope(): Record<string, any> {
    return this.scope
  }

  /**
   * Vérifie si l'app est montée
   */
  get isMounted(): boolean {
    return this._isMounted
  }

  /**
   * Crée un signal (shortcut vers l'API globale)
   */
  signal<T>(initialValue: T): Signal<T> {
    return signal(initialValue)
  }

  /**
   * Crée une valeur calculée (shortcut vers l'API globale)
   */
  computed<T>(computeFn: () => T): Computed<T> {
    return computed(computeFn)
  }

  /**
   * Crée un effet (shortcut vers l'API globale)
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
 * Crée une nouvelle application Pulse avec scope isolé
 * 
 * @example
 * ```typescript
 * // Approche simple avec setup()
 * const app = createApp('#root')
 * app.setup(() => ({
 *   count: signal(0),
 *   increment: () => count(count() + 1)
 * }))
 * app.mount()
 * 
 * // Ou direct
 * const app = createApp()
 * const count = signal(0)
 * app.mount(document.getElementById('root')!)
 * scanDSL(document.getElementById('root')!, { count })
 * ```
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