import type { ReactNode } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons'
import { Card, Skeleton } from 'antd'
import { formatDelta } from '../lib/format'
import Sparkline from './Sparkline'

interface KpiCardProps {
  title: string
  value: string
  icon: ReactNode
  /** Period-over-period change as a fraction, or `null` when unknown. */
  delta: number | null
  /** When true a decrease is good news (e.g. cancellation rate). */
  invertDelta?: boolean
  trend: readonly number[]
  color: string
  loading?: boolean
  comparisonLabel?: string
}

export default function KpiCard({
  title,
  value,
  icon,
  delta,
  invertDelta = false,
  trend,
  color,
  loading = false,
  comparisonLabel = 'vs previous period',
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className="kpi-card" aria-busy="true" aria-label={`${title} (loading)`}>
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '45%' }} />
      </Card>
    )
  }

  const direction = delta === null || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
  const good = direction === 'flat' ? null : invertDelta ? direction === 'down' : direction === 'up'
  const tone = good === null ? 'neutral' : good ? 'good' : 'bad'

  return (
    <Card className="kpi-card" role="group" aria-label={title}>
      <div className="kpi-card__head">
        <span className="kpi-card__title">{title}</span>
        <span className="kpi-card__icon" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="kpi-card__value" data-testid="kpi-value">
        {value}
      </div>
      <div className="kpi-card__foot">
        <span className={`delta delta--${tone}`} data-testid="kpi-delta">
          {direction === 'up' ? <ArrowUpOutlined aria-hidden="true" /> : null}
          {direction === 'down' ? <ArrowDownOutlined aria-hidden="true" /> : null}
          {direction === 'flat' ? <MinusOutlined aria-hidden="true" /> : null}
          <span>{delta === null ? 'n/a' : formatDelta(delta)}</span>
        </span>
        <span className="kpi-card__hint">{comparisonLabel}</span>
      </div>
      <div className="kpi-card__spark">
        <Sparkline data={trend} color={color} />
      </div>
    </Card>
  )
}
