# Migration depuis le DOM Vanilla vers Pulse Framework

## Stratégie de Migration Progressive

Vous n'avez pas besoin de réécrire toute votre application d'un coup ! Pulse Framework peut coexister avec du code DOM vanilla.

### Étape 1 : Ajouter Pulse à votre Projet

```bash
npm install pulse-framework
```

```javascript
// Dans votre HTML existant
import { signal, computed, render } from 'pulse-framework';
```

### Étape 2 : Migrer par Petits Composants

Commencez par identifier les parties les plus problématiques de votre code DOM vanilla :

#### Avant (DOM Vanilla) - Compteur Simple
```javascript
// Code existant problématique
let count = 0;
const countElement = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const doubledElement = document.getElementById('doubled');

function updateDisplay() {
  countElement.textContent = count;
  doubledElement.textContent = count * 2;
}

incrementBtn.addEventListener('click', () => {
  count++;
  updateDisplay(); // Facile d'oublier !
});

decrementBtn.addEventListener('click', () => {
  count--;
  updateDisplay(); // Facile d'oublier !
});

updateDisplay();
```

#### Après (Migration Pulse) - Remplacement Direct

**Option A : HTML Template Literals (recommandé pour migration)**
```javascript
import { signal, computed, render } from 'pulse-framework';

// Migration HTML : gardez votre structure existante !
function migrateCounter() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);

  // Reprenez votre HTML existant et ajoutez la réactivité
  const counterComponent = render.html`
    <div>
      <span id="count">${count}</span>
      <button id="increment" onclick="${() => count(count() + 1)}">+</button>
      <button id="decrement" onclick="${() => count(count() - 1)}">-</button>
      <span id="doubled">${doubled}</span>
    </div>
  `;

  // Remplacez l'ancienne section
  const oldContainer = document.getElementById('counter-container');
  oldContainer.replaceWith(counterComponent);
}

// Appelez la migration quand vous voulez
migrateCounter();
```

**Option B : Objets Déclaratifs (pour restructuration complète)**
```javascript
import { signal, computed, render } from 'pulse-framework';

function migrateCounterStructured() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);

  const counterComponent = render({
    tag: 'div',
    children: [
      {
        tag: 'span',
        attributes: { id: 'count' },
        properties: { textContent: count }
      },
      {
        tag: 'button',
        attributes: { id: 'increment' },
        properties: { textContent: '+' },
        events: { click: () => count(count() + 1) }
      },
      {
        tag: 'button',
        attributes: { id: 'decrement' },
        properties: { textContent: '-' },
        events: { click: () => count(count() - 1) }
      },
      {
        tag: 'span',
        attributes: { id: 'doubled' },
        properties: { textContent: doubled }
      }
    ]
  });

  const oldContainer = document.getElementById('counter-container');
  oldContainer.replaceWith(counterComponent);
}
```
import { signal, computed, render } from 'pulse-framework';

// Remplacer la section problématique
function migrateCounter() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  
  const newCounterSection = render({
    tag: 'div',
    children: [
      {
        tag: 'span',
        attributes: { id: 'count' }, // Garder l'ID si d'autres scripts en dépendent
        properties: { textContent: count }
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
        attributes: { id: 'doubled' },
        properties: { textContent: doubled }
      }
    ]
  });
  
  // Remplacer l'ancien contenu
  const oldContainer = document.getElementById('counter-container');
  oldContainer.innerHTML = '';
  oldContainer.appendChild(newCounterSection);
  
  // API pour le reste de l'application qui pourrait en dépendre
  window.getCount = () => count();
  window.setCount = (value) => count(value);
}

// Appliquer la migration
migrateCounter();
```

## Cas d'Usage : Migration d'un Formulaire Complexe

### Avant - Formulaire DOM Vanilla (Cauchemar à maintenir)

```javascript
// Code legacy avec plein de problèmes
const form = document.getElementById('user-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit');
const errorContainer = document.getElementById('errors');

let formData = {
  email: '',
  password: '',
  confirmPassword: ''
};

