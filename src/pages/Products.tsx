import { useMemo, useState } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Button, Card, Col, Progress, Row, Segmented, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ChartCard'
import { BarChart } from '../components/charts'
import DateRangeControl from '../components/DateRangeControl'
import PageHeader from '../components/PageHeader'
import Sparkline from '../components/Sparkline'
import { useAnalytics } from '../hooks/useAnalytics'
import { breakdownBy, productStats, type ProductStat } from '../lib/analytics'
import { formatCurrency, formatDayKey, formatDelta, formatNumber, formatPercent } from '../lib/format'
import { CATEGORIES } from '../types'

type CategoryFilter = 'All' | (typeof CATEGORIES)[number]

export default function Products() {
  const { loading, range, orders, previousOrders } = useAnalytics()
  const navigate = useNavigate()
  const [category, setCategory] = useState<CategoryFilter>('All')

  const stats = useMemo(() => productStats(orders, previousOrders, range), [orders, previousOrders, range])
  const visible = useMemo(
    () => (category === 'All' ? stats : stats.filter((s) => s.category === category)),
    [stats, category],
  )
  const categories = useMemo(() => breakdownBy(orders, 'category'), [orders])
  const empty = !loading && stats.length === 0

  const columns: ColumnsType<ProductStat> = [
    {
      title: 'Product',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, row) => (
        <div className="cell-stack">
          <Button type="link" size="small" className="link-cell" onClick={() => navigate(`/sales?q=${encodeURIComponent(name)}`)}>
            {name}
          </Button>
          <span className="cell-stack__sub">{row.category}</span>
        </div>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      align: 'right',
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (value: number) => <span className="num">{formatCurrency(value)}</span>,
    },
    {
      title: 'Units',
      dataIndex: 'units',
      align: 'right',
      responsive: ['md'],
      sorter: (a, b) => a.units - b.units,
      render: (value: number) => <span className="num">{formatNumber(value)}</span>,
    },
    {
      title: 'Share',
      dataIndex: 'share',
      responsive: ['lg'],
      sorter: (a, b) => a.share - b.share,
      width: 170,
      render: (share: number) => (
        <Progress percent={Math.round(share * 1000) / 10} size="small" format={() => formatPercent(share)} />
      ),
    },
    {
      title: 'vs previous',
      dataIndex: 'delta',
      align: 'right',
      responsive: ['sm'],
      sorter: (a, b) => (a.delta ?? -Infinity) - (b.delta ?? -Infinity),
      render: (delta: number | null) =>
        delta === null ? (
          <span className="delta delta--neutral">n/a</span>
        ) : (
          <span className={`delta delta--${delta >= 0 ? 'good' : 'bad'}`}>
            {delta >= 0 ? <ArrowUpOutlined aria-hidden="true" /> : <ArrowDownOutlined aria-hidden="true" />}
            {formatDelta(delta)}
          </span>
        ),
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      responsive: ['lg'],
      width: 140,
      render: (trend: number[], row) => (
        <div className="table-spark">
          <Sparkline data={trend} height={28} label={`Revenue trend for ${row.name}`} />
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description={`${formatDayKey(range.start)} – ${formatDayKey(range.end)} · ${stats.length} products sold`}
        extra={<DateRangeControl />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Revenue by category"
            height={300}
            loading={loading}
            empty={empty}
            ariaLabel="Column chart of revenue by product category"
          >
            <BarChart data={categories.map((c) => ({ name: c.key, value: c.revenue }))} height={300} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Top products"
            subtitle={category === 'All' ? 'All categories' : category}
            height={300}
            loading={loading}
            empty={empty || visible.length === 0}
            ariaLabel="Bar chart of the top products by revenue"
          >
            <BarChart
              data={visible.slice(0, 7).map((p) => ({ name: p.name, value: p.revenue }))}
              height={300}
              horizontal
              color="#10b981"
            />
          </ChartCard>
        </Col>
        <Col span={24}>
          <Card
            title="All products"
            extra={
              <Segmented
                aria-label="Filter by category"
                value={category}
                onChange={(value) => setCategory(value as CategoryFilter)}
                options={['All', ...CATEGORIES]}
              />
            }
          >
            <Table<ProductStat>
              rowKey="productId"
              size="middle"
              columns={columns}
              dataSource={visible}
              loading={loading}
              pagination={{ pageSize: 8, hideOnSinglePage: true, showSizeChanger: false }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No products sold in this period' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}
