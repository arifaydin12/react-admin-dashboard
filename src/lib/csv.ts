import type { Order } from '../types'

const FORMULA_PREFIX = /^[=+\-@\t\r]/

/**
 * Escapes one CSV field (RFC 4180). Text starting with a spreadsheet formula
 * character is prefixed with an apostrophe to avoid CSV injection.
 */
export function escapeCsvField(value: string | number): string {
  let text = String(value)
  if (typeof value === 'string' && FORMULA_PREFIX.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(header: readonly string[], rows: ReadonlyArray<ReadonlyArray<string | number>>): string {
  return [header, ...rows].map((line) => line.map(escapeCsvField).join(',')).join('\r\n')
}

export const ORDER_CSV_HEADER = [
  'Order ID',
  'Date',
  'Customer',
  'Email',
  'Product',
  'Category',
  'Region',
  'Channel',
  'Payment method',
  'Quantity',
  'Unit price (USD)',
  'Discount (%)',
  'Shipping (USD)',
  'Tax (USD)',
  'Total (USD)',
  'Status',
] as const

export function ordersToCsv(orders: readonly Order[]): string {
  return toCsv(
    ORDER_CSV_HEADER,
    orders.map((o) => [
      o.id,
      o.date,
      o.customer,
      o.email,
      o.product,
      o.category,
      o.region,
      o.channel,
      o.paymentMethod,
      o.quantity,
      o.unitPrice.toFixed(2),
      Math.round(o.discount * 100),
      o.shipping.toFixed(2),
      o.tax.toFixed(2),
      o.amount.toFixed(2),
      o.status,
    ]),
  )
}

/** Triggers a browser download of a text file (with a BOM so Excel reads UTF-8). */
export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob(['\uFEFF', content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
