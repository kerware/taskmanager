import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Démarre le serveur MSW avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Réinitialise les handlers entre chaque test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Arrête le serveur après tous les tests
afterAll(() => server.close())