let errors = {};

function validateEmail(email) {
  return email.includes('@') && email.includes('.');
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateConfirmPassword(password, confirm) {
  return password === confirm;
}

function updateErrors() {
  errors = {};
  
  if (!validateEmail(formData.email)) {
    errors.email = 'Email invalide';
  }
  
  if (!validatePassword(formData.password)) {
    errors.password = 'Mot de passe trop court';
  }
  
  if (!validateConfirmPassword(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = 'Mots de passe différents';
  }
  
  // Mise à jour manuelle de l'UI (error-prone)
  errorContainer.innerHTML = '';
  Object.values(errors).forEach(error => {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = error;
    errorDiv.className = 'error';
    errorContainer.appendChild(errorDiv);
  });
  
  // État du bouton
  submitBtn.disabled = Object.keys(errors).length > 0;
}

// Event listeners répétitifs
emailInput.addEventListener('input', (e) => {
  formData.email = e.target.value;
  updateErrors(); // Facile d'oublier !
});

passwordInput.addEventListener('input', (e) => {
  formData.password = e.target.value;
  updateErrors(); // Facile d'oublier !
});

confirmPasswordInput.addEventListener('input', (e) => {
  formData.confirmPassword = e.target.value;
  updateErrors(); // Facile d'oublier !
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  updateErrors();
  if (Object.keys(errors).length === 0) {
    console.log('Formulaire valide:', formData);
  }
});

// Init
updateErrors();
```

### Après - Migration Pulse (Simple et Robuste)

```javascript
import { signal, computed, render } from 'pulse-framework';

function migrateUserForm() {
  // États réactifs
  const email = signal('');
  const password = signal('');
  const confirmPassword = signal('');
  
  // Validations automatiques
  const emailError = computed(() => {
    const value = email();
    if (!value) return '';
    return value.includes('@') && value.includes('.') ? '' : 'Email invalide';
  });
  
  const passwordError = computed(() => {
    const value = password();
    if (!value) return '';
    return value.length >= 8 ? '' : 'Mot de passe trop court';
  });
  
  const confirmPasswordError = computed(() => {
    const pass = password();
    const confirm = confirmPassword();
    if (!confirm) return '';
    return pass === confirm ? '' : 'Mots de passe différents';
  });
  
  const allErrors = computed(() => [
    emailError(),
    passwordError(), 
    confirmPasswordError()
  ].filter(Boolean));
  
  const isValid = computed(() => allErrors().length === 0 && email() && password() && confirmPassword());
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      console.log('Formulaire valide:', {
        email: email(),
        password: password(),
        confirmPassword: confirmPassword()
      });
    }
  };
  
  const newForm = render({
    tag: 'form',
    attributes: { id: 'user-form' },
    events: { submit: handleSubmit },
    children: [
      {
        tag: 'input',
        attributes: { 
          type: 'email',
          id: 'email',
          placeholder: 'Email'
        },
        properties: { value: email },
        events: { input: (e) => email(e.target.value) }
      },
      
      {
        tag: 'input',
        attributes: { 
          type: 'password',
          id: 'password',
          placeholder: 'Mot de passe'
        },
        properties: { value: password },
        events: { input: (e) => password(e.target.value) }
      },
      
      {
        tag: 'input',
        attributes: { 
          type: 'password',
          id: 'confirm-password',
          placeholder: 'Confirmer le mot de passe'
        },
        properties: { value: confirmPassword },
        events: { input: (e) => confirmPassword(e.target.value) }
      },
      
      // Container d'erreurs qui se met à jour automatiquement
      {
        tag: 'div',
        attributes: { id: 'errors' },
        children: computed(() => 
          allErrors().map(error => ({
            tag: 'div',
            attributes: { class: 'error' },
            properties: { textContent: error }
          }))
        )
      },
      
      {
        tag: 'button',
        attributes: { 
          type: 'submit',
          id: 'submit'
        },
        properties: {
          textContent: 'Valider',
          disabled: computed(() => !isValid())
        }
      }
    ]
  });
  
  // Remplacer l'ancien formulaire
  const oldForm = document.getElementById('user-form');
  oldForm.parentNode.replaceChild(newForm, oldForm);
}

