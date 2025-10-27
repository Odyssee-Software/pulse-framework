import type { Signal } from 'pulse-framework'
import { createElement, createSection, createButton, createControlsGrid, createStatsGrid } from '../utils/dom'

export interface MemoryTestComponentOptions {
  createdCount: Signal<number>
  signalUpdates: Signal<number>
  globalState: Signal<number>
  onCreateElements: () => void
  onRemoveElements: () => void
  onUpdateSignal: () => void
  onForceGC: () => void
}

export function createMemoryTestComponent(options: MemoryTestComponentOptions): HTMLElement {
  const { 
    createdCount, 
    signalUpdates, 
    globalState, 
    onCreateElements, 
    onRemoveElements, 
    onUpdateSignal, 
    onForceGC 
  } = options

  const section = createSection('Test de Gestion Mémoire')

  // Description
  const description = createElement('p', {
    textContent: 'Ce test vérifie que les bindings sont correctement nettoyés quand les éléments DOM sont supprimés.',
    style: { marginBottom: '1rem' }
  })

  // Statistiques
  const createdCountElement = createElement('span', { 
    textContent: '0',
    attributes: { 'data-created-count': '' }
  })
  const signalUpdatesElement = createElement('span', { 
    textContent: '0',
    attributes: { 'data-signal-updates': '' }
  })
  const globalStateElement = createElement('span', { 
    textContent: '0',
    attributes: { 'data-global-state': '' }
  })

  const statsGrid = createStatsGrid([
    { label: 'Éléments créés', value: createdCountElement },
    { label: 'Signal mis à jour', value: signalUpdatesElement },
    { label: 'État global', value: globalStateElement }
  ])

  // Contrôles
  const controls = createControlsGrid(
    createButton('Créer 10 éléments liés', { 
      icon: 'layers',
      onClick: onCreateElements,
      attributes: { 'data-create-elements': '' }
    }),
    createButton('Supprimer tous les éléments', { 
      icon: 'trash',
      variant: 'danger', 
      onClick: onRemoveElements,
      attributes: { 'data-remove-elements': '' }
    }),
    createButton('Mettre à jour le signal global', { 
      icon: 'activity',
      variant: 'secondary', 
      onClick: onUpdateSignal,
      attributes: { 'data-update-signal': '' }
    }),
    createButton('Forcer le Garbage Collection', { 
      icon: 'cpu',
      variant: 'secondary', 
      onClick: onForceGC,
      attributes: { 'data-force-gc': '' }
    })
  )

  // Container pour les éléments dynamiques
  const dynamicContainer = createElement('div', {
    attributes: { 'data-dynamic-container': '' },
    style: {
      marginTop: '1rem',
      minHeight: '100px',
      border: '2px dashed #e9ecef',
      borderRadius: '8px',
      padding: '1rem'
    }
  })

  // Informations
  const infoBox = createElement('div', {
    style: {
      background: '#f8f9fa',
      padding: '1rem',
      borderRadius: '4px',
      marginTop: '1rem',
      fontSize: '0.9rem',
      color: '#666'
    },
    children: [
      createElement('h4', { textContent: 'Informations' }),
      createElement('p', { textContent: 'Les éléments créés sont automatiquement liés au signal global. Quand vous les supprimez, les bindings doivent être automatiquement nettoyés grâce à WeakMap, WeakRef et FinalizationRegistry.' }),
      createElement('p', { textContent: 'Surveillez la console pour voir les logs de nettoyage automatique.' })
    ]
  })

  section.appendChild(description)
  section.appendChild(statsGrid)
  section.appendChild(controls)
  section.appendChild(dynamicContainer)
  section.appendChild(infoBox)

  return section
}

export function createMemoryTestElement(id: number, globalState: Signal<number>): HTMLElement {
  const element = createElement('div', {
    className: 'dynamic-content',
    attributes: { 'data-element-id': id.toString() },
    style: {
      background: 'white',
      padding: '10px',
      margin: '5px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      display: 'inline-block'
    },
    textContent: `Élément ${id} - État: ${globalState()}`
  })

  return element
}