import { Suspense, type ReactNode } from 'react'
import { Card, Empty, Skeleton } from 'antd'
import ErrorBoundary from './ErrorBoundary'

interface ChartCardProps {
  title: string
  subtitle?: string
  extra?: ReactNode
  /** Fixed content height so the layout does not jump while loading. */
  height?: number
  loading?: boolean
  empty?: boolean
  emptyText?: string
  /** Text alternative describing what the chart shows. */
  ariaLabel?: string
  children: ReactNode
}

/** Card frame for charts: heading, loading skeleton, empty state and error isolation. */
export default function ChartCard({
  title,
  subtitle,
  extra,
  height = 300,
  loading = false,
  empty = false,
  emptyText = 'No data for the selected period',
  ariaLabel,
  children,
}: ChartCardProps) {
  const placeholder = <Skeleton.Node active style={{ width: '100%', height }}>{' '}</Skeleton.Node>

  return (
    <Card
      className="chart-card"
      title={
        <div className="chart-card__title">
          <span>{title}</span>
          {subtitle ? <span className="chart-card__subtitle">{subtitle}</span> : null}
        </div>
      }
      extra={extra}
    >
      <div style={{ height }} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel} aria-busy={loading}>
        {loading ? (
          placeholder
        ) : empty ? (
          <div className="center-fill">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
          </div>
        ) : (
          <ErrorBoundary compact>
            <Suspense fallback={placeholder}>{children}</Suspense>
          </ErrorBoundary>
        )}
      </div>
    </Card>
  )
}
