import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App as AntApp, Button, Card, Empty, Input, Select, Space, Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { SorterResult } from 'antd/es/table/interface'
import { useSearchParams } from 'react-router-dom'
import DateRangeControl from '../components/DateRangeControl'
import OrderDrawer from '../components/OrderDrawer'
import PageHeader from '../components/PageHeader'
import StatusTag from '../components/StatusTag'
import { useData } from '../context/DataContext'
import { useNotifications } from '../context/NotificationContext'
import { useSettings } from '../context/SettingsContext'
import { useAnalytics } from '../hooks/useAnalytics'
import { useOrdersQuery } from '../hooks/useOrdersQuery'
import { queryOrders, type OrderQuery, type SortField, type SortOrder } from '../lib/analytics'
import { downloadTextFile, ordersToCsv } from '../lib/csv'
import { formatCurrency, formatDate, formatDayKey, formatNumber } from '../lib/format'
import { STATUS_LABEL } from '../lib/orders'
import { CATEGORIES, ORDER_STATUSES, REGIONS, type Category, type Order, type OrderStatus, type Region } from '../types'

const SORT_FIELDS: readonly SortField[] = ['id', 'date', 'customer', 'product', 'quantity', 'amount', 'status']

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  return (raw ?? '')
    .split(',')
    .filter((value): value is T => (allowed as readonly string[]).includes(value))
}

