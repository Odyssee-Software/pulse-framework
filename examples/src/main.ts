import { createApp } from 'pulse-framework'
import { createElement, applyGlobalStyles } from './utils/dom'

// Composants autonomes
import { createCounterComponent } from './components/Counter'
import { createTodoComponent } from './components/Todo'
import { createConditionalComponent } from './components/Conditional'

/**
 * Application simplifiée avec des composants autonomes
 */
class SimplePulseApp {

  private app = createApp()

  constructor() {
    this.init()
  }

  private init(): void {
    console.log('🚀 Initialisation de Pulse Framework...')
    
    // Appliquer les styles globaux
    applyGlobalStyles()
    
    // Créer l'interface
    this.createUI()
    
    console.log('✅ Application prête !')
    this.logWelcomeMessage()
  }

  private createUI(): void {

    const appElement = document.getElementById('app')
    if (!appElement) {
      throw new Error('Element #app not found')
    }

    // Effacer le contenu de loading
    appElement.innerHTML = ''

    // Header
    const header = createElement('div', {
      className: 'header',
      children: [
        createElement('h1', { textContent: 'Pulse Framework' }),
        createElement('p', { textContent: 'Exemples avec Composants Autonomes' })
      ]
    })

    // Container principal
    const container = createElement('div', {
      className: 'container'
    })

    // Créer les composants autonomes
    const counterComponent = createCounterComponent({
      initialValue: 10,
      onCountChange: (count) => console.log('Compteur changé:', count)
    })

    const todoComponent = createTodoComponent({
      initialTodos: [
        {
          id: 1,
          text: 'Découvrir Pulse Framework',
          completed: false,
          createdAt: new Date()
        },
        {
          id: 2,
          text: 'Créer des composants autonomes',
          completed: true,
          createdAt: new Date()
        }
      ],
      onTodosChange: (todos) => console.log('Todos changés:', todos.length, 'tâches')
    })

    const conditionalComponent = createConditionalComponent({
      initialVisible: true,
      initialAnimated: false,
      onVisibilityChange: (visible) => console.log('Visibilité basculée:', visible),
      onAnimationChange: (animated) => console.log('Animation basculée:', animated)
    })

    // Assembler l'interface
    container.appendChild(counterComponent)
    container.appendChild(todoComponent)
    container.appendChild(conditionalComponent)

    appElement.appendChild(header)
    appElement.appendChild(container)
  }

  private logWelcomeMessage(): void {
    console.log(`
🎉 Pulse Framework Ready!
    
Les composants sont maintenant autonomes :
- Compteur : Gère son propre état (count, totalClicks)  
- Todos : Gère sa propre liste de tâches
- Chaque composant expose des callbacks pour communiquer avec l'extérieur

Ouvrez la console pour voir les logs des changements !
    `)
  }
}

// Initialiser l'application
new SimplePulseApp()