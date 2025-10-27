# Patterns Avancés avec Pulse Framework

## Gestion d'État Complexe

### Pattern Store Global

En DOM vanilla, gérer un état global est complexe :

```javascript
// DOM vanilla - Store global fragile
const AppState = {
  user: null,
  cart: [],
  notifications: [],
  
  // Observers manuels et error-prone
  observers: [],
  
  notify(change) {
    this.observers.forEach(fn => fn(change));
  },
  
  setUser(user) {
    this.user = user;
    this.notify({ type: 'USER_CHANGED', user });
  },
  
  addToCart(item) {
    this.cart.push(item);
    this.notify({ type: 'CART_CHANGED', cart: this.cart });
  }
};

// Composants doivent manuellement s'abonner/désabonner
function createUserProfile() {
  const element = document.createElement('div');
  
  const observer = (change) => {
    if (change.type === 'USER_CHANGED') {
      updateDisplay(); // Code répétitif
    }
  };
  
  AppState.observers.push(observer);
  
  // Risque de memory leak si on oublie de nettoyer !
  return { element, destroy: () => {
    AppState.observers = AppState.observers.filter(o => o !== observer);
  }};
}
```

### Store avec Pulse Framework

```javascript
import { signal, computed } from 'pulse-framework';

// Store global simple et robuste
export const AppStore = {
  // États
  user: signal(null),
  cart: signal([]),
  notifications: signal([]),
  theme: signal('light'),
  
  // Computed dérivés
  cartTotal: computed(() => 
    AppStore.cart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  ),
  
  cartItemCount: computed(() => 
    AppStore.cart().reduce((sum, item) => sum + item.quantity, 0)
  ),
  
  isAuthenticated: computed(() => AppStore.user() !== null),
  
  unreadNotifications: computed(() => 
    AppStore.notifications().filter(n => !n.read).length
  ),
  
  // Actions
  setUser(user) {
    AppStore.user(user);
  },
  
  addToCart(product, quantity = 1) {
    const cart = AppStore.cart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      AppStore.cart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      AppStore.cart([...cart, { ...product, quantity }]);
    }
  },
  
  removeFromCart(productId) {
    AppStore.cart(AppStore.cart().filter(item => item.id !== productId));
  },
  
  addNotification(message, type = 'info') {
    AppStore.notifications([
      ...AppStore.notifications(),
      {
        id: Date.now(),
        message,
        type,
        read: false,
        timestamp: new Date()
      }
    ]);
  }
};

// Utilisation dans les composants - Synchronisation automatique !
function createUserProfile() {
  return render({
    tag: 'div',
    attributes: { class: 'user-profile' },
    children: [
      {
        tag: 'h2',
        properties: {
          textContent: computed(() => 
            AppStore.isAuthenticated() 
              ? `Bonjour ${AppStore.user().name}` 
              : 'Non connecté'
          )
        }
      },
      {
        tag: 'div',
        properties: {
          textContent: computed(() => 
            `Panier: ${AppStore.cartItemCount()} articles (${AppStore.cartTotal().toFixed(2)}€)`
          )
        }
      }
    ]
  });
}
```

## Gestion des Formulaires

### Formulaire Complexe avec Validation

