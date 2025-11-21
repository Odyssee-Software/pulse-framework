# Utilisation de JSX/TSX avec Pulse Framework

Pulse Framework supporte nativement JSX/TSX, offrant une troisième approche pour créer vos interfaces, en plus des objets déclaratifs et des template literals HTML.

## Pourquoi JSX avec Pulse ?

JSX combine :
- ✅ **Familiarité** : syntaxe proche de React/Solid
- ✅ **Type-safe** : auto-complétion et vérification TypeScript
- ✅ **Réactivité native** : les signals/computed fonctionnent directement
- ✅ **Granularité** : patch DOM ultra-fin sans Virtual DOM

## Configuration

### 1. TypeScript Configuration

Dans votre `tsconfig.json` :

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "pulse-framework"
  }
}
```

OU pour une compatibilité maximale :

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxFactory": "Pulse.jsx",
    "jsxFragmentFactory": "Pulse.Fragment"
  }
}
```

### 2. Extensions de fichiers

Utilisez `.tsx` pour vos fichiers avec JSX :

```
src/
  ├── App.tsx        ← JSX/TSX
  ├── Counter.tsx    ← JSX/TSX
  └── main.ts
```

## Syntaxe de base

### Composant simple

```tsx
import { signal } from 'pulse-framework';

function Counter() {
  const count = signal(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count(count() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

### Avec Computed

```tsx
import { signal, computed } from 'pulse-framework';

function UserProfile() {
  const firstName = signal('John');
  const lastName = signal('Doe');
  const fullName = computed(() => `${firstName()} ${lastName()}`);

  return (
    <div>
      <h1>{fullName}</h1>
      <input 
        value={firstName()} 
        onInput={(e) => firstName((e.target as HTMLInputElement).value)}
      />
    </div>
  );
}
```

## Fragments

Utilisez les fragments pour grouper des éléments sans wrapper :

```tsx
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  );
}
```

## Props et Attributs

### Propriétés HTML standard

```tsx
<div className="container" id="app">
  <img src={imageUrl} alt="Description" />
  <input type="text" value={inputValue} disabled={isDisabled} />
</div>
```

### Propriétés réactives

Les signals et computed peuvent être utilisés directement :

```tsx
const isActive = signal(true);
const message = computed(() => isActive() ? 'Active' : 'Inactive');

<div>
  <p>{message}</p>
  <button disabled={computed(() => !isActive())}>
    Action
  </button>
</div>
```

### Classes dynamiques

```tsx
const isActive = signal(false);

<div className={computed(() => isActive() ? 'active' : 'inactive')}>
  Content
</div>
```

### Styles

```tsx
const width = signal(100);

<div style={`width: ${width()}px`}>
  Resizable
</div>
```

## Événements

### Événements simples

```tsx
<button onClick={() => console.log('Clicked!')}>
  Click me
</button>
```

### Avec modification de signals

```tsx
const count = signal(0);

<button onClick={() => count(count() + 1)}>
  Increment: {count}
</button>
```

### Événements multiples

```tsx
<input
  onInput={(e) => handleInput(e)}
  onFocus={() => setFocused(true)}
  onBlur={() => setFocused(false)}
/>
```

## Comparaison des trois approches

### Approche 1 : Objets déclaratifs

```typescript
import { signal, render } from 'pulse-framework';

const count = signal(0);

const counter = render({
  tag: 'div',
  children: [
    { tag: 'p', properties: { textContent: count } },
    {
      tag: 'button',
      properties: { textContent: 'Increment' },
      events: { click: () => count(count() + 1) }
    }
  ]
});
```

### Approche 2 : Template Literals

```typescript
import { signal, render } from 'pulse-framework';

const count = signal(0);

const counter = render.html`
  <div>
    <p>${count}</p>
    <button onclick="${() => count(count() + 1)}">
      Increment
    </button>
  </div>
`;
```

### Approche 3 : JSX/TSX ⭐

```tsx
import { signal } from 'pulse-framework';

