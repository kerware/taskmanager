import React, { useState, useMemo } from 'react'
import { useTasks }  from './hooks/useTasks'
import { StatsBar }  from './components/StatsBar'
import { TaskForm }  from './components/TaskForm'
import { TaskList }  from './components/TaskList'

const STATUS_FILTERS = [
  { value: '',            label: 'Toutes' },
  { value: 'TODO',        label: '🔵 À faire' },
  { value: 'IN_PROGRESS', label: '🟡 En cours' },
  { value: 'DONE',        label: '🟢 Terminé' },
]

export default function App() {
  const { allTasks, stats, loading, error, create, update, remove, reload } = useTasks()

  const [editingTask,  setEditingTask]  = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm,   setSearchTerm]   = useState('')

  // Filtrage local combiné statut + recherche
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return allTasks.filter(t => {
      const okStatus = !statusFilter || t.status === statusFilter
      const okSearch = !q || t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
      return okStatus && okSearch
    })
  }, [allTasks, statusFilter, searchTerm])

  // CRUD handlers
  const handleCreate = async (form) => {
    try { await create(form) }
    catch (err) {
      const msg = err.response?.data?.fields
        ? Object.values(err.response.data.fields).join(', ')
        : err.response?.data?.error ?? err.message
      alert('Erreur : ' + msg)
    }
  }

  const handleUpdate = async (form) => {
    try { await update(editingTask.id, form); setEditingTask(null) }
    catch (err) { alert('Erreur : ' + (err.response?.data?.error ?? err.message)) }
  }

  const handleDelete = async (id) => {
    try { await remove(id); if (editingTask?.id === id) setEditingTask(null) }
    catch (err) { alert('Erreur : ' + (err.response?.data?.error ?? err.message)) }
  }

  return (
    <div style={S.app}>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════ */}
      <header style={S.header}>
        <h1 style={S.h1}>📋 TaskManager</h1>
        <p style={S.sub}>Projet fil rouge — Pipeline DevOps M1</p>
      </header>

      {/* ═══ STATS ════════════════════════════════════════════════════════ */}
      <div style={S.statsBar}>
        <StatsBar stats={stats} />
        <button style={S.refreshBtn} onClick={reload}>🔄 Actualiser</button>
      </div>

      {/* ═══ ERREUR ═══════════════════════════════════════════════════════ */}
      {error && (
        <div style={S.errorBanner} role="alert">
          ❌ {error} — <button style={S.retryBtn} onClick={reload}>Réessayer</button>
        </div>
      )}

      {/* ═══ CORPS : 2 COLONNES ═══════════════════════════════════════════ */}
      <div style={S.body}>

        {/* ── Colonne gauche : formulaire ───────────────────────────────── */}
        <aside style={S.sidebar}>
          <TaskForm
            key={editingTask?.id ?? 'new'}
            initial={editingTask}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={editingTask ? () => setEditingTask(null) : null}
          />
        </aside>

        {/* ── Colonne droite : filtres + liste ──────────────────────────── */}
        <section style={S.content}>

          {/* Filtres */}
          <div style={S.filters}>
            <div style={S.filterBtns}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  style={{ ...S.filterBtn, ...(statusFilter === f.value ? S.filterOn : {}) }}
                  onClick={() => setStatusFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              style={S.search}
              placeholder="🔍 Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {(statusFilter || searchTerm) && (
              <button style={S.clearBtn} onClick={() => { setStatusFilter(''); setSearchTerm('') }}>
                ✕
              </button>
            )}
          </div>

          {/* Liste des tâches */}
          <TaskList
            tasks={filtered}
            allCount={allTasks.length}
            loading={loading}
            onEdit={setEditingTask}
            onDelete={handleDelete}
          />

        </section>
      </div>
    </div>
  )
}

const S = {
  app:        { minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Segoe UI', system-ui, sans-serif" },

  // Header
  header:     { background: '#0f1f3d', padding: '18px 32px', borderBottom: '3px solid #1d4ed8' },
  h1:         { margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' },
  sub:        { margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.45)' },

  // Stats
  statsBar:   { background: '#fff', padding: '16px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  refreshBtn: { padding: '7px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' },

  // Erreur
  errorBanner:{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 32px', color: '#991b1b', fontSize: 13 },
  retryBtn:   { background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', textDecoration: 'underline' },

  // Layout 2 colonnes
  body:       { display: 'flex', alignItems: 'flex-start', gap: 0, minHeight: 'calc(100vh - 130px)' },

  // Colonne gauche — formulaire
  sidebar:    {
    width: 340,
    flexShrink: 0,
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    padding: '24px 20px',
    minHeight: 'calc(100vh - 130px)',
    position: 'sticky',
    top: 0,
  },

  // Colonne droite — liste
  content:    { flex: 1, padding: '24px 28px', minWidth: 0 },

  // Filtres
  filters:    { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  filterBtns: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn:  { padding: '6px 14px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' },
  filterOn:   { background: '#1d4ed8', borderColor: '#1d4ed8', color: '#fff' },
  search:     { flex: 1, minWidth: 160, padding: '7px 14px', border: '1.5px solid #e2e8f0', borderRadius: 20, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' },
  clearBtn:   { width: 32, height: 32, borderRadius: '50%', background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
