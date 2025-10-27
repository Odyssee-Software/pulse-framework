import type { Signal } from 'pulse-framework'
import type { ListItem } from '../types'
import { createElement, createSection, createButton, createControlsGrid } from '../utils/dom'
import { formatDate } from '../utils/helpers'
import { COLORS } from '../types'

export interface DynamicListComponentOptions {
  items: Signal<ListItem[]>
  onAddItem: () => void
  onShuffleItems: () => void
  onClearItems: () => void
}

export function createDynamicListComponent(options: DynamicListComponentOptions): HTMLElement {
  const { items, onAddItem, onShuffleItems, onClearItems } = options

  const section = createSection('Liste Dynamique')

  // Contrôles
  const controls = createControlsGrid(
    createButton('Ajouter élément', { 
      icon: 'plus',
      onClick: onAddItem,
      attributes: { 'data-add-item': '' }
    }),
    createButton('Mélanger', { 
      icon: 'shuffle',
      variant: 'secondary', 
      onClick: onShuffleItems,
      attributes: { 'data-shuffle-items': '' }
    }),
    createButton('Vider', { 
      icon: 'trash',
      variant: 'danger', 
      onClick: onClearItems,
      attributes: { 'data-clear-items': '' }
    })
  )

  // Container de la liste
  const listContainer = createElement('div', {
    className: 'list-container',
    attributes: { 'data-dynamic-list': '' }
  })

  section.appendChild(controls)
  section.appendChild(listContainer)

  return section
}

export function createListItem(item: ListItem): HTMLElement {
  const listItemElement = createElement('div', {
    className: 'list-item',
    style: {
      borderColor: COLORS[item.color as keyof typeof COLORS]
    },
    children: [
      createElement('h4', {
        textContent: item.title,
        style: {
          color: COLORS[item.color as keyof typeof COLORS]
        }
      }),
      createElement('p', {
        textContent: item.description,
        style: {
          margin: '0.5rem 0',
          color: '#666'
        }
      }),
      createElement('small', {
        textContent: `#${item.id} • ${formatDate(item.createdAt)}`,
        style: {
          color: '#999'
        }
      })
    ]
  })

  return listItemElement
}