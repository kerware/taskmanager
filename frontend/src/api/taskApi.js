import axios from 'axios'

// En développement (npm run dev), Vite proxifie /api → http://localhost:8080
// via vite.config.js. BASE_URL est donc vide par défaut.
// En production, définir VITE_API_URL=http://mon-serveur:8080
const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') // supprime le slash final si présent
  : ''

const http = axios.create({
  // IMPORTANT : baseURL = BASE_URL + '/api'
  // En dev : baseURL = '/api'  → proxy Vite intercepte et redirige vers :8080
  // En prod : baseURL = 'http://mon-serveur:8080/api'
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Intercepteur : log des erreurs réseau en console (utile en dev)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const msg    = err.response?.data?.error ?? err.message
    console.error(`[taskApi] ${err.config?.method?.toUpperCase()} ${err.config?.url} → ${status ?? 'ERR'} ${msg}`)
    return Promise.reject(err)
  }
)

export const taskApi = {
  /** Récupère toutes les tâches (sans paramètre = toutes) */
  getAll: () =>
    http.get('/tasks').then((r) => r.data),

  /** Filtre les tâches par statut via l'API */
  getByStatus: (status) =>
    http.get('/tasks', { params: { status } }).then((r) => r.data),

  /** Recherche par mot-clé dans le titre via l'API */
  search: (keyword) =>
    http.get('/tasks', { params: { search: keyword } }).then((r) => r.data),

  /** Récupère une tâche par son identifiant */
  getById: (id) =>
    http.get(`/tasks/${id}`).then((r) => r.data),

  /** Crée une nouvelle tâche */
  create: (task) =>
    http.post('/tasks', task).then((r) => r.data),

  /** Met à jour une tâche existante */
  update: (id, task) =>
    http.put(`/tasks/${id}`, task).then((r) => r.data),

  /** Supprime une tâche */
  delete: (id) =>
    http.delete(`/tasks/${id}`),

  /** Récupère les statistiques agrégées */
  getStats: () =>
    http.get('/tasks/stats').then((r) => r.data),
}
