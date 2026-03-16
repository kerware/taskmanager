import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm'

describe('TaskForm', () => {

  // ── Mode création ──────────────────────────────────────────────────────────

  describe('mode création', () => {

    it('affiche le titre "Nouvelle tâche"', () => {
      render(<TaskForm onSubmit={vi.fn()} />)
      expect(screen.getByText('+ Nouvelle tâche')).toBeInTheDocument()
    })

    it('affiche les champs titre, description et statut', () => {
      render(<TaskForm onSubmit={vi.fn()} />)
      expect(screen.getByLabelText(/titre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/statut/i)).toBeInTheDocument()
    })

    it('affiche le bouton "Créer"', () => {
      render(<TaskForm onSubmit={vi.fn()} />)
      expect(screen.getByRole('button', { name: /créer/i })).toBeInTheDocument()
    })

    it('n\'affiche pas le bouton "Annuler" sans onCancel', () => {
      render(<TaskForm onSubmit={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument()
    })

    it('appelle onSubmit avec les valeurs saisies', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<TaskForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/titre/i), 'Ma nouvelle tâche')
      await user.type(screen.getByLabelText(/description/i), 'Une description')
      await user.selectOptions(screen.getByLabelText(/statut/i), 'IN_PROGRESS')
      await user.click(screen.getByRole('button', { name: /créer/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          title:       'Ma nouvelle tâche',
          description: 'Une description',
          status:      'IN_PROGRESS',
        })
      })
    })

    it('remet le formulaire à zéro après la soumission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<TaskForm onSubmit={onSubmit} />)

      const input = screen.getByLabelText(/titre/i)
      await user.type(input, 'Tâche temporaire')
      await user.click(screen.getByRole('button', { name: /créer/i }))

      await waitFor(() => expect(input).toHaveValue(''))
    })
  })

  // ── Validation ─────────────────────────────────────────────────────────────

  describe('validation', () => {

    it('affiche une erreur si le titre est vide', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<TaskForm onSubmit={onSubmit} />)

      await user.click(screen.getByRole('button', { name: /créer/i }))

      expect(screen.getByRole('alert')).toHaveTextContent('obligatoire')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('affiche une erreur si le titre dépasse 200 caractères', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<TaskForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/titre/i), 'x'.repeat(201))
      await user.click(screen.getByRole('button', { name: /créer/i }))

      expect(screen.getByRole('alert')).toHaveTextContent('200')
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('n\'affiche pas d\'erreur pour un titre valide', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<TaskForm onSubmit={onSubmit} />)

      await user.type(screen.getByLabelText(/titre/i), 'Titre valide')
      await user.click(screen.getByRole('button', { name: /créer/i }))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // ── Mode édition ───────────────────────────────────────────────────────────

  describe('mode édition', () => {

    const existingTask = {
      id: 1, title: 'Tâche existante', description: 'Description', status: 'IN_PROGRESS',
    }

    it('affiche le titre "Modifier la tâche"', () => {
      render(<TaskForm onSubmit={vi.fn()} initial={existingTask} />)
      expect(screen.getByText(/modifier la tâche/i)).toBeInTheDocument()
    })

    it('pré-remplit les champs avec les valeurs de la tâche', () => {
      render(<TaskForm onSubmit={vi.fn()} initial={existingTask} />)

      expect(screen.getByLabelText(/titre/i)).toHaveValue('Tâche existante')
      expect(screen.getByLabelText(/description/i)).toHaveValue('Description')
      expect(screen.getByLabelText(/statut/i)).toHaveValue('IN_PROGRESS')
    })

    it('affiche le bouton "Annuler" quand onCancel est fourni', () => {
      render(<TaskForm onSubmit={vi.fn()} initial={existingTask} onCancel={vi.fn()} />)
      expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    })

    it('appelle onCancel quand on clique sur Annuler', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      render(<TaskForm onSubmit={vi.fn()} initial={existingTask} onCancel={onCancel} />)

      await user.click(screen.getByRole('button', { name: /annuler/i }))
      expect(onCancel).toHaveBeenCalledOnce()
    })

    it('affiche "Mettre à jour" comme libellé du bouton de soumission', () => {
      render(<TaskForm onSubmit={vi.fn()} initial={existingTask} onCancel={vi.fn()} />)
      expect(screen.getByRole('button', { name: /mettre à jour/i })).toBeInTheDocument()
    })
  })
})
