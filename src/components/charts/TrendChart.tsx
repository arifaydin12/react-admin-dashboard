import { Line } from '@ant-design/charts'
import { formatCurrency, formatDayKey, formatNumber } from '../../lib/format'
import type { SeriesPoint } from '../../lib/analytics'
import { CHART_COLORS, useChartBase } from './chartTheme'

export type TrendMetric = 'revenue' | 'orders'

interface TrendChartProps {
  current: readonly SeriesPoint[]
  previous: readonly SeriesPoint[]
  metric: TrendMetric
  height: number
}

const CURRENT = 'Current period'
const PREVIOUS = 'Previous period'

export default function TrendChart({ current, previous, metric, height }: TrendChartProps) {
  const base = useChartBase()
  const format = (value: number, compact: boolean) =>
    metric === 'revenue' ? formatCurrency(value, { compact, whole: !compact }) : formatNumber(value, compact)

  const data = [
    ...current.map((p) => ({ label: formatDayKey(p.date), series: CURRENT, value: p[metric] })),
    // The previous period is aligned point by point with the current one.
    ...previous.slice(0, current.length).map((p, i) => ({
      label: formatDayKey(current[i]?.date ?? p.date),
      series: PREVIOUS,
      value: p[metric],
    })),
  ]

  return (
    <Line
      data={data}
      xField="label"
      yField="value"
      colorField="series"
      height={height}
      autoFit={base.autoFit}
      theme={base.theme}
      animate={base.animate}
      scale={{ color: { domain: [CURRENT, PREVIOUS], range: [CHART_COLORS[0], '#a1a1aa'] }, x: { type: 'point' } }}
      style={{ lineWidth: 2.5, lineJoin: 'round' }}
      axis={{
        x: {
          title: false,
          labelAutoRotate: false,
          // Show roughly eight evenly spaced date labels whatever the range.
          labelFilter: (_: unknown, index: number) => index % Math.max(1, Math.ceil(current.length / 8)) === 0,
        },
        y: { title: false, labelFormatter: (v: number) => format(v, true), tickCount: 5 },
      }}
      legend={{ color: { position: 'top', layout: { justifyContent: 'flex-end' } } }}
      tooltip={{
        title: (d: { label: string }) => d.label,
        items: [{ channel: 'y', valueFormatter: (v: number) => format(v, false) }],
      }}
      interaction={{ tooltip: { shared: true } }}
    />
  )
}
