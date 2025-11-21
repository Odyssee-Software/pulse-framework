import { signal, computed, render } from 'pulse-framework'
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

  // Rendu déclaratif avec HTML template literals ✨
  const template = render.html`
    <div class="section" style="margin-bottom: 2rem; padding: 1.5rem; border-radius: 8px; border: 1px solid #e1e5e9; background: #ffffff;">
      <!-- Titre de la section -->
      <h2 style="margin: 0 0 1.5rem 0; color: #2c3e50; font-size: 1.5rem; font-weight: 600;">
        Compteur Réactif
      </h2>
      
      <!-- Container du compteur -->
      <div style="text-align: center; margin: 2rem 0;">
        <!-- Valeur du compteur (réactive) -->
        <div class="counter-value" style="font-size: 4rem; font-weight: 700; color: #2c3e50; margin: 1rem 0; text-align: center;">
          ${count}
        </div>
        
        <!-- Grille de contrôles -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 1rem;">
          <!-- Bouton décrémenter -->
          <button 
            onclick="${decrementHandler}"
            style="background: #495057; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            − Décrémenter
          </button>
          
          <!-- Bouton incrémenter -->
          <button 
            onclick="${incrementHandler}"
            style="background: #495057; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            + Incrémenter
          </button>
          
          <!-- Bouton reset -->
          <button 
            onclick="${resetHandler}"
            style="background: #6c757d; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            ↻ Reset
          </button>
          
          <!-- Bouton aléatoire -->
          <button 
            onclick="${randomHandler}"
            style="background: #6c757d; color: white; border: none; padding: 0.625rem 1.25rem; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: all 0.15s ease; margin: 0.25rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            🎲 Aléatoire
          </button>
        </div>
      </div>
      
      <!-- Section des statistiques -->
      <div style="margin-top: 2rem; padding: 1.5rem; border-radius: 8px; border: 1px solid #e1e5e9; background: #f8f9fa;">
        <!-- Titre des statistiques -->
        <h3 style="margin: 0 0 1rem 0; color: #2c3e50; font-size: 1.25rem; font-weight: 600;">
          Statistiques
        </h3>
        
        <!-- Grille des statistiques -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <!-- Valeur actuelle -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
            <span style="font-weight: 500; color: #495057;">Valeur actuelle</span>
            <span style="font-weight: 700; color: #2c3e50;">${count}</span>
          </div>
          
          <!-- Valeur doublée -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
            <span style="font-weight: 500; color: #495057;">Valeur doublée</span>
            <span style="font-weight: 700; color: #2c3e50;">${doubled}</span>
          </div>
          
          <!-- Clics totaux -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
            <span style="font-weight: 500; color: #495057;">Clics totaux</span>
            <span style="font-weight: 700; color: #2c3e50;">${totalClicks}</span>
          </div>
          
          <!-- Signe -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; border: 1px solid #e9ecef;">
            <span style="font-weight: 500; color: #495057;">Signe</span>
            <span style="font-weight: 700; color: #2c3e50; font-size: 1.5rem;">${sign}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  console.log({ template })

  return render( template );
}