export default function Sales() {
  const { message } = AntApp.useApp()
  const { orders: allOrders, status: dataStatus } = useData()
  const { orders: rangeOrders, range } = useAnalytics()
  const { settings } = useSettings()
  const { push } = useNotifications()
  const [params, setParams] = useSearchParams()

  // Filters live in the URL so that notifications, the command palette and
  // shared links can open a pre-filtered table.
  const search = params.get('q') ?? ''
  const statuses = useMemo(() => parseList<OrderStatus>(params.get('status'), ORDER_STATUSES), [params])
  const categories = useMemo(() => parseList<Category>(params.get('category'), CATEGORIES), [params])
  const regions = useMemo(() => parseList<Region>(params.get('region'), REGIONS), [params])
  const orderId = params.get('order')

  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ field: 'date', order: 'desc' })
  const [page, setPage] = useState(1)
  const [text, setText] = useState(search)
  const [lastSearch, setLastSearch] = useState(search)
  const timer = useRef<number | undefined>(undefined)

  // Follow external changes of ?q= (palette, notifications, back button).
  if (search !== lastSearch) {
    setLastSearch(search)
    setText(search)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          return next
        },
        { replace: true },
      )
      setPage(1)
    },
    [setParams],
  )

  const onSearchChange = (value: string) => {
    setText(value)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => updateParams({ q: value.trim() || undefined }), 300)
  }

  const filters = useMemo(() => ({ search, statuses, categories, regions }), [search, statuses, categories, regions])
  const query = useMemo<OrderQuery>(
    () => ({ ...filters, sortField: sort.field, sortOrder: sort.order, page, pageSize: settings.pageSize }),
    [filters, sort, page, settings.pageSize],
  )
  const { page: result, loading } = useOrdersQuery(rangeOrders, query, dataStatus === 'ready')

  const hasFilters = Boolean(search || statuses.length || categories.length || regions.length)
  const selectedOrder = useMemo<Order | null>(
    () => (orderId ? (allOrders.find((o) => o.id === orderId) ?? null) : null),
    [allOrders, orderId],
  )

  const clearFilters = () => {
    window.clearTimeout(timer.current)
    setText('')
    setLastSearch('')
    setParams((current) => {
      const next = new URLSearchParams(current)
      for (const key of ['q', 'status', 'category', 'region']) next.delete(key)
      return next
    }, { replace: true })
    setPage(1)
  }

  const exportCsv = () => {
    const rows = queryOrders(rangeOrders, {
      ...filters,
      sortField: sort.field,
      sortOrder: sort.order,
      pageSize: Number.MAX_SAFE_INTEGER,
    }).rows
    const filename = `orders_${range.start}_${range.end}.csv`
    downloadTextFile(filename, ordersToCsv(rows))
    message.success(`Exported ${formatNumber(rows.length)} orders`)
    push({
      level: 'success',
      title: 'CSV export ready',
      description: `${filename} contains ${formatNumber(rows.length)} orders.`,
    })
  }

  const openOrder = (id: string | null) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (id) next.set('order', id)
        else next.delete('order')
        return next
      },
      { replace: true },
    )
  }

  const sortOrderFor = (field: SortField) =>
    sort.field === field ? (sort.order === 'asc' ? ('ascend' as const) : ('descend' as const)) : null

  const columns: ColumnsType<Order> = [
    {
      title: 'Order',
      dataIndex: 'id',
      sorter: true,
      sortOrder: sortOrderFor('id'),
      render: (id: string) => (
        <Button type="link" size="small" className="link-cell" onClick={() => openOrder(id)}>
          {id}
        </Button>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: true,
      sortOrder: sortOrderFor('date'),
      render: (date: string) => formatDate(date, 'medium'),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      sorter: true,
      sortOrder: sortOrderFor('customer'),
      responsive: ['md'],
      render: (customer: string, row) => (
        <div className="cell-stack">
          <span>{customer}</span>
          <span className="cell-stack__sub">{row.email}</span>
        </div>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      sorter: true,
      sortOrder: sortOrderFor('product'),
      render: (product: string, row) => (
        <div className="cell-stack">
          <span>{product}</span>
          <span className="cell-stack__sub">{row.category}</span>
        </div>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      align: 'right',
      sorter: true,
      sortOrder: sortOrderFor('quantity'),
      responsive: ['lg'],
    },
    {
      title: 'Total',
      dataIndex: 'amount',
      align: 'right',
      sorter: true,
      sortOrder: sortOrderFor('amount'),
      render: (amount: number) => <span className="num">{formatCurrency(amount)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: true,
      sortOrder: sortOrderFor('status'),
      render: (status: OrderStatus) => <StatusTag status={status} />,
    },
  ]

  const onTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Order> | SorterResult<Order>[],
  ) => {
    const single = Array.isArray(sorter) ? sorter[0] : sorter
    const field = SORT_FIELDS.find((f) => f === single?.field)
    const next: { field: SortField; order: SortOrder } =
      field && single?.order
        ? { field, order: single.order === 'ascend' ? 'asc' : 'desc' }
        : { field: 'date', order: 'desc' }
    const sortChanged = next.field !== sort.field || next.order !== sort.order
    setSort(next)
    // Server-style behaviour: a new sort order starts again from the first page.
    setPage(sortChanged ? 1 : (pagination.current ?? 1))
  }

  const total = result?.total ?? 0

  return (
    <>
      <PageHeader
        title="Sales"
        description={`${formatDayKey(range.start)} – ${formatDayKey(range.end)} · ${formatNumber(rangeOrders.length)} orders in range`}
        extra={<DateRangeControl />}
      />

      <Card>
        <div className="toolbar">
          <Input
            allowClear
            value={text}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            placeholder="Search order, customer or product"
            aria-label="Search orders"
            className="toolbar__search"
          />
          <Select<OrderStatus[]>
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Status"
            aria-label="Filter by status"
            className="toolbar__select"
            value={statuses}
            onChange={(value) => updateParams({ status: value.join(',') || undefined })}
            options={ORDER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <Select<Category[]>
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Category"
            aria-label="Filter by category"
            className="toolbar__select"
            value={categories}
            onChange={(value) => updateParams({ category: value.join(',') || undefined })}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select<Region[]>
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            placeholder="Region"
            aria-label="Filter by region"
            className="toolbar__select"
            value={regions}
            onChange={(value) => updateParams({ region: value.join(',') || undefined })}
            options={REGIONS.map((r) => ({ value: r, label: r }))}
          />
          <Space className="toolbar__end">
            {hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : null}
            <Button type="primary" icon={<DownloadOutlined />} onClick={exportCsv} disabled={total === 0}>
              Export CSV
            </Button>
          </Space>
        </div>

        <Table<Order>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={result?.rows ?? []}
          loading={loading || dataStatus === 'loading'}
          onChange={onTableChange}
          scroll={{ x: 'max-content' }}
          showSorterTooltip={false}
          pagination={{
            current: result?.page ?? page,
            pageSize: settings.pageSize,
            total,
            showSizeChanger: false,
            showTotal: (count, [from, to]) => `${from}–${to} of ${formatNumber(count)} orders`,
          }}
          onRow={(row) => ({
            onClick: () => openOrder(row.id),
            className: 'row-clickable',
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={hasFilters ? 'No orders match these filters' : 'No orders in this period'}
              >
                {hasFilters ? <Button onClick={clearFilters}>Clear filters</Button> : null}
              </Empty>
            ),
          }}
        />
      </Card>

      <OrderDrawer order={selectedOrder} onClose={() => openOrder(null)} />
    </>
  )
}
