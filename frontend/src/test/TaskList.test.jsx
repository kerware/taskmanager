import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskList } from '../components/TaskList'

const tasks = [
  { id: 1, title: 'Tâche A', status: 'TODO',        createdAt: '2025-01-01T10:00:00' },
  { id: 2, title: 'Tâche B', status: 'IN_PROGRESS', createdAt: '2025-01-02T10:00:00' },
]

describe('TaskList', () => {

  it('affiche le skeleton de chargement quand loading=true', () => {
    render(<TaskList tasks={[]} allCount={0} loading={true} onEdit={vi.fn()} onDelete={vi.fn()} />)
    // Le skeleton ne contient pas de texte de tâche
    expect(screen.queryByText(/tâche/i)).not.toBeInTheDocument()
  })

  it('affiche "Aucune tâche" quand la base est vide (allCount=0)', () => {
    render(<TaskList tasks={[]} allCount={0} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/aucune tâche pour l'instant/i)).toBeInTheDocument()
  })

  it('affiche "Aucune tâche ne correspond" quand filtre actif sans résultat', () => {
    // tasks vide mais allCount > 0 = filtre actif sans résultat
    render(<TaskList tasks={[]} allCount={3} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/aucune tâche ne correspond/i)).toBeInTheDocument()
  })

  it('affiche toutes les tâches passées en props', () => {
    render(<TaskList tasks={tasks} allCount={2} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Tâche A')).toBeInTheDocument()
    expect(screen.getByText('Tâche B')).toBeInTheDocument()
  })

  it('affiche le compteur "2 tâches"', () => {
    render(<TaskList tasks={tasks} allCount={2} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/2 tâches/i)).toBeInTheDocument()
  })

  it('affiche "(sur N)" quand le filtre réduit la liste', () => {
    render(<TaskList tasks={[tasks[0]]} allCount={2} loading={false} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText(/sur 2/i)).toBeInTheDocument()
  })
})
