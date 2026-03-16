import { useState, useEffect, useCallback } from 'react'
import { taskApi } from '../api/taskApi'

/**
 * Hook gérant l'état des tâches.
 *
 * Règles clés :
 *  - loading=true UNIQUEMENT au premier chargement (skeleton initial)
 *  - Les mutations (create/update/delete) ne remettent PAS loading=true
 *    → la liste reste visible pendant la mise à jour
 *  - allTasks est toujours la liste complète ; le filtrage est dans App.jsx
 */
export function useTasks() {
  const [allTasks, setAllTasks] = useState([])
  const [stats,    setStats]    = useState({ todo: 0, inProgress: 0, done: 0, total: 0 })
  const [loading,  setLoading]  = useState(true)   // true seulement au 1er chargement
  const [error,    setError]    = useState(null)

  // ── Chargement (silencieux = sans spinner, utilisé après mutation) ────────

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError(null)
    try {
      const [tasks, s] = await Promise.all([
        taskApi.getAll(),
        taskApi.getStats(),
      ])
      setAllTasks(tasks)
      setStats(s)
    } catch (err) {
      setError(
        err.code === 'ECONNABORTED'
          ? 'Le serveur ne répond pas — vérifiez que le backend tourne sur le port 8080'
          : err.response?.data?.error ?? 'Impossible de charger les tâches'
      )
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  // Chargement initial (avec spinner)
  useEffect(() => { fetchAll(false) }, [fetchAll])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const create = useCallback(async (payload) => {
    const created = await taskApi.create(payload)
    // Mise à jour optimiste immédiate : la tâche apparaît sans attendre
    setAllTasks(prev => [...prev, created])
    setStats(s => ({ ...s, todo: s.todo + 1, total: s.total + 1 }))
    return created
  }, [])

  const update = useCallback(async (id, payload) => {
    const updated = await taskApi.update(id, payload)
    setAllTasks(prev => prev.map(t => t.id === id ? updated : t))
    // Rechargement silencieux des stats (statut peut avoir changé)
    fetchAll(true)
    return updated
  }, [fetchAll])

  const remove = useCallback(async (id) => {
    // Suppression optimiste immédiate
    const removed = allTasks.find(t => t.id === id)
    setAllTasks(prev => prev.filter(t => t.id !== id))
    if (removed) {
      const key = { TODO: 'todo', IN_PROGRESS: 'inProgress', DONE: 'done' }[removed.status] ?? 'todo'
      setStats(s => ({ ...s, [key]: s[key] - 1, total: s.total - 1 }))
    }
    await taskApi.delete(id)
  }, [allTasks])

  return { allTasks, stats, loading, error, create, update, remove, reload: () => fetchAll(false) }
}