function Counter() {
  const count = signal(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => count(count() + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## Avantages de JSX

| Aspect | Avantage |
|--------|----------|
| **Type Safety** | TypeScript vérifie les props et les éléments |
| **Auto-complétion** | IntelliSense complet dans l'éditeur |
| **Lisibilité** | Structure proche du HTML final |
| **Familiarité** | Syntaxe connue pour les devs React/Solid |
| **Outils** | Support natif dans la plupart des éditeurs |

## Patterns avancés

### Composants réutilisables

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Utilisation
<Button label="Save" onClick={handleSave} variant="primary" />
```

### Conditional Rendering

```tsx
const isLoggedIn = signal(false);

function App() {
  return (
    <div>
      {isLoggedIn() ? (
        <Dashboard />
      ) : (
        <Login />
      )}
    </div>
  );
}
```

### Listes

```tsx
const items = signal(['Apple', 'Banana', 'Cherry']);

function List() {
  return (
    <ul>
      {items().map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
```

### Composition

```tsx
function Card({ children }: { children: any }) {
  return (
    <div className="card">
      {children}
    </div>
  );
}

function App() {
  return (
    <Card>
      <h1>Title</h1>
      <p>Content</p>
    </Card>
  );
}
```

## Intégration avec les autres approches

Vous pouvez mixer JSX avec les autres approches :

```tsx
import { signal, render } from 'pulse-framework';

const count = signal(0);

// JSX composant
function Counter() {
  return <p>Count: {count}</p>;
}

// Utiliser avec render()
const app = (
  <div>
    <Counter />
    {render.html`<button onclick="${() => count(count() + 1)}">+</button>`}
  </div>
);
```

## Best Practices

### 1. Nommage des composants

```tsx
// ✅ Bon - PascalCase
function UserCard() { }

// ❌ Mauvais - camelCase
function userCard() { }
```

### 2. Déstructuration des props

```tsx
// ✅ Bon
function Button({ label, onClick }: ButtonProps) { }

// ❌ Moins lisible
function Button(props: ButtonProps) { 
  const label = props.label;
}
```

### 3. Signals dans les composants

```tsx
// ✅ Bon - signal local
function Counter() {
  const count = signal(0);
  return <div>{count}</div>;
}

// ✅ Aussi bon - signal partagé
const globalCount = signal(0);
function Counter() {
  return <div>{globalCount}</div>;
}
```

### 4. Mémorisation des handlers

```tsx
// ✅ Bon pour performance
function Form() {
  const handleSubmit = () => { /* ... */ };
  
  return <button onClick={handleSubmit}>Submit</button>;
}

// ⚠️  Acceptable mais moins optimal
function Form() {
  return <button onClick={() => { /* ... */ }}>Submit</button>;
}
```

## Différences avec React

### Pas de hooks

Pulse n'utilise pas de hooks. Utilisez directement signals et computed :

```tsx
// ❌ React
function Counter() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

// ✅ Pulse
function Counter() {
  const count = signal(0);
  return <div>{count}</div>;
}
```

### Pas de Virtual DOM

Pulse patch directement le DOM, donc :
- ✅ Pas de reconciliation
- ✅ Updates ultra-granulaires
- ✅ Performance optimale
- ✅ Pas de "re-renders"

### Réactivité native

```tsx
// ✅ Pulse - les signals sont automatiquement trackés
function App() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  
  return <div>{doubled}</div>; // Se met à jour automatiquement
}
```

## Migration depuis React

```tsx
// React
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// Pulse
import { signal, effect } from 'pulse-framework';

function Counter() {
  const count = signal(0);
  
  effect(() => {
    document.title = `Count: ${count()}`;
  });
  
  return <button onClick={() => count(count() + 1)}>{count}</button>;
}
```

## Conclusion

JSX avec Pulse Framework offre :
- 🎯 **Simplicité** : pas de complexité cachée
- ⚡ **Performance** : granularité maximale
- 🔧 **Flexibilité** : utilisable avec les autres approches
- 💪 **Type-safety** : support TypeScript complet
- 🚀 **Productivité** : syntaxe familière et moderne

Choisissez l'approche qui convient le mieux à votre projet :
- **Objets déclaratifs** → pour du code programmatique
- **Template literals** → pour migrer du HTML existant
- **JSX/TSX** → pour des composants React-like avec type-safety
