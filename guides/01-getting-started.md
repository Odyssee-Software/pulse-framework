# Guide de Démarrage - Pulse Framework

## Pourquoi Pulse au lieu du DOM vanilla ?

Si vous développez déjà avec le DOM JavaScript, vous connaissez ces problèmes :

```javascript
// DOM vanilla - Code répétitif et fragile
let count = 0;
const countElement = document.getElementById('count');
const incrementBtn = document.getElementById('increment');

function updateDisplay() {
  countElement.textContent = count; // Oubli facile !
  // Et si count change ailleurs ? Il faut se rappeler d'appeler updateDisplay()
}

incrementBtn.addEventListener('click', () => {
  count++;
  updateDisplay(); // Obligé de penser à ça à chaque fois
});
```

**Avec Pulse Framework (3 approches possibles) :**

### Approche 1 : Objets Déclaratifs

```javascript
import { signal, render } from 'pulse-framework';

const count = signal(0);

const counterApp = render({
  tag: 'div',
  children: [
    {
      tag: 'span',
      properties: {
        textContent: count  // ✨ Réactif automatiquement !
      }
    },
    {
      tag: 'button',
      properties: {
        textContent: 'Incrémenter'
      },
      events: {
        click: () => count(count() + 1) // ✨ L'affichage se met à jour tout seul !
      }
    }
  ]
});
```

### Approche 2 : HTML Template Literals ⭐ (Nouveau !)

```javascript
import { signal, render } from 'pulse-framework';

const count = signal(0);

const counterApp = render.html`
  <div>
    <span>${count}</span>
    <button onclick="${() => count(count() + 1)}">
      Incrémenter
    </button>
  </div>
`;
```

**🎯 Le meilleur des deux mondes :** la familiarité du HTML avec la puissance de la réactivité !

## Installation

```bash
npm install pulse-framework
```

## Premier Exemple : Compteur Simple

### Version DOM Vanilla (40 lignes de complexité)

```html
<div id="app">
  <div>
    <span id="counter">0</span>
    <button id="increment">+</button>
    <button id="decrement">-</button>
    <button id="reset">Reset</button>
  </div>
  <div>
    <p>Double: <span id="doubled">0</span></p>
    <p>Signe: <span id="sign">→</span></p>
  </div>
</div>
```

```javascript
// Beaucoup de boilerplate et de risques d'erreurs...
let count = 0;

const counterEl = document.getElementById('counter');
const doubledEl = document.getElementById('doubled');
const signEl = document.getElementById('sign');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

function updateAll() {
  counterEl.textContent = count;
  doubledEl.textContent = count * 2;
  signEl.textContent = count > 0 ? '➕' : count < 0 ? '➖' : '→';
}

incrementBtn.addEventListener('click', () => {
  count++;
  updateAll(); // Obligé de se rappeler !
});

decrementBtn.addEventListener('click', () => {
  count--;
  updateAll(); // Obligé de se rappeler !
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateAll(); // Obligé de se rappeler !
});

updateAll(); // Et même l'init !
```

### Version Pulse Framework - Approche Objets (15 lignes)

```javascript
import { signal, computed, render } from 'pulse-framework';

function createCounter() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  const sign = computed(() => {
    const value = count();
    return value > 0 ? '➕' : value < 0 ? '➖' : '→';
  });

  return render({
    tag: 'div',
    children: [
      {
        tag: 'div',
        children: [
          {
            tag: 'span',
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
            tag: 'button',
            properties: { textContent: 'Reset' },
            events: { click: () => count(0) }
          }
        ]
      },
      {
        tag: 'div',
        children: [
          {
            tag: 'p',
            children: [
              'Double: ',
              {
                tag: 'span',
                properties: { textContent: doubled } // ✨ Auto-sync
              }
            ]
          },
          {
            tag: 'p', 
            children: [
              'Signe: ',
              {
                tag: 'span',
                properties: { textContent: sign } // ✨ Auto-sync
              }
            ]
          }
        ]
      }
    ]
  });
}
```

### Version Pulse Framework - HTML Template Literals ⭐ (8 lignes !)

```javascript
import { signal, computed, render } from 'pulse-framework';

function createCounter() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  const sign = computed(() => {
    const value = count();
    return value > 0 ? '➕' : value < 0 ? '➖' : '→';
  });

  return render.html`
    <div>
      <div>
        <span>${count}</span>
        <button onclick="${() => count(count() + 1)}">+</button>
        <button onclick="${() => count(count() - 1)}">-</button>
        <button onclick="${() => count(0)}">Reset</button>
      </div>
      <div>
        <p>Double: <span>${doubled}</span></p>
        <p>Signe: <span>${sign}</span></p>
      </div>
    </div>
  `;
}
```

