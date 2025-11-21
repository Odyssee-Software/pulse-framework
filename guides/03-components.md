# Composants Réutilisables avec Pulse Framework

## Le Problème des Composants en DOM Vanilla

En DOM vanilla, créer des composants réutilisables est verbeux et error-prone :

```javascript
// DOM vanilla - Composant Button
function createButton(text, onClick, variant = 'primary') {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = `btn btn-${variant}`;
  button.addEventListener('click', onClick);
  
  // Comment gérer les updates ? Comment nettoyer les listeners ?
  // Comment passer des données réactives ?
  
  return button;
}

// Utilisation limitée et statique
const myButton = createButton('Cliquez-moi', () => alert('Cliqué!'));
```

## Composants avec Pulse Framework

### Approche 1 : Objets Déclaratifs

```javascript
import { signal, computed, render } from 'pulse-framework';

// Composant Button réactif et puissant
function createButton({ 
  text = signal("Button"),
  onClick = () => {},
  variant = signal('primary'),
  disabled = signal(false)
}) {
  return render({
    tag: 'button',
    attributes: {
      class: computed(() => `btn btn-${variant()}`)
    },
    properties: {
      textContent: text,
      disabled: disabled
    },
    events: {
      click: onClick
    }
  });
}
```

### Approche 2 : HTML Template Literals

```javascript
import { signal, computed, render } from 'pulse-framework';

// Même composant, syntaxe HTML familière !
function createButton({ 
  text = signal("Button"),
  onClick = () => {},
  variant = signal('primary'),
  disabled = signal(false)
}) {
  return render.html`
    <button 
      class="${computed(() => `btn btn-${variant()}`)}"
      disabled="${disabled}"
      onclick="${onClick}">
      ${text}
    </button>
  `;
}
```

### Comparaison des Approches

| Aspect                 | Objets Déclaratifs            | HTML Template Literals     |
| ---------------------- | ------------------------------ | -------------------------- |
| **Familiarité** | Programmation objet            | HTML/CSS traditionnel      |
| **TypeScript**   | Auto-complétion parfaite      | Bonne intégration         |
| **Lisibilité**  | Structure claire               | Plus proche du HTML final  |
| **Complexité**  | Meilleur pour logique complexe | Parfait pour markup simple |
| **Migration**    | Depuis du code JS              | Depuis du HTML existant    |

### Utilisation (identique pour les deux approches)

```javascript
// Utilisation dynamique et réactive
const buttonText = signal("Cliquez-moi");
const isDisabled = signal(false);

const myButton = createButton({
  text: buttonText,
  onClick: () => {
    buttonText("Merci !");
    isDisabled(true);
  },
  disabled: isDisabled
});
```

## Exemples Pratiques avec Template Literals

### Composant Card Simple

```javascript
function createCard({ title, content, actions = [] }) {
  return render.html`
    <div class="card">
      <div class="card-header">
        <h3>${title}</h3>
      </div>
      <div class="card-body">
        ${content}
      </div>
      <div class="card-footer">
        ${actions.map(action => render.html`
          <button onclick="${action.handler}" class="${action.class || 'btn'}">
            ${action.label}
          </button>
        `)}
      </div>
    </div>
  `;
}
```

### Composant Liste Réactive

```javascript
function createList({ items, onItemClick, emptyMessage = "Aucun élément" }) {
  return render.html`
    <div class="list-container">
      ${computed(() => {
        const itemsValue = items();
        return itemsValue.length === 0 
          ? render.html`<p class="empty-state">${emptyMessage}</p>`
          : render.html`
              <ul class="item-list">
                ${itemsValue.map(item => render.html`
                  <li onclick="${() => onItemClick(item)}" class="list-item">
                    ${item.name || item}
                  </li>
                `)}
              </ul>
            `;
      })}
    </div>
  `;
}
```

### Formulaire Complexe

