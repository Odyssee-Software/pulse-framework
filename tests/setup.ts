import { beforeEach, vi } from 'vitest'

// Configuration globale pour les tests
beforeEach(() => {
  // Nettoyer le DOM
  document.body.innerHTML = ''
  
  // Mock console en mode test
  if (process.env.NODE_ENV === 'test') {
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
  }
})

// Définir __DEV__ pour les tests
global.__DEV__ = true