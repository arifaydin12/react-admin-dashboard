import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeContext'

function Probe() {
  const { mode, toggle } = useTheme()
  return <button onClick={toggle}>mode:{mode}</button>
}

describe('ThemeProvider', () => {
  it('defaults to light, toggles, and persists the choice', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('mode:light')
    expect(document.documentElement.dataset.theme).toBe('light')

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('mode:dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(JSON.parse(window.localStorage.getItem('pulse.theme') ?? 'null')).toBe('dark')
  })

  it('restores the stored theme on load', () => {
    window.localStorage.setItem('pulse.theme', JSON.stringify('dark'))
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('mode:dark')
  })
})