```javascript
function createForm({ onSubmit, validation = {} }) {
  const formData = signal({
    name: '',
    email: '',
    message: ''
  });
  
  const errors = computed(() => {
    const data = formData();
    const errs = {};
  
    if (!data.name) errs.name = 'Nom requis';
    if (!data.email.includes('@')) errs.email = 'Email invalide';
    if (data.message.length < 10) errs.message = 'Message trop court';
  
    return errs;
  });
  
  const isValid = computed(() => Object.keys(errors()).length === 0);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      onSubmit(formData());
    }
  };
  
  return render.html`
    <form onsubmit="${handleSubmit}" class="form">
      <div class="form-group">
        <label for="name">Nom</label>
        <input 
          type="text" 
          id="name"
          value="${formData().name}"
          oninput="${(e) => formData({...formData(), name: e.target.value})}"
          class="${computed(() => errors().name ? 'error' : '')}"
        />
        ${computed(() => errors().name ? render.html`
          <span class="error-message">${errors().name}</span>
        ` : '')}
      </div>
    
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email"
          value="${formData().email}"
          oninput="${(e) => formData({...formData(), email: e.target.value})}"
          class="${computed(() => errors().email ? 'error' : '')}"
        />
        ${computed(() => errors().email ? render.html`
          <span class="error-message">${errors().email}</span>
        ` : '')}
      </div>
    
      <div class="form-group">
        <label for="message">Message</label>
        <textarea 
          id="message"
          value="${formData().message}"
          oninput="${(e) => formData({...formData(), message: e.target.value})}"
          class="${computed(() => errors().message ? 'error' : '')}"
        ></textarea>
        ${computed(() => errors().message ? render.html`
          <span class="error-message">${errors().message}</span>
        ` : '')}
      </div>
    
      <button type="submit" disabled="${computed(() => !isValid())}" class="btn btn-primary">
        Envoyer
      </button>
    </form>
  `;
}
```

## Exemple Pratique : Composant Counter

### DOM Vanilla (50+ lignes)

```javascript
function createCounter(initialValue = 0) {
  let count = initialValue;
  
  const container = document.createElement('div');
  container.className = 'counter';
  
  const display = document.createElement('span');
  display.className = 'counter-value';
  display.textContent = count;
  
  const incrementBtn = document.createElement('button');
  incrementBtn.textContent = '+';
  incrementBtn.addEventListener('click', () => {
    count++;
    display.textContent = count; // Sync manuelle !
    updateDoubled(); // Oubli facile !
  });
  
  const decrementBtn = document.createElement('button');
  decrementBtn.textContent = '-';
  decrementBtn.addEventListener('click', () => {
    count--;
    display.textContent = count; // Sync manuelle !
    updateDoubled(); // Oubli facile !
  });
  
  const doubledDisplay = document.createElement('span');
  doubledDisplay.className = 'doubled-value';
  
  function updateDoubled() {
    doubledDisplay.textContent = `Double: ${count * 2}`;
  }
  updateDoubled();
  
  container.appendChild(display);
  container.appendChild(incrementBtn);
  container.appendChild(decrementBtn);
  container.appendChild(doubledDisplay);
  
  // API limitée pour communiquer avec l'extérieur
  return {
    element: container,
    getValue: () => count,
    setValue: (newValue) => {
      count = newValue;
      display.textContent = count;
      updateDoubled();
    }
  };
}
```

### Pulse Framework (15 lignes)

```javascript
import { signal, computed, render } from 'pulse-framework';

function createCounter({ initialValue = 0, onCountChange = null } = {}) {
  const count = signal(initialValue);
  const doubled = computed(() => count() * 2);
  
  // Notification optionnelle des changements
  if (onCountChange) {
    // Effect pour notifier les changements
    effect(() => onCountChange(count()));
  }
  
  return render({
    tag: 'div',
    attributes: { class: 'counter' },
    children: [
      {
        tag: 'span',
        attributes: { class: 'counter-value' },
        properties: { textContent: count } // ✨ Auto-sync
      },
      {
        tag: 'button',
        properties: { textContent: '+' },
        events: { click: () => count(count() + 1) }
      },
      {
        tag: 'button', 
        properties: { textContent: '-' },
        events: { click: () => count(count() - 1) }
      },
      {
        tag: 'span',
        attributes: { class: 'doubled-value' },
        children: [
          'Double: ',
          {
            tag: 'span',
            properties: { textContent: doubled } // ✨ Auto-sync
          }
        ]
      }
    ]
  });
}

// Utilisation simple
const counter1 = createCounter({ 
  initialValue: 10,
  onCountChange: (value) => console.log('Counter changed:', value)
});

const counter2 = createCounter({ initialValue: 0 });
```

## Composants Avancés : Todo List

