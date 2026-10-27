import { Tag } from 'antd'
import { STATUS_LABEL } from '../lib/orders'
import type { OrderStatus } from '../types'

const STATUS_COLOR: Record<OrderStatus, string> = {
  completed: 'success',
  shipped: 'processing',
  pending: 'warning',
  cancelled: 'default',
  refunded: 'error',
}

export default function StatusTag({ status }: { status: OrderStatus }) {
  return (
    <Tag color={STATUS_COLOR[status]} style={{ marginInlineEnd: 0 }}>
      {STATUS_LABEL[status]}
    </Tag>
  )
}
