import React from 'react'

const STATUS = {
  TODO:        { label: 'À faire',  bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  IN_PROGRESS: { label: 'En cours', bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  DONE:        { label: 'Terminé',  bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
}

export function TaskCard({ task, onEdit, onDelete }) {
  const st = STATUS[task.status] ?? STATUS.TODO

  const confirmDelete = () => {
    if (window.confirm(`Supprimer « ${task.title} » ?`)) onDelete(task.id)
  }

  return (
    <article style={S.card}>

      {/* Statut */}
      <div style={S.top}>
        <span style={{ ...S.badge, background: st.bg, color: st.color }}>
          <span style={{ ...S.dot, background: st.dot }} />
          {st.label}
        </span>
        <span style={S.id}>#{task.id}</span>
      </div>

      {/* Titre */}
      <h4 style={S.title}>{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p style={S.desc}>{task.description}</p>
      )}

      {/* Footer */}
      <div style={S.footer}>
        <span style={S.date}>
          {task.createdAt ? new Date(task.createdAt).toLocaleDateString('fr-FR') : '—'}
        </span>
        <div style={S.actions}>
          <button style={S.edit}   onClick={() => onEdit(task)}>✏️</button>
          <button style={S.delete} onClick={confirmDelete}>🗑</button>
        </div>
      </div>

    </article>
  )
}

const S = {
  card:   { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  top:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge:  { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.3px' },
  dot:    { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  id:     { fontSize: 11, color: '#cbd5e1' },
  title:  { margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.4 },
  desc:   { margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  date:   { fontSize: 11, color: '#cbd5e1' },
  actions:{ display: 'flex', gap: 4 },
  edit:   { padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  delete: { padding: '4px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
}
