import { signal, computed, render, h } from 'pulse-framework'
import type { Signal, Computed } from 'pulse-framework'

export interface CounterComponentOptions {
  initialValue?: number
  onCountChange?: (count: number) => void
}

export function createCounterComponent(options: CounterComponentOptions = {}): HTMLElement {
  const { initialValue = 0, onCountChange } = options

  // États locaux du composant
  const count = signal(initialValue)
  const totalClicks = signal(0)
  
  // Valeurs calculées
  const doubled = computed(() => count() * 2)
  const sign = computed(() => {
    const value = count()
    if (value > 0) return '➕'
    if (value < 0) return '➖'
    return '➡️'
  })

  // Gestionnaires d'événements
  const incrementHandler = () => {
    count(count() + 1)
    totalClicks(totalClicks() + 1)
    onCountChange?.(count())
  }

  const decrementHandler = () => {
    count(count() - 1)
    totalClicks(totalClicks() + 1)
    onCountChange?.(count())
  }

  const resetHandler = () => {
    count(0)
    totalClicks(totalClicks() + 1)
    onCountChange?.(count())
  }

  const randomHandler = () => {
    const randomValue = Math.floor(Math.random() * 201) - 100 // -100 à 100
    count(randomValue)
    totalClicks(totalClicks() + 1)
    onCountChange?.(count())
  }

  // Rendu déclaratif avec template
  return render({
    tag: 'div',
    attributes: {
      class: 'section'
    },
    properties: {
      style: 'margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; border: 1px solid #e1e5e9; background: #ffffff;'
    },
    children: [
      // Titre de la section
      {
        tag: 'h2',
        properties: {
          textContent: 'Compteur Réactif',
          style: 'margin: 0 0 1.5rem 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600;'
        }
      },
      
      // Container du compteur
      {
        tag: 'div',
        properties: {
          style: 'text-align: center; margin: 2rem 0;'
        },
        children: [
          // Valeur du compteur (réactive)
          {
            tag: 'div',
            attributes: {
              class: 'counter-value'
            },
            properties: {
              textContent: count,  // Binding réactif !
              style: 'font-size: 4rem; font-weight: 700; color: #2c3e50; margin: 1rem 0; text-align: center;'
            }
          },
          
          // Grille de contrôles
          {
            tag: 'div',
            properties: {
              style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 1rem;'
            },
            children: [
              // Bouton décrémenter
              {
                tag: 'button',
                properties: {
                  textContent: '− Décrémenter',
                  style: 'background: #495057; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;'
                },
                events: {
                  click: decrementHandler
                }
              },
              
              // Bouton incrémenter
              {
                tag: 'button',
                properties: {
                  textContent: '+ Incrémenter',
                  style: 'background: #495057; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;'
                },
                events: {
                  click: incrementHandler
                }
              },
              
              // Bouton reset
              {
                tag: 'button',
                properties: {
                  textContent: '↻ Reset',
                  style: 'background: #6c757d; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;'
                },
                events: {
                  click: resetHandler
                }
              },
              
              // Bouton aléatoire
              {
                tag: 'button',
                properties: {
                  textContent: '🎲 Aléatoire',
                  style: 'background: #6c757d; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;'
                },
                events: {
                  click: randomHandler
                }
              }
            ]
          }
        ]
      },
      
      // Section des statistiques
      {
        tag: 'div',
        properties: {
          style: 'margin-top: 2rem; padding: 1.5rem; border-radius: 8px; border: 1px solid #e1e5e9; background: #f8f9fa;'
        },
        children: [
          // Titre des statistiques
          {
            tag: 'h3',
            properties: {
              textContent: 'Statistiques',
              style: 'margin: 0 0 1rem 0; color: #2c3e50; font-size: 1.25rem; font-weight: 600;'
            }
          },
          
          // Grille des statistiques
          {
            tag: 'div',
            properties: {
              style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;'
            },
            children: [
              // Valeur actuelle
              {
                tag: 'div',
                properties: {
                  style: 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;'
                },
                children: [
                  {
                    tag: 'span',
                    properties: {
                      textContent: 'Valeur actuelle',
                      style: 'font-weight: 500; color: #495057;'
                    }
                  },
                  {
                    tag: 'span',
                    properties: {
                      textContent: count,  // Binding réactif !
                      style: 'font-weight: 700; color: #2c3e50;'
                    }
                  }
                ]
              },
              
              // Valeur doublée
              {
                tag: 'div',
                properties: {
                  style: 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;'
                },
                children: [
                  {
                    tag: 'span',
                    properties: {
                      textContent: 'Valeur doublée',
                      style: 'font-weight: 500; color: #495057;'
                    }
                  },
                  {
                    tag: 'span',
                    properties: {
                      textContent: doubled,  // Binding réactif !
                      style: 'font-weight: 700; color: #2c3e50;'
                    }
                  }
                ]
              },
              
              // Clics totaux
              {
                tag: 'div',
                properties: {
                  style: 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;'
                },
                children: [
                  {
                    tag: 'span',
                    properties: {
                      textContent: 'Clics totaux',
                      style: 'font-weight: 500; color: #495057;'
                    }
                  },
                  {
                    tag: 'span',
                    properties: {
                      textContent: totalClicks,  // Binding réactif !
                      style: 'font-weight: 700; color: #2c3e50;'
                    }
                  }
                ]
              },
              
              // Signe
              {
                tag: 'div',
                properties: {
                  style: 'display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;'
                },
                children: [
                  {
                    tag: 'span',
                    properties: {
                      textContent: 'Signe',
                      style: 'font-weight: 500; color: #495057;'
                    }
                  },
                  {
                    tag: 'span',
                    properties: {
                      textContent: sign,  // Binding réactif !
                      style: 'font-weight: 700; color: #2c3e50; font-size: 1.5rem;'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  })
}