import { Pie } from '@ant-design/charts'
import { formatCurrency } from '../../lib/format'
import { CHART_COLORS, useChartBase } from './chartTheme'

export interface Slice {
  name: string
  value: number
}

interface DonutChartProps {
  data: readonly Slice[]
  height: number
  /** Small caption under the total in the centre. */
  centerLabel: string
  /** All possible slice names in a fixed order; decides each slice's colour. */
  order: readonly string[]
}

export default function DonutChart({ data, height, centerLabel, order }: DonutChartProps) {
  const base = useChartBase()
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Pie
      data={[...data]}
      angleField="value"
      colorField="name"
      height={height}
      autoFit={base.autoFit}
      theme={base.theme}
      animate={base.animate}
      innerRadius={0.64}
      // A fixed domain keeps every category / region on the same colour
      // whatever the current revenue ranking is.
      scale={{ color: { domain: [...order], range: CHART_COLORS } }}
      label={false}
      legend={{ color: { position: 'bottom', layout: { justifyContent: 'center' } } }}
      tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => formatCurrency(v) }] }}
      annotations={[
        {
          type: 'text',
          style: {
            text: formatCurrency(total, { compact: true }),
            x: '50%',
            y: '46%',
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 700,
            fill: base.theme === 'classicDark' ? '#fafafa' : '#18181b',
          },
        },
        {
          type: 'text',
          style: {
            text: centerLabel,
            x: '50%',
            y: '55%',
            textAlign: 'center',
            fontSize: 12,
            fill: base.textColor,
          },
        },
      ]}
    />
  )
}
