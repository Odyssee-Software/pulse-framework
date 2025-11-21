/**
 * Outils de debug pour le graphe réactif Pulse
 * Inspiré de l'approche DOM-Graph avec visualisation complète des dépendances
 */

import type { Signal, Computed, Effect } from '../types'

// Registre global pour tracking des nodes réactifs
export const GraphRegistry = {
  nodes: new Set<ReactiveNode>(),
  id: 0,
  enabled: false
}

export interface ReactiveNode {
  __id?: number
  __type?: 'signal' | 'computed' | 'effect'
  __name?: string
  value?: any
  dirty?: boolean
  deps?: Set<any>
  subs?: Set<any>
  isSignal?: boolean
  isComputed?: boolean
  fn?: Function
}

/**
 * Enregistre un node dans le registre (à appeler lors de la création)
 */
export function registerNode(node: ReactiveNode, type: 'signal' | 'computed' | 'effect', name?: string): ReactiveNode {
  if (!GraphRegistry.enabled) return node
  
  node.__id = GraphRegistry.id++
  node.__type = type
  node.__name = name
  GraphRegistry.nodes.add(node)
  return node
}

/**
 * Désactive le tracking (cleanup)
 */
export function unregisterNode(node: ReactiveNode): void {
  GraphRegistry.nodes.delete(node)
}

/**
 * Active le système de debug
 */
export function enableDebug(): void {
  GraphRegistry.enabled = true
  console.log('🔍 Pulse Debug Mode: ENABLED')
}

/**
 * Désactive le système de debug
 */
export function disableDebug(): void {
  GraphRegistry.enabled = false
  GraphRegistry.nodes.clear()
  GraphRegistry.id = 0
  console.log('🔍 Pulse Debug Mode: DISABLED')
}

/**
 * Debug complet du graphe réactif
 * Affiche tous les nodes avec leurs dépendances et subscribers
 */
export function debugGraph(): void {
  if (!GraphRegistry.enabled) {
    console.warn('⚠️  Debug mode is not enabled. Call enableDebug() first.')
    return
  }

  console.group('🔎 Reactive Graph Debugger')
  console.log(`Total nodes: ${GraphRegistry.nodes.size}`)

  const nodes = [...GraphRegistry.nodes].sort((a, b) => (a.__id || 0) - (b.__id || 0))

  for (const node of nodes) {
    const label = `${node.__type?.toUpperCase()} #${node.__id}${node.__name ? ` (${node.__name})` : ''}`
    
    console.group(label)

    // Valeur ou statut
    if (node.isSignal || node.__type === 'signal') {
      console.log('value:', node.value)
    }
    
    if (node.__type === 'computed') {
      console.log('value:', node.value)
      console.log('dirty:', node.dirty ?? false)
    }
    
    if (node.__type === 'effect') {
      console.log('fn:', node.fn?.toString().substring(0, 100) + '...')
    }

    // Dépendances
    if (node.deps && node.deps.size > 0) {
      console.group(`deps (${node.deps.size}):`)
      for (const dep of node.deps) {
        const depNode = dep as ReactiveNode
        console.log(`→ ${depNode.__type} #${depNode.__id}${depNode.__name ? ` (${depNode.__name})` : ''}`)
      }
      console.groupEnd()
    } else {
      console.log('deps: (none)')
    }

    // Subscribers
    if (node.subs && node.subs.size > 0) {
      console.group(`subs (${node.subs.size}):`)
      for (const sub of node.subs) {
        const subNode = sub as ReactiveNode
        console.log(`← ${subNode.__type} #${subNode.__id}${subNode.__name ? ` (${subNode.__name})` : ''}`)
      }
      console.groupEnd()
    } else {
      console.log('subs: (none)')
    }

    console.groupEnd()
  }

  console.groupEnd()
}

/**
 * Affiche l'arbre du graphe réactif en profondeur
 * Commence par les effects (feuilles terminales) et remonte
 */
export function debugGraphTree(): void {
  if (!GraphRegistry.enabled) {
    console.warn('⚠️  Debug mode is not enabled. Call enableDebug() first.')
    return
  }

  console.group('🌳 Reactive Graph Tree')

  // Trouver les roots (effects ou nodes sans subscribers)
  const roots = [...GraphRegistry.nodes].filter(n => 
    n.__type === 'effect' || (n.subs && n.subs.size === 0)
  )

  console.log(`Roots found: ${roots.length}`)

  for (const root of roots) {
    printTree(root, '')
  }

  console.groupEnd()
}

