/**
 * Point d'entrée principal du framework Pulse
 * Micro-framework DOM-first réactif, "no diff, only sync"
 */

export * from './core'
export * from './reactivity'
export * from './dom'
export * from './utils'
export type * from './types'

// API par défaut
export { createApp, PulseApp } from './core'
export { signal, computed, effect, batch } from './reactivity'