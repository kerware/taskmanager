import React from 'react'
import { TaskCard } from './TaskCard'

export function TaskList({ tasks, allCount, loading, onEdit, onDelete }) {

  if (loading) {
    return (
      <div style={S.grid}>
        {[1, 2, 3].map(i => (
          <div key={i} style={S.skeleton}>
            <div style={{ ...S.skLine, width: '35%', marginBottom: 10 }} />
            <div style={{ ...S.skLine, width: '80%', height: 18, marginBottom: 6 }} />
            <div style={{ ...S.skLine, width: '55%' }} />
          </div>
        ))}
      </div>
    )
  }

  if (allCount === 0) {
    return (
      <div style={S.empty}>
        <p style={S.emptyIcon}>📋</p>
        <p style={S.emptyTitle}>Aucune tâche</p>
        <p style={S.emptyHint}>Créez votre première tâche avec le formulaire à gauche.</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div style={S.empty}>
        <p style={S.emptyIcon}>🔍</p>
        <p style={S.emptyTitle}>Aucun résultat</p>
        <p style={S.emptyHint}>Aucune tâche ne correspond à vos filtres.</p>
      </div>
    )
  }

  return (
    <div>
      <p style={S.count}>
        {tasks.length} tâche{tasks.length > 1 ? 's' : ''}
        {allCount !== tasks.length ? ` (filtrées sur ${allCount})` : ''}
      </p>
      <div style={S.grid}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}

const S = {
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
  count:     { fontSize: 11, color: '#94a3b8', margin: '0 0 12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' },
  empty:     { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '2px dashed #e2e8f0' },
  emptyIcon: { fontSize: 36, margin: '0 0 10px' },
  emptyTitle:{ fontWeight: 700, color: '#1e293b', fontSize: 15, margin: '0 0 6px' },
  emptyHint: { color: '#94a3b8', fontSize: 13, margin: 0 },
  skeleton:  { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 },
  skLine:    { background: '#f1f5f9', borderRadius: 4, height: 12 },
}