function printTree(node: ReactiveNode, indent: string): void {
  const label = `${node.__type?.toUpperCase()} #${node.__id}${node.__name ? ` (${node.__name})` : ''}`
  const valueInfo = node.value !== undefined ? ` = ${JSON.stringify(node.value)}` : ''
  const dirtyInfo = node.dirty ? ' [DIRTY]' : ''
  
  console.log(`${indent}${label}${valueInfo}${dirtyInfo}`)

  if (node.deps && node.deps.size > 0) {
    const children = [...node.deps] as ReactiveNode[]
    for (const child of children) {
      printTree(child, indent + '  ')
    }
  }
}

/**
 * Trace la propagation du dirty-state à partir d'un signal
 * Utile pour comprendre comment un changement se propage
 */
export function debugDirtyPropagation(rootNode: ReactiveNode): void {
  if (!GraphRegistry.enabled) {
    console.warn('⚠️  Debug mode is not enabled. Call enableDebug() first.')
    return
  }

  console.group(`🔥 Dirty propagation from ${rootNode.__type?.toUpperCase()} #${rootNode.__id}`)

  const visited = new Set<ReactiveNode>()
  
  function walk(node: ReactiveNode, level: number = 0) {
    if (visited.has(node)) {
      console.log(`${'  '.repeat(level)}↻ ${node.__type} #${node.__id} (already visited)`)
      return
    }
    visited.add(node)

    const dirtyStatus = node.dirty ? '🔴 DIRTY' : '🟢 CLEAN'
    console.log(`${'  '.repeat(level)}${node.__type} #${node.__id}${node.__name ? ` (${node.__name})` : ''} ${dirtyStatus}`)

    if (node.subs) {
      for (const sub of node.subs) {
        walk(sub as ReactiveNode, level + 1)
      }
    }
  }

  walk(rootNode)

  console.groupEnd()
}

/**
 * Statistiques sur le graphe
 */
export function debugStats(): void {
  if (!GraphRegistry.enabled) {
    console.warn('⚠️  Debug mode is not enabled. Call enableDebug() first.')
    return
  }

  const signals = [...GraphRegistry.nodes].filter(n => n.__type === 'signal')
  const computed = [...GraphRegistry.nodes].filter(n => n.__type === 'computed')
  const effects = [...GraphRegistry.nodes].filter(n => n.__type === 'effect')
  const dirtyNodes = [...GraphRegistry.nodes].filter(n => n.dirty === true)

  console.group('📊 Graph Statistics')
  console.log(`Total nodes: ${GraphRegistry.nodes.size}`)
  console.log(`  - Signals: ${signals.length}`)
  console.log(`  - Computed: ${computed.length}`)
  console.log(`  - Effects: ${effects.length}`)
  console.log(`Dirty nodes: ${dirtyNodes.length}`)
  
  // Calcul de la profondeur moyenne
  let totalDepth = 0
  let leafCount = 0
  
  for (const node of GraphRegistry.nodes) {
    if (!node.subs || node.subs.size === 0) {
      leafCount++
      totalDepth += calculateDepth(node)
    }
  }
  
  const avgDepth = leafCount > 0 ? (totalDepth / leafCount).toFixed(2) : 0
  console.log(`Average depth: ${avgDepth}`)
  
  console.groupEnd()
}

function calculateDepth(node: ReactiveNode): number {
  if (!node.deps || node.deps.size === 0) return 0
  
  let maxDepth = 0
  for (const dep of node.deps) {
    const depNode = dep as ReactiveNode
    maxDepth = Math.max(maxDepth, calculateDepth(depNode) + 1)
  }
  
  return maxDepth
}

/**
 * Trouve un node par son ID
 */
export function findNode(id: number): ReactiveNode | undefined {
  return [...GraphRegistry.nodes].find(n => n.__id === id)
}

/**
 * Trouve tous les nodes par type
 */
export function findNodesByType(type: 'signal' | 'computed' | 'effect'): ReactiveNode[] {
  return [...GraphRegistry.nodes].filter(n => n.__type === type)
}

/**
 * Nettoie le registre (utile pour les tests)
 */
export function clearRegistry(): void {
  GraphRegistry.nodes.clear()
  GraphRegistry.id = 0
}
