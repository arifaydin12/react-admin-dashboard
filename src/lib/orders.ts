import type { Order, OrderStatus } from '../types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  completed: 'Completed',
  shipped: 'Shipped',
  pending: 'Pending',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export type StepState = 'done' | 'current' | 'failed' | 'upcoming'

export interface TimelineStep {
  title: string
  /** ISO timestamp, when the step has happened. */
  at?: string
  state: StepState
}

const HOUR = 3_600_000

/**
 * Builds the fulfilment timeline shown in the order drawer. The mock data
 * only stores the placement time, so later steps are derived from it.
 */
export function orderTimeline(order: Order): TimelineStep[] {
  const placed = new Date(order.date).getTime()
  const at = (hours: number) => new Date(placed + hours * HOUR).toISOString()
  const placedStep: TimelineStep = { title: 'Order placed', at: order.date, state: 'done' }

  switch (order.status) {
    case 'pending':
      return [
        { ...placedStep, state: 'done' },
        { title: 'Payment confirmed', state: 'current' },
        { title: 'Shipped', state: 'upcoming' },
        { title: 'Delivered', state: 'upcoming' },
      ]
    case 'shipped':
      return [
        placedStep,
        { title: 'Payment confirmed', at: at(0.2), state: 'done' },
        { title: 'Shipped', at: at(20), state: 'current' },
        { title: 'Delivered', state: 'upcoming' },
      ]
    case 'completed':
      return [
        placedStep,
        { title: 'Payment confirmed', at: at(0.2), state: 'done' },
        { title: 'Shipped', at: at(20), state: 'done' },
        { title: 'Delivered', at: at(92), state: 'done' },
      ]
    case 'refunded':
      return [
        placedStep,
        { title: 'Payment confirmed', at: at(0.2), state: 'done' },
        { title: 'Delivered', at: at(92), state: 'done' },
        { title: 'Refunded', at: at(190), state: 'failed' },
      ]
    case 'cancelled':
      return [placedStep, { title: 'Cancelled', at: at(5), state: 'failed' }]
  }
}