// Appliquer la migration
migrateUserForm();
```

## Migration d'une Todo List Complexe

### Stratégie Progressive

Au lieu de tout réécrire, vous pouvez migrer fonctionnalité par fonctionnalité :

```javascript
// Migration.js - Plan de migration progressif
class TodoMigration {
  constructor() {
    this.legacyTodos = this.getLegacyTodos();
    this.todos = signal(this.legacyTodos);
    
    // Garder les deux systèmes en sync pendant la transition
    this.syncWithLegacy();
  }
  
  getLegacyTodos() {
    // Récupérer les données du système existant
    return window.TodoApp?.todos || [];
  }
  
  syncWithLegacy() {
    // Synchroniser avec l'ancien système
    effect(() => {
      const currentTodos = this.todos();
      if (window.TodoApp?.updateTodos) {
        window.TodoApp.updateTodos(currentTodos);
      }
    });
  }
  
  // Migrer d'abord juste l'affichage
  migrateDisplay() {
    const todoContainer = document.getElementById('todo-list');
    
    const newDisplay = render({
      tag: 'div',
      children: computed(() => 
        this.todos().map(todo => ({
          tag: 'div',
          attributes: { 
            class: `todo-item ${todo.completed ? 'completed' : ''}`,
            'data-id': todo.id.toString()
          },
          children: [
            {
              tag: 'span',
              properties: { textContent: todo.text }
            },
            {
              tag: 'span',
              properties: { 
                textContent: todo.completed ? '✓' : '○'
              }
            }
          ]
        }))
      )
    });
    
    todoContainer.appendChild(newDisplay);
  }
  
  // Ensuite migrer les interactions
  migrateInteractions() {
    // Remplacer progressivement les event listeners
    document.addEventListener('click', (e) => {
      if (e.target.matches('.todo-toggle')) {
        const todoId = e.target.dataset.id;
        this.toggleTodo(parseInt(todoId));
      }
    });
  }
  
  toggleTodo(id) {
    this.todos(this.todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }
}

// Application de la migration
const migration = new TodoMigration();
migration.migrateDisplay();
migration.migrateInteractions();
```

## Checklist de Migration

### ✅ Préparation
- [ ] Identifier les parties les plus problématiques du code
- [ ] Installer Pulse Framework
- [ ] Créer un plan de migration progressive

### ✅ Phase 1 - Migration des Affichages
- [ ] Remplacer les `textContent` manuels par des signals
- [ ] Migrer les classes CSS dynamiques vers computed
- [ ] Éliminer les fonctions `update*()` répétitives

### ✅ Phase 2 - Migration des Interactions
- [ ] Remplacer les event listeners par le système events de Pulse
- [ ] Migrer la gestion d'état vers des signals
- [ ] Simplifier la logique métier

### ✅ Phase 3 - Optimisation
- [ ] Regrouper les états liés dans des composants
- [ ] Créer des computed pour les valeurs dérivées
- [ ] Nettoyer l'ancien code DOM vanilla

### ✅ Phase 4 - Tests et Validation
- [ ] Vérifier que toutes les fonctionnalités marchent
- [ ] Tester les performances
- [ ] Nettoyer les dépendances inutiles

## Cohabitation Pulse + DOM Vanilla

```javascript
// Bridge entre ancien code et nouveau code Pulse
class PulseBridge {
  constructor() {
    this.pulseStores = new Map();
  }
  
  // Exposer un signal Pulse au code legacy
  exposeSignal(name, signal) {
    this.pulseStores.set(name, signal);
    
    // API compatible avec l'ancien code
    window[name] = {
      get: () => signal(),
      set: (value) => signal(value),
      subscribe: (callback) => {
        return effect(() => callback(signal()));
      }
    };
  }
  
