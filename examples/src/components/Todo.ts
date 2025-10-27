import { signal, computed, bindProperty } from 'pulse-framework'
import type { Signal, Computed } from 'pulse-framework'
import type { Todo } from '../types'
import { createElement, createSection, createButton, createControlsGrid, createInput } from '../utils/dom'
import { formatDate, generateId } from '../utils/helpers'

export interface TodoComponentOptions {
  initialTodos?: Todo[]
  onTodosChange?: (todos: Todo[]) => void
}

export function createTodoComponent(options: TodoComponentOptions = {}): HTMLElement {
  const { initialTodos = [], onTodosChange } = options

  // État local du composant
  const todos = signal<Todo[]>(initialTodos)
  const remainingCount = computed(() => 
    todos().filter(todo => !todo.completed).length
  )

  const section = createSection('Liste de Todos')

  // Input pour nouveau todo
  const todoInput = createInput({
    placeholder: 'Nouvelle tâche...',
    attributes: { 'data-todo-input': '' }
  }) as HTMLInputElement

  // Gestionnaires d'événements locaux
  const addTodo = () => {
    const text = todoInput.value.trim()
    if (text) {
      const newTodo: Todo = {
        id: generateId(),
        text,
        completed: false,
        createdAt: new Date()
      }
      todos([...todos(), newTodo])
      todoInput.value = ''
      onTodosChange?.(todos())
    }
  }

  const toggleTodo = (id: number) => {
    todos(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
    onTodosChange?.(todos())
  }

  const removeTodo = (id: number) => {
    todos(todos().filter(todo => todo.id !== id))
    onTodosChange?.(todos())
  }

  const clearCompleted = () => {
    todos(todos().filter(todo => !todo.completed))
    onTodosChange?.(todos())
  }

  const toggleAll = () => {
    const allCompleted = todos().every(todo => todo.completed)
    todos(todos().map(todo => ({ ...todo, completed: !allCompleted })))
    onTodosChange?.(todos())
  }

  // Gestionnaire d'événement pour Enter
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  })

  // Contrôles
  const controls = createControlsGrid(
    createButton('Ajouter', { 
      icon: 'plus',
      onClick: addTodo,
      attributes: { 'data-add-todo': '' }
    }),
    createButton('Supprimer terminées', { 
      icon: 'trash',
      variant: 'danger', 
      onClick: clearCompleted,
      attributes: { 'data-clear-completed': '' }
    }),
    createButton('Tout basculer', { 
      icon: 'check',
      variant: 'secondary', 
      onClick: toggleAll,
      attributes: { 'data-toggle-all': '' }
    })
  )

  // Liste des todos
  const todoList = createElement('div', {
    className: 'todo-list',
    attributes: { 'data-todo-list': '' },
    style: {
      maxHeight: '300px',
      overflowY: 'auto'
    }
  })

  // Compteur de tâches restantes
  const remainingCountElement = createElement('strong', { 
    textContent: remainingCount().toString(),
    attributes: { 'data-remaining-count': '' }
  })
  
  const remainingCounter = createElement('p', {
    children: [
      'Tâches restantes: ',
      remainingCountElement
    ]
  })

  // Binding réactif pour le compteur
  bindProperty(remainingCountElement, 'textContent', remainingCount)

  // Rendu réactif de la liste des todos
  const renderTodos = () => {
    todoList.innerHTML = ''
    todos().forEach(todo => {
      const todoElement = createTodoItem(todo, toggleTodo, removeTodo)
      todoList.appendChild(todoElement)
    })
  }

  // Rendu initial et binding réactif
  renderTodos()
  
  // Effet pour re-rendre la liste quand les todos changent
  const unsubscribe = todos.subscribe(() => {
    renderTodos()
  })

  section.appendChild(todoInput)
  section.appendChild(controls)
  section.appendChild(todoList)
  section.appendChild(remainingCounter)

  return section
}

export function createTodoItem(
  todo: Todo, 
  onToggle: (id: number) => void, 
  onRemove: (id: number) => void
): HTMLElement {
  const todoItem = createElement('div', {
    className: `todo-item ${todo.completed ? 'completed' : ''}`,
    children: [
      createElement('div', {
        className: 'todo-content',
        children: [
          createElement('strong', { textContent: todo.text }),
          createElement('small', {
            textContent: `Créé le ${formatDate(todo.createdAt)}`,
            style: {
              display: 'block',
              color: '#666',
              marginTop: '4px'
            }
          })
        ]
      }),
      createElement('div', {
        className: 'todo-actions',
        children: [
          createButton('', {
            icon: todo.completed ? 'refresh' : 'check',
            variant: 'secondary',
            onClick: () => onToggle(todo.id)
          }),
          createButton('', {
            icon: 'x',
            variant: 'danger',
            onClick: () => onRemove(todo.id)
          })
        ]
      })
    ]
  })

  return todoItem
}