### Utilisation (identique pour toutes les approches)

```javascript
// Utilisation
document.getElementById('app').appendChild(createCounter());
```
  count--;
  updateAll(); // Obligé de se rappeler !
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateAll(); // Obligé de se rappeler !
});

updateAll(); // Et même l'init !
```

### Version Pulse Framework (15 lignes)

```javascript
import { signal, computed, render } from 'pulse-framework';

function createCounter() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  const sign = computed(() => {
    const value = count();
    return value > 0 ? '➕' : value < 0 ? '➖' : '→';
  });

  return render({
    tag: 'div',
    children: [
      {
        tag: 'div',
        children: [
          {
            tag: 'span',
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
            tag: 'button',
            properties: { textContent: 'Reset' },
            events: { click: () => count(0) }
          }
        ]
      },
      {
        tag: 'div',
        children: [
          {
            tag: 'p',
            children: [
              'Double: ',
              {
                tag: 'span',
                properties: { textContent: doubled } // ✨ Auto-sync
              }
            ]
          },
          {
            tag: 'p', 
            children: [
              'Signe: ',
              {
                tag: 'span',
                properties: { textContent: sign } // ✨ Auto-sync
              }
            ]
          }
        ]
      }
    ]
  });
}

// Utilisation
document.getElementById('app').appendChild(createCounter());
```

## Les Avantages Clés

### 1. **Synchronisation Automatique**
- ❌ DOM vanilla : Vous devez manuellement mettre à jour chaque élément
- ✅ Pulse : Les changements se propagent automatiquement

### 2. **Moins d'Erreurs**
- ❌ DOM vanilla : Oubli fréquent d'appeler les fonctions de mise à jour
- ✅ Pulse : Impossible d'oublier, c'est automatique

### 3. **Code Plus Maintenable**
- ❌ DOM vanilla : Code éparpillé, logique métier mélangée avec la UI
- ✅ Pulse : Structure claire, séparation logique

### 4. **Choix de Syntaxe**
- 🎯 **Objets déclaratifs** : Parfait pour les structures complexes, auto-complétion TypeScript
- 🎯 **HTML template literals** : Familier pour les développeurs HTML/CSS, plus concis

### 5. **Performance**
- ❌ DOM vanilla : Updates non optimisés, souvent trop fréquents
- ✅ Pulse : Seulement les éléments qui ont vraiment changé

## Quand Utiliser Quelle Approche ?

### HTML Template Literals `render.html` ⭐
```javascript
// ✅ Parfait pour :
// - Développeurs habitués à HTML/CSS
// - Prototypage rapide
// - Composants avec beaucoup de markup
// - Migration depuis du HTML existant

const myComponent = render.html`
  <article class="card">
    <h2>${title}</h2>
    <p>${description}</p>
    <button onclick="${handleClick}">Action</button>
  </article>
`;
```

### Objets Déclaratifs `render({})`
```javascript
// ✅ Parfait pour :
// - TypeScript strict avec auto-complétion
// - Logique conditionnelle complexe
// - Composants très dynamiques
// - Quand vous préférez la programmation objet

const myComponent = render({
  tag: 'article',
  attributes: { class: 'card' },
  children: [
    { tag: 'h2', properties: { textContent: title }},
    { tag: 'p', properties: { textContent: description }},
    { 
      tag: 'button', 
      properties: { textContent: 'Action' },
      events: { click: handleClick }
    }
  ]
});
```

### Combinaison des Deux
```javascript
// ✅ Vous pouvez même mélanger !
function createComplexComponent() {
  const header = render.html`
    <header class="component-header">
      <h1>${title}</h1>
    </header>
  `;
  
  const dynamicContent = render({
    tag: 'main',
    children: items().map(item => render.html`
      <div class="item">${item.name}</div>
    `)
  });
  
  return render.html`
    <div class="complex-component">
      ${header}
      ${dynamicContent}
    </div>
  `;
}
```
- ❌ DOM vanilla : Vous devez optimiser manuellement (éviter les mises à jour inutiles)
- ✅ Pulse : Optimisations automatiques, mise à jour uniquement si la valeur change

### 5. **Gestion Mémoire**
- ❌ DOM vanilla : Risque de fuites mémoire avec les event listeners
- ✅ Pulse : Nettoyage automatique quand les éléments sont supprimés

## Prochaine Étape

Continuez avec le [Guide des Signals et Computed](./02-signals-computed.md) pour comprendre la réactivité en profondeur.