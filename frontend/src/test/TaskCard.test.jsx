import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../components/TaskCard'

const makeTask = (overrides = {}) => ({
  id: 42,
  title: 'Configurer le pipeline',
  description: 'Pipeline GitHub Actions',
  status: 'TODO',
  createdAt: '2025-03-15T10:00:00',
  ...overrides,
})

describe('TaskCard', () => {

  it('affiche le titre de la tâche', () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Configurer le pipeline')).toBeInTheDocument()
  })

  it('affiche la description quand elle est renseignée', () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Pipeline GitHub Actions')).toBeInTheDocument()
  })

  it('n\'affiche pas de description si elle est absente', () => {
    const task = makeTask({ description: '' })
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />)
    // Pas de paragraphe de description
    expect(screen.queryByText('Pipeline GitHub Actions')).not.toBeInTheDocument()
  })

  it('affiche l\'identifiant de la tâche', () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('#42')).toBeInTheDocument()
  })

  it('affiche le badge "À faire" pour le statut TODO', () => {
    render(<TaskCard task={makeTask({ status: 'TODO' })} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('À faire')).toBeInTheDocument()
  })

  it('affiche le badge "En cours" pour le statut IN_PROGRESS', () => {
    render(<TaskCard task={makeTask({ status: 'IN_PROGRESS' })} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('affiche le badge "Terminé" pour le statut DONE', () => {
    render(<TaskCard task={makeTask({ status: 'DONE' })} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Terminé')).toBeInTheDocument()
  })

  it('affiche la date de création formatée', () => {
    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    // Format fr-FR : 15/03/2025
    expect(screen.getByText('15/03/2025')).toBeInTheDocument()
  })

  it('appelle onEdit avec la tâche quand on clique sur Modifier', async () => {
    const user = userEvent.setup()
    const task = makeTask()
    const onEdit = vi.fn()
    render(<TaskCard task={task} onEdit={onEdit} onDelete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /modifier/i }))
    expect(onEdit).toHaveBeenCalledWith(task)
  })

  it('appelle onDelete avec l\'id après confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /supprimer/i }))

    expect(onDelete).toHaveBeenCalledWith(42)
    vi.restoreAllMocks()
  })

  it('n\'appelle pas onDelete si la confirmation est annulée', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<TaskCard task={makeTask()} onEdit={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /supprimer/i }))

    expect(onDelete).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })
})
