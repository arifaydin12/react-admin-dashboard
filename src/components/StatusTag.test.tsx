import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ORDER_STATUSES } from '../types'
import StatusTag from './StatusTag'

describe('StatusTag', () => {
  it.each(ORDER_STATUSES)('renders a readable label for "%s"', (status) => {
    render(<StatusTag status={status} />)
    expect(screen.getByText(status.charAt(0).toUpperCase() + status.slice(1))).toBeInTheDocument()
  })
})
