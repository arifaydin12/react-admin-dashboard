import { useId } from 'react'

interface SparklineProps {
  data: readonly number[]
  color?: string
  height?: number
  /** Accessible description; the graphic is decorative when omitted. */
  label?: string
}

const WIDTH = 120
const PAD = 2

/** Tiny dependency-free SVG trend line with a soft area fill. */
export default function Sparkline({ data, color = 'var(--color-primary)', height = 40, label }: SparklineProps) {
  const gradientId = useId()
  if (data.length < 2) {
    return <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${height}`} height={height} aria-hidden="true" />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = (WIDTH - PAD * 2) / (data.length - 1)
  const points = data.map((value, i) => {
    const x = PAD + i * step
    const y = PAD + (1 - (value - min) / span) * (height - PAD * 2)
    return [x, y] as const
  })
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(PAD + (data.length - 1) * step).toFixed(1)},${height} L${PAD},${height} Z`

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${WIDTH} ${height}`}
      preserveAspectRatio="none"
      height={height}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
