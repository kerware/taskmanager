import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import App from '../App'
import { server } from './mocks/server'
import { resetMockTasks } from './mocks/handlers'

beforeEach(() => resetMockTasks())

describe('App — Tests d\'intégration (avec MSW)', () => {

  // ── Chargement initial ────────────────────────────────────────────────────

  it('affiche le titre de l\'application', async () => {
    render(<App />)
    expect(screen.getByText(/TaskManager/i)).toBeInTheDocument()
  })

  it('charge et affiche les 3 tâches au montage', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Configurer CI')).toBeInTheDocument()
      expect(screen.getByText('Écrire les tests')).toBeInTheDocument()
      expect(screen.getByText('Mettre en prod')).toBeInTheDocument()
    })
  })

  it('affiche le total de tâches dans les stats', async () => {
    render(<App />)
    await waitFor(() => {
      // StatsBar affiche le total (3 tâches dans les mocks)
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  it('affiche une erreur si l\'API est indisponible', async () => {
    server.use(
      http.get('/api/tasks',       () => HttpResponse.error()),
      http.get('/api/tasks/stats', () => HttpResponse.error()),
    )
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })

  // ── Filtrage local ────────────────────────────────────────────────────────

  it('filtre localement par statut TODO sans appel API supplémentaire', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    await user.click(screen.getByRole('button', { name: /à faire/i }))

    // Seule la tâche TODO est visible
    expect(screen.getByText('Configurer CI')).toBeInTheDocument()
    expect(screen.queryByText('Écrire les tests')).not.toBeInTheDocument() // IN_PROGRESS
    expect(screen.queryByText('Mettre en prod')).not.toBeInTheDocument()   // DONE
  })

  it('filtre localement par recherche textuelle (titre)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    await user.type(screen.getByPlaceholderText(/rechercher/i), 'CI')

    expect(screen.getByText('Configurer CI')).toBeInTheDocument()
    expect(screen.queryByText('Écrire les tests')).not.toBeInTheDocument()
    expect(screen.queryByText('Mettre en prod')).not.toBeInTheDocument()
  })

  it('cumule les filtres statut ET recherche', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    // Filtre TODO
    await user.click(screen.getByRole('button', { name: /à faire/i }))
    // + recherche "CI"
    await user.type(screen.getByPlaceholderText(/rechercher/i), 'CI')

    expect(screen.getByText('Configurer CI')).toBeInTheDocument()
    expect(screen.queryByText('Écrire les tests')).not.toBeInTheDocument()
  })

  it('le bouton Effacer réinitialise les filtres', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    await user.click(screen.getByRole('button', { name: /à faire/i }))
    expect(screen.queryByText('Mettre en prod')).not.toBeInTheDocument()

    // Le bouton "Effacer" apparaît quand un filtre est actif
    await user.click(screen.getByRole('button', { name: /effacer/i }))

    await waitFor(() => {
      expect(screen.getByText('Mettre en prod')).toBeInTheDocument()
    })
  })

  // ── Création ──────────────────────────────────────────────────────────────

  it('crée une tâche et l\'ajoute à la liste', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    await user.type(screen.getByLabelText(/titre/i), 'Ma nouvelle tâche CI')
    await user.click(screen.getByRole('button', { name: /créer/i }))

    await waitFor(() => {
      expect(screen.getByText('Ma nouvelle tâche CI')).toBeInTheDocument()
    })
  })

  it('remet le formulaire à zéro après la création', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    const input = screen.getByLabelText(/titre/i)
    await user.type(input, 'Tâche temporaire')
    await user.click(screen.getByRole('button', { name: /créer/i }))

    await waitFor(() => expect(input).toHaveValue(''))
  })

  // ── Suppression ───────────────────────────────────────────────────────────

  it('supprime une tâche et la retire de la liste', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    const card = screen.getByText('Configurer CI').closest('article')
    await user.click(within(card).getByRole('button', { name: /supprimer/i }))

    await waitFor(() => {
      expect(screen.queryByText('Configurer CI')).not.toBeInTheDocument()
    })
    vi.restoreAllMocks()
  })

  // ── Édition ───────────────────────────────────────────────────────────────

  it('affiche le formulaire d\'édition pré-rempli', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    const card = screen.getByText('Configurer CI').closest('article')
    await user.click(within(card).getByRole('button', { name: /modifier/i }))

    expect(screen.getByText(/modifier la tâche/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/titre/i)).toHaveValue('Configurer CI')
  })

  it('met à jour la tâche et ferme le formulaire d\'édition', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    const card = screen.getByText('Configurer CI').closest('article')
    await user.click(within(card).getByRole('button', { name: /modifier/i }))

    const input = screen.getByLabelText(/titre/i)
    await user.clear(input)
    await user.type(input, 'CI configuré ✅')
    await user.click(screen.getByRole('button', { name: /mettre à jour/i }))

    await waitFor(() => {
      expect(screen.getByText('CI configuré ✅')).toBeInTheDocument()
      expect(screen.queryByText(/modifier la tâche/i)).not.toBeInTheDocument()
    })
  })

  it('le bouton Annuler ferme le formulaire d\'édition', async () => {
    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => screen.getByText('Configurer CI'))

    const card = screen.getByText('Configurer CI').closest('article')
    await user.click(within(card).getByRole('button', { name: /modifier/i }))
    await user.click(screen.getByRole('button', { name: /annuler/i }))

    expect(screen.queryByText(/modifier la tâche/i)).not.toBeInTheDocument()
  })
})
