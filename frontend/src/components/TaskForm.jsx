import React, { useState, useEffect } from 'react'

const STATUSES = [
  { value: 'TODO',        label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE',        label: 'Terminé' },
]

const EMPTY = { title: '', description: '', status: 'TODO' }

export function TaskForm({ onSubmit, initial = null, onCancel = null }) {
  const [form,   setForm]   = useState(initial ?? EMPTY)
  const [errors, setErrors] = useState({})
  const [busy,   setBusy]   = useState(false)

  // Resynchronise quand on passe de création à édition
  useEffect(() => { setForm(initial ?? EMPTY); setErrors({}) }, [initial])

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim())   e.title = 'Le titre est obligatoire'
    if (form.title.length > 200) e.title = 'Maximum 200 caractères'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setBusy(true)
    try {
      await onSubmit({ title: form.title.trim(), description: form.description, status: form.status })
      if (!initial) setForm(EMPTY) // reset seulement en mode création
    } finally {
      setBusy(false)
    }
  }

  const isEdit = initial !== null
  const title  = isEdit ? '✏️ Modifier la tâche' : '➕ Nouvelle tâche'

  return (
    <form onSubmit={handleSubmit} style={S.form}>
      <h3 style={S.heading}>{title}</h3>

      {/* Titre */}
      <div style={S.field}>
        <label style={S.label} htmlFor="f-title">Titre *</label>
        <input
          id="f-title"
          style={{ ...S.input, ...(errors.title ? S.inputErr : {}) }}
          value={form.title}
          onChange={set('title')}
          placeholder="Nom de la tâche..."
          maxLength={200}
        />
        {errors.title && <span style={S.err}>{errors.title}</span>}
      </div>

      {/* Description */}
      <div style={S.field}>
        <label style={S.label} htmlFor="f-desc">Description</label>
        <textarea
          id="f-desc"
          style={{ ...S.input, height: 80, resize: 'vertical' }}
          value={form.description}
          onChange={set('description')}
          placeholder="Description (optionnelle)..."
          maxLength={1000}
        />
      </div>

      {/* Statut */}
      <div style={S.field}>
        <label style={S.label} htmlFor="f-status">Statut</label>
        <select id="f-status" style={S.select} value={form.status} onChange={set('status')}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Boutons */}
      <div style={S.actions}>
        <button type="submit" style={S.btnPrimary} disabled={busy}>
          {busy ? '...' : isEdit ? 'Mettre à jour' : 'Créer la tâche'}
        </button>
        {onCancel && (
          <button type="button" style={S.btnSecondary} onClick={onCancel}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

const S = {
  form:        { display: 'flex', flexDirection: 'column', gap: 0 },
  heading:     { margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#1e293b', paddingBottom: 12, borderBottom: '2px solid #f1f5f9' },
  field:       { marginBottom: 14 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input:       { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: '#fff' },
  inputErr:    { borderColor: '#ef4444' },
  select:      { width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff', cursor: 'pointer' },
  err:         { display: 'block', marginTop: 4, fontSize: 12, color: '#ef4444' },
  actions:     { display: 'flex', gap: 8, marginTop: 8 },
  btnPrimary:  { flex: 1, padding: '10px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnSecondary:{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
}
