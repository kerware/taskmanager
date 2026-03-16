import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsBar } from '../components/StatsBar'

describe('StatsBar', () => {

  const stats = { todo: 3, inProgress: 1, done: 5, total: 9 }

  it('affiche le compteur À faire', () => {
    render(<StatsBar stats={stats} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('À faire')).toBeInTheDocument()
  })

  it('affiche le compteur En cours', () => {
    render(<StatsBar stats={stats} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('En cours')).toBeInTheDocument()
  })

  it('affiche le compteur Terminé', () => {
    render(<StatsBar stats={stats} />)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Terminé')).toBeInTheDocument()
  })

  it('affiche le total', () => {
    render(<StatsBar stats={stats} />)
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('affiche 0 pour toutes les valeurs quand stats est vide', () => {
    render(<StatsBar stats={{}} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBe(4)
  })
})
