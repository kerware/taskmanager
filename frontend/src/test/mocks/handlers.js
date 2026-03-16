import { http, HttpResponse } from 'msw'

// ── Données de test ───────────────────────────────────────────────────────────

export let mockTasks = [
  { id: 1, title: 'Configurer CI',    description: 'Pipeline GitHub Actions', status: 'TODO',        createdAt: '2025-01-01T10:00:00' },
  { id: 2, title: 'Écrire les tests', description: 'JUnit 5 + Mockito',       status: 'IN_PROGRESS', createdAt: '2025-01-02T10:00:00' },
  { id: 3, title: 'Mettre en prod',   description: 'Déploiement automatisé',  status: 'DONE',        createdAt: '2025-01-03T10:00:00' },
]

let nextId = 4

export function resetMockTasks() {
  mockTasks = [
    { id: 1, title: 'Configurer CI',    description: 'Pipeline GitHub Actions', status: 'TODO',        createdAt: '2025-01-01T10:00:00' },
    { id: 2, title: 'Écrire les tests', description: 'JUnit 5 + Mockito',       status: 'IN_PROGRESS', createdAt: '2025-01-02T10:00:00' },
    { id: 3, title: 'Mettre en prod',   description: 'Déploiement automatisé',  status: 'DONE',        createdAt: '2025-01-03T10:00:00' },
  ]
  nextId = 4
}

// ── Handlers MSW ─────────────────────────────────────────────────────────────

export const handlers = [

  // GET /api/tasks
  http.get('/api/tasks', ({ request }) => {
    const url    = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let result = [...mockTasks]
    if (status) result = result.filter((t) => t.status === status)
    if (search) result = result.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

    return HttpResponse.json(result)
  }),

  // GET /api/tasks/stats
  http.get('/api/tasks/stats', () => {
    const todo       = mockTasks.filter((t) => t.status === 'TODO').length
    const inProgress = mockTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const done       = mockTasks.filter((t) => t.status === 'DONE').length
    return HttpResponse.json({ todo, inProgress, done, total: mockTasks.length })
  }),

  // GET /api/tasks/:id
  http.get('/api/tasks/:id', ({ params }) => {
    const task = mockTasks.find((t) => t.id === Number(params.id))
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    return HttpResponse.json(task)
  }),

  // POST /api/tasks
  http.post('/api/tasks', async ({ request }) => {
    const body    = await request.json()
    const created = { id: nextId++, ...body, createdAt: new Date().toISOString() }
    mockTasks.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  // PUT /api/tasks/:id
  http.put('/api/tasks/:id', async ({ params, request }) => {
    const idx = mockTasks.findIndex((t) => t.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await request.json()
    mockTasks[idx] = { ...mockTasks[idx], ...body }
    return HttpResponse.json(mockTasks[idx])
  }),

  // DELETE /api/tasks/:id
  http.delete('/api/tasks/:id', ({ params }) => {
    const idx = mockTasks.findIndex((t) => t.id === Number(params.id))
    if (idx === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    mockTasks.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
