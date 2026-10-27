import { DatePicker, Grid, Segmented } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useData } from '../context/DataContext'
import { PRESETS, presetRange, useDateRange } from '../context/FilterContext'
import { DAY_FORMAT } from '../lib/dates'

const { RangePicker } = DatePicker

/** Global date range: quick presets plus a free-form range picker. */
export default function DateRangeControl() {
  const { range, preset, setPreset, setCustomRange } = useDateRange()
  const { today, firstDay } = useData()
  const screens = Grid.useBreakpoint()

  const presets = PRESETS.map((p) => {
    const r = presetRange(p.days, today)
    return { label: p.label, value: [dayjs(r.start), dayjs(r.end)] as [Dayjs, Dayjs] }
  })

  return (
    <div className="date-range" role="group" aria-label="Date range">
      {screens.md ? (
        <Segmented
          aria-label="Quick range"
          value={preset}
          onChange={(value) => setPreset(value as (typeof PRESETS)[number]['key'])}
          options={PRESETS.map((p) => ({ value: p.key, label: p.key.replace('d', 'D') }))}
        />
      ) : null}
      <RangePicker
        aria-label="Custom date range"
        value={[dayjs(range.start), dayjs(range.end)]}
        allowClear={false}
        format="MMM D, YYYY"
        presets={presets}
        disabledDate={(date) => date.isAfter(dayjs(today), 'day') || date.isBefore(dayjs(firstDay), 'day')}
        onChange={(dates) => {
          const [start, end] = dates ?? []
          if (start && end) setCustomRange({ start: start.format(DAY_FORMAT), end: end.format(DAY_FORMAT) })
        }}
      />
    </div>
  )
}