  // Importer des données du code legacy
  importLegacyData(legacyObject, signalName) {
    const signal = this.pulseStores.get(signalName);
    if (signal && legacyObject) {
      signal(legacyObject.data);
      
      // Synchronisation bidirectionnelle
      legacyObject.onChange = (newData) => signal(newData);
    }
  }
}

// Utilisation du bridge
const bridge = new PulseBridge();

// Créer des signals Pulse
const userCount = signal(0);
const currentUser = signal(null);

// Les exposer au code legacy
bridge.exposeSignal('userCount', userCount);
bridge.exposeSignal('currentUser', currentUser);

// L'ancien code peut maintenant utiliser :
// window.userCount.get() - pour lire
// window.userCount.set(42) - pour écrire
// window.userCount.subscribe(count => console.log(count)) - pour s'abonner
```

## Migration HTML Directe avec Template Literals ⭐

### Cas d'Usage : Transformer du HTML Existant

Si vous avez du HTML existant avec beaucoup de JavaScript pour la synchronisation, les template literals sont parfaits :

#### Avant : HTML + JavaScript Vanilla
```html
<!-- Votre HTML existant -->
<div class="user-profile">
  <div class="avatar">
    <img id="user-avatar" src="" alt="Avatar">
  </div>
  <div class="info">
    <h2 id="user-name">Nom d'utilisateur</h2>
    <p id="user-status">Statut</p>
    <span id="user-score">0</span> points
  </div>
  <div class="actions">
    <button id="edit-btn">Éditer</button>
    <button id="save-btn" style="display: none;">Sauvegarder</button>
  </div>
</div>
```

```javascript
// Votre JavaScript de synchronisation actuel
let userData = {
  name: 'Jean Dupont',
  status: 'En ligne',
  avatar: '/avatars/jean.jpg',
  score: 1250
};

let editMode = false;

function updateUserProfile() {
  document.getElementById('user-name').textContent = userData.name;
  document.getElementById('user-status').textContent = userData.status;
  document.getElementById('user-avatar').src = userData.avatar;
  document.getElementById('user-score').textContent = userData.score;
  
  document.getElementById('edit-btn').style.display = editMode ? 'none' : 'block';
  document.getElementById('save-btn').style.display = editMode ? 'block' : 'none';
}

document.getElementById('edit-btn').addEventListener('click', () => {
  editMode = true;
  updateUserProfile(); // N'oubliez pas !
});

// ... Plus de listeners et d'appels à updateUserProfile()
```

#### Après : Migration Template Literals
```javascript
import { signal, computed, render } from 'pulse-framework';

function createUserProfile() {
  // Convertir les données en signals
  const userData = signal({
    name: 'Jean Dupont',
    status: 'En ligne', 
    avatar: '/avatars/jean.jpg',
    score: 1250
  });
  
  const editMode = signal(false);
  
  // Reprendre EXACTEMENT le même HTML avec la réactivité
  return render.html`
    <div class="user-profile">
      <div class="avatar">
        <img src="${computed(() => userData().avatar)}" alt="Avatar">
      </div>
      <div class="info">
        <h2>${computed(() => userData().name)}</h2>
        <p>${computed(() => userData().status)}</p>
        <span>${computed(() => userData().score)}</span> points
      </div>
      <div class="actions">
        <button 
          onclick="${() => editMode(true)}"
          style="${computed(() => editMode() ? 'display: none;' : 'display: block;')}">
          Éditer
        </button>
        <button 
          onclick="${() => editMode(false)}"
          style="${computed(() => editMode() ? 'display: block;' : 'display: none;')}">
          Sauvegarder
        </button>
      </div>
    </div>
  `;
}

// Remplacer l'ancien HTML
const oldProfile = document.querySelector('.user-profile');
const newProfile = createUserProfile();
oldProfile.replaceWith(newProfile);
```

### Avantages de cette Approche

| Aspect | Avant (Vanilla) | Après (Template Literals) |
|--------|-----------------|---------------------------|
| **Lignes de code** | ~50 lignes | ~25 lignes |
| **Synchronisation** | Manuelle, error-prone | Automatique |
| **HTML** | Séparé du JS | Intégré, cohérent |
| **Debugging** | Difficile à tracer | Flux réactif clair |
| **Maintenance** | Fragile | Robuste |

### Cas Complexe : Formulaire Dynamique

```javascript
// Migration d'un formulaire avec validation
function migrateComplexForm() {
  const formData = signal({
    name: '',
    email: '',
    age: 0,
    preferences: []
  });
  
  const errors = computed(() => {
    const data = formData();
    const errs = {};
    
    if (!data.name) errs.name = 'Nom requis';
    if (!data.email.includes('@')) errs.email = 'Email invalide';
    if (data.age < 18) errs.age = 'Âge minimum 18 ans';
    
    return errs;
  });
  
  const isValid = computed(() => Object.keys(errors()).length === 0);
  
  // Reprendre votre HTML existant + réactivité
  return render.html`
    <form class="dynamic-form">
      <div class="form-group ${computed(() => errors().name ? 'has-error' : '')}">
        <label>Nom</label>
        <input 
          type="text" 
          value="${computed(() => formData().name)}"
          oninput="${(e) => formData({...formData(), name: e.target.value})}"
        />
        ${computed(() => errors().name ? render.html`
          <span class="error">${errors().name}</span>
        ` : '')}
      </div>
      
      <div class="form-group ${computed(() => errors().email ? 'has-error' : '')}">
        <label>Email</label>
        <input 
          type="email" 
          value="${computed(() => formData().email)}"
          oninput="${(e) => formData({...formData(), email: e.target.value})}"
        />
        ${computed(() => errors().email ? render.html`
          <span class="error">${errors().email}</span>
        ` : '')}
      </div>
      
      <button 
        type="submit" 
        disabled="${computed(() => !isValid())}"
        class="btn ${computed(() => isValid() ? 'btn-primary' : 'btn-disabled')}">
        Soumettre
      </button>
    </form>
  `;
}
```

## Bridge Legacy avec Template Literals

Pour les migrations progressives, vous pouvez créer des ponts entre l'ancien code et Pulse :

```javascript
class HTMLMigrationBridge {
  constructor() {
    this.signals = new Map();
  }
  
