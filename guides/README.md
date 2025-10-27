# Documentation Pulse Framework

## Guide de Démarrage Rapide

Pulse Framework est un micro-framework réactif "DOM-first" conçu pour les développeurs habitués au DOM vanilla qui veulent bénéficier de la réactivité moderne sans la complexité.

### Installation

```bash
npm install pulse-framework
```

### Premier Exemple

```javascript
import { signal, computed, render } from 'pulse-framework';

const count = signal(0);
const doubled = computed(() => count() * 2);

const app = render({
  tag: 'div',
  children: [
    {
      tag: 'p',
      children: ['Compteur: ', { tag: 'span', properties: { textContent: count }}]
    },
    {
      tag: 'p', 
      children: ['Double: ', { tag: 'span', properties: { textContent: doubled }}]
    },
    {
      tag: 'button',
      properties: { textContent: 'Incrémenter' },
      events: { click: () => count(count() + 1) }
    }
  ]
});

document.body.appendChild(app);
```

## Guides Complets

1. **[Guide de Démarrage](./01-getting-started.md)**
   - Pourquoi Pulse au lieu du DOM vanilla ?
   - Installation et premier exemple
   - Comparaisons code par code
   - Avantages clés

2. **[Signals et Computed](./02-signals-computed.md)**
   - Variables réactives avec les signals
   - Valeurs calculées automatiques
   - Exemples pratiques (calculatrice, validation)
   - Patterns avancés

3. **[Composants Réutilisables](./03-components.md)**
   - Créer des composants avec render()
   - Communication entre composants
   - Patterns de composition
   - Exemples complexes (TodoList, Dashboard)

4. **[Patterns Avancés](./04-advanced-patterns.md)**
   - Gestion d'état global (Store)
   - Formulaires avec validation
   - Routing SPA
   - Gestion async et loading states

5. **[Guide de Migration](./05-migration-guide.md)**
   - Migration progressive depuis DOM vanilla
   - Stratégies de cohabitation
   - Checklist étape par étape
   - Bénéfices immédiats

## API Référence

### Core Functions

#### `signal(initialValue)`
Crée une variable réactive.

```javascript
const count = signal(0);
console.log(count()); // lecture: 0
count(5); // écriture: 5
```

#### `computed(fn)`
Crée une valeur calculée automatiquement.

```javascript
const doubled = computed(() => count() * 2);
// Se met à jour automatiquement quand count change
```

#### `effect(fn)`
Exécute une fonction à chaque changement de ses dépendances.

```javascript
effect(() => {
  console.log('Count changed:', count());
});
```

#### `render(template)`
Crée des éléments DOM à partir d'un template déclaratif.

```javascript
const element = render({
  tag: 'div',
  attributes: { class: 'container' },
  properties: { textContent: 'Hello' },
  events: { click: () => console.log('clicked') },
  children: [/* nested templates */]
});
```

### Template API

```typescript
interface RenderTemplate {
  tag: string
  attributes?: Record<string, string | Signal | Computed>
  properties?: Record<string, any | Signal | Computed>
  children?: (RenderTemplate | string | Signal | Computed | HTMLElement)[]
  events?: Record<string, (event: Event) => void>
}
```

### Helper Functions

#### `h(tag, props, ...children)`
Syntaxe alternative plus concise pour créer des templates.

```javascript
const button = h('button', 
  { 
    attributes: { class: 'btn' },
    events: { click: handler }
  },
  'Click me'
);
```

#### `fragment(...children)`
Crée un fragment documentaire pour grouper des éléments.

```javascript
const list = fragment(
  h('li', {}, 'Item 1'),
  h('li', {}, 'Item 2')
);
```

## Philosophie "DOM-First"

Pulse Framework adopte une approche "DOM-first" qui signifie :

1. **Pas de Virtual DOM** - Manipulation directe du DOM réel
2. **No Diff, Only Sync** - Synchronisation automatique sans diffing
3. **Performance par Design** - Mises à jour granulaires et optimisées
4. **Compatibilité Totale** - Intégration facile dans du code existant

## Comparaison avec d'autres Frameworks

