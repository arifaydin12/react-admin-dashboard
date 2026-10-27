import { useMemo, useState } from 'react'
import { DollarOutlined, ShoppingCartOutlined, StopOutlined, TagOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Segmented, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import ChartCard from '../components/ChartCard'
import { BarChart, DonutChart, TrendChart } from '../components/charts'
import type { TrendMetric } from '../components/charts/TrendChart'
import DateRangeControl from '../components/DateRangeControl'
import KpiCard from '../components/KpiCard'
import PageHeader from '../components/PageHeader'
import StatusTag from '../components/StatusTag'
import { useSettings } from '../context/SettingsContext'
import { useAnalytics } from '../hooks/useAnalytics'
import { bucketSizeFor, breakdownBy, buildSeries, rangeLength } from '../lib/analytics'
import { formatCurrency, formatDayKey, formatNumber, formatPercent } from '../lib/format'
import { CATEGORIES, type Order } from '../types'

export default function Dashboard() {
  const analytics = useAnalytics()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [metric, setMetric] = useState<TrendMetric>('revenue')
  const { loading, range, previous, orders, previousOrders, summary, delta, hasComparison } = analytics

  const series = useMemo(() => buildSeries(orders, range), [orders, range])
  const previousSeries = useMemo(
    () => buildSeries(previousOrders, previous, bucketSizeFor(range)),
    [previousOrders, previous, range],
  )
  const categories = useMemo(() => breakdownBy(orders, 'category'), [orders])
  const regions = useMemo(() => breakdownBy(orders, 'region'), [orders])
  const products = useMemo(() => breakdownBy(orders, 'product').slice(0, 6), [orders])
  const recent = useMemo(() => orders.slice(-6).reverse(), [orders])

  const compact = settings.compactNumbers
  const days = rangeLength(range)
  const comparisonLabel = hasComparison ? 'vs previous period' : 'no earlier data'
  const empty = !loading && orders.length === 0

  const columns: ColumnsType<Order> = [
    {
      title: 'Order',
      dataIndex: 'id',
      render: (id: string) => (
        <Button type="link" size="small" className="link-cell" onClick={() => navigate(`/sales?order=${id}`)}>
          {id}
        </Button>
      ),
    },
    { title: 'Customer', dataIndex: 'customer', responsive: ['md'] },
    { title: 'Product', dataIndex: 'product', ellipsis: true },
    {
      title: 'Total',
      dataIndex: 'amount',
      align: 'right',
      render: (amount: number) => <span className="num">{formatCurrency(amount)}</span>,
    },
    { title: 'Status', dataIndex: 'status', render: (status: Order['status']) => <StatusTag status={status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`${formatDayKey(range.start)} – ${formatDayKey(range.end)} · ${days} days${
          hasComparison ? `, compared with ${formatDayKey(previous.start)} – ${formatDayKey(previous.end)}` : ''
        }`}
        extra={<DateRangeControl />}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Revenue"
            icon={<DollarOutlined />}
            color="#4f46e5"
            loading={loading}
            value={formatCurrency(summary.revenue, { compact, whole: !compact })}
            delta={delta.revenue}
            trend={series.map((p) => p.revenue)}
            comparisonLabel={comparisonLabel}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Orders"
            icon={<ShoppingCartOutlined />}
            color="#06b6d4"
            loading={loading}
            value={formatNumber(summary.orders)}
            delta={delta.orders}
            trend={series.map((p) => p.orders)}
            comparisonLabel={comparisonLabel}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Average order value"
            icon={<TagOutlined />}
            color="#10b981"
            loading={loading}
            value={formatCurrency(summary.averageOrderValue)}
            delta={delta.averageOrderValue}
            trend={series.map((p) => (p.paidOrders > 0 ? p.revenue / p.paidOrders : 0))}
            comparisonLabel={comparisonLabel}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="Cancelled & refunded"
            icon={<StopOutlined />}
            color="#f59e0b"
            loading={loading}
            value={formatPercent(summary.lossRate)}
            delta={delta.lossRate}
            invertDelta
            trend={series.map((p) => (p.orders > 0 ? p.lostOrders / p.orders : 0))}
            comparisonLabel={comparisonLabel}
          />
        </Col>

        <Col xs={24} xl={16}>
          <ChartCard
            title="Performance trend"
            subtitle={bucketSizeFor(range) === 7 ? 'Weekly totals' : 'Daily totals'}
            height={320}
            loading={loading}
            empty={empty}
            ariaLabel={`Line chart of ${metric} over time compared with the previous period`}
            extra={
              <Segmented
                aria-label="Trend metric"
                value={metric}
                onChange={(value) => setMetric(value as TrendMetric)}
                options={[
                  { label: 'Revenue', value: 'revenue' },
                  { label: 'Orders', value: 'orders' },
                ]}
              />
            }
          >
            <TrendChart current={series} previous={hasComparison ? previousSeries : []} metric={metric} height={320} />
          </ChartCard>
        </Col>
        <Col xs={24} xl={8}>
          <ChartCard
            title="Sales by category"
            height={320}
            loading={loading}
            empty={empty}
            ariaLabel="Donut chart of revenue by product category"
          >
            <DonutChart data={categories.map((c) => ({ name: c.key, value: c.revenue }))} height={320} centerLabel="Revenue" order={CATEGORIES} />
          </ChartCard>
        </Col>

        <Col xs={24} lg={12}>
          <ChartCard
            title="Top products"
            subtitle="By revenue"
            height={300}
            loading={loading}
            empty={empty}
            ariaLabel="Bar chart of the top products by revenue"
          >
            <BarChart data={products.map((p) => ({ name: p.key, value: p.revenue }))} height={300} horizontal />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Revenue by region"
            height={300}
            loading={loading}
            empty={empty}
            ariaLabel="Column chart of revenue by region"
          >
            <BarChart data={regions.map((r) => ({ name: r.key, value: r.revenue }))} height={300} color="#06b6d4" horizontal />
          </ChartCard>
        </Col>

        <Col span={24}>
          <Card
            title="Recent orders"
            extra={
              <Button type="link" onClick={() => navigate('/sales')}>
                View all
              </Button>
            }
          >
            <Table<Order>
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={recent}
              loading={loading}
              pagination={false}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No orders in this period' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}
