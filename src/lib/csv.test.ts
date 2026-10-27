import { describe, expect, it } from 'vitest'
import { makeOrder } from '../test/factories'
import { ORDER_CSV_HEADER, escapeCsvField, ordersToCsv, toCsv } from './csv'

describe('csv', () => {
  it('leaves plain values untouched', () => {
    expect(escapeCsvField('hello')).toBe('hello')
    expect(escapeCsvField(42.5)).toBe('42.5')
  })

  it('quotes fields containing commas, quotes or line breaks', () => {
    expect(escapeCsvField('a,b')).toBe('"a,b"')
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvField('line1\nline2')).toBe('"line1\nline2"')
  })

  it('neutralises spreadsheet formulas', () => {
    expect(escapeCsvField('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)")
    expect(escapeCsvField('@cmd')).toBe("'@cmd")
    expect(escapeCsvField(-5)).toBe('-5')
  })

  it('joins rows with CRLF', () => {
    expect(toCsv(['a', 'b'], [[1, 'x,y']])).toBe('a,b\r\n1,"x,y"')
  })

  it('exports orders with a header and one line per order', () => {
    const rows = [
      makeOrder({ id: 'ORD-1', customer: 'Smith, Jane', amount: 12.5, discount: 0.1 }),
      makeOrder({ id: 'ORD-2', status: 'pending' }),
    ]
    const lines = ordersToCsv(rows).split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe(ORDER_CSV_HEADER.join(','))
    expect(lines[1]).toContain('"Smith, Jane"')
    expect(lines[1]).toContain(',12.50,')
    expect(lines[1]).toContain(',10,') // discount percent
    expect(lines[2]?.endsWith(',pending')).toBe(true)
  })
})