| Feature | Pulse | React | Vue | Vanilla DOM |
|---------|-------|-------|-----|-------------|
| Taille | ~5KB | ~40KB | ~35KB | 0KB |
| Courbe d'apprentissage | Faible | Élevée | Moyenne | Aucune |
| Performance | Excellente | Bonne | Bonne | Variable |
| Réactivité | Automatique | Manuel (hooks) | Automatique | Manuelle |
| Intégration legacy | Facile | Difficile | Moyenne | Native |

## Exemples d'Applications

### Application de Gestion de Tâches

```javascript
import { signal, computed, render } from 'pulse-framework';

function createTodoApp() {
  const todos = signal([]);
  const newTodoText = signal('');
  
  const completedCount = computed(() => 
    todos().filter(t => t.completed).length
  );
  
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
  
  return render({
    tag: 'div',
    children: [
      {
        tag: 'h1',
        properties: { textContent: 'Todo App' }
      },
      {
        tag: 'div',
        children: [
          {
            tag: 'input',
            properties: { 
              value: newTodoText,
              placeholder: 'Nouvelle tâche...'
            },
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
      {
        tag: 'p',
        children: [
          { tag: 'span', properties: { textContent: completedCount }},
          ' / ',
          { tag: 'span', properties: { textContent: computed(() => todos().length) }},
          ' terminées'
        ]
      },
      {
        tag: 'ul',
        children: computed(() => 
          todos().map(todo => render({
            tag: 'li',
            children: [
              {
                tag: 'input',
                attributes: { type: 'checkbox' },
                properties: { checked: signal(todo.completed) },
                events: { 
                  change: () => {
                    todos(todos().map(t => 
                      t.id === todo.id ? {...t, completed: !t.completed} : t
                    ));
                  }
                }
              },
              {
                tag: 'span',
                properties: { textContent: todo.text }
              }
            ]
          }))
        )
      }
    ]
  });
}
```

### Application E-commerce Simple

```javascript
function createShoppingCart() {
  const products = signal([
    { id: 1, name: 'Livre', price: 15 },
    { id: 2, name: 'Stylo', price: 3 },
    { id: 3, name: 'Cahier', price: 8 }
  ]);
  
  const cart = signal([]);
  
  const total = computed(() => 
    cart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  
  const addToCart = (product) => {
    const existing = cart().find(item => item.id === product.id);
    if (existing) {
      cart(cart().map(item => 
        item.id === product.id 
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
    } else {
      cart([...cart(), {...product, quantity: 1}]);
    }
  };
  
  return render({
    tag: 'div',
    children: [
      {
        tag: 'h2',
        properties: { textContent: 'Produits' }
      },
      {
        tag: 'div',
        children: computed(() => 
          products().map(product => render({
            tag: 'div',
            children: [
              {
                tag: 'span',
                properties: { textContent: `${product.name} - ${product.price}€` }
              },
              {
                tag: 'button',
                properties: { textContent: 'Ajouter au panier' },
                events: { click: () => addToCart(product) }
              }
            ]
          }))
        )
      },
      {
        tag: 'h2',
        properties: { textContent: 'Panier' }
      },
      {
        tag: 'div',
        children: computed(() => 
          cart().map(item => render({
            tag: 'div',
            children: [
              {
                tag: 'span',
                properties: { 
                  textContent: `${item.name} x${item.quantity} = ${item.price * item.quantity}€`
                }
              }
            ]
          }))
        )
      },
      {
        tag: 'div',
        children: [
          'Total: ',
          {
            tag: 'strong',
            properties: { textContent: computed(() => `${total()}€`) }
          }
        ]
      }
    ]
  });
}
```

## Performance et Optimisations

Pulse Framework est optimisé par design :

- **Mises à jour granulaires** : Seuls les éléments qui doivent changer sont mis à jour
- **Gestion mémoire automatique** : Nettoyage automatique des listeners et effects
- **Pas de re-render complet** : Synchronisation directe des propriétés modifiées
- **WeakMap et WeakRef** : Évite les fuites mémoire

## Support et Communauté

- **GitHub** : [Odyssee-Software/pulse-framework](https://github.com/Odyssee-Software/pulse-framework)
- **Documentation** : Guides complets dans `/guides`
- **Exemples** : Applications de démonstration dans `/examples`

Pulse Framework - "No diff, only sync" 🚀