```javascript
import { signal, computed, render } from 'pulse-framework';

function createUserForm({ onSubmit = () => {} } = {}) {
  // États du formulaire
  const formData = {
    email: signal(''),
    password: signal(''),
    confirmPassword: signal(''),
    firstName: signal(''),
    lastName: signal(''),
    acceptTerms: signal(false)
  };
  
  // Validations
  const validations = {
    email: computed(() => {
      const email = formData.email();
      if (!email) return 'Email requis';
      if (!/\S+@\S+\.\S+/.test(email)) return 'Email invalide';
      return null;
    }),
    
    password: computed(() => {
      const password = formData.password();
      if (!password) return 'Mot de passe requis';
      if (password.length < 8) return 'Au moins 8 caractères';
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Doit contenir majuscule, minuscule et chiffre';
      }
      return null;
    }),
    
    confirmPassword: computed(() => {
      const password = formData.password();
      const confirm = formData.confirmPassword();
      if (!confirm) return 'Confirmation requise';
      if (password !== confirm) return 'Mots de passe différents';
      return null;
    }),
    
    firstName: computed(() => {
      const name = formData.firstName();
      if (!name.trim()) return 'Prénom requis';
      if (name.trim().length < 2) return 'Au moins 2 caractères';
      return null;
    }),
    
    lastName: computed(() => {
      const name = formData.lastName();
      if (!name.trim()) return 'Nom requis';
      if (name.trim().length < 2) return 'Au moins 2 caractères';
      return null;
    }),
    
    acceptTerms: computed(() => {
      return formData.acceptTerms() ? null : 'Vous devez accepter les conditions';
    })
  };
  
  // État global du formulaire
  const isValid = computed(() => 
    Object.values(validations).every(validation => validation() === null)
  );
  
  const hasErrors = computed(() => 
    Object.values(validations).some(validation => validation() !== null)
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid()) {
      const data = Object.fromEntries(
        Object.entries(formData).map(([key, signal]) => [key, signal()])
      );
      onSubmit(data);
    }
  };
  
  // Helper pour créer un champ avec validation
  const createField = (key, type = 'text', placeholder = '') => ({
    tag: 'div',
    attributes: { class: 'form-field' },
    children: [
      {
        tag: 'input',
        attributes: { 
          type,
          placeholder,
          class: computed(() => 
            validations[key]() ? 'error' : ''
          )
        },
        properties: { 
          value: formData[key],
          checked: type === 'checkbox' ? formData[key] : undefined
        },
        events: {
          input: (e) => formData[key](
            type === 'checkbox' ? e.target.checked : e.target.value
          )
        }
      },
      {
        tag: 'div',
        attributes: { class: 'error-message' },
        properties: {
          textContent: validations[key],
          style: computed(() => 
            validations[key]() ? 'color: red; font-size: 0.8em;' : 'display: none;'
          )
        }
      }
    ]
  });
  
  return render({
    tag: 'form',
    attributes: { class: 'user-form' },
    events: { submit: handleSubmit },
    children: [
      {
        tag: 'h2',
        properties: { textContent: 'Inscription' }
      },
      
      createField('email', 'email', 'Votre email'),
      createField('firstName', 'text', 'Prénom'),
      createField('lastName', 'text', 'Nom'),
      createField('password', 'password', 'Mot de passe'),
      createField('confirmPassword', 'password', 'Confirmez le mot de passe'),
      
      {
        tag: 'label',
        children: [
          {
            tag: 'input',
            attributes: { type: 'checkbox' },
            properties: { checked: formData.acceptTerms },
            events: {
              change: (e) => formData.acceptTerms(e.target.checked)
            }
          },
          ' J\'accepte les conditions d\'utilisation'
        ]
      },
      
      {
        tag: 'button',
        attributes: { type: 'submit' },
        properties: {
          textContent: 'S\'inscrire',
          disabled: computed(() => !isValid()),
          style: computed(() => 
            isValid() 
              ? 'background: green; color: white;' 
              : 'background: gray; color: #ccc;'
          )
        }
      },
      
      // Résumé des erreurs
      {
        tag: 'div',
        attributes: { class: 'form-summary' },
        properties: {
          style: computed(() => hasErrors() ? 'display: block;' : 'display: none;')
        },
        children: [
          {
            tag: 'p',
            properties: { 
              textContent: computed(() => {
                const errors = Object.values(validations)
                  .map(v => v())
                  .filter(Boolean);
                return errors.length > 0 ? `${errors.length} erreur(s) à corriger` : '';
              })
            }
          }
        ]
      }
    ]
  });
}
```

## Pattern de Navigation (SPA)

