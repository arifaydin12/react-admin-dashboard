import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import KpiCard from './KpiCard'

const base = { title: 'Revenue', value: '$298.2K', icon: <span>i</span>, trend: [1, 3, 2, 5], color: '#4f46e5' }

describe('KpiCard', () => {
  it('shows the title, value, delta and a sparkline', () => {
    const { container } = render(<KpiCard {...base} delta={0.137} />)
    expect(screen.getByRole('group', { name: 'Revenue' })).toBeInTheDocument()
    expect(screen.getByTestId('kpi-value')).toHaveTextContent('$298.2K')
    expect(screen.getByTestId('kpi-delta')).toHaveTextContent('+13.7%')
    expect(screen.getByTestId('kpi-delta')).toHaveClass('delta--good')
    expect(container.querySelector('svg.sparkline path')).not.toBeNull()
  })

  it('marks a decrease as bad by default', () => {
    render(<KpiCard {...base} delta={-0.05} />)
    expect(screen.getByTestId('kpi-delta')).toHaveTextContent('-5%')
    expect(screen.getByTestId('kpi-delta')).toHaveClass('delta--bad')
  })

  it('treats a decrease as good when the metric is inverted', () => {
    render(<KpiCard {...base} delta={-0.2} invertDelta />)
    expect(screen.getByTestId('kpi-delta')).toHaveClass('delta--good')
  })

  it('shows n/a when there is nothing to compare with', () => {
    render(<KpiCard {...base} delta={null} comparisonLabel="no earlier data" />)
    expect(screen.getByTestId('kpi-delta')).toHaveTextContent('n/a')
    expect(screen.getByTestId('kpi-delta')).toHaveClass('delta--neutral')
    expect(screen.getByText('no earlier data')).toBeInTheDocument()
  })

  it('renders a skeleton while loading', () => {
    render(<KpiCard {...base} delta={0.1} loading />)
    expect(screen.queryByTestId('kpi-value')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Revenue (loading)')).toHaveAttribute('aria-busy', 'true')
  })
})
