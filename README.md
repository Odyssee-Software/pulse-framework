# Pulse Framework

Micro-framework DOM-first réactif, "no diff, only sync".

Pulse est un framework JavaScript/TypeScript ultraléger conçu pour créer des interfaces utilisateur réactives en manipulant directement le DOM, sans utiliser de virtual DOM ou de système de diff.

## Philosophie

- **DOM-first** : Manipulation directe du DOM pour des performances optimales
- **No diff, only sync** : Synchronisation directe des données avec l'interface
- **Réactivité fine** : Mise à jour uniquement des éléments qui ont changé
- **API simple** : Syntaxe intuitive et minimaliste
- **TypeScript natif** : Support TypeScript complet avec types stricts

## Installation

```bash
npm install pulse-framework
```

## Utilisation de base

```typescript
import { createApp, signal, computed } from 'pulse-framework'

// Créer une application
const app = createApp()

// Créer des signaux réactifs
const count = signal(0)
const doubled = computed(() => count() * 2)

// Lier les données au DOM
app
  .bind('#counter', 'textContent', count)
  .bind('#doubled', 'textContent', doubled)
  .on('#increment', 'click', () => count(count() + 1))
```

## API principale

### Signaux

```typescript
// Signal simple
const name = signal('John')
name('Jane') // Modification
console.log(name()) // Lecture

// Valeur calculée
const greeting = computed(() => `Hello, ${name()}!`)
```

### Bindings DOM

```typescript
// Propriétés
app.bind('#element', 'textContent', signal)
app.bind('#element', 'className', signal)
app.bind('#element', 'style', signal)

// Événements
app.on('#button', 'click', handler)
app.on('#input', 'input', handler)

// Rendu conditionnel
app.if('#element', condition, template)

// Listes
app.list('#container', items, itemTemplate)
```

### Effets

```typescript
import { effect } from 'pulse-framework'

// Effet qui s'exécute à chaque changement
effect(() => {
  console.log('Count:', count())
})

// Avec nettoyage
effect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)
  
  // Fonction de nettoyage
  return () => clearInterval(timer)
})
```

## Exemples

### Compteur simple

```typescript
import { createApp, signal } from 'pulse-framework'

const app = createApp()
const count = signal(0)

app
  .bind('#count', 'textContent', count)
  .on('#increment', 'click', () => count(count() + 1))
  .on('#decrement', 'click', () => count(count() - 1))
```

### Liste de todos

```typescript
import { createApp, signal, computed } from 'pulse-framework'

const app = createApp()
const todos = signal([])
const remaining = computed(() => 
  todos().filter(todo => !todo.completed).length
)

app
  .bind('#remaining', 'textContent', remaining)
  .list('#todo-list', todos, (todo) => `
    <div class="todo ${todo.completed ? 'completed' : ''}">
      <span>${todo.text}</span>
      <button onclick="toggleTodo(${todo.id})">Toggle</button>
    </div>
  `)
```

## Développement

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build
npm run build

# Tests
npm test

# Linting
npm run lint
```

## Structure du projet

```
src/
├── core/           # API principale
├── reactivity/     # Système de réactivité
├── dom/           # Manipulation DOM
├── utils/         # Utilitaires
└── index.ts       # Point d'entrée

examples/          # Exemples d'utilisation
tests/            # Tests unitaires
types/            # Définitions TypeScript
```

## Licence

MIT © Odyssee Software
