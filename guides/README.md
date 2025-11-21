# Documentation Pulse Framework

## Guide de Démarrage Rapide

Pulse Framework est un micro-framework réactif "DOM-first" conçu pour les développeurs habitués au DOM vanilla qui veulent bénéficier de la réactivité moderne sans la complexité.

### Installation

```bash
npm install pulse-framework
```

### Premier Exemple - Nouvelle Syntaxe HTML ⭐

```javascript
import { signal, computed, render } from 'pulse-framework';

const count = signal(0);
const doubled = computed(() => count() * 2);

// HTML Template Literals - Le plus naturel !
const app = render.html`
  <div>
    <p>Compteur: <span>${count}</span></p>
    <p>Double: <span>${doubled}</span></p>
    <button onclick="${() => count(count() + 1)}">
      Incrémenter
    </button>
  </div>
`;

document.body.appendChild(app);
```

### Même Exemple - Syntaxe Objets (Alternative)

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

## 📚 Guides Complets

### Démarrage
- **[01 - Getting Started](./01-getting-started.md)** : Installation, premier composant, concepts de base
- **[02 - Signals & Computed](./02-signals-computed.md)** : Réactivité fine-grained, computed values, dependencies

### Développement
- **[03 - Components](./03-components.md)** : Architecture composants, props, lifecycle
- **[04 - Advanced Patterns](./04-advanced-patterns.md)** : Patterns avancés, performance, debugging
- **[05 - Migration Guide](./05-migration-guide.md)** : Migration depuis React, Vue, Solid

### Outils et APIs
- **[06 - JSX Usage](./06-jsx-usage.md)** : Guide complet JSX/TSX avec Pulse
- **[07 - Debugging](./07-debugging.md)** : Outils de debug, visualisation du graphe réactif
- **[08 - Scheduler & Batching](./08-scheduler-batching.md)** : Optimisation des updates, batching automatique ⚡
- **[09 - Micro-DSL](./09-micro-dsl.md)** : Bindings déclaratifs HTML-first (alternative à JSX) 🎯

## 🎯 Par Niveau

### Débutant
1. Getting Started
2. Signals & Computed
3. Components

### Intermédiaire
4. Advanced Patterns
5. Migration Guide
6. JSX Usage
9. Micro-DSL

### Avancé
7. Debugging
8. Scheduler & Batching

## 🔍 Par Use Case

**Je veux...**
- Démarrer avec Pulse → [01 - Getting Started](./01-getting-started.md)
- Comprendre la réactivité → [02 - Signals & Computed](./02-signals-computed.md)
- Créer des composants → [03 - Components](./03-components.md)
- Utiliser JSX → [06 - JSX Usage](./06-jsx-usage.md)
- Utiliser du HTML natif → [09 - Micro-DSL](./09-micro-dsl.md)
- Migrer depuis React/Vue → [05 - Migration Guide](./05-migration-guide.md)
- Optimiser les performances → [04 - Advanced Patterns](./04-advanced-patterns.md) + [08 - Scheduler](./08-scheduler-batching.md)
- Débugger mon app → [07 - Debugging](./07-debugging.md)

## 📖 Ordre de Lecture Recommandé

```
01 Getting Started
    ↓
02 Signals & Computed
    ↓
03 Components
    ↓
06 JSX Usage (si vous utilisez JSX)
 ou
09 Micro-DSL (si vous préférez HTML natif)
    ↓
08 Scheduler & Batching (pour optimiser)
    ↓
04 Advanced Patterns
    ↓
07 Debugging (quand nécessaire)
```

## 💡 Tips de Navigation

- Chaque guide est **standalone** : lisez dans l'ordre qui vous convient
- Les **exemples** sont copiables-collables
- Les guides incluent des **comparaisons** avec React, Vue, Solid
- **08 - Scheduler** : Essentiel pour les apps avec beaucoup de mises à jour
- **09 - Micro-DSL** : Alternative à JSX pour une approche HTML-first
- Consultez **07 - Debugging** dès que vous rencontrez un problème

Bon apprentissage ! 🚀

document.body.appendChild(app);
```

## 🎯 Avantages Clés

### HTML Template Literals
- ✅ **Familier** : Syntaxe HTML que vous connaissez déjà
- ✅ **Concis** : Moins de code, plus lisible
- ✅ **Réactif** : `${signal}` se met à jour automatiquement
- ✅ **Puissant** : `onclick="${handler}"` avec toute la logique JS

### Objets Déclaratifs  
- ✅ **TypeScript** : Auto-complétion et types stricts
- ✅ **Structuré** : Parfait pour la logique complexe
- ✅ **Prévisible** : Comportement explicite et contrôlé

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
   - Listes dynamiques et rendu conditionnel
   - Performance et optimisations

5. **[Guide de Migration](./05-migration-guide.md)**
   - Depuis du code DOM vanilla
   - Depuis jQuery
   - Approche progressive
   - Stratégies de migration

6. **[JSX/TSX avec Pulse](./06-jsx-usage.md)** ⭐ NOUVEAU
   - Configuration TypeScript
   - Syntaxe JSX avec Pulse
   - Composants réutilisables
   - Différences avec React
   - Best practices

7. **[Debug du Graphe Réactif](./07-debugging.md)** 🔍 NOUVEAU
   - Activation du mode debug
   - Visualisation du graphe
   - Traçage des propagations
   - Outils de diagnostic
   - Best practices
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