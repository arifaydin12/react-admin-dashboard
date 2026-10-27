import type { HeatMatrix } from '../lib/analytics'
import { formatCurrency } from '../lib/format'

/** Region × category revenue heat grid, rendered as an accessible table. */
export default function HeatGrid({ matrix }: { matrix: HeatMatrix }) {
  return (
    <div className="heat-wrap">
      <table className="heat-grid">
        <caption className="visually-hidden">Revenue by region and product category</caption>
        <thead>
          <tr>
            <th scope="col">Region</th>
            {matrix.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row, r) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {matrix.columns.map((column, c) => {
                const value = matrix.values[r]?.[c] ?? 0
                const intensity = matrix.max > 0 ? value / matrix.max : 0
                return (
                  <td
                    key={column}
                    title={`${row} · ${column}: ${formatCurrency(value)}`}
                    style={{
                      background: `color-mix(in srgb, var(--color-primary) ${Math.round(8 + intensity * 72)}%, var(--color-surface))`,
                      color: intensity > 0.55 ? '#fff' : 'inherit',
                    }}
                  >
                    {formatCurrency(value, { compact: true })}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="heat-legend" aria-hidden="true">
        <span>Lower</span>
        <span className="heat-legend__bar" />
        <span>Higher revenue</span>
      </div>
    </div>
  )
}
