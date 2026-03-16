import React from 'react'

export function StatsBar({ stats }) {
  const items = [
    { key: 'todo',       label: 'À faire',  color: '#2563eb' },
    { key: 'inProgress', label: 'En cours', color: '#d97706' },
    { key: 'done',       label: 'Terminé',  color: '#16a34a' },
    { key: 'total',      label: 'Total',    color: '#64748b' },
  ]
  return (
    <div style={S.bar}>
      {items.map(({ key, label, color }) => (
        <div key={key} style={S.item}>
          <span style={{ ...S.num, color }}>{stats[key] ?? 0}</span>
          <span style={S.lbl}>{label}</span>
        </div>
      ))}
    </div>
  )
}

const S = {
  bar:  { display: 'flex', gap: 6 },
  item: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 64 },
  num:  { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  lbl:  { fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
}