```javascript
import { signal, computed, render } from 'pulse-framework';

// Router simple mais puissant
export const Router = {
  currentPath: signal(window.location.pathname),
  params: signal({}),
  
  // Computed pour la route actuelle
  currentRoute: computed(() => {
    const path = Router.currentPath();
    const routes = [
      { path: '/', component: 'home' },
      { path: '/users', component: 'users' },
      { path: '/users/:id', component: 'user-detail' },
      { path: '/products/:category', component: 'products' },
      { path: '/cart', component: 'cart' }
    ];
    
    for (const route of routes) {
      const match = matchPath(path, route.path);
      if (match) {
        Router.params(match.params);
        return { ...route, params: match.params };
      }
    }
    
    return { component: '404', params: {} };
  }),
  
  navigate(path) {
    window.history.pushState({}, '', path);
    Router.currentPath(path);
  },
  
  init() {
    window.addEventListener('popstate', () => {
      Router.currentPath(window.location.pathname);
    });
  }
};

// Helper pour matcher les routes
function matchPath(pathname, pattern) {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  
  if (patternParts.length !== pathParts.length) return null;
  
  const params = {};
  
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];
    
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }
  
  return { params };
}

// App principale avec routing
function createApp() {
  Router.init();
  
  return render({
    tag: 'div',
    attributes: { class: 'app' },
    children: [
      // Navigation
      {
        tag: 'nav',
        children: [
          {
            tag: 'a',
            properties: { textContent: 'Accueil' },
            events: { click: (e) => { e.preventDefault(); Router.navigate('/'); }}
          },
          {
            tag: 'a',
            properties: { textContent: 'Utilisateurs' },
            events: { click: (e) => { e.preventDefault(); Router.navigate('/users'); }}
          },
          {
            tag: 'a',
            properties: { textContent: 'Panier' },
            events: { click: (e) => { e.preventDefault(); Router.navigate('/cart'); }}
          }
        ]
      },
      
      // Contenu dynamique basé sur la route
      {
        tag: 'main',
        children: computed(() => {
          const route = Router.currentRoute();
          
          switch (route.component) {
            case 'home':
              return [createHomePage()];
            case 'users':
              return [createUsersPage()];
            case 'user-detail':
              return [createUserDetailPage(route.params.id)];
            case 'products':
              return [createProductsPage(route.params.category)];
            case 'cart':
              return [createCartPage()];
            default:
              return [create404Page()];
          }
        })
      }
    ]
  });
}
```

## Pattern Async et Loading States

```javascript
import { signal, computed, render } from 'pulse-framework';

function createAsyncDataComponent() {
  const isLoading = signal(false);
  const data = signal(null);
  const error = signal(null);
  
  const loadData = async () => {
    isLoading(true);
    error(null);
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Erreur réseau');
      
      const result = await response.json();
      data(result);
    } catch (err) {
      error(err.message);
    } finally {
      isLoading(false);
    }
  };
  
  // Auto-load au démarrage
  loadData();
  
  return render({
    tag: 'div',
    children: computed(() => {
      if (isLoading()) {
        return [{
          tag: 'div',
          attributes: { class: 'loading' },
          properties: { textContent: 'Chargement...' }
        }];
      }
      
      if (error()) {
        return [{
          tag: 'div',
          attributes: { class: 'error' },
          children: [
            {
              tag: 'p',
              properties: { textContent: `Erreur: ${error()}` }
            },
            {
              tag: 'button',
              properties: { textContent: 'Réessayer' },
              events: { click: loadData }
            }
          ]
        }];
      }
      
      if (data()) {
        return [{
          tag: 'div',
          attributes: { class: 'data' },
          children: [
            {
              tag: 'h3',
              properties: { textContent: 'Données chargées' }
            },
            {
              tag: 'pre',
              properties: { textContent: JSON.stringify(data(), null, 2) }
            },
            {
              tag: 'button',
              properties: { textContent: 'Recharger' },
              events: { click: loadData }
            }
          ]
        }];
      }
      
      return [{
        tag: 'div',
        properties: { textContent: 'Aucune donnée' }
      }];
    })
  });
}
```

## Performance et Optimisations

### Lazy Loading de Composants

```javascript
const LazyComponent = {
  cache: new Map(),
  
  async load(name) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }
    
    const module = await import(`./components/${name}.js`);
    this.cache.set(name, module.default);
    return module.default;
  }
};

function createLazyWrapper(componentName, fallback = 'Chargement...') {
  const component = signal(null);
  const isLoading = signal(true);
  
  LazyComponent.load(componentName).then(comp => {
    component(comp);
    isLoading(false);
  });
  
  return render({
    tag: 'div',
    children: computed(() => {
      if (isLoading()) {
        return [{ tag: 'div', properties: { textContent: fallback }}];
      }
      
      const comp = component();
      return comp ? [comp()] : [];
    })
  });
}
```

Ces patterns montrent la puissance et la flexibilité de Pulse Framework pour gérer des applications complexes avec un code simple et maintenable.