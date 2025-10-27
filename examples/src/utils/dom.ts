/**
 * Utilitaires pour la création d'éléments DOM
 */

/**
 * Crée une icône SVG
 */
export function createIcon(name: string, size: number = 16): HTMLElement {
  const icons: Record<string, string> = {
    plus: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m-7-7h14"/>`,
    minus: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>`,
    refresh: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 4v6h6m16 10v-6h-6M21 4a9 9 0 0 0-9 9 9 9 0 0 1-9 9"/>`,
    shuffle: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3h5v5m-5-5L8 14l-3-3m12 9h5v-5m-5 5l-8-8 3-3"/>`,
    check: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/>`,
    x: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6 6 18M6 6l12 12"/>`,
    trash: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>`,
    eye: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>`,
    eyeOff: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/>`,
    zap: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`,
    activity: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 12h-4l-3 9L9 3l-3 9H2"/>`,
    list: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h16M8 12h16M8 18h16M3 6h.01M3 12h.01M3 18h.01"/>`,
    layers: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`,
    cpu: `<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v3M15 1v3m0 16v3M9 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>`,
    bar: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20V10M18 20V4M6 20v-4"/>`
  }

  const iconPath = icons[name] || icons.zap

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', size.toString())
  svg.setAttribute('height', size.toString())
  svg.setAttribute('viewBox', '0 0 24 24')
  svg.setAttribute('fill', 'none')
  svg.innerHTML = iconPath
  
  return svg as unknown as HTMLElement
}

export interface ElementOptions {
  className?: string
  id?: string
  style?: Partial<CSSStyleDeclaration> | string
  attributes?: Record<string, string>
  children?: (HTMLElement | string)[]
  textContent?: string
  innerHTML?: string
}

/**
 * Crée un élément DOM avec les options specifiées
 */
export function createElement(
  tag: keyof HTMLElementTagNameMap,
  options: ElementOptions = {}
): HTMLElement {
  const element = document.createElement(tag)

  if (options.className) {
    element.className = options.className
  }

  if (options.id) {
    element.id = options.id
  }

  if (options.style) {
    if (typeof options.style === 'string') {
      element.style.cssText = options.style
    } else {
      Object.assign(element.style, options.style)
    }
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
  }

  if (options.textContent) {
    element.textContent = options.textContent
  } else if (options.innerHTML) {
    element.innerHTML = options.innerHTML
  }

  if (options.children) {
    options.children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })
  }

  return element
}

/**
 * Crée un conteneur avec un titre
 */
export function createSection(title: string, className: string = 'section'): HTMLElement {
  return createElement('div', {
    className,
    children: [
      createElement('h2', {
        textContent: title,
        style: {
          color: '#333',
          marginBottom: '1rem',
          fontSize: '1.5rem'
        }
      })
    ]
  })
}

/**
 * Crée un bouton avec des options
 */
export function createButton(
  text: string,
  options: {
    className?: string
    variant?: 'primary' | 'secondary' | 'danger'
    onClick?: () => void
    attributes?: Record<string, string>
    icon?: string
    iconSize?: number
  } = {}
): HTMLButtonElement {
  const variants = {
    primary: '#495057',
    secondary: '#6c757d', 
    danger: '#dc3545'
  }

  const button = createElement('button', {
    className: options.className || '',
    attributes: options.attributes,
    style: {
      background: variants[options.variant || 'primary'],
      color: 'white',
      border: 'none',
      padding: '0.625rem 1.25rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '0.875rem',
      transition: 'all 0.15s ease',
      margin: '0.25rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }) as HTMLButtonElement

  // Ajouter l'icône si spécifiée
  if (options.icon) {
    const icon = createIcon(options.icon, options.iconSize || 16)
    button.appendChild(icon)
  }

  // Ajouter le texte
  if (text) {
    const textNode = document.createTextNode(text)
    button.appendChild(textNode)
  }

  if (options.onClick) {
    button.addEventListener('click', options.onClick)
  }

  // Ajouter les effets hover
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
  })

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = 'none'
  })

  return button
}

/**
 * Crée un input avec des options
 */
export function createInput(options: {
  type?: string
  placeholder?: string
  className?: string
  attributes?: Record<string, string>
} = {}): HTMLInputElement {
  return createElement('input', {
    className: options.className || '',
    attributes: {
      type: options.type || 'text',
      placeholder: options.placeholder || '',
      ...options.attributes
    },
    style: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #e9ecef',
      borderRadius: '6px',
      fontSize: '1rem',
      marginBottom: '1rem',
      transition: 'border-color 0.2s ease'
    }
  }) as HTMLInputElement
}

/**
 * Crée une grille de contrôles
 */
export function createControlsGrid(...buttons: HTMLElement[]): HTMLElement {
  return createElement('div', {
    className: 'controls',
    style: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    children: buttons
  })
}

/**
 * Crée une grille de statistiques
 */
export function createStatsGrid(stats: Array<{ label: string, value: string | HTMLElement }>): HTMLElement {
  const statCards = stats.map(stat => 
    createElement('div', {
      className: 'stat-card',
      style: {
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        padding: '1.5rem',
        borderRadius: '8px',
        textAlign: 'center'
      },
      children: [
        typeof stat.value === 'string' 
          ? createElement('div', {
              className: 'stat-value',
              textContent: stat.value,
              style: {
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#333'
              }
            })
          : stat.value,
        createElement('div', {
          className: 'stat-label',
          textContent: stat.label,
          style: {
            color: '#666',
            marginTop: '0.5rem'
          }
        })
      ]
    })
  )

  return createElement('div', {
    className: 'stats',
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      margin: '1rem 0'
    },
    children: statCards
  })
}

/**
 * Applique des styles CSS globaux
 */
export function applyGlobalStyles(): void {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    .section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
      background: #ffffff;
    }

    .header {
      background: #f8f9fa;
      color: #343a40;
      padding: 2rem;
      text-align: center;
      border-bottom: 1px solid #e1e5e9;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .header p {
      color: #6c757d;
      font-size: 1.1rem;
    }

    .container {
      padding: 2rem;
      background: #f8f9fa;
    }

    .counter-value {
      font-size: 4rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 1rem 0;
      text-align: center;
    }

    .todo-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #f8f9fa;
      margin: 0.5rem 0;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .todo-item:hover {
      background: #e9ecef;
    }

    .todo-item.completed {
      opacity: 0.6;
      text-decoration: line-through;
    }

    .todo-content {
      flex: 1;
      margin-right: 1rem;
    }

    .todo-actions {
      display: flex;
      gap: 0.5rem;
    }

    .conditional-content {
      background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s ease;
    }

    .list-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .list-item {
      background: white;
      border: 2px solid #e9ecef;
      padding: 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .list-item:hover {
      border-color: #667eea;
      transform: translateY(-2px);
    }

    .memory-stats {
      background: #e9ecef;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
      }
      
      .header h1 {
        font-size: 2rem;
      }
      
      .counter-value {
        font-size: 3rem;
      }
    }
  `
  document.head.appendChild(styleSheet)
}