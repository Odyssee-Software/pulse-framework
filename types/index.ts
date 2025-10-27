/**
 * Types de base pour le framework Pulse
 */

export type Subscriber<T = any> = (value: T) => void
export type Unsubscribe = () => void

export interface Signal<T = any> {
  (): T
  (value: T): void
  readonly value: T
  subscribe(subscriber: Subscriber<T>): Unsubscribe
}

export interface Computed<T = any> {
  (): T
  readonly value: T
  subscribe(subscriber: Subscriber<T>): Unsubscribe
}

export interface Effect {
  destroy(): void
  readonly isActive: boolean
}

export type ElementBindingValue = string | number | boolean | null | undefined
export type AttributeValue = ElementBindingValue | Record<string, any>

export interface ElementBinding {
  element: Element
  property: string
  signal: Signal | Computed
  transform?: (value: any) => any
}

export interface EventBinding {
  element: Element
  event: string
  handler: (event: Event) => void
}

export interface ConditionalBinding {
  element: Element
  condition: Signal<boolean> | Computed<boolean>
  template: DocumentFragment
  placeholder: Comment
}

export interface ListBinding<T = any> {
  element: Element
  items: Signal<T[]> | Computed<T[]>
  template: (item: T, index: number) => DocumentFragment
  keyFn?: (item: T, index: number) => string | number
}

declare global {
  const __DEV__: boolean
}