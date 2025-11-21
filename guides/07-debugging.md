# Guide de Debug du Graphe Réactif

Pulse Framework intègre un système de debug puissant pour visualiser et analyser votre graphe réactif en temps réel.

## Activation du mode debug

```typescript
import { __DEBUG__ } from 'pulse-framework'

// Activer le tracking du graphe
__DEBUG__.enable()
```

⚠️ **Important** : Le debug mode ajoute un léger overhead. Activez-le uniquement en développement.

## Visualisation du graphe

### Vue complète

```typescript
__DEBUG__.graph()
```

Affiche tous les nodes avec leurs détails :

```
🔎 Reactive Graph Debugger
Total nodes: 5

SIGNAL #0 (count)
  value: 0
  deps: (none)
  subs (1):
    ← computed #1

COMPUTED #1 (doubled)
  value: 0
  dirty: false
  deps (1):
    → signal #0
  subs (1):
    ← effect #2

EFFECT #2
  fn: () => { console.log(...) }
  deps (1):
    → computed #1
  subs: (none)
```

### Vue arborescente

```typescript
__DEBUG__.tree()
```

Affiche la hiérarchie des dépendances :

```
🌳 Reactive Graph Tree
Roots found: 1

EFFECT #2
  COMPUTED #1 = 0
    SIGNAL #0 (count) = 0
```

### Statistiques

```typescript
__DEBUG__.stats()
```

```
📊 Graph Statistics
Total nodes: 5
  - Signals: 2
  - Computed: 2
  - Effects: 1
Dirty nodes: 0
Average depth: 2.00
```

## Tracking des propagations

Pour comprendre comment un changement se propage :

```typescript
const count = signal(0, 'count')
const doubled = computed(() => count() * 2, 'doubled')

// Tracer la propagation
const countNode = __DEBUG__.findByType('signal')[0]
__DEBUG__.dirty(countNode)
```

Résultat :

```
🔥 Dirty propagation from SIGNAL #0
signal #0 (count) 🔴 DIRTY
  computed #1 (doubled) 🔴 DIRTY
    effect #2 🟢 CLEAN
```

## Nommage des nodes

Pour faciliter le debug, nommez vos signals et computed :

```typescript
// Avec noms
const count = signal(0, 'count')
const doubled = computed(() => count() * 2, 'doubled')
effect(() => {
  console.log(doubled())
}, 'log-doubled')

// Les noms apparaissent dans le debugger
__DEBUG__.graph()
// → SIGNAL #0 (count)
// → COMPUTED #1 (doubled)
// → EFFECT #2 (log-doubled)
```

## Recherche de nodes

### Par ID

```typescript
const node = __DEBUG__.findNode(0)
console.log(node)
```

### Par type

```typescript
const signals = __DEBUG__.findByType('signal')
const computed = __DEBUG__.findByType('computed')
const effects = __DEBUG__.findByType('effect')
```

## API complète

```typescript
interface DebugAPI {
  // Activation/désactivation
  enable(): void
  disable(): void
  
  // Visualisation
  graph(): void           // Vue complète
  tree(): void           // Arbre des dépendances
  stats(): void          // Statistiques
  dirty(node): void      // Tracer la propagation
  
  // Recherche
  findNode(id: number): ReactiveNode | undefined
  findByType(type: 'signal' | 'computed' | 'effect'): ReactiveNode[]
  
  // Utilitaires
  clear(): void          // Nettoyer le registre
  
  // Propriétés
  enabled: boolean       // État du debug mode
  nodeCount: number      // Nombre de nodes
}
```

## Exemple complet

```typescript
import { signal, computed, effect, __DEBUG__ } from 'pulse-framework'

// Activer le debug
__DEBUG__.enable()

// Créer un graphe réactif
const firstName = signal('John', 'firstName')
const lastName = signal('Doe', 'lastName')

const fullName = computed(() => {
  return `${firstName()} ${lastName()}`
}, 'fullName')

const greeting = computed(() => {
  return `Hello, ${fullName()}!`
}, 'greeting')

effect(() => {
  console.log(greeting())
}, 'log-greeting')

// Visualiser le graphe
console.log('=== Initial State ===')
__DEBUG__.graph()
__DEBUG__.tree()
__DEBUG__.stats()

// Modifier un signal et tracer
console.log('\n=== After change ===')
const firstNameNode = __DEBUG__.findByType('signal')[0]
firstName('Jane')
__DEBUG__.dirty(firstNameNode)

// Statistiques finales
console.log('\n=== Final Stats ===')
__DEBUG__.stats()
```

## Integration avec les DevTools

Vous pouvez exposer l'API de debug globalement pour un accès facile depuis la console :

```typescript
// En développement uniquement
if (import.meta.env.DEV) {
  import { __DEBUG__ } from 'pulse-framework'
  __DEBUG__.enable()
  
  // Exposer globalement
  ;(window as any).__PULSE__ = __DEBUG__
}
```

Puis dans la console du navigateur :

```javascript
// Visualiser le graphe
__PULSE__.graph()

// Voir les statistiques
__PULSE__.stats()

// Trouver tous les signals
__PULSE__.findByType('signal')
```

## Best Practices

### 1. Nommez vos nodes importants

```typescript
// ✅ Bon
const userCount = signal(0, 'userCount')
const isLoading = signal(false, 'isLoading')

// ❌ Sans nom (plus difficile à débugger)
const userCount = signal(0)
```

### 2. Désactivez en production

```typescript
// vite.config.ts
export default {
  define: {
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production')
  }
}

// app.ts
if (import.meta.env.DEV) {
  __DEBUG__.enable()
}
```

### 3. Utilisez les statistiques pour détecter les fuites

```typescript
// Avant une opération
__DEBUG__.stats()  // → 10 nodes

// Après plusieurs opérations
performOperations()

// Vérifier qu'il n'y a pas de fuite
__DEBUG__.stats()  // → Devrait être proche de 10
```

### 4. Tracez les propagations lentes

```typescript
const start = performance.now()
mySignal(newValue)
const duration = performance.now() - start

if (duration > 16) {  // Plus d'une frame
  console.warn('Slow propagation detected')
  const node = __DEBUG__.findByType('signal').find(n => n.value === newValue)
  __DEBUG__.dirty(node)  // Voir ce qui ralentit
}
```

## Troubleshooting

### Le debug ne fonctionne pas

```typescript
// Vérifiez que c'est activé
console.log(__DEBUG__.enabled)  // Devrait être true

// Si false, activez-le
__DEBUG__.enable()
```

### Trop de nodes dans le graphe

```typescript
// Nettoyez le registre
__DEBUG__.clear()

// Puis réactivez
__DEBUG__.enable()
```

### Performance dégradée

Le debug mode ajoute un léger overhead. En production, assurez-vous qu'il est désactivé :

```typescript
if (import.meta.env.PROD) {
  __DEBUG__.disable()
}
```

## Conclusion

Le système de debug de Pulse vous offre :
- 🔍 **Visibilité totale** sur votre graphe réactif
- 🎯 **Identification facile** des problèmes de performance
- 📊 **Statistiques détaillées** sur la structure du graphe
- 🔥 **Traçage des propagations** pour comprendre les updates
- 🛠️ **API programmatique** pour l'automatisation

C'est un outil essentiel pour comprendre et optimiser vos applications Pulse !
