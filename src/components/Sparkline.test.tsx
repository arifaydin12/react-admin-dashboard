import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Sparkline from './Sparkline'

describe('Sparkline', () => {
  it('draws a line and an area for two or more points', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />)
    expect(container.querySelectorAll('path')).toHaveLength(2)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders an empty graphic for fewer than two points', () => {
    const { container } = render(<Sparkline data={[5]} />)
    expect(container.querySelectorAll('path')).toHaveLength(0)
  })

  it('does not produce NaN coordinates for a flat series', () => {
    const { container } = render(<Sparkline data={[4, 4, 4, 4]} />)
    expect(container.innerHTML).not.toContain('NaN')
  })

  it('is exposed to assistive technology when labelled', () => {
    const { getByRole } = render(<Sparkline data={[1, 2]} label="Revenue trend" />)
    expect(getByRole('img', { name: 'Revenue trend' })).toBeInTheDocument()
  })
})
