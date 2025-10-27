# Signals et Computed - La Réactivité Simplifiée

## Le Problème avec les Variables Classiques

En DOM vanilla, quand une donnée change, rien ne se passe automatiquement :

```javascript
let userName = "Jean";
let greeting = `Bonjour ${userName}`;

// Plus tard...
userName = "Marie";
// greeting contient toujours "Bonjour Jean" !
// Il faut manuellement faire :
greeting = `Bonjour ${userName}`;
```

## Les Signals : Variables Réactives

Un signal est comme une variable, mais qui notifie automatiquement quand elle change :

```javascript
import { signal } from 'pulse-framework';

const userName = signal("Jean");
const greeting = computed(() => `Bonjour ${userName()}`);

console.log(greeting()); // "Bonjour Jean"

userName("Marie");
console.log(greeting()); // "Bonjour Marie" ✨ Automatique !
```

## Syntaxe des Signals

```javascript
// Créer un signal
const count = signal(0);

// Lire la valeur
console.log(count()); // 0

// Modifier la valeur  
count(5);
console.log(count()); // 5

// Incrémenter
count(count() + 1);
console.log(count()); // 6
```

## Computed : Valeurs Calculées Réactives

### DOM Vanilla (Problématique)

```javascript
let firstName = "Jean";
let lastName = "Dupont";
let fullName = `${firstName} ${lastName}`;

// Il faut penser à mettre à jour fullName partout où on change firstName ou lastName
function updateFirstName(newName) {
  firstName = newName;
  fullName = `${firstName} ${lastName}`; // Répétition !
}

function updateLastName(newName) {
  lastName = newName;
  fullName = `${firstName} ${lastName}`; // Répétition !
}
```

### Pulse Framework (Élégant)

```javascript
import { signal, computed } from 'pulse-framework';

const firstName = signal("Jean");
const lastName = signal("Dupont");
const fullName = computed(() => `${firstName()} ${lastName()}`);

// Utilisation simple
firstName("Marie");  // fullName se met à jour automatiquement
lastName("Martin");  // fullName se met à jour automatiquement

console.log(fullName()); // "Marie Martin"
```

## Exemple Pratique : Calculatrice de Prix

### Version DOM Vanilla

```html
<div>
  Prix unitaire: <input id="price" type="number" value="10">
  Quantité: <input id="quantity" type="number" value="1">
  TVA: <input id="tax" type="number" value="20">
  
  <p>Sous-total: <span id="subtotal">10</span>€</p>
  <p>TVA: <span id="taxAmount">2</span>€</p>
  <p>Total: <span id="total">12</span>€</p>
</div>
```

```javascript
// Beaucoup de code répétitif...
const priceInput = document.getElementById('price');
const quantityInput = document.getElementById('quantity');
const taxInput = document.getElementById('tax');

const subtotalEl = document.getElementById('subtotal');
const taxAmountEl = document.getElementById('taxAmount');
const totalEl = document.getElementById('total');

function calculate() {
  const price = parseFloat(priceInput.value) || 0;
  const quantity = parseFloat(quantityInput.value) || 0;
  const taxRate = parseFloat(taxInput.value) || 0;
  
  const subtotal = price * quantity;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  subtotalEl.textContent = subtotal.toFixed(2);
  taxAmountEl.textContent = taxAmount.toFixed(2);
  totalEl.textContent = total.toFixed(2);
}

priceInput.addEventListener('input', calculate);
quantityInput.addEventListener('input', calculate);
taxInput.addEventListener('input', calculate);

calculate(); // Init
```

### Version Pulse Framework

```javascript
import { signal, computed, render } from 'pulse-framework';

function createPriceCalculator() {
  const price = signal(10);
  const quantity = signal(1);
  const tax = signal(20);
  
  // Calculs automatiques !
  const subtotal = computed(() => price() * quantity());
  const taxAmount = computed(() => subtotal() * (tax() / 100));
  const total = computed(() => subtotal() + taxAmount());
  
  return render({
    tag: 'div',
    children: [
      {
        tag: 'div',
        children: [
          'Prix unitaire: ',
          {
            tag: 'input',
            attributes: { type: 'number' },
            properties: { value: price },
            events: {
              input: (e) => price(parseFloat(e.target.value) || 0)
            }
          }
        ]
      },
      {
        tag: 'div',
        children: [
          'Quantité: ',
          {
            tag: 'input',
            attributes: { type: 'number' },
            properties: { value: quantity },
            events: {
              input: (e) => quantity(parseFloat(e.target.value) || 0)
            }
          }
        ]
      },
      {
        tag: 'div',
        children: [
          'TVA: ',
          {
            tag: 'input',
            attributes: { type: 'number' },
            properties: { value: tax },
            events: {
              input: (e) => tax(parseFloat(e.target.value) || 0)
            }
          }
        ]
      },
      {
        tag: 'p',
        children: [
          'Sous-total: ',
          {
            tag: 'span',
            properties: {
              textContent: computed(() => subtotal().toFixed(2))
            }
          },
          '€'
        ]
      },
      {
        tag: 'p',
        children: [
          'TVA: ',
          {
            tag: 'span',
            properties: {
              textContent: computed(() => taxAmount().toFixed(2))
            }
          },
          '€'
        ]
      },
      {
        tag: 'p',
        children: [
          'Total: ',
          {
            tag: 'span',
            properties: {
              textContent: computed(() => total().toFixed(2))
            }
          },
          '€'
        ]
      }
    ]
  });
}
```

## Avantages des Signals et Computed

### 1. **Cohérence Automatique**
- Les valeurs calculées sont toujours à jour
- Impossible d'avoir des incohérences entre les données

### 2. **Performance Optimisée**
- Recalcul uniquement quand nécessaire
- Pulse détecte automatiquement les dépendances

### 3. **Code Plus Lisible**
- La logique métier est claire et séparée
- Pas de code de synchronisation éparpillé

### 4. **Debugging Facile**
- Les relations entre données sont explicites
- Facile de tracer d'où viennent les changements

## Patterns Avancés

### Signal dérivé avec logique complexe

```javascript
const users = signal([
  { name: "Jean", age: 25, active: true },
  { name: "Marie", age: 30, active: false },
  { name: "Paul", age: 35, active: true }
]);

const activeUsers = computed(() => 
  users().filter(user => user.active)
);

const averageAge = computed(() => {
  const active = activeUsers();
  if (active.length === 0) return 0;
  return active.reduce((sum, user) => sum + user.age, 0) / active.length;
});

// Quand users() change, activeUsers() et averageAge() se mettent à jour automatiquement
```

### Signal avec validation

```javascript
const email = signal("");
const isValidEmail = computed(() => {
  const value = email();
  return value.includes("@") && value.includes(".");
});

const submitEnabled = computed(() => {
  return email().length > 0 && isValidEmail();
});
```

## Prochaine Étape

Découvrez comment créer des [Composants Réutilisables](./03-components.md) avec Pulse Framework.