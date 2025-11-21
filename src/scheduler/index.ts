/**
 * Scheduler pour batching des updates réactifs
 * Regroupe les mises à jour pour éviter les recalculs redondants
 * Inspiré de l'approche DOM-Graph discutée dans gpt.md
 */

type Task = () => void

// File des tâches en attente
const pendingTasks = new Set<Task>()
const pendingMicrotasks = new Set<Task>()

// État du scheduler
let isFlushingSync = false
let isFlushingMicro = false
let isBatching = false

/**
 * Planifie une tâche pour exécution immédiate (synchrone)
 */
export function scheduleSync(task: Task): void {
  if (isFlushingSync) {
    // Si on est déjà en train de flusher, exécuter immédiatement
    task()
  } else {
    pendingTasks.add(task)
    if (!isBatching) {
      flushSync()
    }
  }
}

/**
 * Planifie une tâche pour exécution dans une microtask
 * Permet de regrouper plusieurs updates en un seul cycle
 */
export function scheduleMicrotask(task: Task): void {
  if (isFlushingMicro) {
    // Si on est déjà en train de flusher les microtasks, exécuter immédiatement
    task()
  } else {
    pendingMicrotasks.add(task)
    if (!isBatching) {
      queueMicrotask(flushMicrotasks)
    }
  }
}

/**
 * Exécute toutes les tâches synchrones en attente
 */
function flushSync(): void {
  if (isFlushingSync || pendingTasks.size === 0) return

  isFlushingSync = true
  
  try {
    const tasks = [...pendingTasks]
    pendingTasks.clear()
    
    for (const task of tasks) {
      try {
        task()
      } catch (error) {
        console.error('Error in scheduled task:', error)
      }
    }
  } finally {
    isFlushingSync = false
  }
}

/**
 * Exécute toutes les microtasks en attente
 */
function flushMicrotasks(): void {
  if (isFlushingMicro || pendingMicrotasks.size === 0) return

  isFlushingMicro = true
  
  try {
    const tasks = [...pendingMicrotasks]
    pendingMicrotasks.clear()
    
    for (const task of tasks) {
      try {
        task()
      } catch (error) {
        console.error('Error in scheduled microtask:', error)
      }
    }
  } finally {
    isFlushingMicro = false
  }
}

/**
 * Active le mode batching
 * Toutes les updates sont accumulées jusqu'à endBatch()
 */
export function startBatch(): void {
  isBatching = true
}

/**
 * Désactive le mode batching et flush toutes les tâches
 */
export function endBatch(): void {
  isBatching = false
  flushSync()
  queueMicrotask(flushMicrotasks)
}

/**
 * Exécute une fonction en mode batch
 * Tous les updates sont regroupés et exécutés à la fin
 * 
 * @example
 * ```typescript
 * batch(() => {
 *   signal1(value1)
 *   signal2(value2)
 *   signal3(value3)
 *   // Tous les computed/effects sont mis à jour en une seule fois
 * })
 * ```
 */
export function batch<T>(fn: () => T): T {
  const wasBatching = isBatching
  
  if (wasBatching) {
    // Déjà en mode batch, exécuter directement
    return fn()
  }
  
  startBatch()
  
  try {
    return fn()
  } finally {
    endBatch()
  }
}

/**
 * Force l'exécution immédiate de toutes les tâches en attente
 */
export function flush(): void {
  flushSync()
  flushMicrotasks()
}

/**
 * Nettoie toutes les tâches en attente (utile pour les tests)
 */
export function clearScheduler(): void {
  pendingTasks.clear()
  pendingMicrotasks.clear()
  isFlushingSync = false
  isFlushingMicro = false
  isBatching = false
}

/**
 * Statistiques du scheduler
 */
export function getSchedulerStats() {
  return {
    pendingTasks: pendingTasks.size,
    pendingMicrotasks: pendingMicrotasks.size,
    isFlushingSync,
    isFlushingMicro,
    isBatching
  }
}

/**
 * Mode de scheduling par défaut pour les signals
 */
export type ScheduleMode = 'sync' | 'micro' | 'manual'

let defaultScheduleMode: ScheduleMode = 'micro'

export function setDefaultScheduleMode(mode: ScheduleMode): void {
  defaultScheduleMode = mode
}

export function getDefaultScheduleMode(): ScheduleMode {
  return defaultScheduleMode
}

/**
 * Schedule une tâche selon le mode par défaut
 */
export function schedule(task: Task, mode?: ScheduleMode): void {
  const scheduleMode = mode || defaultScheduleMode
  
  switch (scheduleMode) {
    case 'sync':
      scheduleSync(task)
      break
    case 'micro':
      scheduleMicrotask(task)
      break
    case 'manual':
      // Ne rien faire, l'utilisateur doit appeler flush() manuellement
      pendingTasks.add(task)
      break
  }
}
