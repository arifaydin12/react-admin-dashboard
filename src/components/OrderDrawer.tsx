import { Descriptions, Divider, Drawer, Steps, Typography } from 'antd'
import { orderTimeline, type StepState } from '../lib/orders'
import { formatCurrency, formatDate, formatPercent } from '../lib/format'
import type { Order } from '../types'
import StatusTag from './StatusTag'

const STEP_STATUS: Record<StepState, 'finish' | 'process' | 'error' | 'wait'> = {
  done: 'finish',
  current: 'process',
  failed: 'error',
  upcoming: 'wait',
}

interface OrderDrawerProps {
  order: Order | null
  onClose: () => void
}

/** Side panel with the full details of one order. */
export default function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const steps = order ? orderTimeline(order) : []
  const discountValue = order ? order.unitPrice * order.quantity - order.subtotal : 0

  return (
    <Drawer
      open={order !== null}
      onClose={onClose}
      width="min(460px, 100vw)"
      destroyOnHidden
      title={
        order ? (
          <span className="drawer-title">
            <span>{order.id}</span>
            <StatusTag status={order.status} />
          </span>
        ) : null
      }
    >
      {order ? (
        <>
          <Descriptions column={1} size="small" colon={false} className="order-details">
            <Descriptions.Item label="Placed">{formatDate(order.date, 'datetime')}</Descriptions.Item>
            <Descriptions.Item label="Customer">
              <div className="cell-stack">
                <span>{order.customer}</span>
                <Typography.Text type="secondary">{order.email}</Typography.Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Region">{order.region}</Descriptions.Item>
            <Descriptions.Item label="Channel">{order.channel}</Descriptions.Item>
            <Descriptions.Item label="Payment">{order.paymentMethod}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" plain>
            Items
          </Divider>
          <div className="order-line">
            <div>
              <div className="order-line__name">{order.product}</div>
              <Typography.Text type="secondary">
                {order.category} · {order.quantity} × {formatCurrency(order.unitPrice)}
              </Typography.Text>
            </div>
            <div className="num">{formatCurrency(order.unitPrice * order.quantity)}</div>
          </div>

          <dl className="order-totals">
            {order.discount > 0 ? (
              <div>
                <dt>Discount ({formatPercent(order.discount)})</dt>
                <dd className="num">-{formatCurrency(discountValue)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Subtotal</dt>
              <dd className="num">{formatCurrency(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd className="num">{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</dd>
            </div>
            <div>
              <dt>Tax</dt>
              <dd className="num">{formatCurrency(order.tax)}</dd>
            </div>
            <div className="order-totals__total">
              <dt>Total</dt>
              <dd className="num">{formatCurrency(order.amount)}</dd>
            </div>
          </dl>

          <Divider orientation="left" plain>
            Timeline
          </Divider>
          <Steps
            direction="vertical"
            size="small"
            current={Math.max(0, steps.findIndex((s) => s.state === 'current' || s.state === 'failed'))}
            items={steps.map((step) => ({
              title: step.title,
              status: STEP_STATUS[step.state],
              description: step.at ? formatDate(step.at, 'datetime') : 'Waiting',
            }))}
          />
        </>
      ) : null}
    </Drawer>
  )
}
