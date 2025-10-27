// Types pour l'application d'exemple

export interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

export interface ListItem {
  id: number
  title: string
  description: string
  color: string
  createdAt: Date
}

export interface AppStats {
  totalClicks: number
  currentValue: number
  doubleValue: number
  sign: string
}

export interface ComponentState<T = any> {
  data: T
  mounted: boolean
  cleanup: (() => void)[]
}

// Types utilitaires pour les couleurs
export type Color = 
  | 'blue' 
  | 'green' 
  | 'red' 
  | 'yellow' 
  | 'purple' 
  | 'pink' 
  | 'orange'

export const COLORS: Record<Color, string> = {
  blue: '#74b9ff',
  green: '#55a3ff',
  red: '#ff6b6b',
  yellow: '#fdcb6e',
  purple: '#a29bfe',
  pink: '#fd79a8',
  orange: '#e17055'
}