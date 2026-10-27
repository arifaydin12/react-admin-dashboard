import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

function Bomb({ explode }: { explode: boolean }) {
  if (explode) throw new Error('Boom')
  return <p>All good</p>
}

function Harness() {
  const [explode, setExplode] = useState(true)
  return (
    <>
      <button onClick={() => setExplode(false)}>Fix it</button>
      <ErrorBoundary>
        <Bomb explode={explode} />
      </ErrorBoundary>
    </>
  )
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })
  afterEach(() => vi.restoreAllMocks())

  it('renders children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <Bomb explode={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows a fallback with the error message', () => {
    render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })

  it('recovers via "Try again" once the cause is gone', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fix it' }))
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('uses a compact inline fallback when requested', () => {
    render(
      <ErrorBoundary compact>
        <Bomb explode />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('This chart could not be displayed.')
  })
})