```javascript
import { signal, computed, render, effect } from 'pulse-framework';

function createTodoList({ initialTodos = [], onTodosChange = null } = {}) {
  const todos = signal(initialTodos);
  const newTodoText = signal('');
  
  const completedCount = computed(() => 
    todos().filter(todo => todo.completed).length
  );
  
  const remainingCount = computed(() => 
    todos().length - completedCount()
  );
  
  // Notification des changements
  if (onTodosChange) {
    effect(() => onTodosChange(todos()));
  }
  
  const addTodo = () => {
    const text = newTodoText().trim();
    if (text) {
      todos([...todos(), {
        id: Date.now(),
        text,
        completed: false
      }]);
      newTodoText('');
    }
  };
  
  const toggleTodo = (id) => {
    todos(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const removeTodo = (id) => {
    todos(todos().filter(todo => todo.id !== id));
  };
  
  return render({
    tag: 'div',
    attributes: { class: 'todo-list' },
    children: [
      // Header avec stats
      {
        tag: 'div',
        attributes: { class: 'todo-header' },
        children: [
          {
            tag: 'h3',
            properties: { textContent: 'Ma Todo List' }
          },
          {
            tag: 'p',
            children: [
              {
                tag: 'span',
                properties: { textContent: remainingCount }
              },
              ' tâches restantes sur ',
              {
                tag: 'span', 
                properties: { textContent: computed(() => todos().length) }
              }
            ]
          }
        ]
      },
    
      // Input pour nouvelle tâche
      {
        tag: 'div',
        attributes: { class: 'todo-input' },
        children: [
          {
            tag: 'input',
            attributes: { 
              type: 'text',
              placeholder: 'Nouvelle tâche...'
            },
            properties: { value: newTodoText },
            events: {
              input: (e) => newTodoText(e.target.value),
              keypress: (e) => e.key === 'Enter' && addTodo()
            }
          },
          {
            tag: 'button',
            properties: { textContent: 'Ajouter' },
            events: { click: addTodo }
          }
        ]
      },
    
      // Liste des tâches (rendu dynamique)
      {
        tag: 'div',
        attributes: { class: 'todo-items' },
        children: computed(() => 
          todos().map(todo => render({
            tag: 'div',
            attributes: { 
              class: computed(() => `todo-item ${todo.completed ? 'completed' : ''}`)
            },
            children: [
              {
                tag: 'input',
                attributes: { type: 'checkbox' },
                properties: { checked: signal(todo.completed) },
                events: { change: () => toggleTodo(todo.id) }
              },
              {
                tag: 'span',
                properties: { textContent: todo.text }
              },
              {
                tag: 'button',
                properties: { textContent: '✕' },
                events: { click: () => removeTodo(todo.id) }
              }
            ]
          }))
        )
      }
    ]
  });
}

// Utilisation
const todoList = createTodoList({
  initialTodos: [
    { id: 1, text: 'Apprendre Pulse Framework', completed: false },
    { id: 2, text: 'Créer une app', completed: false }
  ],
  onTodosChange: (todos) => {
    console.log(`${todos.length} tâches au total`);
    localStorage.setItem('todos', JSON.stringify(todos));
  }
});
```

## Communication Entre Composants

### Pattern Event Bus (DOM Vanilla)

```javascript
// DOM vanilla - Event bus compliqué
const eventBus = new EventTarget();

const counter = createCounter();
const display = createDisplay();

// Communication manuelle et fragile
counter.addEventListener('countChanged', (e) => {
  display.update(e.detail.count);
});
```

### Pattern Signal Partagé (Pulse)

```javascript
// Pulse - Signals partagés, simple et robuste
const globalCount = signal(0);

const counter = createCounter({ count: globalCount });
const display = createDisplay({ count: globalCount });
const chart = createChart({ value: globalCount });

// Tous se synchronisent automatiquement !
```

### Exemple Complet : Dashboard

```javascript
function createDashboard() {
  // États globaux partagés
  const users = signal([]);
  const selectedUserId = signal(null);
  const searchQuery = signal('');
  
  // Computed globaux
  const filteredUsers = computed(() => 
    users().filter(user => 
      user.name.toLowerCase().includes(searchQuery().toLowerCase())
    )
  );
  
  const selectedUser = computed(() => 
    users().find(user => user.id === selectedUserId())
  );
  
  return render({
    tag: 'div',
    attributes: { class: 'dashboard' },
    children: [
      // Tous les composants partagent les mêmes signals
      createUserSearch({ 
        query: searchQuery,
        onSearch: (query) => searchQuery(query)
      }),
    
      createUserList({ 
        users: filteredUsers,
        selectedId: selectedUserId,
        onSelect: (id) => selectedUserId(id)
      }),
    
      createUserDetail({ 
        user: selectedUser,
        onUpdate: (updatedUser) => {
          users(users().map(u => u.id === updatedUser.id ? updatedUser : u));
        }
      })
    ]
  });
}
```

## Avantages des Composants Pulse

### 1. **Simplicité**

- Moins de code boilerplate
- Logique métier claire et séparée

### 2. **Réactivité Automatique**

- Synchronisation sans effort
- Performance optimisée

### 3. **Composition Naturelle**

- Signals partagés entre composants
- Communication simple et robuste

### 4. **Maintenance Facile**

- Code prévisible et testable
- Debugging simple

## Prochaine Étape

Apprenez les [Patterns Avancés](./04-advanced-patterns.md) pour maîtriser Pulse Framework complètement.
