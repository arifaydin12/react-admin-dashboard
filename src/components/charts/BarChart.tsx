import { Bar, Column } from '@ant-design/charts'
import { formatCurrency } from '../../lib/format'
import { CHART_COLORS, useChartBase } from './chartTheme'

export interface BarDatum {
  name: string
  value: number
}

interface BarChartProps {
  data: readonly BarDatum[]
  height: number
  /** Horizontal bars suit long labels such as product names. */
  horizontal?: boolean
  color?: string
}

export default function BarChart({ data, height, horizontal = false, color = CHART_COLORS[0] }: BarChartProps) {
  const base = useChartBase()
  const shared = {
    data: [...data],
    xField: 'name',
    yField: 'value',
    height,
    autoFit: base.autoFit,
    theme: base.theme,
    animate: base.animate,
    style: { fill: color, radiusTopLeft: 4, radiusTopRight: 4, maxWidth: 36 },
    axis: {
      x: { title: false, labelAutoEllipsis: true, labelAutoRotate: false },
      y: { title: false, labelFormatter: (v: number) => formatCurrency(v, { compact: true }), tickCount: 5 },
    },
    tooltip: { items: [{ channel: 'y', name: 'Revenue', valueFormatter: (v: number) => formatCurrency(v) }] },
  }

  return horizontal ? (
    <Bar
      {...shared}
      style={{ fill: color, radiusTopRight: 4, radiusBottomRight: 4, maxWidth: 18 }}
      axis={{
        x: { title: false, labelAutoEllipsis: true },
        y: {
          title: false,
          labelAutoRotate: false,
          labelFormatter: (v: number) => formatCurrency(v, { compact: true }),
          tickCount: 4,
        },
      }}
    />
  ) : (
    <Column {...shared} />
  )
}
