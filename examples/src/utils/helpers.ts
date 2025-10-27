import type { Color } from '../types'
import { COLORS } from '../types'

/**
 * Génère un ID unique
 */
export const generateId = (): number => {
  return Date.now() + Math.random() * 1000
}

/**
 * Génère une couleur aléatoire
 */
export const randomColor = (): Color => {
  const colors = Object.keys(COLORS) as Color[]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Génère un nombre aléatoire dans une plage
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Mélange un tableau (algorithme Fisher-Yates)
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Formate une date
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

/**
 * Debounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Animation helper
 */
export const animateElement = (
  element: HTMLElement,
  animation: string,
  duration: number = 300
): Promise<void> => {
  return new Promise((resolve) => {
    element.style.animation = `${animation} ${duration}ms ease-in-out`
    
    const handleAnimationEnd = () => {
      element.style.animation = ''
      element.removeEventListener('animationend', handleAnimationEnd)
      resolve()
    }
    
    element.addEventListener('animationend', handleAnimationEnd)
  })
}