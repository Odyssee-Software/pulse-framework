import { createApp, signal, computed } from '../dist/index.js'

// Initialiser l'application
const app = createApp()

// === COMPTEUR ===
const count = signal(0)

app
  .bind('[data-counter]', 'textContent', count)
  .on('[data-increment]', 'click', () => count(count() + 1))
  .on('[data-decrement]', 'click', () => count(count() - 1))
  .on('[data-reset]', 'click', () => count(0))

// === TODO LIST ===
const todos = signal([
  { id: 1, text: 'Apprendre Pulse Framework', completed: false },
  { id: 2, text: 'Créer une app', completed: false }
])

const remainingCount = computed(() => {
  return todos().filter(todo => !todo.completed).length
})

// Fonction pour ajouter un todo
function addTodo() {
  const input = app.select('[data-todo-input]');
  const text = input.value.trim()
  
  if (text) {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    }
    todos([...todos(), newTodo])
    input.value = ''
  }
}

// Fonction pour toggle un todo
function toggleTodo(id) {
  todos(todos().map(todo => 
    todo.id === id 
      ? { ...todo, completed: !todo.completed }
      : todo
  ))
}

// Fonction pour supprimer un todo
function removeTodo(id) {
  todos(todos().filter(todo => todo.id !== id))
}

app
  .on('[data-add-todo]', 'click', addTodo)
  .on('[data-todo-input]', 'keypress', (e) => {
    if (e.key === 'Enter') addTodo()
  })
  .bind('[data-remaining-count]', 'textContent', remainingCount)
  .list('[data-todo-list]', todos, (todo) => {
    const fragment = document.createDocumentFragment()
    const div = document.createElement('div')
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`
    div.innerHTML = `
      <span>${todo.text}</span>
      <div>
        <button onclick="window.toggleTodo(${todo.id})">
          ${todo.completed ? 'Annuler' : 'Terminer'}
        </button>
        <button onclick="window.removeTodo(${todo.id})">Supprimer</button>
      </div>
    `
    fragment.appendChild(div)
    return fragment
  }, (todo) => todo.id)

// Exposer les fonctions globalement pour les boutons
window.toggleTodo = toggleTodo
window.removeTodo = removeTodo

// === AFFICHAGE CONDITIONNEL ===
const isVisible = signal(true)

app
  .on('[data-toggle-visibility]', 'click', () => isVisible(!isVisible()))

// Pour l'affichage conditionnel, nous allons utiliser une approche plus simple
const conditionalElement = document.querySelector('[data-conditional-content]')
if (conditionalElement) {
  const originalContent = conditionalElement.innerHTML
  app.effect(() => {
    if (isVisible()) {
      conditionalElement.style.display = ''
    } else {
      conditionalElement.style.display = 'none'
    }
  })
}

console.log('Pulse Framework exemple chargé!')
console.log('Signal count:', count())
console.log('Computed remaining:', remainingCount())