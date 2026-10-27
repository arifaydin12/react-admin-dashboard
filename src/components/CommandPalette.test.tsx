import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DataContext, type DataContextValue } from '../context/DataContext'
import { PRODUCTS } from '../data/catalog'
import { makeOrder } from '../test/factories'
import CommandPalette from './CommandPalette'

const orders = [
  makeOrder({ id: 'ORD-4242', customer: 'Margaret Hamilton', product: 'Pulse X Phone', amount: 899 }),
  makeOrder({ id: 'ORD-4243', customer: 'Linus Torvalds' }),
]

const data: DataContextValue = {
  status: 'ready',
  orders,
  products: PRODUCTS,
  today: '2025-06-10',
  firstDay: '2025-06-10',
  error: null,
  reload: () => undefined,
}

function Location() {
  const { pathname, search } = useLocation()
  return <output data-testid="location">{pathname + search}</output>
}

function setup(actions: Parameters<typeof CommandPalette>[0]['actions'] = []) {
  const onClose = vi.fn()
  render(
    <MemoryRouter initialEntries={['/']}>
      <DataContext.Provider value={data}>
        <CommandPalette open onClose={onClose} actions={actions} />
      </DataContext.Provider>
      <Location />
    </MemoryRouter>,
  )
  return { onClose, user: userEvent.setup() }
}

describe('CommandPalette', () => {
  it('lists pages and actions when the query is empty', async () => {
    setup([{ id: 'x', label: 'Do something', run: () => undefined }])
    expect(await screen.findByRole('combobox', { name: 'Search' })).toBeInTheDocument()
    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options.join('|')).toContain('Dashboard')
    expect(options.join('|')).toContain('Regions')
    expect(options.join('|')).toContain('Do something')
  })

  it('navigates to a page with the keyboard', async () => {
    const { user, onClose } = setup()
    await user.type(await screen.findByRole('combobox'), 'sales')
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Sales')
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('location')).toHaveTextContent('/sales')
    expect(onClose).toHaveBeenCalled()
  })

  it('finds orders by customer and opens them on the sales page', async () => {
    const { user } = setup()
    await user.type(await screen.findByRole('combobox'), 'hamilton')
    const option = await screen.findByRole('option', { name: /ORD-4242/ })
    expect(option).toHaveTextContent('Pulse X Phone')
    await user.click(option)
    expect(screen.getByTestId('location')).toHaveTextContent('/sales?order=ORD-4242')
  })

  it('finds products and filters the sales table by them', async () => {
    const { user } = setup()
    await user.type(await screen.findByRole('combobox'), 'orbit')
    await user.click(await screen.findByRole('option', { name: /Orbit Mini Phone/ }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/sales?q=Orbit%20Mini%20Phone'))
  })

  it('moves the active option with the arrow keys', async () => {
    const { user } = setup()
    const input = await screen.findByRole('combobox')
    const first = screen.getAllByRole('option')[0]
    expect(first).toHaveAttribute('aria-selected', 'true')
    await user.type(input, '{ArrowDown}')
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1]?.id)
  })

  it('shows an empty state when nothing matches', async () => {
    const { user } = setup()
    await user.type(await screen.findByRole('combobox'), 'zzzzzz')
    expect(screen.getByText(/No results for/)).toBeInTheDocument()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