  // Exposer un signal comme HTML réactif
  createReactiveElement(selector, signal, template) {
    const element = document.querySelector(selector);
    
    // Remplacer par un composant Pulse
    const reactiveComponent = render.html`
      <div class="migrated-component">
        ${computed(() => template(signal()))}
      </div>
    `;
    
    element.replaceWith(reactiveComponent);
    
    return signal; // Retourner pour manipulation legacy
  }
  
  // Synchroniser avec des inputs existants
  bindExistingInput(inputSelector, signal) {
    const input = document.querySelector(inputSelector);
    
    // Synchronisation bidirectionnelle
    input.value = signal();
    input.addEventListener('input', (e) => signal(e.target.value));
    
    // Mettre à jour l'input quand le signal change
    effect(() => {
      if (input.value !== signal()) {
        input.value = signal();
      }
    });
  }
}

// Utilisation pour migration progressive
const bridge = new HTMLMigrationBridge();

// Créer un signal
const userName = signal('Jean Dupont');

// Remplacer un élément existant par du HTML réactif
bridge.createReactiveElement(
  '#user-display', 
  userName,
  (name) => `<h1>Bonjour ${name}!</h1>`
);

// Lier un input existant
bridge.bindExistingInput('#name-input', userName);
```

## Bénéfices Immédiats de la Migration

1. **Réduction de 50-80% du code** de synchronisation UI
2. **Élimination des bugs** liés aux oublis de mise à jour
3. **Performance améliorée** grâce aux optimisations automatiques
4. **Code plus maintenable** et prévisible
5. **Debugging facilité** avec des flux de données clairs
6. **Transition naturelle** : gardez votre HTML, ajoutez la réactivité

La migration peut se faire progressivement, composant par composant, sans risquer de casser l'application existante.