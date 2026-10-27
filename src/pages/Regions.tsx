import { useMemo } from 'react'
import { Card, Col, Progress, Row, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import ChartCard from '../components/ChartCard'
import { BarChart, DonutChart } from '../components/charts'
import DateRangeControl from '../components/DateRangeControl'
import HeatGrid from '../components/HeatGrid'
import PageHeader from '../components/PageHeader'
import { useAnalytics } from '../hooks/useAnalytics'
import { breakdownBy, regionCategoryMatrix, type BreakdownRow } from '../lib/analytics'
import { formatCurrency, formatDayKey, formatNumber, formatPercent } from '../lib/format'
import { CATEGORIES, REGIONS } from '../types'

export default function Regions() {
  const { loading, range, orders, summary } = useAnalytics()

  const regions = useMemo(() => breakdownBy(orders, 'region'), [orders])
  const matrix = useMemo(() => regionCategoryMatrix(orders, REGIONS, CATEGORIES), [orders])
  const empty = !loading && orders.length === 0

  const columns: ColumnsType<BreakdownRow> = [
    { title: 'Region', dataIndex: 'key' },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      align: 'right',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value: number) => <span className="num">{formatCurrency(value)}</span>,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'right',
      sorter: (a, b) => a.orders - b.orders,
      render: (value: number) => <span className="num">{formatNumber(value)}</span>,
    },
    {
      title: 'Avg. order',
      dataIndex: 'revenue',
      key: 'aov',
      align: 'right',
      responsive: ['md'],
      render: (_: number, row) => <span className="num">{formatCurrency(row.orders ? row.revenue / row.orders : 0)}</span>,
    },
    {
      title: 'Share',
      dataIndex: 'share',
      width: 190,
      responsive: ['sm'],
      render: (share: number) => (
        <Progress percent={Math.round(share * 1000) / 10} size="small" format={() => formatPercent(share)} />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Regions"
        description={`${formatDayKey(range.start)} – ${formatDayKey(range.end)} · ${formatCurrency(summary.revenue, { whole: true })} total revenue`}
        extra={<DateRangeControl />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ChartCard title="Revenue share" height={320} loading={loading} empty={empty} ariaLabel="Donut chart of revenue by region">
            <DonutChart data={regions.map((r) => ({ name: r.key, value: r.revenue }))} height={320} centerLabel="Total revenue" order={REGIONS} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={14}>
          <ChartCard title="Revenue by region" height={320} loading={loading} empty={empty} ariaLabel="Bar chart of revenue by region">
            <BarChart data={regions.map((r) => ({ name: r.key, value: r.revenue }))} height={320} horizontal color="#8b5cf6" />
          </ChartCard>
        </Col>
        <Col span={24}>
          <Card title="Region × category heat grid" extra={<span className="muted">Revenue, darker is higher</span>}>
            {empty ? <div className="muted">No data for the selected period</div> : <HeatGrid matrix={matrix} />}
          </Card>
        </Col>
        <Col span={24}>
          <Card title="Regional breakdown">
            <Table<BreakdownRow>
              rowKey="key"
              size="middle"
              columns={columns}
              dataSource={regions}
              loading={loading}
              pagination={false}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No regional data for this period' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}
